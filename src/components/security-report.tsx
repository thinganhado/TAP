import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Shield, CheckCircle, AlertTriangle, Lock, FileCheck, Database, Server, Activity } from "lucide-react";

export function SecurityReport() {
  const systemSecurityMetrics = [
    {
      category: "Infrastructure Security",
      score: 98,
      status: "excellent",
      details: "All systems encrypted and access-controlled",
      items: [
        { name: "Firewall Protection", status: "active", lastCheck: "2 min ago" },
        { name: "DDoS Mitigation", status: "active", lastCheck: "5 min ago" },
        { name: "Intrusion Detection", status: "active", lastCheck: "1 min ago" },
        { name: "Network Segmentation", status: "active", lastCheck: "3 min ago" }
      ]
    },
    {
      category: "Data Protection",
      score: 96,
      status: "excellent",
      details: "End-to-end encryption with regular backups",
      items: [
        { name: "Data Encryption (AES-256)", status: "active", lastCheck: "1 min ago" },
        { name: "Backup Systems", status: "active", lastCheck: "10 min ago" },
        { name: "Data Masking", status: "active", lastCheck: "4 min ago" },
        { name: "Access Logging", status: "active", lastCheck: "2 min ago" }
      ]
    },
    {
      category: "Authentication & Access",
      score: 94,
      status: "excellent",
      details: "Multi-factor authentication enforced",
      items: [
        { name: "MFA Enforcement", status: "active", lastCheck: "3 min ago" },
        { name: "Session Management", status: "active", lastCheck: "2 min ago" },
        { name: "Role-Based Access Control", status: "active", lastCheck: "5 min ago" },
        { name: "Zero Trust Architecture", status: "active", lastCheck: "1 min ago" }
      ]
    },
    {
      category: "AI Model Security",
      score: 92,
      status: "good",
      details: "AI models secured with adversarial protection",
      items: [
        { name: "Model Encryption", status: "active", lastCheck: "4 min ago" },
        { name: "Adversarial Detection", status: "active", lastCheck: "6 min ago" },
        { name: "Data Poisoning Prevention", status: "warning", lastCheck: "15 min ago" },
        { name: "Model Versioning", status: "active", lastCheck: "2 min ago" }
      ]
    }
  ];

  const complianceStandards = [
    {
      standard: "ISO 22301",
      name: "Business Continuity Management",
      compliance: 98,
      status: "compliant",
      lastAudit: "2024-09-15",
      nextAudit: "2025-03-15",
      findings: 0,
      areas: [
        { area: "Incident Response", score: 100 },
        { area: "Recovery Procedures", score: 98 },
        { area: "Business Impact Analysis", score: 96 },
        { area: "Continuity Planning", score: 98 }
      ]
    },
    {
      standard: "ISO 27001",
      name: "Information Security Management",
      compliance: 97,
      status: "compliant",
      lastAudit: "2024-08-20",
      nextAudit: "2025-02-20",
      findings: 1,
      areas: [
        { area: "Access Control", score: 99 },
        { area: "Cryptography", score: 98 },
        { area: "Physical Security", score: 95 },
        { area: "Operations Security", score: 96 }
      ]
    },
    {
      standard: "ISO 15489",
      name: "Records Management",
      compliance: 95,
      status: "compliant",
      lastAudit: "2024-07-10",
      nextAudit: "2025-01-10",
      findings: 2,
      areas: [
        { area: "Records Creation", score: 97 },
        { area: "Records Capture", score: 95 },
        { area: "Records Retention", score: 93 },
        { area: "Records Disposal", score: 95 }
      ]
    },
    {
      standard: "ISO/IEC 20243",
      name: "Blockchain & Distributed Ledger Security",
      compliance: 96,
      status: "compliant",
      lastAudit: "2024-09-01",
      nextAudit: "2025-03-01",
      findings: 1,
      areas: [
        { area: "Consensus Mechanisms", score: 98 },
        { area: "Smart Contract Security", score: 94 },
        { area: "Node Security", score: 97 },
        { area: "Blockchain Integrity", score: 96 }
      ]
    },
    {
      standard: "ISO 9241",
      name: "Human-Centered Design & Usability",
      compliance: 93,
      status: "compliant",
      lastAudit: "2024-06-15",
      nextAudit: "2024-12-15",
      findings: 3,
      areas: [
        { area: "Dashboard Design", score: 95 },
        { area: "User Interaction", score: 92 },
        { area: "Accessibility", score: 90 },
        { area: "User Feedback", score: 94 }
      ]
    }
  ];

  const fraudDetectionMetrics = [
    {
      metric: "Fraud Cases Detected",
      value: "1,847",
      change: "+12.3%",
      trend: "up",
      description: "Total fraud cases identified this month"
    },
    {
      metric: "False Positive Rate",
      value: "2.4%",
      change: "-0.8%",
      trend: "down",
      description: "Improvement in AI accuracy"
    },
    {
      metric: "Average Detection Time",
      value: "1.2s",
      change: "-0.3s",
      trend: "down",
      description: "Real-time fraud identification"
    },
    {
      metric: "Prevention Rate",
      value: "98.7%",
      change: "+1.2%",
      trend: "up",
      description: "Successful fraud prevention"
    }
  ];

  const recentSecurityEvents = [
    {
      id: "SEC-001",
      type: "Blocked Access",
      severity: "medium",
      description: "Multiple failed login attempts from suspicious IP",
      timestamp: "5 minutes ago",
      action: "IP blocked automatically",
      status: "resolved"
    },
    {
      id: "SEC-002",
      type: "Anomaly Detected",
      severity: "high",
      description: "Unusual transaction pattern detected and flagged",
      timestamp: "15 minutes ago",
      action: "Under investigation",
      status: "investigating"
    },
    {
      id: "SEC-003",
      type: "System Update",
      severity: "low",
      description: "Security patches applied successfully",
      timestamp: "1 hour ago",
      action: "System restarted",
      status: "completed"
    },
    {
      id: "SEC-004",
      type: "Compliance Check",
      severity: "low",
      description: "Automated compliance verification completed",
      timestamp: "2 hours ago",
      action: "Report generated",
      status: "completed"
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">System Security Overview</TabsTrigger>
          <TabsTrigger value="compliance">Fraud & Compliance Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Overall Security Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-green-600">96%</div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Excellent security posture</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Active Threats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">0</div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">All systems secure</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Security Events (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">23</div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">All handled automatically</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">99.99%</div>
                  <Server className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {systemSecurityMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{metric.category}</CardTitle>
                      <CardDescription>{metric.details}</CardDescription>
                    </div>
                    <Badge variant={
                      metric.status === 'excellent' ? 'secondary' :
                      metric.status === 'good' ? 'default' :
                      'destructive'
                    }>
                      {metric.score}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={metric.score} className="h-2" />
                  <div className="space-y-2">
                    {metric.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {item.status === 'active' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                          <span>{item.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.lastCheck}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Recent Security Events
              </CardTitle>
              <CardDescription>
                Real-time monitoring and automated response to security incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSecurityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono">{event.id}</TableCell>
                      <TableCell>{event.type}</TableCell>
                      <TableCell>{event.description}</TableCell>
                      <TableCell>
                        <Badge variant={
                          event.severity === 'high' ? 'destructive' :
                          event.severity === 'medium' ? 'default' :
                          'secondary'
                        }>
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{event.timestamp}</TableCell>
                      <TableCell className="text-sm">{event.action}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {event.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {fraudDetectionMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{metric.metric}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{metric.value}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant={metric.trend === 'up' ? 'secondary' : 'default'} className="text-xs">
                      {metric.change}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{metric.description}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-500" />
                ISO Compliance Standards
              </CardTitle>
              <CardDescription>
                Comprehensive compliance tracking across all industry standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {complianceStandards.map((standard, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium">{standard.standard}</h4>
                        <Badge variant={
                          standard.status === 'compliant' ? 'secondary' :
                          standard.status === 'review' ? 'default' :
                          'destructive'
                        }>
                          {standard.status}
                        </Badge>
                        {standard.findings > 0 && (
                          <Badge variant="outline" className="text-orange-600">
                            {standard.findings} finding{standard.findings > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{standard.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{standard.compliance}%</div>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                    {standard.areas.map((area, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{area.area}</span>
                          <span className="font-medium">{area.score}%</span>
                        </div>
                        <Progress value={area.score} className="h-1" />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Last Audit: {standard.lastAudit}</span>
                    <span>Next Audit: {standard.nextAudit}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-500" />
                Compliance Actions & Recommendations
              </CardTitle>
              <CardDescription>
                Automated compliance monitoring and actionable insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">All critical compliance requirements met</p>
                    <p className="text-sm text-muted-foreground">All systems are operating within compliance standards</p>
                  </div>
                  <Button size="sm" variant="outline">View Report</Button>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Database className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Blockchain audit trail maintained</p>
                    <p className="text-sm text-muted-foreground">Immutable records ensure complete audit transparency</p>
                  </div>
                  <Button size="sm" variant="outline">View Ledger</Button>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Minor findings require attention</p>
                    <p className="text-sm text-muted-foreground">7 non-critical items identified across compliance areas</p>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
