import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { prefersReducedMotion } from './fx/motion-mode.js'

let lenis = null

const headerOffset = () => -(document.querySelector('[data-header]')?.offsetHeight ?? 0)

const isReload = () => performance.getEntriesByType('navigation')[0]?.type === 'reload'

export const resetToTop = () => {
  const entryHash = location.hash && !isReload() ? location.hash : null
  history.scrollRestoration = 'manual'
  if (location.hash) history.replaceState(null, '', location.pathname + location.search)
  window.scrollTo(0, 0)
  return entryHash
}

export const startSmoothScroll = () => {
  if (prefersReducedMotion) return

  lenis = new Lenis()
  lenis.scrollTo(0, { immediate: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

export const scrollToTarget = (target, { onComplete } = {}) => {
  const element = typeof target === 'string' ? document.querySelector(target) : target
  if (!element && target !== 0) return

  if (!lenis) {
    const top = target === 0 ? 0 : element.getBoundingClientRect().top + window.scrollY + headerOffset()
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    onComplete?.()
    return
  }

  lenis.resize()
  lenis.scrollTo(target === 0 ? 0 : element, { duration: 1.2, onComplete })
}

export const pauseScroll = () => {
  lenis?.stop()
  document.documentElement.classList.add('is-scroll-locked')
}

export const resumeScroll = () => {
  lenis?.start()
  document.documentElement.classList.remove('is-scroll-locked')
}

export const bindAnchorLinks = () => {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]')
    if (!link) return

    const hash = link.getAttribute('href')
    if (hash === '#') return
    if (!document.querySelector(hash)) return

    event.preventDefault()
    scrollToTarget(hash)
  })
}
