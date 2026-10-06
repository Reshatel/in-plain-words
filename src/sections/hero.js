import { gsap } from 'gsap'
import { heroParallax, media, motion, photos } from '../config.js'
import { select, selectAll } from '../dom.js'
import { markerSweep } from '../fx/marker.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { paperIn } from '../fx/paper.js'
import { drawScribble } from '../fx/scribble.js'
import { strikeThrough } from '../fx/strike.js'
import { revealWords } from '../fx/words.js'
import '../styles/sections/hero.css'

const restingAngles = [4, -3, 2, -6]

const enableParallax = (desk, layers) => {
  if (prefersReducedMotion) return
  if (!window.matchMedia(media.finePointer).matches) return

  const movers = layers.map((layer) => ({
    depth: Number(layer.dataset.depth),
    moveX: gsap.quickTo(layer, 'x', { duration: heroParallax.duration, ease: 'power3' }),
    moveY: gsap.quickTo(layer, 'y', { duration: heroParallax.duration, ease: 'power3' })
  }))

  desk.closest('.hero').addEventListener('pointermove', (event) => {
    const offsetX = event.clientX / window.innerWidth - 0.5
    const offsetY = event.clientY / window.innerHeight - 0.5
    movers.forEach(({ depth, moveX, moveY }) => {
      moveX(offsetX * heroParallax.range * depth * 2)
      moveY(offsetY * heroParallax.range * depth * 2)
    })
  })
}

export const initHero = (introReady) => {
  const hero = select('.hero')
  if (!hero) return

  const legalese = select('[data-hero-legalese]', hero)
  const title = select('[data-hero-title]', hero)
  const marker = select('[data-hero-marker]', hero)
  const lead = select('[data-hero-lead]', hero)
  const buttons = selectAll('[data-hero-actions] .button', hero)
  const note = select('[data-hero-note]', hero)
  const desk = select('[data-hero-desk]', hero)
  const layers = selectAll('.hero__layer', desk)
  const photo = select('[data-photo="lawyer"]', hero)

  photo.src = photos.lawyer
  photo.srcset = `${photos.lawyerSmall} 420w, ${photos.lawyer} 720w`
  photo.sizes = '(max-width: 899px) 60vw, 360px'

  const intro = gsap
    .timeline({ paused: true, onComplete: () => enableParallax(desk, layers) })
    .add(paperIn(layers, { rest: (index) => restingAngles[index] ?? 0, stagger: 0.14 }), 0)
    .fromTo(legalese, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0)
    .add(strikeThrough(legalese), 0.45)
    .to(legalese, { autoAlpha: 0.35, duration: 0.4 })
    .add(revealWords(title), '-=0.2')
    .add(markerSweep(marker), '-=0.3')
    .fromTo([lead, ...buttons], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: motion.ease, stagger: motion.stagger }, '-=0.4')
    .fromTo(select('.hand', note), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
    .add(drawScribble(selectAll('path', note)), '<')

  document.documentElement.classList.remove('is-booting')
  introReady.then(() => intro.play())
}
