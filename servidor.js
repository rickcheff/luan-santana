const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3200;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.eot':  'application/vnd.ms-fontobject',
};

// Guarda o momento em que cada código de pagamento foi criado
var pendingPayments = {};

http.createServer(function(req, res) {
  var url = req.url.split('?')[0];

  // ─── POST /api/pagar.php ──────────────────────────────────────────────────
  if (req.method === 'POST' && url === '/api/pagar.php') {
    var body = '';
    req.on('data', function(chunk){ body += chunk; });
    req.on('end', function(){
      var code = 'MBWAY' + Date.now();
      pendingPayments[code] = Date.now();
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ success: true, payment_code: code }));
    });
    return;
  }

  // ─── GET /api/verificar.php?code=... ─────────────────────────────────────
  if (req.method === 'GET' && url === '/api/verificar.php') {
    var qs = req.url.split('?')[1] || '';
    var code = '';
    qs.split('&').forEach(function(p){ var kv = p.split('='); if(kv[0]==='code') code = decodeURIComponent(kv[1]||''); });
    var created = pendingPayments[code] || 0;
    var elapsed = Date.now() - created;
    // Simula aprovação depois de 8 segundos
    var status = elapsed > 8000 ? 'approved' : 'pending';
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: true, data: { status: status }, status: status }));
    return;
  }

  // ─── Ficheiros estáticos ──────────────────────────────────────────────────
  var filePath = path.join(ROOT, url === '/' ? '/index.html' : url);
  // Sem extensão → tenta index.html
  if (!path.extname(filePath)) filePath = path.join(filePath, 'index.html');

  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + url);
      return;
    }
    var ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });

}).listen(PORT, function(){
  console.log('Servidor a correr em http://localhost:' + PORT);
  console.log('MB Way API mock activo (/api/pagar.php e /api/verificar.php)');
  console.log('Aprovacao simulada 8 segundos apos iniciar pagamento');
});
