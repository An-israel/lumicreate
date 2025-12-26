// Luminate Creators Constants

export const COIN_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    naira: 1000,
    coins: 100,
    bonus: 0,
    description: "Perfect for testing Luminate or small purchases",
  },
  {
    id: "popular",
    name: "Popular",
    naira: 5000,
    coins: 550,
    bonus: 50,
    bonusPercent: 10,
    description: "Entry equipment or consultations",
    popular: true,
  },
  {
    id: "value",
    name: "Value",
    naira: 10000,
    coins: 1200,
    bonus: 200,
    bonusPercent: 20,
    description: "Mid-tier equipment packages",
  },
  {
    id: "best-deal",
    name: "Best Deal",
    naira: 20000,
    coins: 2600,
    bonus: 600,
    bonusPercent: 30,
    description: "Premium setups or multiple items",
    bestValue: true,
  },
] as const;

export const CONSULTATION_TYPES = [
  {
    id: "equipment_selection",
    name: "Equipment Selection",
    duration: "15 minutes",
    coins: 500,
    nairaValue: 5000,
    description: "Quick equipment advice for specific questions",
    features: [
      "Your content goals and current setup",
      "Budget-appropriate recommendations",
      "Specific product suggestions",
      "Where to prioritize your spending",
    ],
    bestFor: ['"Which mic should I buy?"', '"Is this camera worth it?"', "Quick equipment decisions"],
  },
  {
    id: "setup_support",
    name: "Setup Support",
    duration: "30 minutes",
    coins: 1500,
    nairaValue: 15000,
    description: "Unboxing help, technical setup, and troubleshooting",
    features: [
      "Unboxing and setup assistance",
      "Technical troubleshooting",
      "Optimal equipment placement",
      "Audio/video quality testing",
      "Basic tips for using your gear",
    ],
    bestFor: ["Just received your equipment", "Struggling with setup", "Want to optimize your studio space"],
  },
  {
    id: "content_strategy",
    name: "Content Strategy",
    duration: "1 hour",
    coins: 3000,
    nairaValue: 30000,
    description: "Content niche, growth, and monetization strategy",
    features: [
      "Content niche and positioning",
      "Equipment needs for your content type",
      "Growth and monetization strategy",
      "Content calendar framework",
      "Platform-specific tips (YouTube/TikTok/IG)",
    ],
    bestFor: [
      "New creators figuring out their direction",
      "Existing creators wanting to level up",
      "Planning content strategy for 2025",
    ],
  },
  {
    id: "complete_package",
    name: "Complete Consultation",
    duration: "2 hours",
    coins: 4500,
    nairaValue: 45000,
    description: "Full equipment audit, content strategy, and action plan",
    features: [
      "Complete equipment audit",
      "Budget planning and phased upgrade roadmap",
      "Studio setup optimization",
      "Content strategy and niche positioning",
      "Monetization pathways",
      "30-day action plan",
    ],
    bestFor: [
      "Serious creators investing in long-term growth",
      "Career transition into full-time content creation",
      "Launching a brand or business via content",
    ],
    recommended: true,
  },
] as const;

export const TIERS = {
  basic: {
    name: "Basic",
    priceRange: "₦50,000 - ₦100,000",
    coinsRange: "5,000 - 10,000 coins",
    perfectFor: "Smartphone creators, TikTokers, Instagram content creators just getting started",
    color: "bg-emerald-500",
  },
  premium: {
    name: "Premium",
    priceRange: "₦100,000 - ₦250,000",
    coinsRange: "10,000 - 25,000 coins",
    perfectFor: "YouTubers, podcasters, serious content creators ready to upgrade their quality",
    color: "bg-primary",
    popular: true,
  },
  diamond: {
    name: "Diamond",
    priceRange: "₦250,000 - ₦500,000+",
    coinsRange: "25,000 - 50,000+ coins",
    perfectFor: "Professional creators, brand partnerships, multi-platform content production",
    color: "bg-violet-500",
  },
} as const;

export const CONTENT_TYPES = [
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "podcast", label: "Podcast" },
  { id: "live_streaming", label: "Live Streaming" },
  { id: "photography", label: "Photography" },
  { id: "general", label: "General" },
] as const;

export const ORDER_STATUSES = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  processing: { label: "Processing", color: "bg-blue-500" },
  shipped: { label: "Shipped", color: "bg-purple-500" },
  delivered: { label: "Delivered", color: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
} as const;

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
] as const;

export const WHATSAPP_NUMBER = "+2348000000000"; // Replace with actual number

export const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCoins = (amount: number) => {
  return new Intl.NumberFormat("en-NG").format(amount);
};