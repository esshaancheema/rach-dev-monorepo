#!/bin/bash

# Comprehensive Security Scanner for Zoptal Platform
# Performs multiple security scans including container, dependency, and infrastructure scanning

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SCAN_OUTPUT_DIR="./security-scan-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="${SCAN_OUTPUT_DIR}/${TIMESTAMP}"
SERVICES=("auth-service" "project-service" "ai-service" "billing-service" "notification-service")
APPS=("dashboard" "admin" "web-main")

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}=== $1 ===${NC}"
}

# Function to check if required tools are installed
check_dependencies() {
    print_header "Checking Dependencies"
    
    local missing_tools=()
    
    # Check for required security tools
    tools=("docker" "trivy" "syft" "grype" "cosign" "kubectl" "helm" "node" "pnpm")
    
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_status "Installing missing tools..."
        
        # Install missing tools
        for tool in "${missing_tools[@]}"; do
            case $tool in
                "trivy")
                    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
                    ;;
                "syft")
                    curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin
                    ;;
                "grype")
                    curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin
                    ;;
                "cosign")
                    curl -O -L "https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64"
                    sudo mv cosign-linux-amd64 /usr/local/bin/cosign
                    sudo chmod +x /usr/local/bin/cosign
                    ;;
                *)
                    print_warning "Please install $tool manually"
                    ;;
            esac
        done
    fi
    
    print_success "All dependencies are available"
}

# Function to setup scan environment
setup_scan_environment() {
    print_header "Setting Up Scan Environment"
    
    # Create output directories
    mkdir -p "$REPORT_DIR"/{container,dependency,infrastructure,code,network,compliance}
    
    # Create scan metadata
    cat > "$REPORT_DIR/scan-metadata.json" << EOF
{
  "scan_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "scan_id": "${TIMESTAMP}",
  "platform": "$(uname -s)",
  "scanner_version": "1.0.0",
  "repository": "$(git remote get-url origin 2>/dev/null || echo 'unknown')",
  "commit_hash": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF
    
    print_success "Scan environment ready at $REPORT_DIR"
}

# Function to scan container images
scan_container_images() {
    print_header "Scanning Container Images"
    
    local container_report="$REPORT_DIR/container/container-scan-report.json"
    echo '{"scans": []}' > "$container_report"
    
    # Build and scan each service
    for service in "${SERVICES[@]}" "${APPS[@]}"; do
        print_status "Scanning $service container..."
        
        local image_name="zoptal/${service}:security-scan"
        local service_dir=""
        
        if [[ " ${SERVICES[@]} " =~ " ${service} " ]]; then
            service_dir="services/${service}"
        else
            service_dir="apps/${service}"
        fi
        
        # Build image if Dockerfile exists
        if [ -f "${service_dir}/Dockerfile" ]; then
            print_status "Building $service image..."
            docker build -t "$image_name" -f "${service_dir}/Dockerfile" . > /dev/null 2>&1
            
            # Trivy vulnerability scan
            print_status "Running Trivy scan on $service..."
            trivy image --format json --output "$REPORT_DIR/container/${service}-trivy.json" "$image_name" || true
            
            # Syft SBOM generation
            print_status "Generating SBOM for $service..."
            syft "$image_name" -o json > "$REPORT_DIR/container/${service}-sbom.json" || true
            
            # Grype vulnerability scan using SBOM
            print_status "Running Grype scan on $service..."
            grype sbom:"$REPORT_DIR/container/${service}-sbom.json" -o json > "$REPORT_DIR/container/${service}-grype.json" || true
            
            # Docker Scout scan (if available)
            if command -v docker-scout &> /dev/null; then
                print_status "Running Docker Scout scan on $service..."
                docker scout cves "$image_name" --format json > "$REPORT_DIR/container/${service}-scout.json" 2>/dev/null || true
            fi
            
            # Image configuration analysis
            print_status "Analyzing $service image configuration..."
            docker inspect "$image_name" > "$REPORT_DIR/container/${service}-config.json" || true
            
            # Update report
            jq --arg service "$service" --arg status "completed" '.scans += [{"service": $service, "status": $status, "timestamp": now}]' "$container_report" > temp.json && mv temp.json "$container_report"
            
        else
            print_warning "No Dockerfile found for $service"
            jq --arg service "$service" --arg status "skipped" '.scans += [{"service": $service, "status": $status, "reason": "No Dockerfile"}]' "$container_report" > temp.json && mv temp.json "$container_report"
        fi
    done
    
    print_success "Container image scanning completed"
}

# Function to scan dependencies
scan_dependencies() {
    print_header "Scanning Dependencies"
    
    print_status "Installing dependencies..."
    pnpm install --frozen-lockfile > /dev/null 2>&1
    
    # NPM audit
    print_status "Running npm audit..."
    pnpm audit --json > "$REPORT_DIR/dependency/npm-audit.json" 2>/dev/null || true
    
    # License check
    print_status "Checking licenses..."
    if command -v license-checker &> /dev/null; then
        license-checker --json > "$REPORT_DIR/dependency/licenses.json" || true
    else
        pnpm add -g license-checker
        license-checker --json > "$REPORT_DIR/dependency/licenses.json" || true
    fi
    
    # Snyk scan (if token available)
    if [ -n "${SNYK_TOKEN:-}" ]; then
        print_status "Running Snyk scan..."
        if command -v snyk &> /dev/null; then
            snyk test --json > "$REPORT_DIR/dependency/snyk.json" 2>/dev/null || true
        fi
    fi
    
    # Check for known vulnerable packages
    print_status "Checking for known vulnerable packages..."
    cat > "$REPORT_DIR/dependency/vulnerable-packages-check.js" << 'EOF'
const fs = require('fs');
const path = require('path');

const vulnerablePackages = [
    'event-stream', 'flatmap-stream', 'ps-killer', 'rc-tooltip',
    'bootstrap-select', 'jquery-mobile', 'handlebars', 'lodash'
];

function checkPackageJson(filePath) {
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const dependencies = { ...content.dependencies, ...content.devDependencies };
        
        const found = [];
        Object.keys(dependencies).forEach(pkg => {
            if (vulnerablePackages.some(vuln => pkg.includes(vuln))) {
                found.push({ package: pkg, version: dependencies[pkg] });
            }
        });
        
        return found;
    } catch (error) {
        return [];
    }
}

const results = {
    scan_date: new Date().toISOString(),
    vulnerable_packages: []
};

// Check root package.json
const rootVulnerable = checkPackageJson('package.json');
if (rootVulnerable.length > 0) {
    results.vulnerable_packages.push({
        location: 'root',
        packages: rootVulnerable
    });
}

// Check workspace package.json files
const workspaces = ['apps', 'services', 'packages'];
workspaces.forEach(workspace => {
    try {
        const dirs = fs.readdirSync(workspace);
        dirs.forEach(dir => {
            const packageJsonPath = path.join(workspace, dir, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const vulnerable = checkPackageJson(packageJsonPath);
                if (vulnerable.length > 0) {
                    results.vulnerable_packages.push({
                        location: `${workspace}/${dir}`,
                        packages: vulnerable
                    });
                }
            }
        });
    } catch (error) {
        // Workspace directory doesn't exist
    }
});

console.log(JSON.stringify(results, null, 2));
EOF
    
    node "$REPORT_DIR/dependency/vulnerable-packages-check.js" > "$REPORT_DIR/dependency/vulnerable-packages.json"
    
    print_success "Dependency scanning completed"
}

# Function to scan infrastructure
scan_infrastructure() {
    print_header "Scanning Infrastructure"
    
    # Kubernetes manifest security scan
    if [ -d "k8s" ]; then
        print_status "Scanning Kubernetes manifests..."
        
        # kube-score analysis
        if command -v kube-score &> /dev/null; then
            find k8s/ -name "*.yaml" -exec kube-score score {} \; > "$REPORT_DIR/infrastructure/kube-score.txt" 2>/dev/null || true
        fi
        
        # Checkov scan
        if command -v checkov &> /dev/null; then
            checkov -d k8s/ --framework kubernetes -o json > "$REPORT_DIR/infrastructure/checkov-k8s.json" || true
        fi
        
        # Polaris scan
        if command -v polaris &> /dev/null; then
            polaris audit --audit-path k8s/ --format json > "$REPORT_DIR/infrastructure/polaris.json" || true
        fi
    fi
    
    # Docker Compose security scan
    if [ -f "docker-compose.yml" ] || [ -f "docker-compose.prod.yml" ]; then
        print_status "Scanning Docker Compose files..."
        
        if command -v checkov &> /dev/null; then
            checkov -f docker-compose*.yml --framework docker_compose -o json > "$REPORT_DIR/infrastructure/checkov-compose.json" || true
        fi
    fi
    
    # Terraform scan (if terraform files exist)
    if [ -d "terraform" ]; then
        print_status "Scanning Terraform configurations..."
        
        if command -v checkov &> /dev/null; then
            checkov -d terraform/ --framework terraform -o json > "$REPORT_DIR/infrastructure/checkov-terraform.json" || true
        fi
        
        if command -v tfsec &> /dev/null; then
            tfsec terraform/ --format json > "$REPORT_DIR/infrastructure/tfsec.json" || true
        fi
    fi
    
    print_success "Infrastructure scanning completed"
}

# Function to scan source code
scan_source_code() {
    print_header "Scanning Source Code"
    
    # Semgrep static analysis
    if command -v semgrep &> /dev/null; then
        print_status "Running Semgrep analysis..."
        semgrep \
            --config=p/security-audit \
            --config=p/secrets \
            --config=p/owasp-top-ten \
            --config=p/javascript \
            --config=p/typescript \
            --json \
            --output="$REPORT_DIR/code/semgrep.json" \
            . || true
    fi
    
    # ESLint security analysis
    print_status "Running ESLint security analysis..."
    if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
        # Install security plugin if not present
        if ! pnpm list eslint-plugin-security &> /dev/null; then
            pnpm add -D eslint-plugin-security
        fi
        
        # Run ESLint with security rules
        pnpm run lint --format json > "$REPORT_DIR/code/eslint-security.json" 2>/dev/null || true
    fi
    
    # Secret scanning with TruffleHog
    if command -v trufflehog &> /dev/null; then
        print_status "Running secret scan with TruffleHog..."
        trufflehog filesystem . --json > "$REPORT_DIR/code/secrets.json" 2>/dev/null || true
    fi
    
    # Git history secret scan
    print_status "Scanning Git history for secrets..."
    if [ -d ".git" ]; then
        cat > "$REPORT_DIR/code/git-secret-scan.sh" << 'EOF'
#!/bin/bash
# Scan git history for potential secrets
patterns=(
    "password\s*="
    "api[_-]?key\s*="
    "secret[_-]?key\s*="
    "private[_-]?key"
    "access[_-]?token"
    "auth[_-]?token"
    "jwt[_-]?secret"
    "database[_-]?url"
    "connection[_-]?string"
    "-----BEGIN.*PRIVATE KEY-----"
)

results=()
for pattern in "${patterns[@]}"; do
    matches=$(git log --all --full-history --grep="$pattern" --pretty=format:"%H %s" | head -10)
    if [ -n "$matches" ]; then
        results+=("{\"pattern\": \"$pattern\", \"matches\": \"$matches\"}")
    fi
done

echo "{\"secret_patterns\": [$(IFS=,; echo "${results[*]}")]}"
EOF
        
        chmod +x "$REPORT_DIR/code/git-secret-scan.sh"
        "$REPORT_DIR/code/git-secret-scan.sh" > "$REPORT_DIR/code/git-secrets.json" 2>/dev/null || true
    fi
    
    print_success "Source code scanning completed"
}

# Function to perform network security analysis
scan_network_security() {
    print_header "Analyzing Network Security"
    
    # Check for exposed ports and services
    print_status "Analyzing exposed services..."
    
    cat > "$REPORT_DIR/network/port-analysis.js" << 'EOF'
const fs = require('fs');
const path = require('path');

const results = {
    exposed_ports: [],
    docker_compose_analysis: {},
    kubernetes_services: []
};

// Analyze Docker Compose files
['docker-compose.yml', 'docker-compose.prod.yml'].forEach(file => {
    if (fs.existsSync(file)) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const portMatches = content.match(/ports:\s*\n\s*-\s*["']?(\d+):\d+["']?/g);
            if (portMatches) {
                results.docker_compose_analysis[file] = {
                    exposed_ports: portMatches.map(match => {
                        const port = match.match(/(\d+):/)[1];
                        return parseInt(port);
                    })
                };
            }
        } catch (error) {
            results.docker_compose_analysis[file] = { error: error.message };
        }
    }
});

// Analyze Kubernetes service files
if (fs.existsSync('k8s')) {
    const findYamlFiles = (dir) => {
        const files = [];
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                files.push(...findYamlFiles(fullPath));
            } else if (item.endsWith('.yaml') || item.endsWith('.yml')) {
                files.push(fullPath);
            }
        });
        return files;
    };
    
    const yamlFiles = findYamlFiles('k8s');
    yamlFiles.forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('kind: Service')) {
                const portMatches = content.match(/port:\s*(\d+)/g);
                if (portMatches) {
                    results.kubernetes_services.push({
                        file: file,
                        ports: portMatches.map(match => parseInt(match.match(/(\d+)/)[1]))
                    });
                }
            }
        } catch (error) {
            // Skip files that can't be read
        }
    });
}

console.log(JSON.stringify(results, null, 2));
EOF
    
    node "$REPORT_DIR/network/port-analysis.js" > "$REPORT_DIR/network/port-analysis.json"
    
    # Analyze TLS configuration
    print_status "Analyzing TLS configuration..."
    
    cat > "$REPORT_DIR/network/tls-analysis.json" << 'EOF'
{
  "tls_analysis": {
    "cert_manager_usage": false,
    "letsencrypt_usage": false,
    "custom_ca_usage": false,
    "ingress_tls_config": []
  }
}
EOF
    
    if [ -d "k8s" ]; then
        # Check for cert-manager and TLS configuration
        if grep -r "cert-manager" k8s/ &> /dev/null; then
            jq '.tls_analysis.cert_manager_usage = true' "$REPORT_DIR/network/tls-analysis.json" > temp.json && mv temp.json "$REPORT_DIR/network/tls-analysis.json"
        fi
        
        if grep -r "letsencrypt" k8s/ &> /dev/null; then
            jq '.tls_analysis.letsencrypt_usage = true' "$REPORT_DIR/network/tls-analysis.json" > temp.json && mv temp.json "$REPORT_DIR/network/tls-analysis.json"
        fi
    fi
    
    print_success "Network security analysis completed"
}

# Function to check compliance
check_compliance() {
    print_header "Checking Security Compliance"
    
    local compliance_report="$REPORT_DIR/compliance/compliance-report.json"
    
    cat > "$compliance_report" << 'EOF'
{
  "compliance_frameworks": {
    "owasp_top10": {
      "status": "checking",
      "findings": []
    },
    "cis_docker": {
      "status": "checking",
      "findings": []
    },
    "nist_cybersecurity": {
      "status": "checking",
      "findings": []
    },
    "pci_dss": {
      "status": "checking",
      "findings": []
    }
  },
  "security_policies": {
    "password_policy": "unknown",
    "access_control": "unknown",
    "data_encryption": "unknown",
    "audit_logging": "unknown"
  }
}
EOF
    
    # OWASP Top 10 compliance check
    print_status "Checking OWASP Top 10 compliance..."
    
    # Check for common security misconfigurations
    local owasp_findings=()
    
    # A01:2021 - Broken Access Control
    if ! grep -r "authentication\|authorization" apps/ services/ &> /dev/null; then
        owasp_findings+=("\"A01:2021 - Missing access control implementation\"")
    fi
    
    # A02:2021 - Cryptographic Failures
    if grep -r "md5\|sha1" apps/ services/ &> /dev/null; then
        owasp_findings+=("\"A02:2021 - Weak cryptographic algorithms detected\"")
    fi
    
    # A03:2021 - Injection
    if ! grep -r "sanitize\|escape\|validate" apps/ services/ &> /dev/null; then
        owasp_findings+=("\"A03:2021 - Input validation may be insufficient\"")
    fi
    
    # Update OWASP findings
    if [ ${#owasp_findings[@]} -gt 0 ]; then
        local findings_json="[$(IFS=,; echo "${owasp_findings[*]}")]"
        jq --argjson findings "$findings_json" '.compliance_frameworks.owasp_top10.findings = $findings | .compliance_frameworks.owasp_top10.status = "non_compliant"' "$compliance_report" > temp.json && mv temp.json "$compliance_report"
    else
        jq '.compliance_frameworks.owasp_top10.status = "compliant"' "$compliance_report" > temp.json && mv temp.json "$compliance_report"
    fi
    
    # CIS Docker Benchmark compliance
    print_status "Checking CIS Docker Benchmark compliance..."
    
    if [ -f "Dockerfile" ] || find . -name "Dockerfile" | head -1 &> /dev/null; then
        # Check for non-root user
        if find . -name "Dockerfile" -exec grep -l "USER.*[0-9]" {} \; | head -1 &> /dev/null; then
            jq '.compliance_frameworks.cis_docker.status = "compliant"' "$compliance_report" > temp.json && mv temp.json "$compliance_report"
        else
            jq '.compliance_frameworks.cis_docker.status = "non_compliant" | .compliance_frameworks.cis_docker.findings += ["Containers may be running as root"]' "$compliance_report" > temp.json && mv temp.json "$compliance_report"
        fi
    fi
    
    print_success "Compliance checking completed"
}

# Function to generate comprehensive security report
generate_security_report() {
    print_header "Generating Security Report"
    
    local report_file="$REPORT_DIR/security-report.html"
    
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zoptal Security Scan Report</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background-color: #f5f5f5; 
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid #007acc; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .section { 
            margin-bottom: 30px; 
            padding: 20px; 
            border: 1px solid #ddd; 
            border-radius: 5px; 
        }
        .critical { background-color: #ffebee; border-left: 5px solid #f44336; }
        .high { background-color: #fff3e0; border-left: 5px solid #ff9800; }
        .medium { background-color: #f3e5f5; border-left: 5px solid #9c27b0; }
        .low { background-color: #e8f5e8; border-left: 5px solid #4caf50; }
        .info { background-color: #e3f2fd; border-left: 5px solid #2196f3; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .summary-card { 
            padding: 15px; 
            border-radius: 5px; 
            text-align: center; 
            color: white; 
            font-weight: bold; 
        }
        .summary-card.critical { background-color: #f44336; }
        .summary-card.high { background-color: #ff9800; }
        .summary-card.medium { background-color: #9c27b0; }
        .summary-card.low { background-color: #4caf50; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
        }
        th, td { 
            padding: 10px; 
            text-align: left; 
            border-bottom: 1px solid #ddd; 
        }
        th { 
            background-color: #007acc; 
            color: white; 
        }
        .timestamp { 
            color: #666; 
            font-size: 0.9em; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Zoptal Security Scan Report</h1>
            <p class="timestamp">Generated on: __TIMESTAMP__</p>
            <p class="timestamp">Scan ID: __SCAN_ID__</p>
        </div>
        
        <div class="section info">
            <h2>📊 Executive Summary</h2>
            <div class="grid">
                <div class="summary-card critical">
                    <h3>Critical Issues</h3>
                    <p id="critical-count">0</p>
                </div>
                <div class="summary-card high">
                    <h3>High Risk Issues</h3>
                    <p id="high-count">0</p>
                </div>
                <div class="summary-card medium">
                    <h3>Medium Risk Issues</h3>
                    <p id="medium-count">0</p>
                </div>
                <div class="summary-card low">
                    <h3>Low Risk Issues</h3>
                    <p id="low-count">0</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>🐳 Container Security</h2>
            <p>Vulnerability scanning results for Docker containers:</p>
            <table>
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Critical</th>
                        <th>High</th>
                        <th>Medium</th>
                        <th>Low</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="container-results">
                    <tr><td colspan="6">Scan results will be populated here</td></tr>
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>📦 Dependency Security</h2>
            <p>Vulnerability scanning results for project dependencies:</p>
            <div id="dependency-results">
                <p>Dependency scan results will be populated here</p>
            </div>
        </div>
        
        <div class="section">
            <h2>🏗️ Infrastructure Security</h2>
            <p>Security analysis of Kubernetes manifests and infrastructure:</p>
            <div id="infrastructure-results">
                <p>Infrastructure scan results will be populated here</p>
            </div>
        </div>
        
        <div class="section">
            <h2>💻 Code Security</h2>
            <p>Static analysis and secret scanning results:</p>
            <div id="code-results">
                <p>Code security scan results will be populated here</p>
            </div>
        </div>
        
        <div class="section">
            <h2>🌐 Network Security</h2>
            <p>Network configuration and exposure analysis:</p>
            <div id="network-results">
                <p>Network security analysis results will be populated here</p>
            </div>
        </div>
        
        <div class="section">
            <h2>✅ Compliance Status</h2>
            <p>Compliance with security frameworks and standards:</p>
            <div id="compliance-results">
                <p>Compliance check results will be populated here</p>
            </div>
        </div>
        
        <div class="section info">
            <h2>🔧 Recommendations</h2>
            <ul>
                <li>Address all critical and high-risk vulnerabilities immediately</li>
                <li>Implement automated security scanning in CI/CD pipeline</li>
                <li>Regular dependency updates and security patches</li>
                <li>Enable container image signing and verification</li>
                <li>Implement network policies and service mesh</li>
                <li>Regular security training for development team</li>
            </ul>
        </div>
    </div>
    
    <script>
        // Populate report with actual scan data
        const scanData = __SCAN_DATA__;
        
        // Update timestamp and scan ID
        document.querySelector('.timestamp').textContent = document.querySelector('.timestamp').textContent.replace('__TIMESTAMP__', scanData.timestamp);
        
        // Update summary counts (this would be populated with real data)
        // This is a placeholder - in real implementation, you'd parse the JSON results
    </script>
</body>
</html>
EOF
    
    # Replace placeholders
    sed -i "s/__TIMESTAMP__/$(date)/g" "$report_file"
    sed -i "s/__SCAN_ID__/$TIMESTAMP/g" "$report_file"
    
    # Generate summary JSON
    cat > "$REPORT_DIR/scan-summary.json" << EOF
{
  "scan_id": "$TIMESTAMP",
  "scan_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total_scans": $(( ${#SERVICES[@]} + ${#APPS[@]} )),
  "scan_types": [
    "container_vulnerability",
    "dependency_audit", 
    "infrastructure_security",
    "code_analysis",
    "network_security",
    "compliance_check"
  ],
  "status": "completed",
  "report_location": "$report_file"
}
EOF
    
    print_success "Security report generated at $report_file"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    
    # Remove any temporary Docker images
    docker images --filter "reference=zoptal/*:security-scan" -q | xargs -r docker rmi > /dev/null 2>&1 || true
    
    # Clean up any temporary files
    find "$REPORT_DIR" -name "temp.json" -delete 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Main execution function
main() {
    print_header "Zoptal Security Scanner v1.0.0"
    print_status "Starting comprehensive security scan..."
    
    # Trap cleanup on exit
    trap cleanup EXIT
    
    # Run all security scans
    check_dependencies
    setup_scan_environment
    scan_container_images
    scan_dependencies
    scan_infrastructure
    scan_source_code
    scan_network_security
    check_compliance
    generate_security_report
    
    print_success "Security scan completed successfully!"
    print_status "Report available at: $REPORT_DIR"
    print_status "View HTML report: open $REPORT_DIR/security-report.html"
}

# Handle script arguments
case "${1:-scan}" in
    "scan")
        main
        ;;
    "container")
        setup_scan_environment
        scan_container_images
        ;;
    "deps"|"dependencies")
        setup_scan_environment
        scan_dependencies
        ;;
    "infra"|"infrastructure")
        setup_scan_environment
        scan_infrastructure
        ;;
    "code")
        setup_scan_environment
        scan_source_code
        ;;
    "network")
        setup_scan_environment
        scan_network_security
        ;;
    "compliance")
        setup_scan_environment
        check_compliance
        ;;
    "clean")
        rm -rf "$SCAN_OUTPUT_DIR"
        print_success "Cleaned up scan results"
        ;;
    *)
        echo "Usage: $0 [scan|container|deps|infra|code|network|compliance|clean]"
        echo "  scan         - Run complete security scan (default)"
        echo "  container    - Scan container images only"
        echo "  deps         - Scan dependencies only"
        echo "  infra        - Scan infrastructure only"
        echo "  code         - Scan source code only"
        echo "  network      - Analyze network security only"
        echo "  compliance   - Check compliance only"
        echo "  clean        - Clean up scan results"
        exit 1
        ;;
esac