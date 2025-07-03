
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, AlertCircle } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySet: (apiKey: string) => void;
}

export const ApiKeyModal = ({ isOpen, onClose, onApiKeySet }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsValidating(true);
    try {
      // Basic validation - check if it looks like an OpenAI API key
      if (!apiKey.startsWith('sk-') || apiKey.length < 50) {
        throw new Error('Invalid API key format');
      }
      
      onApiKeySet(apiKey);
      setApiKey("");
      onClose();
    } catch (error) {
      console.error('API key validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Key className="h-5 w-5 text-cyan-400" />
            OpenAI API Key Required
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-white">
              Enter your OpenAI API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="bg-slate-800 border-slate-600 text-white"
              required
            />
          </div>
          <div className="flex items-start gap-2 p-3 bg-amber-900/20 border border-amber-600 rounded-md">
            <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-200">
              <p className="font-medium">Important:</p>
              <p>Your API key is stored locally in your browser and never sent to our servers. For production use, consider connecting to Supabase for secure key management.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isValidating || !apiKey.trim()}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700"
            >
              {isValidating ? 'Validating...' : 'Set API Key'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
