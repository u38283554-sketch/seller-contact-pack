/**
 * Seller Content Pack - Master Configuration
 * All plan pricing, limits, support contacts, and service defaults are defined here.
 * You can edit prices or limits here and they will immediately apply across the entire app.
 */

export const BRAND_CONFIG = {
  name: "Seller Content Pack",
  tagline: "Product ka naam daalo. 1 minute mein poora selling content ready.",
  supportWhatsapp: "+964 780 133 3567",
  supportWhatsappRaw: "9647801333567", // without spaces or plus for wa.me link
  supportEmail: "dkbhaiya1200@gmail.com",
};

export const PLANS = {
  free: {
    id: "free",
    name: "Free Try",
    price: 0,
    days: 30,
    limit: 1, // 1 free generation per device
    badge: "Free",
    features: [
      "1 Free full content pack generation",
      "All 7 selling content formats",
      "Meesho, Amazon, Flipkart, Instagram & WhatsApp ready",
      "Hinglish, Hindi & English support",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter Plan",
    price: 99, // ₹99
    days: 30,
    limit: 100, // 100 generations
    badge: "Most Popular",
    isPopular: true,
    features: [
      "100 Full content pack generations",
      "Valid for 30 days",
      "All 7 e-commerce output formats",
      "Single-part instant regeneration",
      "High-speed generation (< 60s)",
      "WhatsApp & Email priority support",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Plan",
    price: 199, // ₹199
    days: 30,
    limit: 300, // 300 generations
    badge: "Best Value",
    features: [
      "300 Full content pack generations",
      "Valid for 30 days",
      "All 7 e-commerce output formats",
      "Single-part instant regeneration",
      "Priority AI queue for busy hours",
      "WhatsApp & Email priority support",
      "Best for active catalog & bulk sellers",
    ],
  },
};

export const AI_CONFIG = {
  defaultBaseUrl: "https://velona.in/v1",
  defaultModel: "deepseek/deepseek-v4-flash",
  timeoutMs: 25000, // 25-second AbortController timeout per parallel part
  maxTokensPerPart: 1500, // Ample tokens for full reel scripts, descriptions, and WhatsApp templates
};

export const ZAPUPI_CONFIG = {
  createOrderUrl: "https://pay.zapupi.com/api/create-order",
  orderStatusUrl: "https://pay.zapupi.com/api/order-status",
};
