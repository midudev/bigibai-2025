export interface ShowAchievementOptions {
  title?: string
  description?: string
  icon?: string
}

export function showAchievement(
  notificationId: string = 'achievement-notification',
  options: ShowAchievementOptions = {}
) {
  const notification = document.getElementById(notificationId)
  if (!notification) {
    console.warn(`Achievement notification with id "${notificationId}" not found`)
    return
  }

  // Actualizar contenido si se proporciona
  if (options.title) {
    const titleEl = notification.querySelector('.achievement-title')
    if (titleEl) titleEl.textContent = options.title
  }

  if (options.description) {
    const textEl = notification.querySelector('.achievement-text')
    if (textEl) textEl.textContent = options.description
  }

  if (options.icon) {
    const iconEl = notification.querySelector('.achievement-icon') as HTMLImageElement
    if (iconEl) iconEl.src = options.icon
  }

  // Reproducir sonido
  const audio = new Audio('/achievement-sound.mp3')
  audio.volume = 0.5
  audio.play().catch((e) => console.log('Error playing sound:', e))

  notification.classList.add('show')

  setTimeout(() => {
    notification.classList.add('expanded')
  }, 600)

  setTimeout(() => {
    notification.classList.remove('expanded')
    setTimeout(() => {
      notification.classList.remove('show')
    }, 500)
  }, 8000)
}
