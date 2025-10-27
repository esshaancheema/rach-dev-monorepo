#!/usr/bin/env tsx

/**
 * Bundle Analysis Script
 * 
 * This script analyzes the Next.js bundle size, identifies optimization opportunities,
 * and generates reports for the Zoptal website build.
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface BundleAnalysis {
  timestamp: string;
  totalSize: number;
  gzippedSize: number;
  pages: PageBundle[];
  chunks: ChunkBundle[];
  recommendations: string[];
  performance: {
    firstLoadJS: number;
    totalJS: number;
    css: number;
    images: number;
    fonts: number;
  };
  thresholds: {
    firstLoadJS: { value: number; threshold: number; status: 'pass' | 'warn' | 'fail' };
    totalBundle: { value: number; threshold: number; status: 'pass' | 'warn' | 'fail' };
  };
}

interface PageBundle {
  route: string;
  size: number;
  firstLoadJS: number;
  chunks: string[];
  static: boolean;
}

interface ChunkBundle {
  name: string;
  size: number;
  gzippedSize?: number;
  type: 'page' | 'shared' | 'runtime' | 'vendor';
  dependencies: string[];
}

const OUTPUT_DIR = path.join(process.cwd(), 'reports', 'bundle');
const BUILD_DIR = path.join(process.cwd(), '.next');

// Performance thresholds (in bytes)
const THRESHOLDS = {
  FIRST_LOAD_JS: 200 * 1024, // 200KB
  TOTAL_BUNDLE: 1024 * 1024, // 1MB
  PAGE_SIZE: 100 * 1024, // 100KB per page
  CHUNK_SIZE: 50 * 1024 // 50KB per chunk
};

async function buildProject(): Promise<void> {
  console.log('🔨 Building project for analysis...');
  
  try {
    // Set environment for analysis
    process.env.ANALYZE = 'true';
    
    const { stdout, stderr } = await execAsync('npm run build', { 
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    
    if (stderr && !stderr.includes('Warning')) {
      console.warn('Build warnings:', stderr);
    }
    
    console.log('✅ Build completed successfully');
  } catch (error) {
    throw new Error(`Build failed: ${error}`);
  }
}

async function analyzeBuildOutput(): Promise<BundleAnalysis> {
  const buildManifestPath = path.join(BUILD_DIR, 'build-manifest.json');
  const appManifestPath = path.join(BUILD_DIR, 'app-build-manifest.json');
  
  if (!fs.existsSync(buildManifestPath)) {
    throw new Error('Build manifest not found. Run build first.');
  }
  
  // Read build manifests
  const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf-8'));
  const appManifest = fs.existsSync(appManifestPath) 
    ? JSON.parse(fs.readFileSync(appManifestPath, 'utf-8'))
    : null;
  
  // Analyze static directory
  const staticDir = path.join(BUILD_DIR, 'static');
  const chunks = await analyzeChunks(staticDir);
  const pages = await analyzePages(buildManifest, chunks);
  
  // Calculate total sizes
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const gzippedSize = chunks.reduce((sum, chunk) => sum + (chunk.gzippedSize || chunk.size * 0.3), 0);
  
  // Performance analysis
  const performance = calculatePerformanceMetrics(chunks, pages);
  
  // Generate recommendations
  const recommendations = generateRecommendations(chunks, pages, performance);
  
  // Check thresholds
  const thresholds = {
    firstLoadJS: {
      value: performance.firstLoadJS,
      threshold: THRESHOLDS.FIRST_LOAD_JS,
      status: performance.firstLoadJS > THRESHOLDS.FIRST_LOAD_JS ? 'fail' : 
              performance.firstLoadJS > THRESHOLDS.FIRST_LOAD_JS * 0.8 ? 'warn' : 'pass'
    } as const,
    totalBundle: {
      value: totalSize,
      threshold: THRESHOLDS.TOTAL_BUNDLE,
      status: totalSize > THRESHOLDS.TOTAL_BUNDLE ? 'fail' :
              totalSize > THRESHOLDS.TOTAL_BUNDLE * 0.8 ? 'warn' : 'pass'
    } as const
  };
  
  return {
    timestamp: new Date().toISOString(),
    totalSize,
    gzippedSize,
    pages,
    chunks,
    recommendations,
    performance,
    thresholds
  };
}

async function analyzeChunks(staticDir: string): Promise<ChunkBundle[]> {
  const chunks: ChunkBundle[] = [];
  
  if (!fs.existsSync(staticDir)) {
    return chunks;
  }
  
  const processDirectory = (dir: string, type: ChunkBundle['type']) => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.css'))) {
        const size = stat.size;
        
        chunks.push({
          name: file,
          size,
          type,
          dependencies: extractDependencies(filePath)
        });
      }
    }
  };
  
  // Analyze different chunk types
  processDirectory(path.join(staticDir, 'chunks'), 'shared');
  processDirectory(path.join(staticDir, 'css'), 'shared');
  
  return chunks;
}

async function analyzePages(buildManifest: any, chunks: ChunkBundle[]): Promise<PageBundle[]> {
  const pages: PageBundle[] = [];
  
  for (const [route, files] of Object.entries(buildManifest.pages)) {
    const pageFiles = files as string[];
    const pageChunks = chunks.filter(chunk => 
      pageFiles.some(file => file.includes(chunk.name))
    );
    
    const size = pageChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const firstLoadJS = calculateFirstLoadJS(pageChunks);
    
    pages.push({
      route,
      size,
      firstLoadJS,
      chunks: pageChunks.map(c => c.name),
      static: !route.includes('[') && !route.includes('*')
    });
  }
  
  return pages;
}

function extractDependencies(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const dependencies: string[] = [];
    
    // Extract import statements (simplified)
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const dep = match[1];
      if (!dep.startsWith('.') && !dep.startsWith('/')) {
        dependencies.push(dep);
      }
    }
    
    return [...new Set(dependencies)];
  } catch {
    return [];
  }
}

function calculateFirstLoadJS(chunks: ChunkBundle[]): number {
  // Calculate JS that needs to be loaded on first page visit
  return chunks
    .filter(chunk => chunk.name.endsWith('.js'))
    .reduce((sum, chunk) => sum + chunk.size, 0);
}

function calculatePerformanceMetrics(chunks: ChunkBundle[], pages: PageBundle[]) {
  const jsChunks = chunks.filter(c => c.name.endsWith('.js'));
  const cssChunks = chunks.filter(c => c.name.endsWith('.css'));
  
  return {
    firstLoadJS: Math.max(...pages.map(p => p.firstLoadJS)),
    totalJS: jsChunks.reduce((sum, c) => sum + c.size, 0),
    css: cssChunks.reduce((sum, c) => sum + c.size, 0),
    images: 0, // Would need to analyze public/images
    fonts: 0   // Would need to analyze fonts
  };
}

function generateRecommendations(
  chunks: ChunkBundle[], 
  pages: PageBundle[], 
  performance: BundleAnalysis['performance']
): string[] {
  const recommendations: string[] = [];
  
  // Check first load JS
  if (performance.firstLoadJS > THRESHOLDS.FIRST_LOAD_JS) {
    recommendations.push(
      `First Load JS (${formatBytes(performance.firstLoadJS)}) exceeds threshold (${formatBytes(THRESHOLDS.FIRST_LOAD_JS)}). Consider code splitting.`
    );
  }
  
  // Check large chunks
  const largeChunks = chunks.filter(c => c.size > THRESHOLDS.CHUNK_SIZE);
  if (largeChunks.length > 0) {
    recommendations.push(
      `${largeChunks.length} chunks are larger than ${formatBytes(THRESHOLDS.CHUNK_SIZE)}. Consider splitting: ${largeChunks.map(c => c.name).join(', ')}`
    );
  }
  
  // Check large pages
  const largePages = pages.filter(p => p.size > THRESHOLDS.PAGE_SIZE);
  if (largePages.length > 0) {
    recommendations.push(
      `${largePages.length} pages are larger than ${formatBytes(THRESHOLDS.PAGE_SIZE)}. Consider lazy loading: ${largePages.map(p => p.route).join(', ')}`
    );
  }
  
  // Check vendor dependencies
  const vendorChunks = chunks.filter(c => c.dependencies.length > 10);
  if (vendorChunks.length > 0) {
    recommendations.push(
      'Consider tree-shaking unused vendor code or splitting vendor bundles'
    );
  }
  
  // CSS recommendations
  if (performance.css > 50 * 1024) { // 50KB
    recommendations.push(
      'Consider CSS optimization: critical CSS inlining, unused CSS removal'
    );
  }
  
  return recommendations;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function generateHTMLReport(analysis: BundleAnalysis): string {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bundle Analysis Report - Zoptal</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2563eb; margin-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #1e40af; }
        .stat-label { color: #64748b; margin-top: 5px; }
        .threshold { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8em; }
        .threshold.pass { background: #dcfce7; color: #166534; }
        .threshold.warn { background: #fef3c7; color: #92400e; }
        .threshold.fail { background: #fecaca; color: #991b1b; }
        .recommendations { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .table th { background: #f1f5f9; font-weight: 600; }
        .progress { width: 100%; height: 20px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
        .progress-bar { height: 100%; background: linear-gradient(to right, #10b981, #f59e0b, #ef4444); transition: width 0.3s; }
        .timestamp { color: #64748b; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📦 Bundle Analysis Report</h1>
        <p class="timestamp">Generated: ${new Date(analysis.timestamp).toLocaleString()}</p>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-value">${formatBytes(analysis.totalSize)}</div>
                <div class="stat-label">Total Bundle Size</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatBytes(analysis.gzippedSize)}</div>
                <div class="stat-label">Gzipped Size</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatBytes(analysis.performance.firstLoadJS)}</div>
                <div class="stat-label">First Load JS</div>
                <div class="threshold ${analysis.thresholds.firstLoadJS.status}">
                    ${analysis.thresholds.firstLoadJS.status.toUpperCase()}
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysis.pages.length}</div>
                <div class="stat-label">Total Pages</div>
            </div>
        </div>
        
        <h2>🎯 Performance Thresholds</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <h4>First Load JS: ${formatBytes(analysis.thresholds.firstLoadJS.value)} / ${formatBytes(analysis.thresholds.firstLoadJS.threshold)}</h4>
                <div class="progress">
                    <div class="progress-bar" style="width: ${Math.min(100, (analysis.thresholds.firstLoadJS.value / analysis.thresholds.firstLoadJS.threshold) * 100)}%"></div>
                </div>
            </div>
            <div>
                <h4>Total Bundle: ${formatBytes(analysis.thresholds.totalBundle.value)} / ${formatBytes(analysis.thresholds.totalBundle.threshold)}</h4>
                <div class="progress">
                    <div class="progress-bar" style="width: ${Math.min(100, (analysis.thresholds.totalBundle.value / analysis.thresholds.totalBundle.threshold) * 100)}%"></div>
                </div>
            </div>
        </div>
        
        ${analysis.recommendations.length > 0 ? `
        <div class="recommendations">
            <h3>💡 Optimization Recommendations:</h3>
            <ul>
                ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        <h2>📄 Page Analysis</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Route</th>
                    <th>Size</th>
                    <th>First Load JS</th>
                    <th>Chunks</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
                ${analysis.pages.map(page => `
                <tr>
                    <td>${page.route}</td>
                    <td>${formatBytes(page.size)}</td>
                    <td>${formatBytes(page.firstLoadJS)}</td>
                    <td>${page.chunks.length}</td>
                    <td>${page.static ? 'Static' : 'Dynamic'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h2>🧩 Chunk Analysis</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Chunk</th>
                    <th>Size</th>
                    <th>Type</th>
                    <th>Dependencies</th>
                </tr>
            </thead>
            <tbody>
                ${analysis.chunks.map(chunk => `
                <tr>
                    <td>${chunk.name}</td>
                    <td>${formatBytes(chunk.size)}</td>
                    <td>${chunk.type}</td>
                    <td>${chunk.dependencies.length}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>
  `;
  
  return html;
}

async function main() {
  try {
    console.log('🚀 Starting bundle analysis for Zoptal website...');
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Build project
    await buildProject();
    
    // Analyze bundle
    const analysis = await analyzeBuildOutput();
    
    // Save reports
    const timestamp = Date.now();
    const jsonPath = path.join(OUTPUT_DIR, `bundle-analysis-${timestamp}.json`);
    const htmlPath = path.join(OUTPUT_DIR, `bundle-analysis-${timestamp}.html`);
    
    fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));
    fs.writeFileSync(htmlPath, generateHTMLReport(analysis));
    
    // Console summary
    console.log('\n✅ Bundle Analysis Complete!');
    console.log(`📦 Total Size: ${formatBytes(analysis.totalSize)}`);
    console.log(`🗜️  Gzipped: ${formatBytes(analysis.gzippedSize)}`);
    console.log(`⚡ First Load JS: ${formatBytes(analysis.performance.firstLoadJS)}`);
    console.log(`📄 Pages: ${analysis.pages.length}`);
    console.log(`🧩 Chunks: ${analysis.chunks.length}`);
    
    // Status summary
    console.log('\n🎯 Performance Status:');
    console.log(`   First Load JS: ${analysis.thresholds.firstLoadJS.status.toUpperCase()}`);
    console.log(`   Total Bundle: ${analysis.thresholds.totalBundle.status.toUpperCase()}`);
    
    if (analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      analysis.recommendations.forEach((rec, i) => console.log(`   ${i + 1}. ${rec}`));
    }
    
    console.log(`\n📁 Reports saved to: ${OUTPUT_DIR}`);
    
    // Exit with error if thresholds exceeded
    if (analysis.thresholds.firstLoadJS.status === 'fail' || analysis.thresholds.totalBundle.status === 'fail') {
      console.log('\n❌ Bundle analysis failed - performance thresholds exceeded');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error running bundle analysis:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { analyzeBuildOutput, generateRecommendations, formatBytes };