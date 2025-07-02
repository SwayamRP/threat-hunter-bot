
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Shield, Search, Globe } from "lucide-react";
import { SecurityAnalyzer } from "@/utils/securityAnalyzer";
import { useToast } from "@/hooks/use-toast";

interface ThreatLog {
  id: string;
  type: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: Date;
  source: string;
  status: "detected" | "blocked" | "resolved";
}

export const ThreatMonitor = () => {
  const [threats, setThreats] = useState<ThreatLog[]>([]);
  const [urlToAnalyze, setUrlToAnalyze] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Add some sample threats for demonstration
    const sampleThreats: ThreatLog[] = [
      {
        id: "1",
        type: "Phishing Attempt",
        description: "Suspicious email content detected with urgency patterns",
        severity: "HIGH",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        source: "Content Analysis",
        status: "blocked"
      },
      {
        id: "2",
        type: "Suspicious URL",
        description: "Request to potentially malicious domain blocked",
        severity: "MEDIUM",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        source: "Network Monitor",
        status: "blocked"
      }
    ];
    setThreats(sampleThreats);
  }, []);

  const analyzeURL = async () => {
    if (!urlToAnalyze.trim()) return;
    
    setAnalyzing(true);
    const analyzer = new SecurityAnalyzer();
    
    try {
      const result = await analyzer.analyzeURLManually(urlToAnalyze);
      
      const newThreat: ThreatLog = {
        id: Date.now().toString(),
        type: result.safe ? "URL Safe" : "Suspicious URL",
        description: result.safe 
          ? "URL analysis completed - No threats detected"
          : `URL analysis found issues: ${result.issues.join(", ")}`,
        severity: result.safe ? "LOW" : "MEDIUM",
        timestamp: new Date(),
        source: "Manual Analysis",
        status: result.safe ? "resolved" : "detected"
      };
      
      setThreats(prev => [newThreat, ...prev]);
      
      toast({
        title: result.safe ? "URL is Safe" : "Potential Threat Detected",
        description: newThreat.description,
        variant: result.safe ? "default" : "destructive",
      });
      
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze URL",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
      setUrlToAnalyze("");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "bg-red-600";
      case "HIGH": return "bg-orange-600";
      case "MEDIUM": return "bg-yellow-600";
      case "LOW": return "bg-green-600";
      default: return "bg-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "blocked": return "bg-red-600";
      case "detected": return "bg-yellow-600";
      case "resolved": return "bg-green-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* URL Analysis Tool */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Search className="h-5 w-5 text-cyan-400" />
            URL Security Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={urlToAnalyze}
              onChange={(e) => setUrlToAnalyze(e.target.value)}
              placeholder="Enter URL to analyze for security threats..."
              className="bg-slate-900 border-slate-600 text-white placeholder-gray-400"
              onKeyPress={(e) => e.key === "Enter" && analyzeURL()}
            />
            <Button 
              onClick={analyzeURL}
              disabled={analyzing || !urlToAnalyze.trim()}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {analyzing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Globe className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Threat Log */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            Threat Detection Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {threats.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <p>No threats detected. Your system is secure!</p>
              </div>
            ) : (
              threats.map((threat) => (
                <div
                  key={threat.id}
                  className="bg-slate-900/50 p-4 rounded-lg border border-slate-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{threat.type}</h3>
                      <Badge className={`${getSeverityColor(threat.severity)} text-white`}>
                        {threat.severity}
                      </Badge>
                      <Badge className={`${getStatusColor(threat.status)} text-white`}>
                        {threat.status.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-400">
                      {threat.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-2">{threat.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Source: {threat.source}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {threats.filter(t => t.severity === "CRITICAL").length}
            </div>
            <div className="text-sm text-gray-400">Critical</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {threats.filter(t => t.severity === "HIGH").length}
            </div>
            <div className="text-sm text-gray-400">High</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {threats.filter(t => t.severity === "MEDIUM").length}
            </div>
            <div className="text-sm text-gray-400">Medium</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {threats.filter(t => t.status === "blocked").length}
            </div>
            <div className="text-sm text-gray-400">Blocked</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
