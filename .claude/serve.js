const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const indexFile = path.join(root, 'index.html');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.js': 'text/javascript',
  '.css': 'text/css',
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const requestedFile = path.normalize(path.join(root, urlPath));

  // Prevent escaping the project root
  if (!requestedFile.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(requestedFile).toLowerCase();
  const isRealFile = urlPath !== '/' && ext && fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile();
  const fileToServe = isRealFile ? requestedFile : indexFile;
  const contentType = isRealFile ? (MIME[ext] || 'application/octet-stream') : MIME['.html'];

  fs.readFile(fileToServe, (err, data) => {
    if (err) { res.writeHead(500); res.end('Error'); return; }
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(8080);
