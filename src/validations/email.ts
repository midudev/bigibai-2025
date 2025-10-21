import { z } from "astro:schema";

export const emailSchema = z
  .string({
    required_error: "El email es requerido",
    invalid_type_error: "El email debe ser un texto",
  })
  .trim() // Elimina espacios en blanco
  .min(1, "El email no puede estar vacío")
  .email("El formato del email no es válido")
  .toLowerCase() // Normaliza a minúsculas
  .max(255, "El email es demasiado largo")
  // Validación adicional para dominios comunes mal escritos
  .refine(
    (email) => {
      const commonTypos = [
        "gmial.com",
        "gmai.com",
        "yahooo.com",
        "hotmial.com",
      ];
      const domain = email.split("@")[1];
      return !commonTypos.includes(domain);
    },
    { message: "Verifica que el dominio del email esté bien escrito" },
  )
  // Validación para evitar emails temporales/desechables
  .refine(
    (email) => {
      const disposable = [
        "tempmail.com",
        "throwaway.email",
        "10minutemail.com",
        "guerrillamail.com",
        "mailinator.com",
        "yopmail.com",
      ];
      const domain = email.split("@")[1];
      return !disposable.includes(domain);
    },
    { message: "Por favor, usa un email permanente" },
  )
  .transform((email) => email.trim().toLowerCase());
