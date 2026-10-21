import { createCipheriv, createDecipheriv, createHmac, randomBytes, scryptSync } from 'crypto'
import { COUPON_HMAC_SECRET, ENCRYPTION_SECRET, SALT_KEY } from 'astro:env/server'
import EncryptRuntimeError from '@/errors/EncryptRuntimeError'
import DecryptRuntimeError from '@/errors/DecryptRuntimeError'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // Tamaño del vector de inicialización
const KEY_LENGTH = 32 // AES-256 requiere clave de 32 bytes

// scrypt es costoso en CPU (los Workers tienen límite de CPU por petición):
// derivamos la clave una sola vez por isolate
let cachedKey: Buffer | null = null

/**
 * Obtiene la clave de cifrado desde las variables de entorno
 * La clave debe ser una cadena de al menos 32 caracteres
 */
function getEncryptionKey(): Buffer {
  if (cachedKey) return cachedKey

  const secret = ENCRYPTION_SECRET

  if (!secret || !SALT_KEY) {
    throw new EncryptRuntimeError(
      'UNDEFINED_ECRYPTION_SECRET',
      'ENCRYPTION_SECRET o SALT_KEY no están definidas en las variables de entorno'
    )
  }

  if (secret.length < 32) {
    throw new EncryptRuntimeError(
      'ENCRYPTION_SECRET_LENGTH',
      'ENCRYPTION_SECRET debe tener al menos 32 caracteres'
    )
  }

  // Derivamos una clave de 32 bytes usando scrypt
  const salt = Buffer.from(SALT_KEY) // Salt fijo para consistencia
  cachedKey = scryptSync(secret, salt, KEY_LENGTH)
  return cachedKey
}

/**
 * Cifra un texto usando AES-256-GCM
 * @param text - Texto a cifrar (ej: email)
 * @returns Texto cifrado en formato: salt.iv.encrypted.authTag (hex)
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)

  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Formato: iv.encrypted.authTag (todo en hex)
  return [iv.toString('hex'), encrypted, authTag.toString('hex')].join('.')
}

/**
 * Descifra un texto cifrado con AES-256-GCM
 * @param encryptedData - Texto cifrado en formato: iv.encrypted.authTag
 * @returns Texto descifrado
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey()
  const parts = encryptedData.split('.')

  if (parts.length !== 3) {
    throw new DecryptRuntimeError('INVALID_FORMAT_DATA', 'Formato de datos cifrados inválido')
  }

  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  const authTag = Buffer.from(parts[2], 'hex')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Genera el HMAC-SHA256 de un cupón con COUPON_HMAC_SECRET
 * Es determinista (se puede buscar por índice), pero el secreto no está en la base de datos:
 * si se filtra la tabla, sin él no se pueden sacar los cupones por fuerza bruta
 * @param coupon - Cupón normalizado (XXXX-XXXX-XXXX)
 * @returns HMAC-SHA256 en formato hexadecimal
 */
export function hashCoupon(coupon: string): string {
  const secret = COUPON_HMAC_SECRET

  if (!secret) {
    throw new EncryptRuntimeError(
      'UNDEFINED_COUPON_HMAC_SECRET',
      'COUPON_HMAC_SECRET no está definida en las variables de entorno'
    )
  }

  if (secret.length < 32) {
    throw new EncryptRuntimeError(
      'COUPON_HMAC_SECRET_LENGTH',
      'COUPON_HMAC_SECRET debe tener al menos 32 caracteres'
    )
  }

  return createHmac('sha256', secret).update(coupon).digest('hex')
}
