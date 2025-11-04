const http = require('http');
const fs = require('fs');
const path = require('path');

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

function serveFile(res, filePath) {
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': mimeType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(content, 'utf-8');
        }
    });
}

const requestListener = (req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    serveFile(res, filePath);
};

const server = http.createServer(requestListener);
const PORT = 8080;

server.listen(PORT, () => {
    console.log('🚀 Local HTTP server started on port ' + PORT);
    console.log('📍 URL: http://localhost:' + PORT);
    console.log('');
    console.log('⚠️  Picture-in-Picture API requires HTTPS!');
    console.log('');
    console.log('� Solutions for HTTPS testing:');
    console.log('');
    console.log('1️⃣  Use Chrome with insecure content flags:');
    console.log('   chrome.exe --allow-running-insecure-content --disable-web-security --user-data-dir=temp-chrome');
    console.log('');
    console.log('2️⃣  Use browser\'s localhost HTTPS support:');
    console.log('   - Chrome: Enable chrome://flags/#allow-insecure-localhost');
    console.log('   - Edge: Similar flag available');
    console.log('');
    console.log('3️⃣  Use online deployment:');
    console.log('   - GitHub Pages (automatic HTTPS)');
    console.log('   - Vercel, Netlify, etc.');
    console.log('');
    console.log('4️⃣  Install local HTTPS tools:');
    console.log('   - mkcert for local certificates');
    console.log('   - ngrok for tunneling');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});