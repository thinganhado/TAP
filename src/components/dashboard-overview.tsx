import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { TrendingUp, AlertTriangle, Shield, Eye, FileCheck, Activity } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  description: string;
}

function MetricCard({ title, value, change, trend, icon, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="flex items-center space-x-1 text-xs">
          <TrendingUp className={`h-3 w-3 ${trend === 'up' ? 'text-red-500' : 'text-green-500'}`} />
          <span className={trend === 'up' ? 'text-red-500' : 'text-green-500'}>
            {change}
          </span>
          <span className="text-muted-foreground">from last period</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardOverview() {
  const alerts = [
    {
      id: 1,
      type: "critical",
      message: "Suspicious transaction pattern detected - Account #7891",
      timestamp: "2 minutes ago",
      confidence: 94
    },
    {
      id: 2,
      type: "warning",
      message: "Unusual document upload behavior - User ID #5432",
      timestamp: "15 minutes ago",
      confidence: 78
    },
    {
      id: 3,
      type: "info",
      message: "Blockchain verification completed - 1,247 transactions",
      timestamp: "1 hour ago",
      confidence: 99
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Fraud Alerts"
          value="23"
          change="+12%"
          trend="up"
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          description="Active fraud alerts requiring investigation"
        />
        <MetricCard
          title="Risk Score"
          value="7.2/10"
          change="-5%"
          trend="down"
          icon={<Shield className="h-4 w-4 text-orange-500" />}
          description="Average risk score across all transactions"
        />
        <MetricCard
          title="Monitored Transactions"
          value="1,247,892"
          change="+23%"
          trend="up"
          icon={<Eye className="h-4 w-4 text-blue-500" />}
          description="Real-time transactions under AI surveillance"
        />
        <MetricCard
          title="AI Confidence"
          value="94.7%"
          change="+2%"
          trend="up"
          icon={<Activity className="h-4 w-4 text-green-500" />}
          description="Average AI model confidence in fraud detection"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Recent Fraud Alerts
          </CardTitle>
          <CardDescription>
            Real-time AI-powered fraud detection alerts with confidence scores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert) => (
            <Alert key={alert.id} className={
              alert.type === 'critical' ? 'border-red-200 bg-red-50' :
              alert.type === 'warning' ? 'border-orange-200 bg-orange-50' :
              'border-blue-200 bg-blue-50'
            }>
              <div className="flex items-center justify-between">
                <AlertDescription className="flex-1">
                  {alert.message}
                </AlertDescription>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    alert.type === 'critical' ? 'destructive' :
                    alert.type === 'warning' ? 'default' :
                    'secondary'
                  }>
                    {alert.confidence}% confidence
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {alert.timestamp}
                  </span>
                </div>
              </div>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}