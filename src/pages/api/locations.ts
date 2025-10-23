import { type APIRoute } from 'astro'
import { locations } from '@/data/locations'

const stringifiedLocations = JSON.stringify(locations)

export const GET: APIRoute = async () => {
  return new Response(stringifiedLocations, { status: 200 })
}
