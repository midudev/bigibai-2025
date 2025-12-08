// Tipos de juegos disponibles
export type GameType = 'anagram' | 'trivia' | 'puzzle' | 'memory' | 'racer' | 'camper' | 'snake' | 'circus' | 'safari' | 'hamster' | 'dron' | 'flight' | 'arkanoid'

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
  4: 'circus',
  5: 'safari',
  6: 'hamster',
  7: 'dron',
  8: 'flight',
  9: 'arkanoid',
  10: 'arkanoid',
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
  4: '04_466A47E3-5C11-450F-AB27-A2FA4858B45E',
  5: '05_AF624A43-6CCC-4078-A72B-1CBB26EDFDE1',
  6: '06_C86A7444-3949-4882-9654-6BBE45EE440B',
  7: '07_AA0C1848-B6CD-4261-8A51-35E77CE89126',
  8: '08_2F2D0FE7-37B2-4F42-9631-02BA19BA432B',
  9: '09_BEC5D794-65D1-4D7D-A131-41CB3AC582AF',
  10: '10_BAE880CD-0208-4D56-A6D1-3C435C0D4194',
  11: '11_86DC3649-B1FE-4D4F-94EC-461D838E71D4',
  12: '12_EDEE315A-6067-4ECA-81E6-298597A674BC',
  13: '13_D4A64AE3-8F76-4D85-A6A6-AE8492FDD2A9',
  14: '14_6FDFB013-5993-428D-AF3A-D3BDF93D3FC6',
  15: '15_0FA809B7-0D07-49F5-A348-DABC509FD44F',
  16: '16_9E7C5F1C-46FA-457F-9EAB-D77872C4ADF9',
  17: '17_FA969ED4-81C1-49FF-AC30-7A2249AE0326',
  18: '18_4B0B8912-9257-45E9-981A-E1028D61E5E7',
  19: '19_EE7E34B9-086B-40DB-8302-47F2E23DE74B',
  20: '20_301DD07A-DD32-47F4-B2E3-39708BF2CB42',
  21: '21_0CDA7CDE-4043-4632-B942-BD6D827C6A5B',
  22: '22_BF745AFA-FCB1-4743-B510-185CD126FB95',
  23: '23_AEEED75B-A73F-4BB5-A99A-0E70AA7DE9BC',
  24: '24_097B0006-3D8F-427D-A198-0E7AC25DCC67',
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
  },
  4: {
    videoUrl: getVideoUrlForDay(4),
    prize: 'Entradas para Cirque du Soleil',
  },
  5: {
    videoUrl: getVideoUrlForDay(5),
    prize: 'Viaje en Safari para dos',
  },
  6: {
    videoUrl: getVideoUrlForDay(6),
    prize: 'Cena en Celler Can Roca',
  },
  7: {
    videoUrl: getVideoUrlForDay(7),
    prize: 'DJI Mini 4K Fly More Combo',
  },
  8: {
    videoUrl: getVideoUrlForDay(8),
    prize: 'Viaje a Islas para dos',
  },
  9: {
    videoUrl: getVideoUrlForDay(9),
    prize: 'Viaje en Crucero para dos',
  },
  10: {
    videoUrl: getVideoUrlForDay(10),
    prize: 'iPhone Air 256GB',
  },
  11: {
    videoUrl: getVideoUrlForDay(11),
    prize: 'Sony WH-1000XM5 + LinkBuds',
  },
  12: {
    videoUrl: getVideoUrlForDay(12),
    prize: 'Camino Legendario para 2 personas'
  }, 
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
