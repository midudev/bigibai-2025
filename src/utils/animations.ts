// Script for scroll reveal animations and parallax effects
export function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  const elements = document.querySelectorAll('.scroll-reveal')
  elements.forEach(el => observer.observe(el))
}

// Smooth parallax effect on specific elements
export function initParallaxEffect() {
  const parallaxElements = document.querySelectorAll('[data-parallax]')
  
  if (parallaxElements.length === 0) return
  
  let ticking = false
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset
        
        parallaxElements.forEach((element) => {
          const speed = parseFloat(element.getAttribute('data-parallax') || '0.5')
          const yPos = -(scrolled * speed)
          
          ;(element as HTMLElement).style.transform = `translateY(${yPos}px)`
        })
        
        ticking = false
      })
      
      ticking = true
    }
  })
}

// Add 3D hover effect to specific elements
export function init3DHoverEffect() {
  const hoverElements = document.querySelectorAll('.hover-3d')
  
  hoverElements.forEach(element => {
    element.addEventListener('mousemove', (e: Event) => {
      const mouseEvent = e as MouseEvent
      const rect = (element as HTMLElement).getBoundingClientRect()
      const x = mouseEvent.clientX - rect.left
      const y = mouseEvent.clientY - rect.top
      
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      
      const rotateX = (y - centerY) / 10
      const rotateY = (centerX - x) / 10
      
      ;(element as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
    })
    
    element.addEventListener('mouseleave', () => {
      ;(element as HTMLElement).style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
    })
  })
}

// Initialize all animations when the DOM is ready
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only start if the user does not have reduced mobility preferences.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (!prefersReducedMotion) {
      initScrollAnimations()
      initParallaxEffect()
      init3DHoverEffect()
    }
  })
}
