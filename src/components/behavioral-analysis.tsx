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

const chartData = [
  { time: "00:00", normal: 205, suspicious: 8, fraudulent: 3 },
  { time: "04:00", normal: 182, suspicious: 16, fraudulent: 5 },
  { time: "08:00", normal: 367, suspicious: 5, fraudulent: 17 },
  { time: "12:00", normal: 127, suspicious: 8, fraudulent: 11 },
  { time: "16:00", normal: 410, suspicious: 21, fraudulent: 19 },
  { time: "20:00", normal: 289, suspicious: 9, fraudulent: 16 },
];

const riskScoreData = [
  { time: "00:00", score: 4.5 },
  { time: "02:00", score: 3.8 },
  { time: "04:00", score: 4.2 },
  { time: "06:00", score: 5.3 },
  { time: "08:00", score: 7.1 },
  { time: "10:00", score: 8.4 },
  { time: "12:00", score: 9.3 },
  { time: "14:00", score: 8.2 },
  { time: "16:00", score: 7.4 },
  { time: "18:00", score: 6.1 },
  { time: "20:00", score: 5.5 },
  { time: "22:00", score: 4.7 },
];

const recentTransactions = [
  {
    id: "TXN-789123",
    account: "****4521",
    coordinates: { longitude: -74.0060, latitude: 40.7128 },
    location: "New York, NY",
    riskScore: 9.2,
    status: "flagged",
    aiModel: "DeepFraud-v3",
    confidence: 82,
    timestamp: "2024-09-15 14:23:45",
  },
  {
    id: "TXN-789124",
    account: "****7891",
    coordinates: { longitude: -0.1276, latitude: 51.5074 },
    location: "London, UK",
    riskScore: 2.1,
    status: "normal",
    aiModel: "DeepFraud-v3",
    confidence: 82,
    timestamp: "2024-09-15 14:22:12",
  },
  {
    id: "TXN-789125",
    account: "****3456",
    coordinates: { longitude: 72.8777, latitude: 19.0760 },
    location: "Mumbai, IN",
    riskScore: 7.8,
    status: "review",
    aiModel: "GraphNet-v2",
    confidence: 82,
    timestamp: "2024-09-15 14:21:33",
  },
  {
    id: "TXN-789126",
    account: "****9876",
    coordinates: { longitude: -79.3832, latitude: 43.6532 },
    location: "Toronto, CA",
    riskScore: 1.5,
    status: "normal",
    aiModel: "DeepFraud-v3",
    confidence: 99,
    timestamp: "2024-09-15 14:20:18",
  },
];

export function BehavioralAnalysis() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Real-Time Behavior Analysis
            </CardTitle>
            <CardDescription>
              AI-powered behavior classification over the
              last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="normal"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Normal"
                />
                <Line
                  type="monotone"
                  dataKey="suspicious"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Suspicious"
                />
                <Line
                  type="monotone"
                  dataKey="fraudulent"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Fraudulent"
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
              Average fraud risk score calculated by AI models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={riskScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 10]} />
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
            Live monitoring of transactions with AI-powered risk
            assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono">
                    {txn.id}
                  </TableCell>
                  <TableCell>{txn.account}</TableCell>
                  <TableCell className="font-mono text-xs">
                    ({txn.coordinates.longitude}, {txn.coordinates.latitude})
                  </TableCell>
                  <TableCell>{txn.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${
                          txn.riskScore >= 8
                            ? "text-red-600"
                            : txn.riskScore >= 5
                              ? "text-orange-600"
                              : "text-green-600"
                        }`}
                      >
                        {txn.riskScore}
                      </span>
                      {txn.riskScore >= 8 && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        txn.status === "flagged"
                          ? "destructive"
                          : txn.status === "review"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {txn.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      Investigate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
