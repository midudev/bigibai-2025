# Servicio de Rate Limiting

Servicio reutilizable para aplicar rate limiting usando Upstash Redis en todas las APIs y acciones de la aplicación.

## Configuración

Asegúrate de tener las siguientes variables de entorno configuradas:

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

## Uso

### Ejemplo básico

```typescript
import { checkRateLimit } from '@/services/ratelimit'

const rateLimitResult = await checkRateLimit({
  identifier: 'user@example.com', // Puede ser email, IP, user ID, etc.
  limit: 5, // Número máximo de requests
  windowMs: 3_600_000, // Ventana de tiempo en ms (1 hora)
})

if (!rateLimitResult.success) {
  throw new Error('Demasiados intentos')
}

// Continuar con la lógica...
```

### Usando helpers para mensajes

```typescript
import { checkRateLimit, getRateLimitMessage, getTimeRemaining } from '@/services/ratelimit'

const rateLimitResult = await checkRateLimit({
  identifier: email,
  limit: 5,
  windowMs: 3_600_000,
})

if (!rateLimitResult.success) {
  // Opción 1: Mensaje automático formateado
  throw new Error(getRateLimitMessage(rateLimitResult.reset))

  // Opción 2: Obtener tiempo restante para personalizar
  const time = getTimeRemaining(rateLimitResult.reset)
  throw new Error(`Espera ${time.minutes} minutos antes de intentar de nuevo`)
}
```

### En Astro Actions

```typescript
import { checkRateLimit, getRateLimitMessage } from '@/services/ratelimit'
import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'

export const server = {
  myAction: defineAction({
    input: z.object({
      email: z.string().email(),
    }),
    async handler({ email }) {
      // Aplicar rate limiting
      const rateLimitResult = await checkRateLimit({
        identifier: email,
        limit: 10,
        windowMs: 3_600_000, // 1 hora
      })

      if (!rateLimitResult.success) {
        throw new ActionError({
          code: 'TOO_MANY_REQUESTS',
          message: getRateLimitMessage(rateLimitResult.reset),
        })
      }

      // Tu lógica aquí...
    },
  }),
}
```

### En API Routes

```typescript
import type { APIRoute } from 'astro'
import { checkRateLimit, getRateLimitMessage, getTimeRemaining } from '@/services/ratelimit'

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Rate limit por IP
  const rateLimitResult = await checkRateLimit({
    identifier: clientAddress,
    limit: 100,
    windowMs: 60_000, // 1 minuto
  })

  if (!rateLimitResult.success) {
    const time = getTimeRemaining(rateLimitResult.reset)

    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: getRateLimitMessage(rateLimitResult.reset),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'Retry-After': time.seconds.toString(),
        },
      }
    )
  }

  // Tu lógica aquí...
  return new Response(JSON.stringify({ success: true }))
}
```

## Ventanas de tiempo comunes

```typescript
// 1 segundo
windowMs: 1_000

// 10 segundos
windowMs: 10_000

// 1 minuto
windowMs: 60_000

// 5 minutos
windowMs: 300_000

// 1 hora
windowMs: 3_600_000

// 1 día
windowMs: 86_400_000
```

## Respuesta del servicio

El servicio retorna un objeto con la siguiente estructura:

```typescript
{
  success: boolean,      // Si el request está permitido
  limit: number,         // Límite total de requests
  remaining: number,     // Requests restantes en la ventana
  reset: Date | number,  // Cuándo se resetea el contador
  pending: Promise<void> // Promise para operaciones async
}
```

## Estrategia Fail Open

Por defecto, si hay un error al conectar con Redis, el servicio permite la request (fail open). Esto evita que un problema con Redis bloquee toda tu aplicación.

Si prefieres denegar requests cuando Redis falle (fail closed), puedes modificar el catch en el servicio:

```typescript
} catch (error) {
  console.error("Rate limit error:", error)

  // Fail closed: denegar en caso de error
  return {
    success: false,
    limit,
    remaining: 0,
    reset: new Date(Date.now() + windowMs),
    pending: Promise.resolve(),
  }
}
```

## Identificadores recomendados

- **Email**: Para limitar suscripciones, registro, login
- **IP**: Para proteger endpoints públicos
- **User ID**: Para limitar acciones de usuarios autenticados
- **Combinación**: `${userId}:${action}` para límites específicos por acción

## Funciones Helper

### `getTimeRemaining(reset)`

Calcula el tiempo restante hasta el reset en diferentes unidades:

```typescript
import { getTimeRemaining } from '@/services/ratelimit'

const time = getTimeRemaining(rateLimitResult.reset)

console.log(time.milliseconds) // ej: 58432
console.log(time.seconds) // ej: 59
console.log(time.minutes) // ej: 1
console.log(time.hours) // ej: 1
```

### `getRateLimitMessage(reset, customMessage?)`

Genera un mensaje de error amigable con el tiempo restante formateado automáticamente:

```typescript
import { getRateLimitMessage } from '@/services/ratelimit'

// Mensaje por defecto
const message = getRateLimitMessage(rateLimitResult.reset)
// "Demasiados intentos. Intenta de nuevo en 5 minutos"

// Mensaje personalizado
const customMsg = getRateLimitMessage(rateLimitResult.reset, 'Has excedido el límite. Espera')
// "Has excedido el límite. Espera en 5 minutos"
```

El mensaje se adapta automáticamente:

- Menos de 1 minuto: muestra segundos
- Entre 1 y 59 minutos: muestra minutos
- 60 minutos o más: muestra horas
