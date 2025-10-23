import { createClient } from '@/supabase'
import { type APIRoute } from 'astro'

const csvPath = '/coordenadas.csv'
let locations: any[] = []

// Encontrar índices de las columnas que necesitamos
const [retailIndex, ensenaIndex, ciudadIndex, provinciaIndex, direccionIndex, latIndex, lonIndex] =
  [0, 1, 2, 3, 4, 5, 6]

const retailDictionary: Record<string, string> = {
  A: 'Eroski',
  B: 'El Corte Inglés',
  C: 'Carrefour',
  D: 'Alcampo',
} as const

// Colores asignados a cada retail
const retailColors: Record<string, string> = {
  A: '#0099ff', // Azul Claro - Eroski
  B: '#10b981', // Verde - El Corte Inglés
  C: '#0f468f', // Azul Oscuro - Carrefour
  D: '#ef4444', // Rojo - Alcampo
} as const

const retailImages: Record<string, string> = {
  A: '/eroski-logo.webp',
  B: '/el-corte-ingles-logo.webp',
  C: '/carrefour-logo.webp',
  D: '/alcampo-logo.webp',
} as const

export const GET: APIRoute = async ({ url }) => {
  if (locations.length === 0) {
    const response = await fetch(new URL(csvPath, url.origin))
    const csvText = await response.text()
    // Parsear CSV
    const lines = csvText.split('\n')

    // Parsear datos
    locations = lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        const cols = line.split(';')
        const lat = parseFloat(cols[latIndex])
        const lon = parseFloat(cols[lonIndex])

        // Filtrar coordenadas inválidas
        if (isNaN(lat) || isNaN(lon)) return null

        return {
          lat,
          lon,
          ciudad: cols[ciudadIndex]?.trim() || '',
          provincia: cols[provinciaIndex]?.trim() || '',
          ensena: cols[ensenaIndex]?.trim() || '',
          direccion: cols[direccionIndex]?.trim() || '',
          retail: cols[retailIndex]?.trim() || '',
        }
      })
      .filter((loc): loc is NonNullable<typeof loc> => loc !== null)
  }

  return new Response(JSON.stringify(locations), { status: 200 })
}
