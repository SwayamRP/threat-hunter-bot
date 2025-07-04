import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Shield, AlertTriangle, Settings, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SecurityAnalyzer } from "@/utils/securityAnalyzer";
import { OpenAIService } from "@/utils/openaiService";
import { ApiKeyModal } from "@/components/ApiKeyModal";

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
      text: "Hello! I'm CyberGuard AI, powered by GPT-4o for advanced cybersecurity assistance. I'm actively monitoring this website for threats and can help you with security concerns. How can I assist you today?",
      sender: "ai",
      type: "normal",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [openaiService] = useState(new OpenAIService());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check if OpenAI API key is set
    if (!openaiService.hasApiKey()) {
      setShowApiKeyModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsAnalyzing(true);

    try {
      // Prepare conversation context for OpenAI
      const conversationMessages = messages
        .filter(msg => msg.type !== "threat") // Exclude threat notifications from conversation
        .slice(-10) // Keep last 10 messages for context
        .map(msg => ({
          role: msg.sender === "user" ? "user" as const : "assistant" as const,
          content: msg.text
        }));

      // Add the current user message
      conversationMessages.push({
        role: "user" as const,
        content: currentInput
      });

      const aiResponse = await openaiService.generateResponse(conversationMessages);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "ai",
        type: "analysis",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      let errorMessage = "I apologize, but I encountered an error processing your request. ";
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid API key')) {
          errorMessage += "Please check your OpenAI API key and try again.";
          setShowApiKeyModal(true);
        } else if (error.message.includes('rate limit')) {
          errorMessage += "API rate limit exceeded. Please try again in a few minutes.";
        } else {
          errorMessage += "Please try again later.";
        }
      }
      
      const errorAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        sender: "ai",
        type: "normal",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorAiMessage]);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate response",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApiKeySet = (apiKey: string) => {
    openaiService.setApiKey(apiKey);
    toast({
      title: "API Key Set",
      description: "GPT-4o integration is now active!",
    });
  };

  const handleClearApiKey = () => {
    openaiService.clearApiKey();
    toast({
      title: "API Key Cleared",
      description: "GPT-4o integration disabled",
    });
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
                <Badge variant="secondary" className={openaiService.hasApiKey() ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
                  {openaiService.hasApiKey() ? "GPT-4o" : "Basic"}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApiKeyModal(true)}
                  className="text-white hover:bg-white/20"
                  title="Configure OpenAI API"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
                      <span className="text-sm whitespace-pre-wrap">{message.text}</span>
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
                      {openaiService.hasApiKey() ? "GPT-4o is thinking..." : "Analyzing security data..."}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-4 border-t border-slate-700">
              {!openaiService.hasApiKey() && (
                <div className="mb-2 p-2 bg-amber-900/20 border border-amber-600 rounded text-xs text-amber-200 flex items-center gap-2">
                  <Key className="h-3 w-3" />
                  <span>Set OpenAI API key for GPT-4o responses</span>
                </div>
              )}
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message CyberGuard AI..."
                  className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 resize-none pr-12 min-h-[44px] max-h-[120px]"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isAnalyzing || !inputMessage.trim()}
                  className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onApiKeySet={handleApiKeySet}
      />
    </>
  );
};
