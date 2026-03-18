const { createProxyMiddleware } = require("http-proxy-middleware");

const SERVICES = {
  auth: process.env.AUTH_SERVICE || "http://localhost:4001",
  product: process.env.PRODUCT_SERVICE || "http://localhost:4002",
  order: process.env.ORDER_SERVICE || "http://localhost:5003",
  inventory: process.env.INVENTORY_SERVICE || "http://localhost:5004",
  notification: process.env.NOTIFICATION_SERVICE || "http://localhost:5005",
  email: process.env.EMAIL_SERVICE || "http://localhost:5006",
};

const buildProxy = (target, pathRewrite) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    timeout: 10000,
    proxyTimeout: 10000,
    onError: (error, req, res) => {
      console.error(`[APIGateway] Proxy error for ${req.method} ${req.originalUrl}:`, error.message);

      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: "Bad gateway: target service unavailable",
        });
      }
    },
    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader("x-gateway-source", "api-gateway");
      proxyReq.setHeader("x-request-path", req.originalUrl);
    },
  });
};

const registerProxyRoutes = (app) => {
  app.use(
    "/api/auth",
    buildProxy(SERVICES.auth, {
      "^/api/auth": "/auth",
    })
  );

  app.use(
    "/api/products",
    buildProxy(SERVICES.product, {
      "^/api/products": "/products",
    })
  );

  app.use(
    "/api/categories",
    buildProxy(SERVICES.product, {
      "^/api/categories": "/categories",
    })
  );

  app.use(
    "/api/orders",
    buildProxy(SERVICES.order, {
      "^/api/orders": "/orders",
    })
  );

  app.use(
    "/api/inventory",
    buildProxy(SERVICES.inventory, {
      "^/api/inventory": "/inventory",
    })
  );

  app.use(
    "/api/notifications",
    buildProxy(SERVICES.notification, {
      "^/api/notifications": "/notifications",
    })
  );

  app.use(
    "/api/emails",
    buildProxy(SERVICES.email, {
      "^/api/emails": "/emails",
    })
  );
};

module.exports = {
  registerProxyRoutes,
};
