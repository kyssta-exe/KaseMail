export const config = {
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
  sessionExpiryHours: parseInt(process.env.SESSION_EXPIRY_HOURS || "72"),
  mailCoreAdapter: (process.env.MAIL_CORE_ADAPTER || "mailcow") as "mailcow" | "stalwart",
  mailcow: {
    apiUrl: process.env.MAILCOW_API_URL || "http://localhost:8080",
    apiKey: process.env.MAILCOW_API_KEY || "",
  },
  stalwart: {
    apiUrl: process.env.STALWART_API_URL || "http://localhost:8080",
    apiKey: process.env.STALWART_API_KEY || "",
  },
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  webmailUrl: process.env.NEXT_PUBLIC_WEBMAIL_URL || "http://localhost:3000",
  encryptionKey: process.env.ENCRYPTION_KEY || "",
}
