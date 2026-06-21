const { createProxyMiddleware } = require('http-proxy-middleware');

export default function handler(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  let target = urlObj.searchParams.get('url');

  if (!target) {
    // Support /api/proxy/https://example.com format
    target = req.url.replace(/^/api/proxy/?/, '');
  }

  if (!target) {
    res.status(400).json({ error: 'Missing target url' });
    return;
  }

  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    target = 'https://' + target;
  }

  const proxy = createProxyMiddleware({
    target: target,
    changeOrigin: true,
    secure: true,
    ws: true,
    onProxyReq: (proxyReq, req) => {
      // Remove proxy-specific headers
      proxyReq.removeHeader('x-forwarded-host');
      proxyReq.removeHeader('x-forwarded-proto');
    }
  });

  proxy(req, res, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    }
  });
}