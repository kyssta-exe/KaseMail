import { validateEnv } from "./env-validate"

let bootstrapped = false

export function boot(): void {
  if (bootstrapped) return
  bootstrapped = true
  validateEnv()
}
