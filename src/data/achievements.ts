export interface Achievement {
  id: string
  title: string
  description: string
  image: string
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  'calendar-redeemed': {
    id: 'calendar-redeemed',
    title: '¡Tu primer calendario!',
    description: 'Has canjeado tu primer calendario de adviento.',
    image: '/achievement_01.webp',
  },
  'calendar-two': {
    id: 'calendar-two',
    title: 'El doble de oportunidades',
    description: 'Has canjeado 2 calendarios de adviento.',
    image: '/achievement_02.webp',
  },
  'calendar-lover': {
    id: 'calendar-lover',
    title: 'Amor por el chocolate',
    description: 'Has canjeado 5 calendarios de adviento.',
    image: '/achievement_03.webp',
  },
  'first-unlocked': {
    id: 'first-unlocked',
    title: '¿Qué es? ¿Qué es?',
    description: 'Desvela tu primer sorteo',
    image: '/achievement_04.webp',
  },
  'five-unlocked': {
    id: 'five-unlocked',
    title: '¡El quinto!',
    description: 'Desvela tu quinto sorteo',
    image: '/achievement_05.webp',
  },
  'all-unlocked': {
    id: 'all-unlocked',
    title: 'El ansía viva',
    description: '¡Desvela todos los sorteos!',
    image: '/achievement_06.webp',
  },
  'clicker-level-1': {
    id: 'clicker-level-1',
    title: 'Púgil Novato',
    description: 'Has completado el primer nivel en Choco Boxer',
    image: '/pixel-glove.png', // Reusing existing asset as placeholder
  },
  'clicker-level-5': {
    id: 'clicker-level-5',
    title: 'Púgil Experto',
    description: 'Has llegado al nivel 5 en Choco Boxer',
    image: '/pixel-glove.png', // Reusing existing asset as placeholder
  },
}
