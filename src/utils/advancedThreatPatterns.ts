
// Advanced threat patterns based on real-world cybersecurity intelligence
export const ADVANCED_MALWARE_PATTERNS = [
  // Code injection patterns
  /eval\s*\(\s*['""][^'"]*['"]\s*\)/gi,
  /Function\s*\(\s*['""][^'"]*['"]\s*\)/gi,
  /setTimeout\s*\(\s*['""][^'"]*['"]/gi,
  /setInterval\s*\(\s*['""][^'"]*['"]/gi,
  
  // XSS patterns
  /<script[^>]*>.*?<\/script>/gi,
  /javascript\s*:\s*[^;]*/gi,
  /on\w+\s*=\s*['""][^'"]*['"]/gi,
  /<iframe[^>]*src\s*=\s*['"]javascript:/gi,
  
  // SQL injection patterns
  /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bunion\b).*(\bfrom\b|\binto\b|\bwhere\b)/gi,
  /['"];\s*(drop|delete|insert|update|select)/gi,
  
  // Command injection
  /(\||&|;|`|\$\(|\${).*?(ls|cat|wget|curl|nc|netcat|bash|sh|cmd|powershell)/gi,
  
  // Path traversal
  /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\\|\.\.%2f|\.\.%5c/gi,
  
  // Crypto mining patterns
  /coinhive|cryptoloot|jsecoin|mineralt|cryptonight/gi,
  
  // Obfuscation patterns
  /String\.fromCharCode\s*\(/gi,
  /unescape\s*\(/gi,
  /decodeURIComponent\s*\(/gi,
];

export const PHISHING_INDICATORS = [
  // Urgency patterns
  /urgent.*action.*required/gi,
  /immediate.*verification.*required/gi,
  /account.*will.*be.*suspended/gi,
  /verify.*within.*24.*hours/gi,
  /limited.*time.*offer/gi,
  /act.*now.*or.*lose/gi,
  
  // Credential harvesting
  /click.*here.*to.*verify/gi,
  /update.*payment.*information/gi,
  /confirm.*your.*identity/gi,
  /unusual.*activity.*detected/gi,
  
  // Financial threats
  /unauthorized.*transaction/gi,
  /refund.*pending/gi,
  /tax.*refund.*available/gi,
  /lottery.*winner/gi,
  /inheritance.*claim/gi,
  
  // Technical support scams
  /computer.*infected/gi,
  /virus.*detected/gi,
  /call.*microsoft.*support/gi,
  /system.*compromised/gi,
];

export const MALICIOUS_DOMAINS = [
  // Known malicious TLDs
  '.tk', '.ml', '.ga', '.cf', '.pw', '.top', '.click', '.download',
  
  // Suspicious patterns
  'bit.ly', 'tinyurl.com', 'short.link', 'goo.gl',
  'secure-bank', 'paypal-verification', 'amazon-security',
  'microsoft-support', 'apple-verification',
];

export const SUSPICIOUS_URLS = [
  // Dangerous schemes
  'javascript:', 'data:text/html', 'vbscript:', 'file:',
  
  // Suspicious parameters
  'exec=', 'cmd=', 'eval=', 'system=', 'shell=',
  'include=', 'require=', 'path=', 'dir=',
];

export const NETWORK_THREATS = {
  suspiciousHeaders: [
    'x-forwarded-for',
    'x-originating-ip',
    'x-remote-ip',
    'x-cluster-client-ip',
  ],
  dangerousMethods: ['TRACE', 'TRACK', 'DEBUG'],
  riskyContentTypes: [
    'application/x-msdownload',
    'application/octet-stream',
    'application/x-executable',
  ],
};
