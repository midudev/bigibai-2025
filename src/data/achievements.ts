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
    image: '/pixel-lock-achievement.png',
  },
  'calendar-two': {
    id: 'calendar-two',
    title: 'El doble de oportunidades',
    description: 'Has canjeado 2 calendarios de adviento.',
    image: '/pixel-victory-achievement.png',
  },
  'calendar-lover': {
    id: 'calendar-lover',
    title: 'Amor por el chocolate',
    description: 'Has canjeado 5 calendarios de adviento.',
    image: '/pixel-heart-achievement.png',
  },
  'first-unlocked': {
    id: 'first-unlocked',
    title: '¿Qué es? ¿Qué es?',
    description: 'Desvela tu primer sorteo',
    image: '/pixel-pig-achievement.png',
  },
  'five-unlocked': {
    id: 'five-unlocked',
    title: '¡El quinto!',
    description: 'Desvela tu quinto sorteo',
    image: '/pixel-five-achievement.png',
  },
  'all-unlocked': {
    id: 'all-unlocked',
    title: 'El ansía viva',
    description: '¡Desvela todos los sorteos!',
    image: '/pixel-gift-achievement.png',
  },
  'clicker-level-1': {
    id: 'clicker-level-1',
    title: 'Púgil Novato',
    description: 'Has completado el primer nivel en Choco Boxer',
    image: '/pixel-glove.png',
  },
  'clicker-level-5': {
    id: 'clicker-level-5',
    title: 'Púgil Experto',
    description: 'Has llegado al nivel 5 en Choco Boxer',
    image: '/pixel-glove-elite.png',
  },
}
