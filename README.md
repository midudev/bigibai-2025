# Big Ibai

Web oficial de [Big Ibai](https://www.bigibai.com): el calendario de Adviento de Ibai con sorteos y un juego nuevo cada día de diciembre.

Hecha con Astro, Tailwind CSS y Supabase, y desplegada en Cloudflare Workers.

## Desarrollo

Necesitas [Bun](https://bun.com).

```bash
git clone https://github.com/midudev/bigibai.git
cd bigibai
cp .env.example .env
bun install
bun run dev
```

Sin las credenciales de Supabase en `.env` solo funciona la parte visual.
