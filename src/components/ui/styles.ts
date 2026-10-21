export type ButtonVariant = 'brand' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

/** También sirve para los controles generados en el navegador (p. ej. administración). */
export function buttonClasses({
  variant = 'brand',
  size = 'md',
  className = '',
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return `ui-button ui-button--${variant} ui-button--${size} ${className}`.trim()
}
