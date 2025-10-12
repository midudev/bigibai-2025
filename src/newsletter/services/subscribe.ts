import { supabase } from "@/supabase"
import { encrypt, hash } from "@/utils/crypto"

const ERROR_CODE_ALREADY_EXISTS = "23505"

export const saveNewsletterEmail = async (email: string) => {
  // Hash para detectar duplicados (determinista)
  const emailHash = hash(email)
  
  // Verificar si el email ya existe antes de insertar
  const { data: existing, error: checkError } = await supabase
    .from('newsletter')
    .select('id')
    .eq('email_hash', emailHash)
    .maybeSingle()
  
  if (checkError) {
    console.error(checkError)

    return {
      duplicated: false,
      success: false,
      error: "Error al verificar el email en la newsletter"
    }
  }
  
  // Si ya existe, retornar como duplicado sin intentar insertar
  if (existing) {
    return {
      duplicated: true,
      success: true,
      error: null
    }
  }
  
  // Cifrado para poder recuperar el email (reversible)
  const emailEncrypted = encrypt(email)
  
  const { error } = await supabase.from('newsletter').insert({ 
    email_hash: emailHash,
    email_encrypted: emailEncrypted 
  })
  
  if (error?.code === ERROR_CODE_ALREADY_EXISTS) {
    // Por si acaso hubo una race condition
    return {
      duplicated: true,
      success: true,
      error: null
    }
  }

  if (error) {
    console.error(error) // pino logger

    return {
      duplicated: false,
      success: false,
      error: "Error al guardar el email en la newsletter"
    }
  }

  return {
    duplicated: false,
    success: true,
    error: null
  }
}