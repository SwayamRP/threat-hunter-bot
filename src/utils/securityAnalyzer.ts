import { ADVANCED_MALWARE_PATTERNS, PHISHING_INDICATORS, MALICIOUS_DOMAINS, SUSPICIOUS_URLS, NETWORK_THREATS } from './advancedThreatPatterns';
import { ThreatIntelligenceService } from './threatIntelligence';
import { BehaviorAnalyzer } from './behaviorAnalyzer';

interface ThreatInfo {
  type: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: Date;
  source?: string;
  confidence?: number;
  mitigation?: string;
}

export class SecurityAnalyzer {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private threatCallback: ((threat: ThreatInfo) => void) | null = null;
  private threatIntelligence: ThreatIntelligenceService;
  private behaviorAnalyzer: BehaviorAnalyzer;
  private contentSecurityPolicy: string | null = null;
  private performanceMonitor: PerformanceObserver | null = null;

  constructor() {
    this.threatIntelligence = ThreatIntelligenceService.getInstance();
    this.behaviorAnalyzer = new BehaviorAnalyzer();
    this.initializeContentSecurityPolicy();
    this.initializePerformanceMonitoring();
  }

  startMonitoring(onThreatDetected: (threat: ThreatInfo) => void) {
    this.threatCallback = onThreatDetected;
    
    // Enhanced monitoring components
    this.observeDOM();
    this.monitorNetworkRequests();
    this.monitorWebRTC();
    this.monitorServiceWorkers();
    this.monitorWebSockets();
    this.monitorLocalStorage();
    this.monitorBehaviorAnomalies();
    
    // Periodic comprehensive scans
    this.monitoringInterval = setInterval(() => {
      this.performComprehensiveSecurityScan();
    }, 15000); // Every 15 seconds for better real-time protection

    // Update threat intelligence periodically
    setInterval(() => {
      this.threatIntelligence.updateThreatIntelligence();
    }, 3600000); // Every hour

    console.log("CyberGuard AI: Advanced security monitoring started");
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    if (this.performanceMonitor) {
      this.performanceMonitor.disconnect();
    }
    console.log("CyberGuard AI: Security monitoring stopped");
  }

  private initializeContentSecurityPolicy() {
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (metaCSP) {
      this.contentSecurityPolicy = metaCSP.getAttribute('content');
    }
  }

  private initializePerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      this.performanceMonitor = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Check for suspicious performance patterns
          if (entry.duration > 5000) { // Operations taking longer than 5 seconds
            this.reportThreat({
              type: "Performance Anomaly",
              description: `Suspicious long-running operation detected: ${entry.name}`,
              severity: "MEDIUM",
              timestamp: new Date(),
              source: "Performance Monitor",
              confidence: 70
            });
          }
        });
      });
      
      this.performanceMonitor.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }

  private observeDOM() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.analyzeElementAdvanced(node as Element);
            }
          });
        }
        
        // Monitor attribute changes for suspicious modifications
        if (mutation.type === 'attributes' && mutation.target instanceof Element) {
          this.analyzeAttributeChanges(mutation.target, mutation.attributeName);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
    });
  }

  private analyzeElementAdvanced(element: Element) {
    const html = element.outerHTML || '';
    let confidence = 0;
    
    // Enhanced pattern matching with confidence scoring
    ADVANCED_MALWARE_PATTERNS.forEach((pattern) => {
      if (pattern.test(html)) {
        confidence += 25;
        this.reportThreat({
          type: "Advanced Malware Pattern",
          description: `Sophisticated malicious code pattern detected in DOM element`,
          severity: confidence > 75 ? "CRITICAL" : "HIGH",
          timestamp: new Date(),
          source: "Advanced DOM Analysis",
          confidence,
          mitigation: "Block script execution and sanitize content"
        });
      }
    });

    // Check for crypto mining scripts
    if (this.detectCryptoMining(html)) {
      this.reportThreat({
        type: "Cryptocurrency Mining",
        description: "Unauthorized cryptocurrency mining script detected",
        severity: "HIGH",
        timestamp: new Date(),
        source: "Crypto Mining Detection",
        confidence: 90,
        mitigation: "Block mining scripts and alert user"
      });
    }

    // Enhanced phishing detection
    const textContent = element.textContent || '';
    PHISHING_INDICATORS.forEach((indicator) => {
      if (indicator.test(textContent)) {
        confidence += 20;
        this.reportThreat({
          type: "Advanced Phishing Content",
          description: `Sophisticated phishing language detected with high confidence`,
          severity: "HIGH",
          timestamp: new Date(),
          source: "Advanced Content Analysis",
          confidence: Math.min(confidence, 95),
          mitigation: "Warn user and block suspicious links"
        });
      }
    });
  }

  private analyzeAttributeChanges(element: Element, attributeName: string | null) {
    if (!attributeName) return;
    
    const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover'];
    if (dangerousAttributes.includes(attributeName.toLowerCase())) {
      const handler = element.getAttribute(attributeName) || '';
      if (this.containsAdvancedSuspiciousCode(handler)) {
        this.reportThreat({
          type: "Dynamic Event Handler Injection",
          description: `Suspicious event handler dynamically added: ${attributeName}`,
          severity: "HIGH",
          timestamp: new Date(),
          source: "Attribute Monitor",
          confidence: 85,
          mitigation: "Remove malicious event handlers"
        });
      }
    }
  }

  private monitorNetworkRequests() {
    // Enhanced fetch monitoring
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
      
      await this.analyzeNetworkRequestAdvanced(url, 'fetch');
      
      try {
        const response = await originalFetch.apply(window, args);
        await this.analyzeResponse(response.clone());
        return response;
      } catch (error) {
        this.reportThreat({
          type: "Network Request Failed",
          description: `Failed network request may indicate blocking of malicious content: ${url}`,
          severity: "LOW",
          timestamp: new Date(),
          source: "Network Monitor",
          confidence: 60
        });
        throw error;
      }
    };

    // Enhanced XMLHttpRequest monitoring
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url) {
      if (typeof url === 'string') {
        const analyzer = new SecurityAnalyzer();
        analyzer.analyzeNetworkRequestAdvanced(url, 'xhr');
      }
      return originalXHR.apply(this, [method, url] as any);
    };
  }

  private async analyzeNetworkRequestAdvanced(url: string, method: string) {
    try {
      const urlObj = new URL(url);
      let riskScore = 0;
      const threats: string[] = [];
      
      // Check against threat intelligence
      if (this.threatIntelligence.isDomainMalicious(urlObj.hostname)) {
        riskScore += 40;
        threats.push('Known malicious domain');
      }
      
      // Enhanced domain analysis
      MALICIOUS_DOMAINS.forEach(domain => {
        if (urlObj.hostname.includes(domain)) {
          riskScore += 30;
          threats.push(`Suspicious domain pattern: ${domain}`);
        }
      });
      
      // Advanced URL analysis
      SUSPICIOUS_URLS.forEach(pattern => {
        if (url.includes(pattern)) {
          riskScore += 25;
          threats.push(`Dangerous URL pattern: ${pattern}`);
        }
      });
      
      // Check for suspicious headers (if available)
      if (method === 'fetch' && riskScore > 0) {
        this.reportThreat({
          type: "Malicious Network Request",
          description: `Blocked request to suspicious endpoint: ${threats.join(', ')}`,
          severity: riskScore > 70 ? "CRITICAL" : riskScore > 40 ? "HIGH" : "MEDIUM",
          timestamp: new Date(),
          source: "Advanced Network Analysis",
          confidence: Math.min(riskScore + 20, 95),
          mitigation: "Block network request and isolate potential malware"
        });
      }

      // Check for data exfiltration patterns
      this.detectDataExfiltration(urlObj, url);

    } catch (error) {
      // Enhanced malicious URL scheme detection
      SUSPICIOUS_URLS.forEach(scheme => {
        if (url.startsWith(scheme)) {
          this.reportThreat({
            type: "Malicious URL Scheme",
            description: `Dangerous URL scheme detected: ${scheme}`,
            severity: "CRITICAL",
            timestamp: new Date(),
            source: "URL Scheme Analysis",
            confidence: 95,
            mitigation: "Block execution and sanitize URL"
          });
        }
      });
    }
  }

  private async analyzeResponse(response: Response) {
    try {
      const contentType = response.headers.get('content-type');
      
      // Check for suspicious content types
      if (contentType && NETWORK_THREATS.riskyContentTypes.some(type => contentType.includes(type))) {
        this.reportThreat({
          type: "Suspicious Content Type",
          description: `Potentially dangerous content type received: ${contentType}`,
          severity: "MEDIUM",
          timestamp: new Date(),
          source: "Response Analysis",
          confidence: 75,
          mitigation: "Scan content before execution"
        });
      }

      // Analyze response headers for security issues
      const securityHeaders = ['content-security-policy', 'x-frame-options', 'x-content-type-options'];
      securityHeaders.forEach(header => {
        if (!response.headers.get(header)) {
          console.warn(`CyberGuard AI: Missing security header: ${header}`);
        }
      });

    } catch (error) {
      console.error('CyberGuard AI: Error analyzing response:', error);
    }
  }

  private monitorWebRTC() {
    // Monitor WebRTC connections for potential privacy leaks
    const originalCreateDataChannel = RTCPeerConnection.prototype.createDataChannel;
    RTCPeerConnection.prototype.createDataChannel = function(...args) {
      console.log('CyberGuard AI: WebRTC data channel created');
      return originalCreateDataChannel.apply(this, args);
    };
  }

  private monitorServiceWorkers() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        // Monitor service worker messages for suspicious activity
        if (typeof event.data === 'string' && this.containsAdvancedSuspiciousCode(event.data)) {
          this.reportThreat({
            type: "Suspicious Service Worker Activity",
            description: "Service worker sending potentially malicious messages",
            severity: "MEDIUM",
            timestamp: new Date(),
            source: "Service Worker Monitor",
            confidence: 70,
            mitigation: "Review and potentially unregister service worker"
          });
        }
      });
    }
  }

  private monitorWebSockets() {
    const originalWebSocket = window.WebSocket;
    window.WebSocket = class extends WebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols);
        
        // Analyze WebSocket URL
        const wsUrl = typeof url === 'string' ? url : url.toString();
        if (MALICIOUS_DOMAINS.some(domain => wsUrl.includes(domain))) {
          // Report but don't block to avoid breaking functionality
          const analyzer = new SecurityAnalyzer();
          analyzer.reportThreat({
            type: "Suspicious WebSocket Connection",
            description: `WebSocket connection to potentially malicious endpoint: ${wsUrl}`,
            severity: "MEDIUM",
            timestamp: new Date(),
            source: "WebSocket Monitor",
            confidence: 65,
            mitigation: "Monitor WebSocket traffic for malicious data"
          });
        }
      }
    };
  }

  private monitorLocalStorage() {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key: string, value: string) {
      // Check for suspicious data being stored
      if (value.length > 10000 || ADVANCED_MALWARE_PATTERNS.some(pattern => pattern.test(value))) {
        const analyzer = new SecurityAnalyzer();
        analyzer.reportThreat({
          type: "Suspicious Local Storage Activity",
          description: `Potentially malicious data stored in localStorage: ${key}`,
          severity: "MEDIUM",
          timestamp: new Date(),
          source: "Storage Monitor",
          confidence: 60,
          mitigation: "Review and clear suspicious localStorage entries"
        });
      }
      
      return originalSetItem.call(this, key, value);
    };
  }

  private monitorBehaviorAnomalies() {
    setInterval(() => {
      const anomalies = this.behaviorAnalyzer.analyzeForAnomalies();
      
      if (anomalies.suspiciousActivity) {
        this.reportThreat({
          type: "Behavioral Anomaly",
          description: `Suspicious user behavior detected: ${anomalies.indicators.join(', ')}`,
          severity: anomalies.riskScore > 70 ? "HIGH" : "MEDIUM",
          timestamp: new Date(),
          source: "Behavior Analysis",
          confidence: anomalies.riskScore,
          mitigation: "Monitor user session and potentially require additional verification"
        });
      }
    }, 30000); // Check every 30 seconds
  }

  private performComprehensiveSecurityScan() {
    // Enhanced periodic scanning
    this.scanForCryptoMiners();
    this.scanForKeyloggers();
    this.scanForDataExfiltration();
    this.scanForPrivacyViolations();
    this.validateContentSecurityPolicy();
    
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

  private scanForCryptoMiners() {
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      const content = script.textContent || script.innerHTML || '';
      if (this.detectCryptoMining(content)) {
        this.reportThreat({
          type: "Cryptocurrency Mining Detected",
          description: "Unauthorized cryptocurrency mining activity found",
          severity: "HIGH",
          timestamp: new Date(),
          source: "Crypto Mining Scan",
          confidence: 90,
          mitigation: "Block mining scripts and preserve system resources"
        });
      }
    });
  }

  private scanForKeyloggers() {
    // Check for suspicious keyboard event listeners
    const suspiciousKeyboardListeners = ['keydown', 'keyup', 'keypress'];
    suspiciousKeyboardListeners.forEach(eventType => {
      const elements = document.querySelectorAll(`[on${eventType}]`);
      elements.forEach(element => {
        const handler = element.getAttribute(`on${eventType}`) || '';
        if (handler.includes('value') && handler.includes('send')) {
          this.reportThreat({
            type: "Potential Keylogger",
            description: "Suspicious keyboard event handler that may capture user input",
            severity: "HIGH",
            timestamp: new Date(),
            source: "Keylogger Detection",
            confidence: 80,
            mitigation: "Remove suspicious event handlers and warn user"
          });
        }
      });
    });
  }

  private scanForDataExfiltration() {
    // Monitor for forms submitting to external domains
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const action = form.action;
      if (action && !action.startsWith(window.location.origin)) {
        try {
          const actionUrl = new URL(action);
          if (this.threatIntelligence.isDomainMalicious(actionUrl.hostname)) {
            this.reportThreat({
              type: "Data Exfiltration Attempt",
              description: `Form configured to send data to known malicious domain: ${actionUrl.hostname}`,
              severity: "CRITICAL",
              timestamp: new Date(),
              source: "Data Exfiltration Scan",
              confidence: 95,
              mitigation: "Block form submission and alert user"
            });
          }
        } catch (error) {
          // Invalid URL
        }
      }
    });
  }

  private scanForPrivacyViolations() {
    // Check for unauthorized access to sensitive APIs
    if (navigator.geolocation && typeof navigator.geolocation.getCurrentPosition === 'function') {
      const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
      navigator.geolocation.getCurrentPosition = function(...args) {
        const analyzer = new SecurityAnalyzer();
        analyzer.reportThreat({
          type: "Location Access Attempt",
          description: "Application attempting to access user location",
          severity: "MEDIUM",
          timestamp: new Date(),
          source: "Privacy Monitor",
          confidence: 100,
          mitigation: "Review location permission and notify user"
        });
        return originalGetCurrentPosition.apply(this, args);
      };
    }
  }

  private validateContentSecurityPolicy() {
    if (!this.contentSecurityPolicy) {
      console.warn('CyberGuard AI: No Content Security Policy detected - vulnerability to XSS attacks');
    } else {
      // Basic CSP validation
      const unsafeDirectives = ['unsafe-inline', 'unsafe-eval'];
      unsafeDirectives.forEach(directive => {
        if (this.contentSecurityPolicy!.includes(directive)) {
          this.reportThreat({
            type: "Weak Content Security Policy",
            description: `CSP contains unsafe directive: ${directive}`,
            severity: "MEDIUM",
            timestamp: new Date(),
            source: "CSP Validation",
            confidence: 85,
            mitigation: "Strengthen Content Security Policy"
          });
        }
      });
    }
  }

  private detectCryptoMining(content: string): boolean {
    const cryptoMiningPatterns = [
      /coinhive/gi, /cryptoloot/gi, /jsecoin/gi, /mineralt/gi,
      /cryptonight/gi, /monero/gi, /webminer/gi, /browser.*mining/gi
    ];
    return cryptoMiningPatterns.some(pattern => pattern.test(content));
  }

  private detectDataExfiltration(urlObj: URL, fullUrl: string) {
    // Check for suspicious data being sent
    const suspiciousParams = ['password', 'ssn', 'credit', 'card', 'token', 'key'];
    suspiciousParams.forEach(param => {
      if (fullUrl.toLowerCase().includes(param)) {
        this.reportThreat({
          type: "Potential Data Exfiltration",
          description: `Sensitive data parameter detected in URL: ${param}`,
          severity: "HIGH",
          timestamp: new Date(),
          source: "Data Exfiltration Detection",
          confidence: 75,
          mitigation: "Block request and secure sensitive data"
        });
      }
    });
  }

  private containsAdvancedSuspiciousCode(code: string): boolean {
    return ADVANCED_MALWARE_PATTERNS.some(pattern => pattern.test(code));
  }

  private reportThreat(threat: ThreatInfo) {
    console.warn('CyberGuard AI - Advanced Threat Detected:', threat);
    if (this.threatCallback) {
      this.threatCallback(threat);
    }
  }

  // Enhanced public method for manual analysis
  public analyzeURLManually(url: string): Promise<{ safe: boolean; issues: string[]; confidence: number }> {
    return new Promise((resolve) => {
      const issues: string[] = [];
      let confidence = 0;
      
      try {
        const urlObj = new URL(url);
        
        // Enhanced protocol check
        if (!['https:', 'http:'].includes(urlObj.protocol)) {
          issues.push('Non-standard or dangerous protocol detected');
          confidence += 30;
        }
        
        // Threat intelligence check
        if (this.threatIntelligence.isDomainMalicious(urlObj.hostname)) {
          issues.push('Domain flagged by threat intelligence');
          confidence += 40;
        }
        
        // Advanced pattern analysis
        SUSPICIOUS_URLS.forEach(pattern => {
          if (url.includes(pattern)) {
            issues.push(`Suspicious URL pattern: ${pattern}`);
            confidence += 20;
          }
        });
        
        // Domain reputation check
        const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.pw', '.top', '.click'];
        if (suspiciousTLDs.some(tld => urlObj.hostname.endsWith(tld))) {
          issues.push('Domain uses high-risk TLD');
          confidence += 15;
        }
        
        // URL shortener detection
        const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co'];
        if (shorteners.some(shortener => urlObj.hostname.includes(shortener))) {
          issues.push('URL shortener detected - potential obfuscation');
          confidence += 10;
        }
        
        resolve({
          safe: issues.length === 0,
          issues,
          confidence: Math.min(confidence, 95)
        });
        
      } catch (error) {
        issues.push('Invalid URL format');
        resolve({ safe: false, issues, confidence: 90 });
      }
    });
  }

  // New method to get comprehensive security status
  public getSecurityStatus() {
    const stats = this.threatIntelligence.getIntelligenceStats();
    const behavior = this.behaviorAnalyzer.getBehaviorSummary();
    
    return {
      threatIntelligence: stats,
      userBehavior: behavior,
      protectionLevel: 'Advanced',
      monitoringActive: this.monitoringInterval !== null,
    };
  }
}
