
interface ThreatInfo {
  type: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: Date;
  source?: string;
}

export class SecurityAnalyzer {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private threatCallback: ((threat: ThreatInfo) => void) | null = null;
  private suspiciousPatterns = [
    /eval\s*\(/gi,
    /document\.write\s*\(/gi,
    /innerHTML\s*=.*<script/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
  ];

  private phishingIndicators = [
    /urgent.*action.*required/gi,
    /verify.*account.*immediately/gi,
    /suspended.*account/gi,
    /click.*here.*now/gi,
    /limited.*time.*offer/gi,
  ];

  startMonitoring(onThreatDetected: (threat: ThreatInfo) => void) {
    this.threatCallback = onThreatDetected;
    
    // Monitor DOM changes
    this.observeDOM();
    
    // Monitor network requests
    this.monitorNetworkRequests();
    
    // Periodic security scans
    this.monitoringInterval = setInterval(() => {
      this.performSecurityScan();
    }, 30000); // Every 30 seconds

    console.log("CyberGuard AI: Security monitoring started");
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log("CyberGuard AI: Security monitoring stopped");
  }

  private observeDOM() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.analyzeElement(node as Element);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private analyzeElement(element: Element) {
    const html = element.outerHTML || '';
    
    // Check for suspicious patterns
    this.suspiciousPatterns.forEach((pattern) => {
      if (pattern.test(html)) {
        this.reportThreat({
          type: "Malicious Code Injection",
          description: `Suspicious JavaScript pattern detected in DOM element`,
          severity: "HIGH",
          timestamp: new Date(),
          source: "DOM Analysis"
        });
      }
    });

    // Check for suspicious attributes
    if (element.hasAttribute('onclick') || element.hasAttribute('onload')) {
      const handler = element.getAttribute('onclick') || element.getAttribute('onload') || '';
      if (this.containsSuspiciousCode(handler)) {
        this.reportThreat({
          type: "Suspicious Event Handler",
          description: `Potentially malicious event handler detected`,
          severity: "MEDIUM",
          timestamp: new Date(),
          source: "Attribute Analysis"
        });
      }
    }

    // Check for phishing content
    const textContent = element.textContent || '';
    this.phishingIndicators.forEach((indicator) => {
      if (indicator.test(textContent)) {
        this.reportThreat({
          type: "Phishing Content",
          description: `Potential phishing language detected: suspicious urgency patterns`,
          severity: "HIGH",
          timestamp: new Date(),
          source: "Content Analysis"
        });
      }
    });
  }

  private monitorNetworkRequests() {
    // Override fetch to monitor requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [resource] = args;
      let url: string;
      
      if (typeof resource === 'string') {
        url = resource;
      } else if (resource instanceof Request) {
        url = resource.url;
      } else {
        url = resource.toString();
      }
      
      this.analyzeURL(url);
      
      return originalFetch.apply(window, args);
    };

    // Override XMLHttpRequest
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url) {
      if (typeof url === 'string') {
        // Use a SecurityAnalyzer instance to analyze the URL
        const analyzer = new SecurityAnalyzer();
        analyzer.analyzeURL(url);
      }
      return originalXHR.apply(this, [method, url] as any);
    };
  }

  private analyzeURL(url: string) {
    try {
      const urlObj = new URL(url);
      
      // Check for suspicious domains
      const suspiciousDomains = [
        'bit.ly', 'tinyurl.com', 'short.link', 'suspicious-domain.com'
      ];
      
      if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
        this.reportThreat({
          type: "Suspicious URL",
          description: `Request to potentially malicious domain: ${urlObj.hostname}`,
          severity: "MEDIUM",
          timestamp: new Date(),
          source: "Network Monitor"
        });
      }

      // Check for suspicious parameters
      const suspiciousParams = ['exec', 'cmd', 'eval', 'script'];
      suspiciousParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          this.reportThreat({
            type: "Suspicious URL Parameter",
            description: `URL contains potentially dangerous parameter: ${param}`,
            severity: "HIGH",
            timestamp: new Date(),
            source: "URL Analysis"
          });
        }
      });

    } catch (error) {
      // Invalid URL, potentially suspicious
      if (url.includes('javascript:') || url.includes('data:')) {
        this.reportThreat({
          type: "Malicious URL Scheme",
          description: `Dangerous URL scheme detected: ${url.substring(0, 50)}...`,
          severity: "CRITICAL",
          timestamp: new Date(),
          source: "URL Validation"
        });
      }
    }
  }

  private performSecurityScan() {
    // Check for suspicious global variables
    const suspiciousGlobals = ['eval', 'Function', 'setTimeout', 'setInterval'];
    suspiciousGlobals.forEach(globalVar => {
      if (window[globalVar as keyof Window] && typeof window[globalVar as keyof Window] !== 'function') {
        this.reportThreat({
          type: "Global Variable Tampering",
          description: `Suspicious modification of global ${globalVar}`,
          severity: "HIGH",
          timestamp: new Date(),
          source: "Global Scan"
        });
      }
    });

    // Check for iframe injections
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.src;
      if (src && (src.includes('javascript:') || src.includes('data:'))) {
        this.reportThreat({
          type: "Suspicious Iframe",
          description: `Iframe with dangerous source detected`,
          severity: "HIGH",
          timestamp: new Date(),
          source: "Iframe Scan"
        });
      }
    });

    // Check for form tampering
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const action = form.action;
      if (action && !action.startsWith(window.location.origin) && !action.startsWith('https://')) {
        this.reportThreat({
          type: "Suspicious Form Action",
          description: `Form submitting to external or insecure endpoint`,
          severity: "MEDIUM",
          timestamp: new Date(),
          source: "Form Analysis"
        });
      }
    });
  }

  private containsSuspiciousCode(code: string): boolean {
    return this.suspiciousPatterns.some(pattern => pattern.test(code));
  }

  private reportThreat(threat: ThreatInfo) {
    console.warn('CyberGuard AI - Threat Detected:', threat);
    if (this.threatCallback) {
      this.threatCallback(threat);
    }
  }

  // Public method for manual URL analysis
  public analyzeURLManually(url: string): Promise<{ safe: boolean; issues: string[] }> {
    return new Promise((resolve) => {
      const issues: string[] = [];
      
      try {
        const urlObj = new URL(url);
        
        // Check protocol
        if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
          issues.push('Non-standard protocol detected');
        }
        
        // Check for suspicious patterns in URL
        if (url.includes('..') || url.includes('//')) {
          issues.push('Path traversal patterns detected');
        }
        
        // Check domain reputation (simplified)
        const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf'];
        if (suspiciousTLDs.some(tld => urlObj.hostname.endsWith(tld))) {
          issues.push('Domain uses suspicious TLD');
        }
        
        resolve({
          safe: issues.length === 0,
          issues
        });
        
      } catch (error) {
        issues.push('Invalid URL format');
        resolve({ safe: false, issues });
      }
    });
  }
}
