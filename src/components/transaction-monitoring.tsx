import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  AlertCircle,
  TrendingUp,
  Activity,
  Eye,
} from "lucide-react";

type ConnectionState = "connecting" | "connected" | "disconnected";
type RiskStatus = "normal" | "review" | "flagged";

interface RawTransaction {
  key: string;
  linkId: string;
  timestamp: string;
  type: string;
  amount: number | null;
  srcAccount: string;
  dstAccount: string;
}

interface ScoredTransaction {
  id: string;
  linkId: string;
  eventTime: string;
  type: string;
  amount: number | null;
  newBalance: number | null;
  newBalanceSource: string | null;
  riskScore: number;
  threshold: number;
  status: RiskStatus;
  decision: string;
  account: string;
  riskReasons: string[];
  usedReference: boolean | null;
  raw: unknown;
}

interface ChartPoint {
  time: string;
  normal: number;
  suspicious: number;
  fraudulent: number;
}

interface RiskPoint {
  time: string;
  score: number;
}

const HISTORY_LIMIT = 200;
const RAW_HISTORY_LIMIT = 600;
const DEFAULT_BACKEND = "http://localhost:8000";
const SNAPSHOT_PATH = "/snapshot";

const numberFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function resolveBackendOrigin(): string {
  const envBase = import.meta.env?.VITE_REALTIME_BASE;
  if (typeof envBase === "string" && envBase.trim().length > 0) {
    return envBase.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_BACKEND;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
}

function buildTxnKey(linkId: string, timestamp: string): string {
  return `${linkId}|${timestamp}`;
}

function formatCurrency(amount: number | null): string {
  if (amount === null) {
    return "—";
  }
  return `$${numberFormatter.format(amount)}`;
}

function formatPercent(probability: number): string {
  return `${percentFormatter.format(clamp(Math.round(probability * 100), 0, 100))}%`;
}

function formatDateTime(value: string): string {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) {
    return value || "—";
  }
  return dt.toLocaleString();
}

function formatTimeLabel(value: string): string {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) {
    return value || "";
  }
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function timeBucketLabel(value: string): string {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) {
    return value || "";
  }
  const hours = dt.getHours().toString().padStart(2, "0");
  const minutes = Math.floor(dt.getMinutes() / 30) * 30;
  const minuteLabel = minutes.toString().padStart(2, "0");
  return `${hours}:${minuteLabel}`;
}

function timeBucketRank(label: string): number {
  const [h, m] = label.split(":").map((part) => Number(part));
  const hours = Number.isNaN(h) ? 0 : h;
  const minutes = Number.isNaN(m) ? 0 : m;
  return hours * 60 + minutes;
}

function epoch(value: string): number {
  const ts = Date.parse(value);
  return Number.isNaN(ts) ? 0 : ts;
}

function computeStatus(risk: number, decision: string, threshold: number): RiskStatus {
  const normalizedThreshold = threshold > 0 ? threshold : 0.5;
  if (decision === "flag") {
    return "flagged";
  }
  if (risk >= normalizedThreshold) {
    return "review";
  }
  if (risk >= normalizedThreshold * 0.75) {
    return "review";
  }
  return "normal";
}

function deriveRiskReasons(args: {
  riskScore: number;
  threshold: number;
  amount: number | null;
  newBalance: number | null;
  newBalanceSource: string | null;
  decision: string;
  usedReference: boolean | null;
}): string[] {
  const reasons = new Set<string>();

  if (args.decision === "flag") {
    reasons.add(
      `Model flagged transaction (${formatPercent(args.riskScore)} ≥ ${formatPercent(args.threshold)})`,
    );
  } else {
    reasons.add(`Predicted risk ${formatPercent(args.riskScore)}`);
    reasons.add(`Threshold ${formatPercent(args.threshold)}`);
  }

  if (args.amount !== null) {
    reasons.add(`Amount ${formatCurrency(args.amount)}`);
  }

  if (args.newBalance !== null) {
    const suffix = args.newBalanceSource ? ` (${args.newBalanceSource})` : "";
    reasons.add(`Balance after transaction ${formatCurrency(args.newBalance)}${suffix}`);
  }

  if (args.usedReference === false) {
    reasons.add("No reference profile matched");
  } else if (args.usedReference === true) {
    reasons.add("Reference profile matched");
  }

  return Array.from(reasons);
}

function mapRawTransaction(payload: any): RawTransaction | null {
  if (!payload) {
    return null;
  }
  const link = payload.link_id ?? payload.linkId ?? payload.context?.link_id;
  if (link === undefined || link === null || link === "") {
    return null;
  }
  const linkId = String(link);
  const eventTimeValue =
    (typeof payload.event_time === "string" && payload.event_time.trim().length > 0
      ? payload.event_time
      : null) ?? new Date().toISOString();
  const amount = toNumber(payload.amount);
  const raw: RawTransaction = {
    key: buildTxnKey(linkId, eventTimeValue),
    linkId,
    timestamp: eventTimeValue,
    type: String(payload.tx_type ?? payload.type ?? "Unknown"),
    amount,
    srcAccount: payload.src_account ? String(payload.src_account) : "",
    dstAccount: payload.dst_account ? String(payload.dst_account) : "",
  };
  return raw;
}

function mapScoredTransaction(
  payload: any,
  lookupRaw?: (linkId: string, timestamp: string) => RawTransaction | undefined,
): ScoredTransaction | null {
  if (!payload) {
    return null;
  }
  const ctx = payload.context ?? {};
  const link = payload.link_id ?? ctx.link_id ?? payload.linkId;
  if (link === undefined || link === null || link === "") {
    return null;
  }
  const linkId = String(link);
  const eventTime =
    (typeof payload.event_time === "string" && payload.event_time.trim().length > 0
      ? payload.event_time
      : typeof ctx.event_time === "string" && ctx.event_time.trim().length > 0
        ? ctx.event_time
        : null) ?? new Date().toISOString();

  const raw = lookupRaw?.(linkId, eventTime);

  const riskScore =
    toNumber(ctx.prediction_probability ?? payload.risk_score ?? payload.probability) ?? 0;
  const threshold = toNumber(ctx.threshold ?? payload.threshold) ?? 0.5;
  const decision = String(payload.decision ?? "").toLowerCase() ||
    (riskScore >= threshold ? "flag" : "ok");
  const amount =
    toNumber(ctx.tx_amount ?? ctx.amount ?? payload.amount ?? raw?.amount ?? null);
  const newBalance = toNumber(ctx.new_balance ?? ctx.newBalance ?? null);
  const newBalanceSource = ctx.new_balance_source ? String(ctx.new_balance_source) : null;
  const type = String(ctx.tx_type ?? payload.tx_type ?? raw?.type ?? "Unknown");
  const account = ctx.account
    ? String(ctx.account)
    : raw?.srcAccount ?? "";
  const usedReference =
    typeof ctx.used_reference_row === "boolean" ? ctx.used_reference_row : null;

  const status = computeStatus(riskScore, decision, threshold);
  const riskReasons = deriveRiskReasons({
    riskScore,
    threshold,
    amount,
    newBalance,
    newBalanceSource,
    decision,
    usedReference,
  });

  const id = buildTxnKey(linkId, eventTime);

  return {
    id,
    linkId,
    eventTime,
    type,
    amount,
    newBalance,
    newBalanceSource,
    riskScore,
    threshold,
    status,
    decision,
    account,
    riskReasons,
    usedReference,
    raw: payload,
  };
}

function insertTransaction(
  list: ScoredTransaction[],
  incoming: ScoredTransaction,
): ScoredTransaction[] {
  const map = new Map<string, ScoredTransaction>();
  map.set(incoming.id, incoming);
  for (const tx of list) {
    if (!map.has(tx.id)) {
      map.set(tx.id, tx);
    }
  }
  const sorted = Array.from(map.values()).sort(
    (a, b) => epoch(b.eventTime) - epoch(a.eventTime),
  );
  if (sorted.length > HISTORY_LIMIT) {
    sorted.length = HISTORY_LIMIT;
  }
  return sorted;
}

function sortAndTrim(items: ScoredTransaction[]): ScoredTransaction[] {
  const map = new Map<string, ScoredTransaction>();
  for (const item of items) {
    map.set(item.id, item);
  }
  const sorted = Array.from(map.values()).sort(
    (a, b) => epoch(b.eventTime) - epoch(a.eventTime),
  );
  if (sorted.length > HISTORY_LIMIT) {
    sorted.length = HISTORY_LIMIT;
  }
  return sorted;
}

function buildChartData(transactions: ScoredTransaction[]): ChartPoint[] {
  const buckets = new Map<string, { normal: number; suspicious: number; fraudulent: number }>();
  const recent = [...transactions]
    .sort((a, b) => epoch(a.eventTime) - epoch(b.eventTime))
    .slice(-120);

  for (const tx of recent) {
    const label = timeBucketLabel(tx.eventTime);
    const slot = buckets.get(label) ?? { normal: 0, suspicious: 0, fraudulent: 0 };
    if (tx.status === "flagged") {
      slot.fraudulent += 1;
    } else if (tx.status === "review") {
      slot.suspicious += 1;
    } else {
      slot.normal += 1;
    }
    buckets.set(label, slot);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => timeBucketRank(a[0]) - timeBucketRank(b[0]))
    .slice(-24)
    .map(([time, counts]) => ({ time, ...counts }));
}

function buildRiskSeries(transactions: ScoredTransaction[]): RiskPoint[] {
  return [...transactions]
    .sort((a, b) => epoch(a.eventTime) - epoch(b.eventTime))
    .slice(-24)
    .map((tx) => ({
      time: formatTimeLabel(tx.eventTime),
      score: Number((tx.riskScore * 100).toFixed(2)),
    }));
}

export function TransactionMonitoring() {
  const [transactions, setTransactions] = useState<ScoredTransaction[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const backendOrigin = useMemo(() => resolveBackendOrigin(), []);

  const rawByKeyRef = useRef<Map<string, RawTransaction>>(new Map());
  const rawByLinkRef = useRef<Map<string, RawTransaction>>(new Map());
  const rawOrderRef = useRef<string[]>([]);

  const lookupRaw = useCallback(
    (linkId: string, timestamp: string) => {
      const byKey = rawByKeyRef.current.get(buildTxnKey(linkId, timestamp));
      if (byKey) {
        return byKey;
      }
      return rawByLinkRef.current.get(linkId);
    },
    [],
  );

  const storeRaw = useCallback((payload: any) => {
    const mapped = mapRawTransaction(payload);
    if (!mapped) {
      return;
    }
    rawByKeyRef.current.set(mapped.key, mapped);
    rawByLinkRef.current.set(mapped.linkId, mapped);

    const order = rawOrderRef.current;
    order.push(mapped.key);
    while (order.length > RAW_HISTORY_LIMIT) {
      const staleKey = order.shift();
      if (staleKey) {
        rawByKeyRef.current.delete(staleKey);
      }
    }
  }, []);

  const hydrateSnapshot = useCallback(async () => {
    try {
      const response = await fetch(`${backendOrigin}${SNAPSHOT_PATH}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Snapshot request failed (${response.status})`);
      }
      const payload = await response.json();

      rawByKeyRef.current.clear();
      rawByLinkRef.current.clear();
      rawOrderRef.current.length = 0;

      if (Array.isArray(payload?.transactions_raw)) {
        for (const raw of payload.transactions_raw) {
          storeRaw(raw);
        }
      }

      const scored = Array.isArray(payload?.transactions)
        ? payload.transactions
        : [];
      const mapped = scored
        .map((item: any) => mapScoredTransaction(item, lookupRaw))
        .filter((item): item is ScoredTransaction => Boolean(item));

      setTransactions(sortAndTrim(mapped));
      setLastUpdated(Date.now());
    } catch (error) {
      console.warn("Failed to hydrate snapshot", error);
    }
  }, [backendOrigin, lookupRaw, storeRaw]);

  useEffect(() => {
    let cancelled = false;
    hydrateSnapshot();

    const socket = io(backendOrigin, {
      path: "/socket.io",
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      timeout: 5000,
    });

    socket.on("connect", () => {
      if (cancelled) return;
      setConnectionState("connected");
    });

    socket.on("disconnect", () => {
      if (cancelled) return;
      setConnectionState("disconnected");
    });

    socket.on("txn_raw", (payload) => {
      if (cancelled) return;
      storeRaw(payload);
    });

    socket.on("txn_event", (payload) => {
      if (cancelled) return;
      const mapped = mapScoredTransaction(payload, lookupRaw);
      if (!mapped) {
        return;
      }
      setTransactions((prev) => insertTransaction(prev, mapped));
      setLastUpdated(Date.now());
    });

    socket.on("flag_event", (payload) => {
      if (cancelled) return;
      const mapped = mapScoredTransaction(payload, lookupRaw);
      if (!mapped) {
        return;
      }
      setTransactions((prev) => insertTransaction(prev, mapped));
      setLastUpdated(Date.now());
    });

    return () => {
      cancelled = true;
      socket.close();
    };
  }, [backendOrigin, hydrateSnapshot, lookupRaw, storeRaw]);

  useEffect(() => {
    if (connectionState === "connected") {
      return;
    }
    const id = window.setInterval(() => {
      hydrateSnapshot();
    }, 5000);
    return () => window.clearInterval(id);
  }, [connectionState, hydrateSnapshot]);

  const chartData = useMemo(() => buildChartData(transactions), [transactions]);
  const riskScoreData = useMemo(() => buildRiskSeries(transactions), [transactions]);
  const recentTransactions = useMemo(() => transactions, [transactions]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {connectionState !== "connected" && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-900">
                {connectionState === "connecting"
                  ? "Connecting to live transaction stream..."
                  : "Realtime stream unavailable – showing the latest snapshot."}
              </CardTitle>
              {lastUpdated && (
                <CardDescription className="text-xs text-yellow-800">
                  Last updated {new Date(lastUpdated).toLocaleTimeString()}
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Real-Time Transaction Flow
              </CardTitle>
              <CardDescription>
                AI-powered transaction classification by time bucket
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="normal"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Normal"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="suspicious"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Review"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="fraudulent"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Flagged"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Risk Score Trend
              </CardTitle>
              <CardDescription>
                Recent fraud risk probability scaled to 0–100
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={riskScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#f59e0b"
                    fill="#fbbf24"
                    fillOpacity={0.3}
                    name="Risk Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              Recent Transaction Analysis
            </CardTitle>
            <CardDescription>
              Live monitoring of transactions with AI-powered risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto pr-2" style={{ maxHeight: "24rem" }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Risk Probability</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                        Waiting for scored transactions...
                      </TableCell>
                    </TableRow>
                  )}
                  {recentTransactions.map((txn) => {
                    const riskPercent = clamp(Math.round(txn.riskScore * 100), 0, 100);
                    const accountLabel = `ID${txn.linkId}`;
                    const statusLabel = txn.status === "flagged"
                      ? "flagged"
                      : txn.status === "review"
                        ? "review"
                        : "normal";

                    return (
                      <TableRow key={txn.id}>
                        <TableCell className="font-mono text-xs">
                          {txn.linkId}
                        </TableCell>
                        <TableCell>{accountLabel}</TableCell>
                        <TableCell>{formatCurrency(txn.amount)}</TableCell>
                        <TableCell>{txn.type}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                txn.status === "flagged"
                                  ? "text-red-600"
                                  : txn.status === "review"
                                    ? "text-blue-600"
                                    : "text-green-600"
                              }`}
                            >
                              {riskPercent}
                            </span>
                            {txn.status === "flagged" && txn.riskReasons.length > 0 && (
                              <UITooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-4 w-4 cursor-help text-red-500 hover:text-red-600 transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-72">
                                  <div className="space-y-2">
                                    <div className="font-medium text-red-600">
                                      Risk Factors
                                    </div>
                                    <ul className="space-y-1">
                                      {txn.riskReasons.map((reason, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm">
                                          <span className="mt-1 text-red-500">•</span>
                                          <span>{reason}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </TooltipContent>
                              </UITooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatDateTime(txn.eventTime)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              statusLabel === "flagged"
                                ? "destructive"
                                : statusLabel === "review"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Investigate
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
