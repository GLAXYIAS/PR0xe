const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = createProxyMiddleware({
  changeOrigin: true,
  router: (req) => {
    let target = req.query.url;
    if (!target) {
      const path = req.path.replace(/^\/+/, '');
      if (path.startsWith('http')) target = path;
    }
    return target && target.startsWith('http') ? target : 'https://www.google.com';
  },
  onProxyReq: (proxyReq, req) => {
    const target = req.query.url || req.path.replace(/^\/+/, '');
    if (target && target.startsWith('http')) {
      try {
        proxyReq.setHeader('Host', new URL(target).host);
      } catch (e) {}
    }
  }
});
