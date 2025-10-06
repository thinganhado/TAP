import {
  useCallback,
  useEffect,
  useMemo,
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

interface ScoredBehavior {
  id: string;
  linkId: string;
  clientId: string;
  eventTime: string;           // Timestamp from dataset (when behavior occurred)
  scoredTime: string;           // Timestamp when fraud detection was performed
  latitude: number;
  longitude: number;
  riskScore: number;
  status: RiskStatus;
  decision: string;
  threshold: number;
  specialistProbas: {
    temporal: number;
    geographical: number;
    behavioral: number;
    composite: number;
  };
  aiModel: string;
}

interface ChartPoint {
  time: string;
  normal: number;
  suspicious: number;
  fraudulent: number;
}

interface RiskPoint {
  date: string;
  score: number;
}

const DEFAULT_BACKEND = "http://localhost:8000";

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

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
}

function formatTime(value: string): string {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value || "—";
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(value: string): string {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value || "—";
  return dt.toLocaleDateString();
}

function formatDateTime(value: string): string {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value || "—";
  return dt.toLocaleString();
}

function epoch(value: string): number {
  const ts = Date.parse(value);
  return Number.isNaN(ts) ? 0 : ts;
}

function computeStatus(risk: number, decision: string, threshold: number): RiskStatus {
  if (decision === "flagged" || risk >= 0.8) return "flagged";
  if (decision === "flag" || risk >= threshold) return "review";
  return "normal";
}

function mapScoredBehavior(payload: any): ScoredBehavior | null {
  if (!payload) return null;
  
  const ctx = payload.context ?? {};
  const clientId = payload.client_id ?? ctx.client_id ?? "";
  const linkId = payload.link_id ?? ctx.link_id ?? "";
  
  if (!clientId && !linkId) return null;
  
  const eventTime = payload.event_time || new Date().toISOString();
  const scoredTime = new Date().toISOString(); // Current time when scored
  
  const riskScore = toNumber(ctx.prediction_probability ?? payload.risk_score ?? payload.probability) ?? 0;
  const threshold = toNumber(ctx.threshold ?? payload.threshold) ?? 0.5;
  const decision = String(payload.decision ?? "").toLowerCase() || (riskScore >= threshold ? "flag" : "ok");
  
  const specialistProbas = ctx.specialist_probas ?? {};
  
  return {
    id: `${linkId || clientId}|${eventTime}`,
    linkId,
    clientId,
    eventTime,
    scoredTime,
    latitude: toNumber(ctx.latitude ?? payload.latitude) ?? 0,
    longitude: toNumber(ctx.longitude ?? payload.longitude) ?? 0,
    riskScore,
    status: computeStatus(riskScore, decision, threshold),
    decision,
    threshold,
    specialistProbas: {
      temporal: toNumber(specialistProbas.temporal) ?? 0,
      geographical: toNumber(specialistProbas.geographical) ?? 0,
      behavioral: toNumber(specialistProbas.behavioral) ?? 0,
      composite: toNumber(specialistProbas.composite) ?? 0,
    },
    aiModel: payload.model_version ?? ctx.model_version ?? "GeoEnsemble-v1",
  };
}

function buildTimeBasedChart(behaviors: ScoredBehavior[]): ChartPoint[] {
  // Use scoredTime (when detection was performed) for time-based grouping
  const buckets = new Map<string, { normal: number; suspicious: number; fraudulent: number }>();
  
  for (const beh of behaviors) {
    const timeLabel = formatTime(beh.scoredTime);
    const slot = buckets.get(timeLabel) ?? { normal: 0, suspicious: 0, fraudulent: 0 };
    
    if (beh.status === "flagged") slot.fraudulent += 1;
    else if (beh.status === "review") slot.suspicious += 1;
    else slot.normal += 1;
    
    buckets.set(timeLabel, slot);
  }
  
  return Array.from(buckets.entries())
    .map(([time, counts]) => ({ time, ...counts }))
    .slice(-24);
}

function buildDateBasedRiskSeries(behaviors: ScoredBehavior[]): RiskPoint[] {
  // Use eventTime (from dataset) for date-based risk scoring
  const dateGroups = new Map<string, number[]>();
  
  for (const beh of behaviors) {
    const dateLabel = formatDate(beh.eventTime);
    const scores = dateGroups.get(dateLabel) ?? [];
    scores.push(beh.riskScore * 100);
    dateGroups.set(dateLabel, scores);
  }
  
  return Array.from(dateGroups.entries())
    .map(([date, scores]) => ({
      date,
      score: Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
    }))
    .slice(-12);
}

export function BehavioralAnalysis() {
  const [behaviors, setBehaviors] = useState<ScoredBehavior[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const backendOrigin = useMemo(() => resolveBackendOrigin(), []);

  useEffect(() => {
    const hydrateSnapshot = async () => {
      try {
        const response = await fetch(`${backendOrigin}/snapshot`, { cache: "no-store" });
        if (!response.ok) return;
        
        const payload = await response.json();
        const scored = Array.isArray(payload?.behaviours) ? payload.behaviours : [];
        const mapped = scored
          .map(mapScoredBehavior)
          .filter((item): item is ScoredBehavior => Boolean(item));
        
        setBehaviors(mapped);
      } catch (error) {
        console.warn("Failed to hydrate snapshot", error);
      }
    };

    hydrateSnapshot();

    const socket = io(backendOrigin, {
      path: "/socket.io",
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => setConnectionState("connected"));
    socket.on("disconnect", () => setConnectionState("disconnected"));

    socket.on("beh_event", (payload) => {
      const mapped = mapScoredBehavior(payload);
      if (!mapped) return;
      
      setBehaviors((prev) => [mapped, ...prev].slice(0, 200));
    });

    socket.on("flag_event", (payload) => {
      if (payload.stream !== "behaviour") return;
      const mapped = mapScoredBehavior(payload);
      if (!mapped) return;
      
      setBehaviors((prev) => [mapped, ...prev].slice(0, 200));
    });

    return () => socket.close();
  }, [backendOrigin]);

  const chartData = useMemo(() => buildTimeBasedChart(behaviors), [behaviors]);
  const riskScoreData = useMemo(() => buildDateBasedRiskSeries(behaviors), [behaviors]);

  return (
    <div className="space-y-6">
      {connectionState !== "connected" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">
              {connectionState === "connecting"
                ? "Connecting to behavior stream..."
                : "Realtime stream unavailable – showing latest snapshot."}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Real-Time Behavior Analysis
            </CardTitle>
            <CardDescription>
              Classification by detection time (when fraud scoring occurred)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" label={{ value: "Time (HH:MM)", position: "insideBottom", offset: -5 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="normal" stroke="#22c55e" strokeWidth={2} name="Normal" dot={false} />
                <Line type="monotone" dataKey="suspicious" stroke="#f59e0b" strokeWidth={2} name="Review" dot={false} />
                <Line type="monotone" dataKey="fraudulent" stroke="#ef4444" strokeWidth={2} name="Flagged" dot={false} />
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
              Average risk by event date (when behavior occurred in dataset)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={riskScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" label={{ value: "Date", position: "insideBottom", offset: -5 }} />
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
            Recent Behavior Analysis
          </CardTitle>
          <CardDescription>
            Live monitoring with AI-powered risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-y-auto pr-2" style={{ maxHeight: "24rem" }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Event Time</TableHead>
                  <TableHead>Detection Time</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Model</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {behaviors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      Waiting for scored behaviors...
                    </TableCell>
                  </TableRow>
                )}
                {behaviors.map((beh) => (
                  <TableRow key={beh.id}>
                    <TableCell className="font-mono text-xs">{beh.clientId || beh.linkId}</TableCell>
                    <TableCell className="font-mono text-xs">
                      ({beh.longitude.toFixed(4)}, {beh.latitude.toFixed(4)})
                    </TableCell>
                    <TableCell className="text-xs">{formatDateTime(beh.eventTime)}</TableCell>
                    <TableCell className="text-xs">{formatDateTime(beh.scoredTime)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            beh.status === "flagged"
                              ? "text-red-600"
                              : beh.status === "review"
                                ? "text-orange-600"
                                : "text-green-600"
                          }`}
                        >
                          {Math.round(beh.riskScore * 100)}
                        </span>
                        {beh.status === "flagged" && <AlertCircle className="h-4 w-4 text-red-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          beh.status === "flagged"
                            ? "destructive"
                            : beh.status === "review"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {beh.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{beh.aiModel}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Investigate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}