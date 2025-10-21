type ErrorCodes = 'INVALID_FORMAT_DATA' | 'UNCERTAIN'

/**
 * Error en tiempo de ejecución al descriptear hash en formato: iv.encrypted.authTag
 * @param code - Código de Error
 * @param message - Mensaje de Error
 */
export default class DecryptRuntimeError extends Error {
  code: ErrorCodes

  constructor(code: ErrorCodes, message: string) {
    super(message)
    this.name = 'DecryptRuntimeError'
    this.code = code.trim().toUpperCase() as ErrorCodes

    Object.setPrototypeOf(this, DecryptRuntimeError.prototype)
  }

  log(): this {
    // use chalk to make it colorful [pnpm i chalk]
    console.error(
      `
    [!] ${this.name}: | ${this.code} |...
      └── [+] Message: "${this.message}"
    `
    )

    return this
  }
}
