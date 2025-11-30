export interface Achievement {
  id: string
  title: string
  descriptionDo: string
  descriptionDone: string
  image: string
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  'calendar-redeemed': {
    id: 'calendar-redeemed',
    title: '¡Tu primer calendario!',
    descriptionDo: 'Canjea tu primer calendario de adviento.',
    descriptionDone: '¡Has canjeado tu primer calendario de adviento!',
    image: '/pixel-lock-achievement.png',
  },
  'calendar-two': {
    id: 'calendar-two',
    title: 'El doble de oportunidades',
    descriptionDo: 'Canjea 2 calendarios de adviento.',
    descriptionDone: '¡Has canjeado 2 calendarios de adviento!',
    image: '/pixel-victory-achievement.png',
  },
  'calendar-lover': {
    id: 'calendar-lover',
    title: 'Chocolate Lover',
    descriptionDo: 'Canjea 5 calendarios de adviento.',
    descriptionDone: '¡Has canjeado 5 calendarios de adviento!',
    image: '/pixel-heart-achievement.png',
  },
  'first-unlocked': {
    id: 'first-unlocked',
    title: '¿Qué es? ¿Qué es?',
    descriptionDo: 'Desvela el primer sorteo',
    descriptionDone: '¡Has desvelado tu primer sorteo!',
    image: '/pixel-pig-achievement.png',
  },
  'five-unlocked': {
    id: 'five-unlocked',
    title: '¡El quinto!',
    descriptionDo: 'Desvela cinco sorteos',
    descriptionDone: '¡Has desvelado cinco sorteos!',
    image: '/pixel-five-achievement.png',
  },
  'all-unlocked': {
    id: 'all-unlocked',
    title: 'El ansia viva',
    descriptionDo: 'Desvela todos los sorteos',
    descriptionDone: '¡Has desvelado todos los sorteos!',
    image: '/pixel-gift-achievement.png',
  },
  'a-todo-gas': {
    id: 'a-todo-gas',
    title: 'A todo gas',
    descriptionDo: 'Completa el juego del coche',
    descriptionDone: '¡Has completado el juego del coche!',
    image: '/pixel-car-achievement.png',
  },
  'clicker-level-1': {
    id: 'clicker-level-1',
    title: 'Púgil Novato',
    descriptionDo: 'Completa el primer nivel en Choco Boxer',
    descriptionDone: '¡Has completado el primer nivel en Choco Boxer!',
    image: '/pixel-glove.png',
  },
  'clicker-level-5': {
    id: 'clicker-level-5',
    title: 'Púgil Experto',
    descriptionDo: 'Llega al nivel 5 en Choco Boxer',
    descriptionDone: '¡Has llegado al nivel 5 en Choco Boxer!',
    image: '/pixel-glove-elite.png',
  },
}
