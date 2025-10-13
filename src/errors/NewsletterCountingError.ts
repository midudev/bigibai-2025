import { PostgrestError } from "@supabase/supabase-js"

/**
 * Error en el rencuento del Newsletter
 * @param message - Mensaje de Error
 */
export default class NewsletterCountingError extends Error {
  postgrestError: PostgrestError | null

  constructor(
    message: string,
    postgrestError: PostgrestError | null
  ) {
    super(message)
    this.name = 'NewsletterCountingError'
    this.postgrestError = postgrestError

    Object.setPrototypeOf(this, NewsletterCountingError.prototype)
  }

  log(): this {
    // use chalk to make it colorful [pnpm i chalk]
    console.error(
    `
    [!] ${this.name}: | COUNT_SUSCRIBERS_FAULT |...
      ├── [+] Message: "${this.message}"
      └── [*] Postgrest.sql Error:
            - .message : "${this.postgrestError?.message ?? 'N/A'}"
            - .code    : "${this.postgrestError?.code ?? 'N/A'}"
            - .details : "${this.postgrestError?.details ?? 'N/A'}"
            - .hint    : "${this.postgrestError?.hint ?? 'N/A'}"
    `
    )

    return this
  }
}