import { gsap } from 'gsap'
import { motion } from '../config.js'
import { officeStats } from '../data/stats.js'
import { escapeHtml, select, selectAll } from '../dom.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { revealTimeline } from '../fx/reveal.js'
import { drawScribble } from '../fx/scribble.js'
import { scribbleArrow } from '../fx/svg.js'
import { countUp } from '../fx/words.js'
import '../styles/sections/numbers.css'

const statMarkup = ({ value, unit, label, note }) => `
  <li class="stat">
    <div class="stat__sticker sticker" data-stat-sticker>
      <p class="stat__value"><span data-stat-count="${value}">${value}</span> <span class="stat__unit">${escapeHtml(unit)}</span></p>
      <p class="stat__label">${escapeHtml(label)}</p>
    </div>
    <p class="stat__note" data-stat-note>
      ${scribbleArrow('stat__arrow')}
      <span class="hand">${escapeHtml(note)}</span>
    </p>
  </li>`

const restingTilt = (index) => [-3, 2, -1.5, 3][index % 4]

export const initNumbers = () => {
  const board = select('[data-numbers]')
  if (!board) return

  board.innerHTML = officeStats.map(statMarkup).join('')

  const stickers = selectAll('[data-stat-sticker]', board)
  const counters = selectAll('[data-stat-count]', board)
  const notes = selectAll('[data-stat-note] .hand', board)
  const arrows = selectAll('[data-stat-note] path', board)

  const stickOn = prefersReducedMotion
    ? gsap.fromTo(stickers, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.fadeDuration, stagger: motion.stagger })
    : gsap.fromTo(
        stickers,
        { autoAlpha: 0, scale: 1.18, y: -30, rotation: (index) => restingTilt(index) * 4 },
        { autoAlpha: 1, scale: 1, y: 0, rotation: restingTilt, duration: 0.6, ease: motion.paperEase, stagger: 0.12 }
      )

  revealTimeline(board)
    .add(stickOn)
    .add(counters.map((counter) => countUp(counter, Number(counter.dataset.statCount))), 0.2)
    .fromTo(notes, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.12 }, 0.6)
    .add(drawScribble(arrows, { stagger: 0.06 }), 0.6)
}
