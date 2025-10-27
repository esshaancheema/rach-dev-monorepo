#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Zoptal Monorepo Configuration...\n');

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

function validateFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}`);
    results.passed++;
    return true;
  } else {
    console.log(`❌ ${description} - Missing: ${filePath}`);
    results.failed++;
    results.errors.push(`Missing: ${filePath}`);
    return false;
  }
}

function validatePackageJson(filePath, requiredScripts = []) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Missing package.json: ${filePath}`);
    results.failed++;
    return false;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`✅ Valid package.json: ${pkg.name || path.dirname(filePath)}`);
    
    // Check required scripts
    const missingScripts = requiredScripts.filter(script => !pkg.scripts || !pkg.scripts[script]);
    if (missingScripts.length > 0) {
      console.log(`⚠️  Missing scripts in ${filePath}: ${missingScripts.join(', ')}`);
      results.warnings++;
    }
    
    results.passed++;
    return true;
  } catch (error) {
    console.log(`❌ Invalid package.json: ${filePath} - ${error.message}`);
    results.failed++;
    results.errors.push(`Invalid JSON: ${filePath}`);
    return false;
  }
}

// Core configuration files
console.log('📋 Core Configuration Files:');
validateFile('package.json', 'Root package.json');
validateFile('turbo.json', 'Turbo configuration');
validateFile('pnpm-workspace.yaml', 'pnpm workspace configuration');
validateFile('tsconfig.json', 'Root TypeScript configuration');
validateFile('.gitignore', 'Git ignore file');
validateFile('.prettierrc', 'Prettier configuration');
validateFile('.eslintrc.js', 'ESLint configuration');
validateFile('.nvmrc', 'Node version file');
validateFile('README.md', 'Root README');
validateFile('docker-compose.yml', 'Docker Compose configuration');
validateFile('.env.example', 'Environment variables example');
console.log('');

// Apps
console.log('🚀 Applications:');
const apps = ['web-main', 'dashboard', 'admin', 'developer-portal'];
const requiredAppScripts = ['dev', 'build', 'start', 'lint', 'type-check'];
apps.forEach(app => {
  validatePackageJson(`apps/${app}/package.json`, requiredAppScripts);
  validateFile(`apps/${app}/next.config.js`, `${app} Next.js config`);
  validateFile(`apps/${app}/tsconfig.json`, `${app} TypeScript config`);
});
console.log('');

// Services
console.log('⚙️  Services:');
const services = ['auth-service', 'project-service', 'ai-service', 'billing-service', 'notification-service', 'analytics-service'];
const requiredServiceScripts = ['dev', 'build', 'start', 'test', 'lint', 'type-check'];
services.forEach(service => {
  validatePackageJson(`services/${service}/package.json`, requiredServiceScripts);
});
console.log('');

// Packages
console.log('📦 Shared Packages:');
const packages = ['ui', 'config', 'database', 'eslint-config', 'tsconfig'];
packages.forEach(pkg => {
  validatePackageJson(`packages/${pkg}/package.json`);
});
console.log('');

// Libs
console.log('📚 Libraries:');
const libs = ['utils', 'types', 'api-client'];
libs.forEach(lib => {
  validatePackageJson(`libs/${lib}/package.json`);
  validateFile(`libs/${lib}/tsconfig.json`, `${lib} TypeScript config`);
  validateFile(`libs/${lib}/src/index.ts`, `${lib} main export file`);
});
console.log('');

// Infrastructure
console.log('🏗️  Infrastructure:');
validateFile('infrastructure/docker/Dockerfile.node', 'Node.js Dockerfile');
validateFile('infrastructure/docker/Dockerfile.nextjs', 'Next.js Dockerfile');
validateFile('infrastructure/docker/docker-compose.dev.yml', 'Development Docker Compose');
validateFile('infrastructure/docker/docker-compose.prod.yml', 'Production Docker Compose');
validateFile('infrastructure/k8s/namespace.yaml', 'Kubernetes namespace');
validateFile('infrastructure/k8s/ingress.yaml', 'Kubernetes ingress');
validateFile('infrastructure/terraform/main.tf', 'Terraform main configuration');
console.log('');

// GitHub Actions
console.log('🔄 CI/CD:');
validateFile('.github/workflows/ci.yml', 'CI workflow');
validateFile('.github/workflows/deploy-services.yml', 'Services deployment workflow');
validateFile('.github/workflows/deploy-apps.yml', 'Apps deployment workflow');
validateFile('.github/workflows/release.yml', 'Release workflow');
validateFile('.github/workflows/security.yml', 'Security workflow');
console.log('');

// VS Code Configuration
console.log('🔧 Development Environment:');
validateFile('.vscode/extensions.json', 'VS Code extensions');
validateFile('.vscode/settings.json', 'VS Code settings');
validateFile('.vscode/launch.json', 'VS Code debug configuration');
console.log('');

// Summary
console.log('📊 Validation Summary:');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);

if (results.errors.length > 0) {
  console.log('\n🚨 Errors:');
  results.errors.forEach(error => console.log(`   ${error}`));
}

console.log('\n' + '='.repeat(50));
if (results.failed === 0) {
  console.log('🎉 Monorepo configuration is valid!');
  console.log('\n📖 Next Steps:');
  console.log('1. Install dependencies: pnpm install');
  console.log('2. Start development: pnpm dev');
  console.log('3. Run tests: pnpm test');
  console.log('4. Build all packages: pnpm build');
  process.exit(0);
} else {
  console.log('❌ Monorepo configuration has errors that need to be fixed.');
  process.exit(1);
}