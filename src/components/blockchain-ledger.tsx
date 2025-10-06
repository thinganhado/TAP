import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Shield, Lock, CheckCircle, Clock, Link, Hash } from "lucide-react";

const blockchainTransactions = [
  {
    blockHeight: 15420,
    hash: "0xa1b2c3d4e5f6789...",
    timestamp: "2024-09-15 14:23:45",
    transactions: 47,
    validator: "Node-7891",
    gasUsed: "2.3M",
    status: "confirmed",
    fraudChecks: 47,
    fraudDetected: 0
  },
  {
    blockHeight: 15419,
    hash: "0xf6e5d4c3b2a1098...",
    timestamp: "2024-09-15 14:22:30",
    transactions: 52,
    validator: "Node-4521",
    gasUsed: "2.8M",
    status: "confirmed",
    fraudChecks: 52,
    fraudDetected: 1
  },
  {
    blockHeight: 15418,
    hash: "0x123456789abcdef...",
    timestamp: "2024-09-15 14:21:15",
    transactions: 39,
    validator: "Node-9876",
    gasUsed: "1.9M",
    status: "confirmed",
    fraudChecks: 39,
    fraudDetected: 0
  }
];

const smartContracts = [
  {
    id: "SC-001",
    name: "FraudDetectionValidator",
    address: "0x742d35Cc6681C74b...",
    purpose: "Automatic fraud check on high-value transactions",
    triggers: 1247,
    successRate: 94.7,
    gasEfficiency: "High",
    lastExecution: "2 minutes ago"
  },
  {
    id: "SC-002", 
    name: "DocumentVerifier",
    address: "0x9381bC4F2a1dE67f...",
    purpose: "Verify document authenticity through consensus",
    triggers: 892,
    successRate: 98.2,
    gasEfficiency: "Medium",
    lastExecution: "5 minutes ago"
  },
  {
    id: "SC-003",
    name: "RiskScoreOracle",
    address: "0x4f7A2b8c9D1E3F56...",
    purpose: "Calculate and store immutable risk scores",
    triggers: 2156,
    successRate: 99.1,
    gasEfficiency: "High",
    lastExecution: "1 minute ago"
  }
];

const auditTrail = [
  {
    id: "AUDIT-789123",
    action: "Transaction Flagged",
    txnHash: "0xa1b2c3d4e5f6789...",
    amount: "$12,450.00",
    reason: "ML model detected anomaly",
    timestamp: "2024-09-15 14:23:45",
    blockHeight: 15420,
    immutable: true,
    verified: true
  },
  {
    id: "AUDIT-789124",
    action: "Document Verified",
    docHash: "0xf6e5d4c3b2a1098...",
    document: "Loan Application #LA-2024-001",
    reason: "NLP verification passed",
    timestamp: "2024-09-15 14:22:30",
    blockHeight: 15419,
    immutable: true,
    verified: true
  },
  {
    id: "AUDIT-789125",
    action: "Risk Score Updated",
    userHash: "0x123456789abcdef...",
    newScore: "7.2/10",
    reason: "Behavioral analysis change",
    timestamp: "2024-09-15 14:21:15",
    blockHeight: 15418,
    immutable: true,
    verified: true
  }
];

export function BlockchainLedger() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="blocks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="blocks">Blockchain Blocks</TabsTrigger>
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="integrity">Data Integrity</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-blue-500" />
                Blockchain Transaction Ledger
              </CardTitle>
              <CardDescription>
                Immutable record of all fraud detection activities and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Block Height</TableHead>
                    <TableHead>Block Hash</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Validator</TableHead>
                    <TableHead>Fraud Checks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockchainTransactions.map((block) => (
                    <TableRow key={block.blockHeight}>
                      <TableCell className="font-mono">{block.blockHeight}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {block.hash}
                      </TableCell>
                      <TableCell className="text-sm">{block.timestamp}</TableCell>
                      <TableCell>{block.transactions}</TableCell>
                      <TableCell className="font-mono text-sm">{block.validator}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{block.fraudChecks}</span>
                          {block.fraudDetected > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {block.fraudDetected} fraud
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Confirmed</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          View Block
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-purple-500" />
                Smart Contract Fraud Prevention
              </CardTitle>
              <CardDescription>
                Automated fraud detection and prevention through smart contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {smartContracts.map((contract) => (
                  <div key={contract.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{contract.name}</h4>
                        <p className="text-sm text-muted-foreground font-mono">{contract.address}</p>
                      </div>
                      <Badge variant="outline">{contract.id}</Badge>
                    </div>
                    
                    <p className="text-sm mb-4">{contract.purpose}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Executions:</span>
                        <div className="font-medium">{contract.triggers.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <div className="font-medium text-green-600">{contract.successRate}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gas Efficiency:</span>
                        <div className="font-medium">
                          <Badge variant={
                            contract.gasEfficiency === 'High' ? 'secondary' :
                            contract.gasEfficiency === 'Medium' ? 'default' :
                            'destructive'
                          }>
                            {contract.gasEfficiency}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Execution:</span>
                        <div className="font-medium">{contract.lastExecution}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        View Code
                      </Button>
                      <Button size="sm" variant="outline">
                        Execution History
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Immutable Audit Trail
              </CardTitle>
              <CardDescription>
                Tamper-proof record of all fraud detection and prevention activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Audit ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Block Height</TableHead>
                    <TableHead>Integrity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditTrail.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell className="font-mono">{audit.id}</TableCell>
                      <TableCell>{audit.action}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {audit.txnHash || audit.docHash || audit.userHash}
                      </TableCell>
                      <TableCell className="text-sm">{audit.reason}</TableCell>
                      <TableCell className="font-mono">{audit.blockHeight}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <Lock className="h-4 w-4 text-blue-500" />
                          <span className="text-xs text-green-600">Verified</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Verify Hash
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-500" />
                  Data Integrity Metrics
                </CardTitle>
                <CardDescription>
                  Blockchain-based integrity verification and tamper detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Hash Verification Success</span>
                  <span className="text-green-600 font-medium">100%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Block Validation Rate</span>
                  <span className="text-green-600 font-medium">99.98%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Consensus Nodes Active</span>
                  <span className="font-medium">47/50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Network Latency</span>
                  <span className="font-medium">1.2s avg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Last Integrity Check</span>
                  <span className="font-medium">30 seconds ago</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Real-Time Monitoring
                </CardTitle>
                <CardDescription>
                  Live blockchain network status and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Network Status</span>
                  <Badge variant="secondary" className="text-green-600">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Current Block Height</span>
                  <span className="font-mono">15,420</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending Transactions</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Gas Price</span>
                  <span className="font-medium">12.5 Gwei</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Block Time</span>
                  <span className="font-medium">1.2s avg</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Blockchain Network Visualization</CardTitle>
              <CardDescription>
                Visual representation of the fraud prevention blockchain network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/20 rounded-lg p-8 text-center">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm">Genesis Block</span>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-8 h-px bg-gray-300"></div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm">Validated Blocks</span>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-8 h-px bg-gray-300"></div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm">Current Block</span>
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