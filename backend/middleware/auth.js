const crypto = require("crypto");

const verifyShopifyRequest = (req, res, next) => {
  const shopHeader = req.headers["x-shopify-shop-domain"];
  const shopQuery  = req.query.shop;
  let shop = shopHeader || shopQuery;

  if (!shop) {
    if (process.env.NODE_ENV === "development") {
      req.shop = process.env.DEV_SHOP || "dev-store.myshopify.com";
      return next();
    }
    return res.status(401).json({ error: "Unauthorized: shop not found" });
  }

  if (!shop.includes(".myshopify.com")) {
    shop = `${shop}.myshopify.com`;
  }

  req.shop = shop.toLowerCase();
  next();
};

const verifyWebhook = (req, res, next) => {
  const hmac = req.headers["x-shopify-hmac-sha256"];
  const body = req.rawBody;

  if (!hmac || !body) {
    return res.status(401).json({ error: "Webhook verification failed" });
  }

  const hash = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET || "")
    .update(body, "utf8")
    .digest("base64");

  if (hash !== hmac) {
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  next();
};

module.exports = { verifyShopifyRequest, verifyWebhook };