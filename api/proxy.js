const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = createProxyMiddleware({
  changeOrigin: true,
  router: (req) => {
    let target = req.query.url;
    
    // Support /https://example.com style
    if (!target) {
      const path = req.path.replace(/^\/+/, '');
      if (path.startsWith('http')) target = path;
    }
    
    return target && target.startsWith('http') ? target : null;
  },
  onProxyReq: (proxyReq, req) => {
    const target = req.query.url || req.path.replace(/^\/+/, '');
    if (target && target.startsWith('http')) {
      try {
        proxyReq.setHeader('Host', new URL(target).host);
      } catch (e) {}
    }
  },
  onError: (err, req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>Proxy Error</h1><p>Try again or check the URL.</p>');
  }
});
