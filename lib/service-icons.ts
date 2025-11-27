// Service icon mapping using favicon APIs
const SERVICE_DOMAINS: Record<string, string> = {
  // Social Media
  gmail: "gmail.com",
  google: "google.com",
  facebook: "facebook.com",
  twitter: "twitter.com",
  x: "x.com",
  instagram: "instagram.com",
  linkedin: "linkedin.com",
  tiktok: "tiktok.com",
  snapchat: "snapchat.com",
  pinterest: "pinterest.com",
  reddit: "reddit.com",
  whatsapp: "whatsapp.com",
  telegram: "telegram.org",
  discord: "discord.com",

  // Streaming
  netflix: "netflix.com",
  spotify: "spotify.com",
  youtube: "youtube.com",
  amazon: "amazon.com",
  prime: "primevideo.com",
  hulu: "hulu.com",
  disney: "disneyplus.com",
  hbo: "hbomax.com",
  twitch: "twitch.tv",

  // Shopping
  ebay: "ebay.com",
  walmart: "walmart.com",
  target: "target.com",
  etsy: "etsy.com",
  aliexpress: "aliexpress.com",
  shopify: "shopify.com",

  // Tech
  apple: "apple.com",
  icloud: "icloud.com",
  microsoft: "microsoft.com",
  outlook: "outlook.com",
  github: "github.com",
  gitlab: "gitlab.com",
  bitbucket: "bitbucket.org",
  dropbox: "dropbox.com",
  notion: "notion.so",
  slack: "slack.com",
  zoom: "zoom.us",
  figma: "figma.com",
  vercel: "vercel.com",

  // Finance
  paypal: "paypal.com",
  stripe: "stripe.com",
  venmo: "venmo.com",
  cashapp: "cash.app",
  coinbase: "coinbase.com",
  robinhood: "robinhood.com",

  // Others
  yahoo: "yahoo.com",
  protonmail: "protonmail.com",
  wordpress: "wordpress.com",
  medium: "medium.com",
}

export function getServiceIconUrl(service: string): string {
  const serviceLower = service.toLowerCase().trim()

  // Check if it's a known service
  for (const [key, domain] of Object.entries(SERVICE_DOMAINS)) {
    if (serviceLower.includes(key)) {
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    }
  }

  // Check if service name looks like a domain
  if (serviceLower.includes(".")) {
    return `https://www.google.com/s2/favicons?domain=${serviceLower}&sz=64`
  }

  // Try to get favicon by treating service name as domain
  return `https://www.google.com/s2/favicons?domain=${serviceLower}.com&sz=64`
}

export function getServiceColor(service: string): string {
  const serviceLower = service.toLowerCase()

  const colors: Record<string, string> = {
    gmail: "bg-red-500/10",
    google: "bg-blue-500/10",
    facebook: "bg-blue-600/10",
    twitter: "bg-sky-500/10",
    x: "bg-neutral-800/10",
    instagram: "bg-pink-500/10",
    linkedin: "bg-blue-700/10",
    netflix: "bg-red-600/10",
    spotify: "bg-green-500/10",
    github: "bg-neutral-900/10",
    apple: "bg-neutral-800/10",
    amazon: "bg-orange-500/10",
    discord: "bg-indigo-500/10",
    slack: "bg-purple-500/10",
    youtube: "bg-red-500/10",
    paypal: "bg-blue-600/10",
    dropbox: "bg-blue-500/10",
  }

  for (const [key, color] of Object.entries(colors)) {
    if (serviceLower.includes(key)) {
      return color
    }
  }

  return "bg-primary/10"
}
