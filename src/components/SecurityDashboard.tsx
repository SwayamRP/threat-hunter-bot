
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle, Activity } from "lucide-react";

interface SecurityMetrics {
  threatsBlocked: number;
  securityScore: number;
  activeMonitoring: boolean;
  lastScan: Date;
  vulnerabilities: number;
}

export const SecurityDashboard = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    threatsBlocked: 0,
    securityScore: 95,
    activeMonitoring: true,
    lastScan: new Date(),
    vulnerabilities: 0,
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 2),
        securityScore: Math.max(90, Math.min(100, prev.securityScore + (Math.random() - 0.5) * 2)),
        lastScan: new Date(),
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getSecurityStatus = (score: number) => {
    if (score >= 90) return { status: "Secure", color: "bg-green-500", icon: CheckCircle };
    if (score >= 70) return { status: "Warning", color: "bg-yellow-500", icon: AlertTriangle };
    return { status: "Critical", color: "bg-red-500", icon: AlertTriangle };
  };

  const securityStatus = getSecurityStatus(metrics.securityScore);
  const StatusIcon = securityStatus.icon;

  return (
    <div className="space-y-6">
      {/* Main Security Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <Shield className="h-6 w-6 text-cyan-400" />
            Security Status
            <Badge 
              className={`${securityStatus.color} text-white`}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {securityStatus.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-white mb-2">
                <span>Security Score</span>
                <span className="font-bold">{metrics.securityScore}%</span>
              </div>
              <Progress value={metrics.securityScore} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-white">
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-cyan-400">{metrics.threatsBlocked}</div>
                <div className="text-sm text-gray-300">Threats Blocked Today</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{metrics.vulnerabilities}</div>
                <div className="text-sm text-gray-300">Active Vulnerabilities</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-green-400" />
              Real-time Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-white">
                <span>Malware Detection</span>
                <Badge className="bg-green-600 text-white">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-white">
                <span>Phishing Protection</span>
                <Badge className="bg-green-600 text-white">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-white">
                <span>Network Monitoring</span>
                <Badge className="bg-green-600 text-white">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-white">
                <span>DOM Analysis</span>
                <Badge className="bg-green-600 text-white">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-white">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Security scan completed - No threats found</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Network monitoring active</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>AI model updated with new threat patterns</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Phishing protection enabled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Learning Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">AI Learning & Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <div className="text-lg font-bold text-purple-400">1,247</div>
              <div className="text-sm text-gray-300">Patterns Learned</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <div className="text-lg font-bold text-blue-400">99.2%</div>
              <div className="text-sm text-gray-300">Detection Accuracy</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <div className="text-lg font-bold text-cyan-400">Real-time</div>
              <div className="text-sm text-gray-300">Learning Mode</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
