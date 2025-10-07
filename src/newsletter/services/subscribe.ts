import { supabase } from "@/supabase"

const ERROR_CODE_ALREADY_EXISTS = "23505"

export const saveNewsletterEmail = async (email: string) => {
  const { error } = await supabase.from('newsletter').insert({ email })

  if (error?.code === ERROR_CODE_ALREADY_EXISTS) {
    return {
      success: true,
      error: 'El email ya está suscrito a la newsletter'
    }
  }

  if (error) {
    console.error(error) // pino logger

    return {
      success: false,
      error: "Error al guardar el email en la newsletter"
    }
  }

  return {
    success: true,
    error: null
  }
}