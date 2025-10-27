interface ThreatAnalysisRequest {
  ip: string;
  userAgent: string;
  pathname: string;
  searchParams: Record<string, string>;
  referer: string;
  method: string;
  headers: Record<string, string>;
}

interface ThreatAnalysisResult {
  isThreat: boolean;
  riskScore: number; // 0-10 scale
  threats: string[];
  details: Record<string, any>;
}

export class ThreatDetection {
  // Known malicious IP patterns
  private readonly MALICIOUS_IP_PATTERNS = [
    /^10\./, // Private network (suspicious for external requests)
    /^192\.168\./, // Private network
    /^172\.(1[6-9]|2\d|3[01])\./, // Private network
    /^0\./, // Invalid IP range
    /^127\./, // Localhost (suspicious for external requests)
  ];

  // Suspicious user agents
  private readonly SUSPICIOUS_USER_AGENTS = [
    /nikto/i,
    /sqlmap/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /havij/i,
    /libwww-perl/i,
    /python-urllib/i,
    /wget/i,
    /curl\/[0-9]/,
    /^-$/,
    /scanner/i,
    /hack/i,
    /attack/i,
    /exploit/i,
    /penetrat/i,
    /test.*security/i,
  ];

  // SQL Injection patterns
  private readonly SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(UNION\s+SELECT)/i,
    /(\-\-|\#|\/\*|\*\/)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /('|\")(\s)*(OR|AND)(\s)*('|\")/i,
    /(sleep\(|benchmark\(|pg_sleep\()/i,
    /(waitfor\s+delay)/i,
    /(\bxp_cmdshell\b)/i,
    /(\bsp_executesql\b)/i,
  ];

  // XSS patterns
  private readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe\b[^>]*>/i,
    /<object\b[^>]*>/i,
    /<embed\b[^>]*>/i,
    /<link\b[^>]*>/i,
    /expression\s*\(/i,
    /vbscript:/i,
    /livescript:/i,
    /<meta\b[^>]*>/i,
  ];

  // Path traversal patterns
  private readonly PATH_TRAVERSAL_PATTERNS = [
    /\.\.[\/\\]/,
    /\%2e\%2e[\/\\]/i,
    /\%252e\%252e[\/\\]/i,
    /\.\%2f/i,
    /\%2e\%2f/i,
    /\%252e\%252f/i,
  ];

  // Command injection patterns
  private readonly COMMAND_INJECTION_PATTERNS = [
    /[;&|`]/,
    /\$\([^)]*\)/,
    /`[^`]*`/,
    /\|\s*(cat|ls|pwd|whoami|id|uname|netstat|ps|top|wget|curl)/i,
    /;\s*(cat|ls|pwd|whoami|id|uname|netstat|ps|top|wget|curl)/i,
    /\b(eval|exec|system|shell_exec|passthru|popen|proc_open)\b/i,
  ];

  // Suspicious file extensions
  private readonly SUSPICIOUS_EXTENSIONS = [
    /\.(php|asp|aspx|jsp|jspx|cfm|pl|py|rb|sh|bat|cmd|exe|dll|scr)$/i,
    /\.(htaccess|htpasswd|ini|conf|config|xml|json|sql|db|bak|backup)$/i,
  ];

  // Brute force patterns
  private readonly BRUTE_FORCE_PATHS = [
    /\/(login|admin|wp-admin|wp-login|administrator|auth|signin|logon)$/i,
    /\/api\/(auth|login|signin)$/i,
    /\.(git|svn|cvs|bzr|hg)\//i,
    /\/(\.env|\.config|config\.php|wp-config\.php)$/i,
  ];

  // DDoS detection patterns
  private readonly DDOS_INDICATORS = {
    highRequestRate: 100, // requests per minute
    lowUserAgentVariety: 0.1, // ratio of unique UAs to total requests
    shortSessionDuration: 1000, // milliseconds
    repeatedRequestPatterns: 0.8, // ratio of repeated requests
  };

  // Known attack signatures
  private readonly ATTACK_SIGNATURES = [
    { name: 'WordPress Scanner', pattern: /wp-(admin|content|includes|login)/ },
    { name: 'PHP Info Scanner', pattern: /phpinfo\.php/ },
    { name: 'Config File Scanner', pattern: /\.(env|config|ini|conf)$/ },
    { name: 'Backup File Scanner', pattern: /\.(bak|backup|old|tmp|temp)$/ },
    { name: 'Directory Traversal', pattern: /\.\.\/.*\.\./ },
    { name: 'Shell Upload Attempt', pattern: /\.(php|asp|jsp|py|rb|pl|sh)$/ },
    { name: 'SQL Map Tool', pattern: /sqlmap/ },
    { name: 'Nikto Scanner', pattern: /nikto/ },
    { name: 'Acunetix Scanner', pattern: /acunetix/i },
    { name: 'Nessus Scanner', pattern: /nessus/i },
  ];

  async analyzeRequest(request: ThreatAnalysisRequest): Promise<ThreatAnalysisResult> {
    const threats: string[] = [];
    let riskScore = 0;
    const details: Record<string, any> = {};

    // 1. IP Address Analysis
    const ipAnalysis = this.analyzeIP(request.ip);
    if (ipAnalysis.suspicious) {
      threats.push('suspicious-ip');
      riskScore += ipAnalysis.riskScore;
      details.ipAnalysis = ipAnalysis;
    }

    // 2. User Agent Analysis
    const uaAnalysis = this.analyzeUserAgent(request.userAgent);
    if (uaAnalysis.suspicious) {
      threats.push('malicious-user-agent');
      riskScore += uaAnalysis.riskScore;
      details.userAgentAnalysis = uaAnalysis;
    }

    // 3. Path Analysis
    const pathAnalysis = this.analyzePath(request.pathname);
    if (pathAnalysis.suspicious) {
      threats.push(...pathAnalysis.threats);
      riskScore += pathAnalysis.riskScore;
      details.pathAnalysis = pathAnalysis;
    }

    // 4. Parameter Analysis
    const paramAnalysis = this.analyzeParameters(request.searchParams);
    if (paramAnalysis.suspicious) {
      threats.push(...paramAnalysis.threats);
      riskScore += paramAnalysis.riskScore;
      details.paramAnalysis = paramAnalysis;
    }

    // 5. Header Analysis
    const headerAnalysis = this.analyzeHeaders(request.headers);
    if (headerAnalysis.suspicious) {
      threats.push(...headerAnalysis.threats);
      riskScore += headerAnalysis.riskScore;
      details.headerAnalysis = headerAnalysis;
    }

    // 6. Rate Pattern Analysis
    const rateAnalysis = await this.analyzeRequestRate(request.ip);
    if (rateAnalysis.suspicious) {
      threats.push('high-request-rate');
      riskScore += rateAnalysis.riskScore;
      details.rateAnalysis = rateAnalysis;
    }

    // 7. Attack Signature Detection
    const signatureAnalysis = this.detectAttackSignatures(request);
    if (signatureAnalysis.suspicious) {
      threats.push(...signatureAnalysis.signatures);
      riskScore += signatureAnalysis.riskScore;
      details.signatureAnalysis = signatureAnalysis;
    }

    // 8. Behavioral Analysis
    const behaviorAnalysis = await this.analyzeBehavior(request);
    if (behaviorAnalysis.suspicious) {
      threats.push(...behaviorAnalysis.threats);
      riskScore += behaviorAnalysis.riskScore;
      details.behaviorAnalysis = behaviorAnalysis;
    }

    // Cap risk score at 10
    riskScore = Math.min(10, riskScore);

    return {
      isThreat: threats.length > 0 || riskScore >= 5,
      riskScore,
      threats: [...new Set(threats)], // Remove duplicates
      details
    };
  }

  private analyzeIP(ip: string): { suspicious: boolean; riskScore: number; reasons: string[] } {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for private/invalid IP ranges
    for (const pattern of this.MALICIOUS_IP_PATTERNS) {
      if (pattern.test(ip)) {
        reasons.push('private-ip-range');
        riskScore += 3;
        break;
      }
    }

    // Check against threat intelligence (would be external service in production)
    if (this.isKnownMaliciousIP(ip)) {
      reasons.push('known-malicious-ip');
      riskScore += 8;
    }

    // Check for TOR exit nodes (would be external service in production)
    if (this.isTorExitNode(ip)) {
      reasons.push('tor-exit-node');
      riskScore += 4;
    }

    return {
      suspicious: reasons.length > 0,
      riskScore,
      reasons
    };
  }

  private analyzeUserAgent(userAgent: string): { suspicious: boolean; riskScore: number; reasons: string[] } {
    const reasons: string[] = [];
    let riskScore = 0;

    // Empty or missing user agent
    if (!userAgent || userAgent.trim() === '') {
      reasons.push('missing-user-agent');
      riskScore += 2;
    }

    // Check for suspicious patterns
    for (const pattern of this.SUSPICIOUS_USER_AGENTS) {
      if (pattern.test(userAgent)) {
        reasons.push('malicious-user-agent-pattern');
        riskScore += 6;
        break;
      }
    }

    // Check for extremely short user agents
    if (userAgent && userAgent.length < 10) {
      reasons.push('short-user-agent');
      riskScore += 3;
    }

    // Check for generic/fake user agents
    if (this.isGenericUserAgent(userAgent)) {
      reasons.push('generic-user-agent');
      riskScore += 2;
    }

    return {
      suspicious: reasons.length > 0,
      riskScore,
      reasons
    };
  }

  private analyzePath(pathname: string): { suspicious: boolean; riskScore: number; threats: string[] } {
    const threats: string[] = [];
    let riskScore = 0;

    // Path traversal detection
    for (const pattern of this.PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(pathname)) {
        threats.push('path-traversal');
        riskScore += 5;
        break;
      }
    }

    // Suspicious file extensions
    for (const pattern of this.SUSPICIOUS_EXTENSIONS) {
      if (pattern.test(pathname)) {
        threats.push('suspicious-file-access');
        riskScore += 4;
        break;
      }
    }

    // Brute force attempts
    for (const pattern of this.BRUTE_FORCE_PATHS) {
      if (pattern.test(pathname)) {
        threats.push('brute-force-attempt');
        riskScore += 3;
        break;
      }
    }

    // Encoded path attempts
    if (pathname.includes('%2e%2e') || pathname.includes('%252e%252e')) {
      threats.push('encoded-path-traversal');
      riskScore += 6;
    }

    // Null byte injection
    if (pathname.includes('%00') || pathname.includes('\0')) {
      threats.push('null-byte-injection');
      riskScore += 5;
    }

    return {
      suspicious: threats.length > 0,
      riskScore,
      threats
    };
  }

  private analyzeParameters(params: Record<string, string>): { suspicious: boolean; riskScore: number; threats: string[] } {
    const threats: string[] = [];
    let riskScore = 0;

    for (const [key, value] of Object.entries(params)) {
      const paramString = `${key}=${value}`;

      // SQL injection detection
      for (const pattern of this.SQL_INJECTION_PATTERNS) {
        if (pattern.test(paramString)) {
          threats.push('sql-injection');
          riskScore += 7;
          break;
        }
      }

      // XSS detection
      for (const pattern of this.XSS_PATTERNS) {
        if (pattern.test(paramString)) {
          threats.push('xss-attempt');
          riskScore += 6;
          break;
        }
      }

      // Command injection detection
      for (const pattern of this.COMMAND_INJECTION_PATTERNS) {
        if (pattern.test(paramString)) {
          threats.push('command-injection');
          riskScore += 8;
          break;
        }
      }

      // LDAP injection detection
      if (this.containsLDAPInjection(paramString)) {
        threats.push('ldap-injection');
        riskScore += 6;
      }

      // File inclusion attempts
      if (this.containsFileInclusion(paramString)) {
        threats.push('file-inclusion');
        riskScore += 7;
      }
    }

    return {
      suspicious: threats.length > 0,
      riskScore,
      threats
    };
  }

  private analyzeHeaders(headers: Record<string, string>): { suspicious: boolean; riskScore: number; threats: string[] } {
    const threats: string[] = [];
    let riskScore = 0;

    // Check for suspicious headers
    const suspiciousHeaders = [
      'x-forwarded-for',
      'x-originating-ip',
      'x-remote-ip',
      'x-remote-addr'
    ];

    for (const header of suspiciousHeaders) {
      if (headers[header]) {
        const value = headers[header];
        // Check for header injection
        if (value.includes('\n') || value.includes('\r')) {
          threats.push('header-injection');
          riskScore += 5;
        }
      }
    }

    // Check for missing expected headers
    if (!headers['accept'] || !headers['accept-language']) {
      threats.push('missing-standard-headers');
      riskScore += 2;
    }

    // Check for automated tool signatures in headers
    const toolSignatures = ['burp', 'zap', 'nikto', 'sqlmap', 'nmap'];
    for (const [key, value] of Object.entries(headers)) {
      for (const signature of toolSignatures) {
        if (key.toLowerCase().includes(signature) || value.toLowerCase().includes(signature)) {
          threats.push('security-tool-detected');
          riskScore += 6;
          break;
        }
      }
    }

    return {
      suspicious: threats.length > 0,
      riskScore,
      threats
    };
  }

  private async analyzeRequestRate(ip: string): Promise<{ suspicious: boolean; riskScore: number; details: any }> {
    // This would connect to a request tracking service in production
    // For now, we'll simulate the analysis
    
    const requests = await this.getRecentRequests(ip);
    const requestRate = requests.length; // requests per minute
    
    let riskScore = 0;
    const details: any = { requestRate, threshold: this.DDOS_INDICATORS.highRequestRate };

    if (requestRate > this.DDOS_INDICATORS.highRequestRate) {
      riskScore += Math.min(6, Math.floor(requestRate / 50));
    }

    return {
      suspicious: riskScore > 0,
      riskScore,
      details
    };
  }

  private detectAttackSignatures(request: ThreatAnalysisRequest): { suspicious: boolean; riskScore: number; signatures: string[] } {
    const signatures: string[] = [];
    let riskScore = 0;

    const fullRequest = `${request.pathname}${JSON.stringify(request.searchParams)}${request.userAgent}`;

    for (const signature of this.ATTACK_SIGNATURES) {
      if (signature.pattern.test(fullRequest)) {
        signatures.push(signature.name.toLowerCase().replace(/\s+/g, '-'));
        riskScore += 4;
      }
    }

    return {
      suspicious: signatures.length > 0,
      riskScore,
      signatures
    };
  }

  private async analyzeBehavior(request: ThreatAnalysisRequest): Promise<{ suspicious: boolean; riskScore: number; threats: string[] }> {
    const threats: string[] = [];
    let riskScore = 0;

    // Analyze request patterns
    const patterns = await this.getRequestPatterns(request.ip);
    
    // Check for rapid scanning behavior
    if (patterns.uniquePaths > 50 && patterns.timeSpan < 300000) { // 50 paths in 5 minutes
      threats.push('rapid-scanning');
      riskScore += 5;
    }

    // Check for unusual request frequency
    if (patterns.requestFrequency > 10) { // More than 10 requests per second
      threats.push('ddos-pattern');
      riskScore += 6;
    }

    // Check for bot-like behavior
    if (this.isBotLikeBehavior(patterns)) {
      threats.push('bot-behavior');
      riskScore += 3;
    }

    return {
      suspicious: threats.length > 0,
      riskScore,
      threats
    };
  }

  // Helper methods (would be implemented with external services in production)
  
  private isKnownMaliciousIP(ip: string): boolean {
    // In production, this would check against threat intelligence feeds
    const knownMaliciousIPs = ['1.2.3.4', '5.6.7.8']; // Example
    return knownMaliciousIPs.includes(ip);
  }

  private isTorExitNode(ip: string): boolean {
    // In production, this would check against TOR exit node lists
    return false;
  }

  private isGenericUserAgent(userAgent: string): boolean {
    const genericPatterns = [
      /^Mozilla\/5\.0$/,
      /^User-Agent$/,
      /^test$/i,
      /^bot$/i,
      /^crawler$/i
    ];
    
    return genericPatterns.some(pattern => pattern.test(userAgent));
  }

  private containsLDAPInjection(input: string): boolean {
    const ldapPatterns = [
      /\(\|\(/,
      /\(\&\(/,
      /\(\!\(/,
      /\*\)\(/,
      /\)\(\|/
    ];
    
    return ldapPatterns.some(pattern => pattern.test(input));
  }

  private containsFileInclusion(input: string): boolean {
    const fileInclusionPatterns = [
      /\.\.[\/\\]/,
      /\/etc\/passwd/i,
      /\/proc\/self\/environ/i,
      /php:\/\/filter/i,
      /data:\/\//i,
      /expect:\/\//i
    ];
    
    return fileInclusionPatterns.some(pattern => pattern.test(input));
  }

  private async getRecentRequests(ip: string): Promise<any[]> {
    // Simulated request history - in production would query database
    return [];
  }

  private async getRequestPatterns(ip: string): Promise<{
    uniquePaths: number;
    timeSpan: number;
    requestFrequency: number;
    userAgentVariety: number;
  }> {
    // Simulated pattern analysis - in production would analyze request history
    return {
      uniquePaths: 0,
      timeSpan: 0,
      requestFrequency: 0,
      userAgentVariety: 0
    };
  }

  private isBotLikeBehavior(patterns: any): boolean {
    return patterns.userAgentVariety < 0.1 && patterns.requestFrequency > 5;
  }
}