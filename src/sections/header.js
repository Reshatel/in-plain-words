import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { headerScroll } from '../config.js'
import { select, selectAll } from '../dom.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { pauseScroll, resumeScroll } from '../scroll.js'
import '../styles/sections/header.css'

export const initHeader = () => {
  const header = select('[data-header]')
  if (!header) return

  const toggle = select('[data-menu-toggle]', header)
  const menu = select('[data-mobile-menu]', header)
  let menuOpen = false

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const offset = self.scroll()
      header.classList.toggle('is-scrolled', offset > 8)
      if (menuOpen) return
      header.classList.toggle('is-hidden', offset > headerScroll.revealOffset && self.direction === 1)
    }
  })

  if (!toggle || !menu) return

  const menuItems = selectAll('[data-menu-item]', menu)

  const openMenu = () => {
    menuOpen = true
    menu.hidden = false
    toggle.setAttribute('aria-expanded', 'true')
    header.classList.add('is-menu-open')
    pauseScroll()
    if (prefersReducedMotion) return
    gsap
      .timeline()
      .fromTo(menu, { yPercent: -100 }, { yPercent: 0, duration: 0.55, ease: 'power3.out' })
      .fromTo(menuItems, { y: -16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, '-=0.25')
  }

  const closeMenu = () => {
    if (!menuOpen) return
    menuOpen = false
    toggle.setAttribute('aria-expanded', 'false')
    header.classList.remove('is-menu-open')
    resumeScroll()
    if (prefersReducedMotion) {
      menu.hidden = true
      return
    }
    gsap.to(menu, { yPercent: -100, duration: 0.4, ease: 'power3.in', onComplete: () => (menu.hidden = true) })
  }

  toggle.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()))
  menu.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return
    closeMenu()
  })
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    closeMenu()
  })
}
