import http from 'http';
import handler from './api/index';
import dotenv from 'dotenv';

dotenv.config();

let port = Number(process.env.PORT || 3001);

const server = http.createServer((req, res) => {
  // Basic CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  handler(req, res);
});

function start(p: number) {
  server.listen(p, () => {
    port = p;
    console.log(`API server running on http://localhost:${p}`);
  });
}

server.on('error', (err: any) => {
  if (err?.code === 'EADDRINUSE') {
    const next = port + 1;
    console.warn(`Port ${port} in use, trying ${next}...`);
    start(next);
  } else {
    console.error('Server error:', err);
  }
});

start(port);
