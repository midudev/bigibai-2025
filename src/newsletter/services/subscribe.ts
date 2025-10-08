import { supabase } from "@/supabase";

const ERROR_CODE_ALREADY_EXISTS = "23505";

/**
 * Valida que el email tenga un formato válido adicional
 * Esta es una validación de respaldo por si Zod falla
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Guarda un email en la newsletter
 * @param email - Email a guardar (debe estar sanitizado)
 * @returns Objeto con el resultado de la operación
 */
export const saveNewsletterEmail = async (email: string) => {
  // Validación de seguridad adicional en el servidor
  if (!email || typeof email !== "string") {
    return {
      duplicated: false,
      success: false,
      error: "Email inválido",
    };
  }

  // Sanitización final
  const sanitizedEmail = email.trim().toLowerCase();

  // Validación de formato
  if (!isValidEmail(sanitizedEmail)) {
    return {
      duplicated: false,
      success: false,
      error: "El formato del email no es válido",
    };
  }

  // Validación de longitud
  if (sanitizedEmail.length > 255) {
    return {
      duplicated: false,
      success: false,
      error: "El email es demasiado largo",
    };
  }

  try {
    const { error } = await supabase.from("newsletter").insert({
      email: sanitizedEmail,
      created_at: new Date().toISOString(),
    });

    if (error?.code === ERROR_CODE_ALREADY_EXISTS) {
      return {
        duplicated: true,
        success: true,
        error: null,
      };
    }

    if (error) {
      console.error("[Newsletter Error]", {
        code: error.code,
        message: error.message,
        details: error.details,
      });

      return {
        duplicated: false,
        success: false,
        error: "Error al guardar el email en la newsletter",
      };
    }

    // Log de éxito (considera usar un logger apropiado en producción)
    console.info("[Newsletter Success]", { email: sanitizedEmail });

    return {
      duplicated: false,
      success: true,
      error: null,
    };
  } catch (err) {
    console.error("[Newsletter Exception]", err);

    return {
      duplicated: false,
      success: false,
      error: "Error inesperado al procesar la suscripción",
    };
  }
};
