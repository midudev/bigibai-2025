type ErrorCodes = 'UNDEFINED_ECRYPTION_SECRET' | 'ENCRYPTION_SECRET_LENGTH' | 'UNCERTAIN'

/**
 * Error en tiempo de ejecución al encriptar
 * @param code - Código de Error
 * @param message - Mensaje de Error
 */
export default class EncryptRuntimeError extends Error {
  code: ErrorCodes

  constructor(
    code: ErrorCodes,
    message: string
  ) {
    super(message)
    this.name = 'EncryptRuntimeError'
    this.code = code.trim().toUpperCase() as ErrorCodes

    Object.setPrototypeOf(this, EncryptRuntimeError.prototype)
  }

  log(): this {
    const secret = import.meta.env.ENCRYPTION_SECRET || '<undefined>'

    // use chalk to make it colorful [pnpm i chalk]
    console.error(`
 [!] ${this.name}: | ${this.code} |...
  └── [+] Message: "${this.message}"
${secret != '<undefined>' ?
`       └── [*] On: /.env ==> ENCRYPTION_SECRET=${secret}`
: ''}
`)
    return this
  }
}
