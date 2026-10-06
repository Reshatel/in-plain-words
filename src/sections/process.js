import { gsap } from 'gsap'
import { media, motion } from '../config.js'
import { processSteps } from '../data/process.js'
import { escapeHtml, padNumber, select, selectAll } from '../dom.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { revealTimeline } from '../fx/reveal.js'
import '../styles/sections/process.css'

const stepMarkup = ({ title, text }, index) => `
  <li class="process__step sticker" data-process-step>
    <span class="process__number legal">Step ${padNumber(index + 1)}</span>
    <h3 class="process__title">${escapeHtml(title)}</h3>
    <p class="process__text">${escapeHtml(text)}</p>
  </li>`

const restingTilt = (index) => [-2, 1.5, -1, 2.5][index % 4]

const buildScrubbedPath = (track, reveal, steps) => {
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: track, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 }
  })

  timeline.fromTo(reveal, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, ease: 'none' }, 0)
  steps.forEach((step, index) => {
    const arrival = (index / Math.max(steps.length - 1, 1)) * 0.92
    timeline.fromTo(
      step,
      { autoAlpha: 0, scale: 1.2, rotation: restingTilt(index) * 5, y: -20 },
      { autoAlpha: 1, scale: 1, rotation: restingTilt(index), y: 0, duration: 0.08, ease: motion.paperEase },
      arrival
    )
  })

  return timeline
}

export const initProcess = () => {
  const track = select('[data-process]')
  if (!track) return

  const list = select('[data-process-steps]', track)
  list.innerHTML = processSteps.map(stepMarkup).join('')
  const steps = selectAll('[data-process-step]', list)
  const [wideReveal, tallReveal] = selectAll('[data-process-reveal]', track)

  if (prefersReducedMotion) {
    gsap.set(steps, { rotation: restingTilt })
    revealTimeline(track).fromTo(steps, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.fadeDuration, stagger: motion.stagger })
    return
  }

  const layouts = gsap.matchMedia()
  layouts.add(media.desktop, () => {
    buildScrubbedPath(track, wideReveal, steps)
  })
  layouts.add(media.mobile, () => {
    buildScrubbedPath(track, tallReveal, steps)
  })
}
