const { getDefaultConfig } = require('expo/metro-config');
const https = require('https');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

const PASSWORD_RESET_UPSTREAM =
  process.env.EXPO_PUBLIC_API_URL?.trim() || 'https://coach180.vercel.app';

/**
 * Same-origin proxy for password reset so Expo web can call Coach180's
 * /api/send-reset without browser CORS blocking the cross-origin request.
 */
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      const url = req.url?.split('?')[0] ?? '';
      if (url !== '/api/send-reset' || req.method !== 'POST') {
        return middleware(req, res, next);
      }

      const chunks = [];
      req.on('data', (chunk) => {
        chunks.push(chunk);
      });
      req.on('end', () => {
        const body = Buffer.concat(chunks);
        const upstream = new URL('/api/send-reset', PASSWORD_RESET_UPSTREAM);
        const proxyReq = https.request(
          upstream,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': body.length,
            },
          },
          (proxyRes) => {
            const responseChunks = [];
            proxyRes.on('data', (chunk) => {
              responseChunks.push(chunk);
            });
            proxyRes.on('end', () => {
              const responseBody = Buffer.concat(responseChunks);
              res.statusCode = proxyRes.statusCode ?? 502;
              res.setHeader(
                'Content-Type',
                proxyRes.headers['content-type'] || 'application/json',
              );
              res.end(responseBody);
            });
          },
        );

        proxyReq.on('error', (error) => {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              ok: false,
              error: error instanceof Error ? error.message : 'Proxy failed',
            }),
          );
        });

        proxyReq.write(body);
        proxyReq.end();
      });
    };
  },
};

module.exports = config;
