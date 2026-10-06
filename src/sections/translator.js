import { gsap } from 'gsap'
import { media, motion } from '../config.js'
import { legalTerms } from '../data/terms.js'
import { escapeHtml, padNumber, select, selectAll } from '../dom.js'
import { markerErase, markerSweep } from '../fx/marker.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { revealTimeline } from '../fx/reveal.js'
import '../styles/sections/translator.css'

const termCardMarkup = ({ term, plain, example }, index) => `
  <li class="term-card" data-term-card>
    <button class="term-card__inner" type="button" aria-pressed="false" data-term-flip>
      <span class="term-card__face term-card__face--front sheet">
        <span class="term-card__label legal">Term No. ${padNumber(index + 1)}</span>
        <span class="term-card__term">${escapeHtml(term)}</span>
        <span class="term-card__hint hand">tap to translate</span>
      </span>
      <span class="term-card__face term-card__face--back sheet">
        <span class="term-card__label legal">In plain words</span>
        <span class="term-card__plain"><span class="marker" data-term-marker>${escapeHtml(plain)}</span></span>
        <span class="term-card__example">${escapeHtml(example)}</span>
      </span>
    </button>
  </li>`

const equalizeCardHeights = (grid) => {
  grid.style.setProperty('--term-height', '0px')
  const tallest = Math.max(...selectAll('.term-card__face', grid).map((face) => face.scrollHeight))
  grid.style.setProperty('--term-height', `${tallest}px`)
}

const fanIn = (cards) => {
  if (prefersReducedMotion) return gsap.fromTo(cards, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.fadeDuration, stagger: motion.stagger })

  const middle = (cards.length - 1) / 2
  return gsap.fromTo(
    cards,
    { autoAlpha: 0, y: 80, x: (index) => (middle - index) * 60, rotation: (index) => (index - middle) * 7 },
    { autoAlpha: 1, y: 0, x: 0, rotation: (index) => (index % 2 ? 1 : -1), duration: motion.duration, ease: motion.paperEase, stagger: motion.stagger }
  )
}

export const initTranslator = () => {
  const grid = select('[data-term-grid]')
  if (!grid) return

  grid.innerHTML = legalTerms.map(termCardMarkup).join('')

  const cards = selectAll('[data-term-card]', grid)
  const translateAll = select('[data-translate-all]')
  let pendingResize = null

  equalizeCardHeights(grid)
  window.addEventListener('resize', () => {
    pendingResize?.kill()
    pendingResize = gsap.delayedCall(0.2, equalizeCardHeights, [grid])
  })
  const flipDuration = prefersReducedMotion ? 0 : motion.flipDuration

  selectAll('[data-term-marker]', grid).forEach((marker) => gsap.set(marker, { backgroundSize: '0% 100%' }))

  const setFlipped = (card, flipped, delay = 0) => {
    const inner = select('[data-term-flip]', card)
    const marker = select('[data-term-marker]', card)
    inner.setAttribute('aria-pressed', String(flipped))
    card.classList.toggle('is-flipped', flipped)

    if (!flipped) {
      markerErase(marker)
      return gsap.to(inner, { rotationY: 0, duration: flipDuration, ease: 'power2.inOut', delay })
    }

    return gsap
      .timeline({ delay })
      .to(inner, { rotationY: 180, duration: flipDuration, ease: 'power2.inOut' })
      .add(markerSweep(marker), '-=0.15')
  }

  const syncTranslateAllLabel = () => {
    const everyFlipped = cards.every((card) => card.classList.contains('is-flipped'))
    translateAll.textContent = everyFlipped ? 'Back to legalese' : 'Translate all'
  }

  grid.addEventListener('click', (event) => {
    const card = event.target.closest('[data-term-card]')
    if (!card) return
    setFlipped(card, !card.classList.contains('is-flipped'))
    syncTranslateAllLabel()
  })

  translateAll.addEventListener('click', () => {
    const flipToPlain = !cards.every((card) => card.classList.contains('is-flipped'))
    cards.forEach((card, index) => setFlipped(card, flipToPlain, index * motion.stagger))
    syncTranslateAllLabel()
  })

  if (window.matchMedia(media.finePointer).matches && !prefersReducedMotion) {
    cards.forEach((card) => {
      card.addEventListener('pointerenter', () => gsap.to(card, { y: -10, duration: 0.3, ease: 'power2.out' }))
      card.addEventListener('pointerleave', () => gsap.to(card, { y: 0, duration: 0.4, ease: motion.paperEase }))
    })
  }

  revealTimeline(grid).add(fanIn(cards))
}
