import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, AlertTriangle, Shield, Target, Brain, Activity, MapPin } from "lucide-react";

const fraudTrendsData = [
  { month: 'Jan', detected: 145, prevented: 132, loss: 89000 },
  { month: 'Feb', detected: 167, prevented: 152, loss: 76000 },
  { month: 'Mar', detected: 189, prevented: 174, loss: 65000 },
  { month: 'Apr', detected: 201, prevented: 188, loss: 58000 },
  { month: 'May', detected: 156, prevented: 143, loss: 71000 },
  { month: 'Jun', detected: 134, prevented: 125, loss: 82000 },
  { month: 'Jul', detected: 178, prevented: 165, loss: 67000 },
  { month: 'Aug', detected: 192, prevented: 181, loss: 54000 },
  { month: 'Sep', detected: 223, prevented: 209, loss: 47000 }
];

const fraudTypesData = [
  { name: 'Credit Card Fraud', value: 35, color: '#ef4444' },
  { name: 'Identity Theft', value: 28, color: '#f59e0b' },
  { name: 'Account Takeover', value: 18, color: '#8b5cf6' },
  { name: 'Wire Fraud', value: 12, color: '#06b6d4' },
  { name: 'Document Fraud', value: 7, color: '#10b981' }
];

const modelPerformanceData = [
  { model: 'DeepFraud-v3', precision: 94.2, recall: 91.8, f1Score: 93.0, accuracy: 95.1 },
  { model: 'GraphNet-v2', precision: 91.5, recall: 89.3, f1Score: 90.4, accuracy: 92.7 },
  { model: 'FinBERT-v2', precision: 87.9, recall: 88.7, f1Score: 88.3, accuracy: 89.4 },
  { model: 'BehaviorNet-v1', precision: 83.2, recall: 85.1, f1Score: 84.1, accuracy: 86.8 }
];

const geographicData = [
  { region: 'North America', incidents: 456, trend: '+12%' },
  { region: 'Europe', incidents: 324, trend: '-8%' },
  { region: 'Asia Pacific', incidents: 287, trend: '+23%' },
  { region: 'Latin America', incidents: 156, trend: '+5%' },
  { region: 'Middle East & Africa', incidents: 89, trend: '-3%' }
];

const riskMetrics = [
  { time: '00:00', riskScore: 3.2, alertsGenerated: 12, falsePositives: 2 },
  { time: '04:00', riskScore: 2.8, alertsGenerated: 8, falsePositives: 1 },
  { time: '08:00', riskScore: 5.1, alertsGenerated: 28, falsePositives: 4 },
  { time: '12:00', riskScore: 7.3, alertsGenerated: 45, falsePositives: 7 },
  { time: '16:00', riskScore: 6.8, alertsGenerated: 38, falsePositives: 5 },
  { time: '20:00', riskScore: 4.2, alertsGenerated: 19, falsePositives: 3 }
];

// Geographic incident data for scatter plot visualization
const incidentLocations = [
  { city: 'New York', incidents: 95, lat: 40.7, lng: -74.0, severity: 'high' },
  { city: 'London', incidents: 78, lat: 51.5, lng: -0.1, severity: 'medium' },
  { city: 'Mumbai', incidents: 62, lat: 19.1, lng: 72.9, severity: 'high' },
  { city: 'Sydney', incidents: 45, lat: -33.9, lng: 151.2, severity: 'low' },
  { city: 'Toronto', incidents: 52, lat: 43.7, lng: -79.4, severity: 'medium' },
  { city: 'Tokyo', incidents: 67, lat: 35.7, lng: 139.7, severity: 'medium' },
  { city: 'Berlin', incidents: 38, lat: 52.5, lng: 13.4, severity: 'low' },
  { city: 'São Paulo', incidents: 41, lat: -23.5, lng: -46.6, severity: 'medium' },
  { city: 'Dubai', incidents: 33, lat: 25.3, lng: 55.3, severity: 'low' },
  { city: 'Singapore', incidents: 29, lat: 1.4, lng: 103.8, severity: 'low' }
];

export function AnalyticsDashboard() {
  const severityBadge = (sev) => {
    if (sev === 'high') return <Badge variant="destructive">High</Badge>;
    if (sev === 'medium') return <Badge variant="default">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fraud Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive fraud detection and prevention analytics</p>
        </div>
        <Select defaultValue="7days">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24hours">24 Hours</SelectItem>
            <SelectItem value="7days">7 Days</SelectItem>
            <SelectItem value="30days">30 Days</SelectItem>
            <SelectItem value="90days">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="geographic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Fraud Trends</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="risk">Risk Metrics</TabsTrigger>
          <TabsTrigger value="investigations">Investigations</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Fraud Detection Trends
                </CardTitle>
                <CardDescription>
                  Monthly fraud detection and prevention effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={fraudTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="detected" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Detected" />
                    <Area type="monotone" dataKey="prevented" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Prevented" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Fraud Types Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of detected fraud types by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={fraudTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fraudTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Financial Loss Prevention
              </CardTitle>
              <CardDescription>
                Estimated financial losses prevented through AI fraud detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={fraudTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Losses Prevented"]} />
                  <Bar dataKey="loss" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-orange-500" />
                AI Model Performance Metrics
              </CardTitle>
              <CardDescription>
                Comparative performance analysis of fraud detection models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modelPerformanceData.map((model, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{model.model}</h4>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{model.precision}%</div>
                        <div className="text-sm text-muted-foreground">Precision</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{model.recall}%</div>
                        <div className="text-sm text-muted-foreground">Recall</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{model.f1Score}%</div>
                        <div className="text-sm text-muted-foreground">F1-Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{model.accuracy}%</div>
                        <div className="text-sm text-muted-foreground">Accuracy</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-500" />
                Geographic Fraud Distribution
              </CardTitle>
              <CardDescription>
                Regional analysis of fraud incidents and global incident distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                {/* Geographic Incident Chart */}
                <div className="md:col-span-3">
                  <div className="h-[420px] w-full rounded-xl overflow-hidden border p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <h4 className="font-medium">Global Incident Distribution</h4>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="lng" 
                          domain={[-180, 180]}
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                          label={{ value: 'Longitude', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          dataKey="lat" 
                          domain={[-90, 90]}
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                          label={{ value: 'Latitude', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length > 0) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-background border rounded-lg p-3 shadow-lg">
                                  <div className="font-medium">{data.city}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Incidents: {data.incidents}
                                  </div>
                                  <div className="text-sm flex items-center gap-2">
                                    Severity: {severityBadge(data.severity)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {data.lat.toFixed(2)}°, {data.lng.toFixed(2)}°
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter 
                          data={incidentLocations} 
                          fill="#ef4444"
                          shape="circle"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Region summary */}
                <div className="md:col-span-2 space-y-4">
                  {geographicData.map((region, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{region.region}</h4>
                        <div className="text-sm text-muted-foreground">
                          {region.incidents} incidents detected
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={region.trend.startsWith('+') ? 'destructive' : 'secondary'}>
                          {region.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Real-Time Risk Metrics
              </CardTitle>
              <CardDescription>
                Dynamic risk assessment and alert generation patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={riskMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="riskScore" stroke="#ef4444" strokeWidth={2} name="Risk Score" />
                  <Line type="monotone" dataKey="alertsGenerated" stroke="#f59e0b" strokeWidth={2} name="Alerts Generated" />
                  <Line type="monotone" dataKey="falsePositives" stroke="#8b5cf6" strokeWidth={2} name="False Positives" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">6.7</div>
                <div className="text-sm text-muted-foreground">Average Risk Score</div>
                <div className="text-xs text-green-600 mt-1">↓ 12% from last week</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">2,456</div>
                <div className="text-sm text-muted-foreground">Alerts Generated</div>
                <div className="text-xs text-red-600 mt-1">↑ 8% from last week</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">4.2%</div>
                <div className="text-sm text-muted-foreground">False Positive Rate</div>
                <div className="text-xs text-green-600 mt-1">↓ 23% from last week</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investigations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Investigation Status</CardTitle>
                <CardDescription>Current status of fraud investigations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Open Investigations</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Under Review</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Resolved This Week</span>
                  <span className="font-medium text-green-600">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Resolution Time</span>
                  <span className="font-medium">2.3 days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investigation Outcomes</CardTitle>
                <CardDescription>Results of completed fraud investigations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Confirmed Fraud</span>
                  <span className="font-medium text-red-600">89%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>False Positives</span>
                  <span className="font-medium text-orange-600">8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Inconclusive</span>
                  <span className="font-medium text-gray-600">3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Recovery Rate</span>
                  <span className="font-medium text-green-600">73%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Investigation Actions</CardTitle>
              <CardDescription>Latest activities in fraud investigation pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Account Freeze - USR-7891</h4>
                    <p className="text-sm text-muted-foreground">Suspicious transaction pattern detected</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">Critical</Badge>
                    <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Document Verification - DOC-2024-002</h4>
                    <p className="text-sm text-muted-foreground">NLP analysis flagged potential forgery</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">In Progress</Badge>
                    <div className="text-xs text-muted-foreground mt-1">5 hours ago</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Case Closed - INV-2024-089</h4>
                    <p className="text-sm text-muted-foreground">Investigation concluded, fraud confirmed</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Resolved</Badge>
                    <div className="text-xs text-muted-foreground mt-1">1 day ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}