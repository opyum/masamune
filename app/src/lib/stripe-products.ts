export const PLANS = {
  free: {
    name: "Gratuit",
    price: 0,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: [
      "1 site",
      "Sous-domaine masamune.app",
      "5 modifications/mois",
      "SEO basique",
    ],
    limits: { sites: 1, iterationsPerMonth: 5 },
  },
  pro: {
    name: "Pro",
    price: 39,
    priceYearly: 29,
    stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
    stripePriceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
    features: [
      "1 site",
      "Domaine custom",
      "SEO complet",
      "Modifications illimitees",
      "WhatsApp ou Telegram",
    ],
    limits: { sites: 1, iterationsPerMonth: -1 },
  },
  business: {
    name: "Business",
    price: 79,
    priceYearly: 59,
    stripePriceIdMonthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || "",
    stripePriceIdYearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || "",
    features: [
      "3 sites",
      "Domaines custom",
      "Monitoring SEO",
      "Analytics",
      "Tous les canaux",
      "Notifications proactives",
    ],
    limits: { sites: 3, iterationsPerMonth: -1 },
  },
  enterprise: {
    name: "Enterprise",
    price: 149,
    stripePriceIdMonthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "",
    stripePriceIdYearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "",
    features: [
      "10 sites",
      "Support dedie",
      "Design premium",
      "API",
    ],
    limits: { sites: 10, iterationsPerMonth: -1 },
  },
} as const;

export type PlanKey = keyof typeof PLANS;
