const { spawn } = require('child_process');

console.log('🔍 Diagnosing Next.js server issues...');

const nextProcess = spawn('npx', ['next', 'dev', '--port', '3000'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd()
});

nextProcess.stdout.on('data', (data) => {
  console.log('📤 STDOUT:', data.toString());
});

nextProcess.stderr.on('data', (data) => {
  console.error('❌ STDERR:', data.toString());
});

nextProcess.on('close', (code) => {
  console.log(`🔚 Process exited with code: ${code}`);
});

nextProcess.on('error', (error) => {
  console.error('💥 Process error:', error);
});

// Kill after 30 seconds
setTimeout(() => {
  console.log('⏰ Killing process after 30 seconds...');
  nextProcess.kill();
}, 30000);