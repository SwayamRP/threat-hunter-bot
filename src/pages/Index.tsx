
import { useState } from "react";
import { CyberSecurityChatbot } from "@/components/CyberSecurityChatbot";
import { ThreatMonitor } from "@/components/ThreatMonitor";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { Shield } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-cyan-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">CyberGuard AI</h1>
          </div>
          <p className="text-xl text-cyan-200">Advanced AI-Powered Cybersecurity Monitoring</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 rounded-lg p-1 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "dashboard"
                  ? "bg-cyan-600 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Security Dashboard
            </button>
            <button
              onClick={() => setActiveTab("monitor")}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "monitor"
                  ? "bg-cyan-600 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Threat Monitor
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === "dashboard" && <SecurityDashboard />}
          {activeTab === "monitor" && <ThreatMonitor />}
        </div>
      </div>

      {/* Always-available floating chatbot */}
      <CyberSecurityChatbot />
    </div>
  );
};

export default Index;
