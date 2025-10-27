const http = require('http');

const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Test server working!\n');
});

server.listen(port, 'localhost', () => {
  console.log(`Test server running at http://localhost:${port}/`);
  console.log('Press Ctrl+C to stop');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});