import { config } from "./config"

const DEV_DEFAULTS: Record<string, string> = {
  JWT_SECRET: "dev-secret-change-in-production",
  ENCRYPTION_KEY: "",
  STALWART_API_KEY: "",
  MAILCOW_API_KEY: "",
}

export function validateEnv(): void {
  const warnings: string[] = []

  if (config.jwtSecret === DEV_DEFAULTS.JWT_SECRET && process.env.NODE_ENV === "production") {
    warnings.push("JWT_SECRET is set to insecure default. Generate a strong random value for production.")
  }

  if (!config.encryptionKey) {
    warnings.push("ENCRYPTION_KEY is empty. Set a random 32-byte hex string for production.")
  }

  if (config.mailCoreAdapter === "stalwart") {
    if (!config.stalwart.apiKey) {
      warnings.push("STALWART_API_KEY is empty. Mail core operations will fail.")
    }
    if (process.env.NODE_ENV === "production" && !config.stalwart.apiUrl) {
      warnings.push("STALWART_API_URL is not configured.")
    }
  }

  if (config.mailCoreAdapter === "mailcow") {
    if (!config.mailcow.apiKey) {
      warnings.push("MAILCOW_API_KEY is empty. Mail core operations will fail.")
    }
  }

  if (warnings.length > 0) {
    console.warn("=== KaseMail Configuration Warnings ===")
    warnings.forEach((w) => console.warn(`  WARN: ${w}`))
    console.warn("=======================================")
  }
}
