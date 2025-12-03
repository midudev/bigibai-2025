// Tipos de juegos disponibles
export type GameType = 'anagram' | 'trivia' | 'puzzle' | 'memory' | 'racer' | 'camper' | 'snake'

// Configuración de cada día
interface DayConfig {
  day: number
  description: string
  gameType: GameType
  prize?: string
  gameData?: {  
    targetScore?: number
    anagram?: string
    answer?: string
    hint?: string
    videoUrl?: string
    prize?: string
    // Aquí puedes añadir más propiedades específicas de cada tipo de juego
  }
}

const DESCRIPTIONS = [
  'Como las 24 casillas del calendario de Adviento de Ibai',
  'Momento perfecto para decorar el árbol con más LEDs que el setup de Ander',
  'Ya puedes poner el Belén en casa',
  'Tres semanas para preparar las recetas navideñas',
  'Momento ideal para escribir la carta a los Reyes Magos',
  'Las luces de la ciudad empiezan a brillar',
  'Los mercadillos navideños abren sus puertas y el chat pregunta si se puede pagar con subs',
  'Hora de empezar con las compras de regalos',
  'Los villancicos suenan en todas partes',
  'Quince días para hornear las galletas navideñas',
  'Dos semanas para ultimar los detalles',
  'Trece días de espera, suficiente para maratonear todos los eventos de la Velada',
  'Doce días para celebrar',
  'Los calcetines ya cuelgan de la chimenea',
  'Solo diez días más',
  'Nueve renos tirando del trineo de Santa',
  'Una semana y un día: tiempo justo para suscribirte a Ibai con Prime',
  'Una semana exacta',
  'Los regalos empiezan a acumularse bajo el árbol, ¿alguno será un funko de Ibai?',
  'Cinco días nada más',
  'Las cuatro velas de la Corona de Adviento ya brillan',
  'Como los tres Reyes Magos viajando hacia Belén viendo un stream de Ibai',
  'Las últimas compras antes de la gran celebración',
  '¡Mañana es Navidad! El momento más esperado del año',
]

// Configuración de juegos por día
const GAME_CONFIG: Record<number, GameType> = {
  1: 'racer',
  2: 'camper',
  3: 'snake',
  4: 'racer',
  5: 'racer',
  6: 'racer',
  7: 'racer',
  8: 'racer',
  9: 'racer',
  10: 'racer',
  11: 'racer',
  12: 'racer',
  13: 'racer',
  14: 'racer',
  15: 'racer',
  16: 'racer',
  17: 'racer',
  18: 'racer',
  19: 'racer',
  20: 'racer',
  21: 'racer',
  22: 'racer',
  23: 'racer',
  24: 'racer',
}

// Mapeo de videos por día (UUID único para cada video)
const VIDEO_URLS: Record<number, string> = {
  1: '01_0CF5950A-A6B4-4F86-93DD-23E28C7685EE',
  2: '02_C0EAB650-A81B-42A7-862D-30C51F8B9C8D',
  3: '03_4CCC36F4-D5B2-4BE8-BA1D-6B006F53B207',
  4: '04_466A47E3-5C11-450F-AB27-A2FA4858B45E'
}

// Función auxiliar para obtener la URL del video según el día
function getVideoUrlForDay(day: number): string {
  return VIDEO_URLS[day] || 'mock'
}

// Datos específicos de cada día
const GAME_DATA: Record<number, DayConfig['gameData']> = {
  1: {
    videoUrl: getVideoUrlForDay(1),
    prize: 'Mini Cooper Eléctrico',
  },
  2: {
    videoUrl: getVideoUrlForDay(2),
    prize: 'Fin de semana sobre ruedas',
  },
  3: {
    videoUrl: getVideoUrlForDay(3),
    prize: 'Kit de LEGO valorado en 2000€',
  }
}

function getDescriptionForDay(day: number): string {
  const today = new Date()
  const currentYear = today.getFullYear()

  // Calcular días hasta Navidad
  let christmas = new Date(currentYear, 11, 25)
  if (today > christmas) {
    christmas = new Date(currentYear + 1, 11, 25)
  }
  const daysUntil = Math.max(
    0,
    Math.ceil((christmas.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  )

  // Obtener día actual (0 si no estamos en diciembre)
  const currentDay = today.getMonth() === 11 ? today.getDate() : 0

  // Si el día ya pasó o es hoy, descripción personalizada
  return day <= currentDay
    ? DESCRIPTIONS[day - 1]
    : `y ${daysUntil} días para Navidad - Casilla ${day}/24`
}

export const cells: DayConfig[] = Array.from({ length: 24 }, (_, i) => {
  const day = i + 1
  return {
    day,
    description: getDescriptionForDay(day),
    gameType: GAME_CONFIG[day] || 'anagram',
    gameData: GAME_DATA[day],
  }
})
