import { type APIRoute } from 'astro'
import { locations } from '@/data/locations'

const stringifiedLocations = JSON.stringify(locations)

export const GET: APIRoute = async () => {
  return new Response(stringifiedLocations, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Los datos solo cambian con cada deploy
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
