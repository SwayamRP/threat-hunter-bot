
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class OpenAIService {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = localStorage.getItem('openai_api_key');
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async generateResponse(messages: OpenAIMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set');
    }

    const systemPrompt = `You are CyberGuard AI, an advanced cybersecurity assistant with expertise in:
- Threat detection and analysis
- Malware identification and mitigation
- Phishing prevention and user education
- Network security monitoring
- Vulnerability assessment
- Security best practices and compliance
- Incident response and forensics
- Risk assessment and management

You provide accurate, helpful, and actionable cybersecurity advice. You can analyze security threats, explain complex security concepts in simple terms, and guide users through security procedures. Always prioritize user safety and data protection.

Current context: You are actively monitoring this website for security threats in real-time.`;

    const requestMessages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: requestMessages,
          max_tokens: 1500,
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key.');
        } else if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`API request failed: ${response.status}`);
        }
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('openai_api_key');
  }
}
