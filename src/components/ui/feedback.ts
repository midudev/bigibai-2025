export function showNotice(
  element: HTMLElement,
  text: string,
  variant: 'success' | 'error' | 'info' | 'warning' = 'info'
) {
  element.textContent = text
  element.classList.remove(
    'hidden',
    'invisible',
    'opacity-0',
    'translate-y-3',
    'scale-90',
    'ui-notice--success',
    'ui-notice--error',
    'ui-notice--info',
    'ui-notice--warning'
  )
  element.classList.add('ui-notice', `ui-notice--${variant}`)
}
