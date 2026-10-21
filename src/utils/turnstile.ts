// Cloudflare Turnstile (widget "bigibai-enlace-magico") para lo que acaba en Supabase Auth.
// En local, la clave de pruebas de Cloudflare, que siempre pasa (el widget solo admite bigibai.com)
const SITE_KEY = import.meta.env.DEV ? '1x00000000000000000000AA' : '0x4AAAAAAFfApFbO4m6cfFt6'
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
// Lo máximo que se espera a que se resuelva el desafío antes de dar el envío por fallido
const TOKEN_TIMEOUT = 15_000

interface Turnstile {
  render(container: HTMLElement, options: Record<string, unknown>): string
  reset(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: Turnstile
  }
}

let scriptPromise: Promise<Turnstile> | undefined

// Con el ClientRouter la página no se recarga: el script se carga una sola vez
function loadTurnstile(): Promise<Turnstile> {
  scriptPromise ??= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile)

    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.addEventListener('load', () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile no disponible'))
    )
    script.addEventListener('error', () => {
      scriptPromise = undefined
      reject(new Error('No se ha podido cargar Turnstile'))
    })
    document.head.append(script)
  })
  return scriptPromise
}

/**
 * Pinta el widget en `container` (solo se ve si Turnstile necesita que el usuario interactúe)
 */
export function createCaptcha(container: HTMLElement) {
  let token: string | null = null
  let waiting: ((value: string) => void)[] = []

  const setToken = (value: string | null) => {
    token = value
    if (!value) return
    waiting.forEach((resolve) => resolve(value))
    waiting = []
  }

  const widget = loadTurnstile()
    .then((turnstile) => ({
      turnstile,
      id: turnstile.render(container, {
        sitekey: SITE_KEY,
        appearance: 'interaction-only',
        callback: (value: string) => setToken(value),
        'expired-callback': () => setToken(null),
        'error-callback': () => setToken(null),
      }),
    }))
    .catch(() => null)

  return {
    /** Token para enviar a Supabase, o null si no se ha podido resolver el desafío */
    async getToken(): Promise<string | null> {
      if (token) return token
      if (!(await widget)) return null

      return new Promise((resolve) => {
        const done = (value: string | null) => {
          clearTimeout(timer)
          waiting = waiting.filter((callback) => callback !== done)
          resolve(value)
        }
        const timer = setTimeout(() => done(null), TOKEN_TIMEOUT)
        waiting.push(done)
      })
    },

    async reset() {
      token = null
      const current = await widget
      current?.turnstile.reset(current.id)
    },
  }
}
