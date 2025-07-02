
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SecurityAnalyzer } from "@/utils/securityAnalyzer";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  type?: "normal" | "threat" | "analysis";
  timestamp: Date;
}

export const CyberSecurityChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm CyberGuard AI, your cybersecurity assistant. I'm actively monitoring this website for threats and can help you with security concerns. How can I assist you today?",
      sender: "ai",
      type: "normal",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start continuous threat monitoring
    const analyzer = new SecurityAnalyzer();
    analyzer.startMonitoring((threat) => {
      const threatMessage: Message = {
        id: Date.now().toString(),
        text: `🚨 THREAT DETECTED: ${threat.type} - ${threat.description}. Risk Level: ${threat.severity}`,
        sender: "ai",
        type: "threat",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, threatMessage]);
      
      toast({
        title: "Security Threat Detected",
        description: threat.description,
        variant: "destructive",
      });
    });

    return () => analyzer.stopMonitoring();
  }, [toast]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "ai",
        type: "analysis",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsAnalyzing(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes("malware") || input.includes("virus")) {
      return "I've initiated a malware scan. Current status: No active malware detected. I recommend regular system updates and avoiding suspicious downloads. Would you like me to analyze a specific file or URL?";
    }
    
    if (input.includes("phishing") || input.includes("email")) {
      return "Phishing protection is active. I'm monitoring for suspicious links and emails. Key signs of phishing: unexpected urgent requests, suspicious sender addresses, and requests for sensitive information. Always verify sender identity before clicking links.";
    }
    
    if (input.includes("security") || input.includes("protect")) {
      return "Current security status: PROTECTED. Active monitoring includes: Real-time threat detection, suspicious activity analysis, and automated threat response. Your website is being continuously monitored for vulnerabilities.";
    }
    
    if (input.includes("analyze") || input.includes("check")) {
      return "I can analyze URLs, files, network traffic, and user behavior patterns for security threats. Please provide the specific item you'd like me to analyze, and I'll perform a comprehensive security assessment.";
    }
    
    return "I'm here to help with cybersecurity concerns. I can detect malware, identify phishing attempts, analyze suspicious activities, and provide security recommendations. What specific security issue would you like me to address?";
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case "threat":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "analysis":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] z-50 shadow-2xl border-slate-700 bg-slate-900">
          <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                CyberGuard AI
                <Badge variant="secondary" className="bg-green-500 text-white">
                  Online
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-[400px]">
            <ScrollArea className="flex-1 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      message.sender === "user"
                        ? "bg-cyan-600 text-white"
                        : message.type === "threat"
                        ? "bg-red-900 text-red-100 border border-red-600"
                        : "bg-slate-800 text-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {getMessageIcon(message.type)}
                      <span className="text-sm">{message.text}</span>
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isAnalyzing && (
                <div className="text-left mb-4">
                  <div className="inline-block p-3 rounded-lg bg-slate-800 text-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                      Analyzing security data...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about security threats..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isAnalyzing}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
