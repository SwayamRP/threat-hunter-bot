interface UserBehavior {
  clickPatterns: number[];
  mouseMovePatterns: { x: number; y: number; timestamp: number }[];
  keyboardPatterns: number[];
  scrollPatterns: number[];
  sessionDuration: number;
  pageVisits: string[];
}

interface AnomalyDetection {
  isBot: boolean;
  suspiciousActivity: boolean;
  riskScore: number;
  indicators: string[];
}

export class BehaviorAnalyzer {
  private behavior: UserBehavior;
  private startTime: number;
  private mouseEvents: { x: number; y: number; timestamp: number }[] = [];
  private clickTimes: number[] = [];
  private keyPressTimes: number[] = [];

  constructor() {
    this.startTime = Date.now();
    this.behavior = {
      clickPatterns: [],
      mouseMovePatterns: [],
      keyboardPatterns: [],
      scrollPatterns: [],
      sessionDuration: 0,
      pageVisits: [window.location.href],
    };
    this.initializeTracking();
  }

  private initializeTracking() {
    // Track mouse movements
    document.addEventListener('mousemove', (e) => {
      this.mouseEvents.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });
      
      // Keep only recent events
      if (this.mouseEvents.length > 100) {
        this.mouseEvents = this.mouseEvents.slice(-50);
      }
    });

    // Track clicks
    document.addEventListener('click', () => {
      this.clickTimes.push(Date.now());
      if (this.clickTimes.length > 20) {
        this.clickTimes = this.clickTimes.slice(-10);
      }
    });

    // Track key presses
    document.addEventListener('keydown', () => {
      this.keyPressTimes.push(Date.now());
      if (this.keyPressTimes.length > 50) {
        this.keyPressTimes = this.keyPressTimes.slice(-25);
      }
    });

    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.behavior.pageVisits.push(window.location.href);
      }
    });
  }

  analyzeForAnomalies(): AnomalyDetection {
    const indicators: string[] = [];
    let riskScore = 0;

    // Check for bot-like behavior
    const isBot = this.detectBotBehavior();
    if (isBot) {
      indicators.push('Bot-like interaction patterns detected');
      riskScore += 30;
    }

    // Check for suspicious rapid clicks
    if (this.detectRapidClicking()) {
      indicators.push('Abnormally rapid clicking detected');
      riskScore += 20;
    }

    // Check for linear mouse movements (bot indicator)
    if (this.detectLinearMouseMovement()) {
      indicators.push('Non-human mouse movement patterns');
      riskScore += 25;
    }

    // Check for keyboard automation
    if (this.detectKeyboardAutomation()) {
      indicators.push('Automated keyboard input detected');
      riskScore += 20;
    }

    // Check session duration anomalies
    const sessionDuration = Date.now() - this.startTime;
    if (sessionDuration < 1000 && this.clickTimes.length > 5) {
      indicators.push('Unusually short session with high activity');
      riskScore += 15;
    }

    return {
      isBot,
      suspiciousActivity: riskScore > 30,
      riskScore,
      indicators,
    };
  }

  private detectBotBehavior(): boolean {
    // Check for perfect timing patterns
    if (this.clickTimes.length >= 3) {
      const intervals = [];
      for (let i = 1; i < this.clickTimes.length; i++) {
        intervals.push(this.clickTimes[i] - this.clickTimes[i - 1]);
      }
      
      // Check if intervals are too consistent (bot-like)
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((acc, interval) => acc + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      
      return variance < 100; // Very low variance indicates bot
    }
    
    return false;
  }

  private detectRapidClicking(): boolean {
    if (this.clickTimes.length < 3) return false;
    
    const recentClicks = this.clickTimes.slice(-5);
    const timeSpan = recentClicks[recentClicks.length - 1] - recentClicks[0];
    
    return timeSpan < 1000 && recentClicks.length >= 5; // 5 clicks in less than 1 second
  }

  private detectLinearMouseMovement(): boolean {
    if (this.mouseEvents.length < 10) return false;
    
    const recentMoves = this.mouseEvents.slice(-10);
    let linearMoves = 0;
    
    for (let i = 2; i < recentMoves.length; i++) {
      const p1 = recentMoves[i - 2];
      const p2 = recentMoves[i - 1];
      const p3 = recentMoves[i];
      
      // Check if three points are nearly collinear
      const crossProduct = Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y));
      if (crossProduct < 5) { // Very small cross product indicates linear movement
        linearMoves++;
      }
    }
    
    return linearMoves > 5; // Too many linear movements
  }

  private detectKeyboardAutomation(): boolean {
    if (this.keyPressTimes.length < 5) return false;
    
    const intervals = [];
    for (let i = 1; i < this.keyPressTimes.length; i++) {
      intervals.push(this.keyPressTimes[i] - this.keyPressTimes[i - 1]);
    }
    
    // Check for too consistent timing
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const consistentIntervals = intervals.filter(interval => Math.abs(interval - avgInterval) < 10).length;
    
    return consistentIntervals / intervals.length > 0.8; // 80% of intervals are too consistent
  }

  getBehaviorSummary() {
    return {
      sessionDuration: Date.now() - this.startTime,
      totalClicks: this.clickTimes.length,
      totalMouseMoves: this.mouseEvents.length,
      totalKeyPresses: this.keyPressTimes.length,
      pagesVisited: this.behavior.pageVisits.length,
    };
  }
}
