const { createProxyMiddleware } = require('http-proxy-middleware');

const proxy = createProxyMiddleware({
  target: '', // will be overridden
  changeOrigin: true,
  pathRewrite: (path, req) => {
    // Extract target from query or path
    return path;
  },
  onProxyReq: (proxyReq, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const targetUrl = url.searchParams.get('url') || req.url.replace('/api/proxy/', '');
    if (targetUrl) {
      proxyReq.setHeader('Host', new URL(targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl).host);
    }
  }
});

export default function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let target = url.searchParams.get('url');
  if (!target) {
    target = req.url.replace('/api/proxy', '').replace(/^//, '');
  }
  if (!target.startsWith('http')) {
    target = 'https://' + target;
  }

  // Dynamic target
  proxy.proxy(req, res, { target });
}