import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from 'crypto'
import EncryptRuntimeError from '@/errors/EncryptRuntimeError'
import DecryptRuntimeError from '@/errors/DecryptRuntimeError'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16      // Tamaño del vector de inicialización
const KEY_LENGTH = 32     // AES-256 requiere clave de 32 bytes

/**
 * Obtiene la clave de cifrado desde las variables de entorno
 * La clave debe ser una cadena de al menos 32 caracteres
 */
function getEncryptionKey(): Buffer {
  const secret = import.meta.env.ENCRYPTION_SECRET
  
  if (!secret) {
    throw new EncryptRuntimeError('UNDEFINED_ECRYPTION_SECRET', 'ENCRYPTION_SECRET no está definida en las variables de entorno')
  }

  if (secret.length < 32) {
    throw new EncryptRuntimeError('ENCRYPTION_SECRET_LENGTH', 'ENCRYPTION_SECRET debe tener al menos 32 caracteres')
  }

  // Derivamos una clave de 32 bytes usando scrypt
  const salt = Buffer.from('bigibai-newsletter-salt') // Salt fijo para consistencia
  return scryptSync(secret, salt, KEY_LENGTH)
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
  return [
    iv.toString('hex'),
    encrypted,
    authTag.toString('hex')
  ].join('.')
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
 * Genera un hash SHA-256 de un texto
 * Este hash es determinista (mismo input = mismo output)
 * Útil para detectar duplicados sin exponer el texto original
 * @param text - Texto a hashear (ej: email)
 * @returns Hash SHA-256 en formato hexadecimal
 */
export function hash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}
