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
  const stickers = steps.map((step, index) =>
    gsap.fromTo(
      step,
      { autoAlpha: 0, y: 24, scale: 0.96, rotation: restingTilt(index) },
      { autoAlpha: 1, y: 0, scale: 1, rotation: restingTilt(index), duration: 0.8, ease: 'power2.out', paused: true, immediateRender: true }
    )
  )
  const arrivals = steps.map((_, index) => (index / Math.max(steps.length - 1, 1)) * 0.9)

  gsap.fromTo(
    reveal,
    { drawSVG: '0%' },
    {
      drawSVG: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: track,
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 1,
        onUpdate: (self) => {
          arrivals.forEach((arrival, index) => {
            const sticker = stickers[index]
            const arrived = self.progress >= arrival
            if (arrived === !sticker.reversed() && sticker.progress() > 0) return
            arrived ? sticker.play() : sticker.reverse()
          })
        }
      }
    }
  )
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
