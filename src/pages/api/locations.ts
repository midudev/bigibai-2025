import { type APIRoute } from 'astro'

let locations: any[] = []

// Encontrar índices de las columnas que necesitamos
const [retailIndex, ensenaIndex, ciudadIndex, provinciaIndex, direccionIndex, latIndex, lonIndex] =
  [0, 1, 2, 3, 4, 5, 6]

export const GET: APIRoute = async ({ url }) => {
  if (locations.length === 0) {
    const response = await fetch('http://bigibai.com/coordenadas.csv')
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
