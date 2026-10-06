import { gsap } from 'gsap'
import { preloaderTiming } from '../config.js'
import { select } from '../dom.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { stampDown } from '../fx/stamp.js'
import { typeText } from '../fx/words.js'
import { pauseScroll, resumeScroll } from '../scroll.js'
import '../styles/sections/preloader.css'

export const runPreloader = () =>
  new Promise((resolve) => {
    const preloader = select('[data-preloader]')
    if (!preloader) {
      resolve()
      return
    }

    if (prefersReducedMotion) {
      preloader.remove()
      resolve()
      return
    }

    pauseScroll()

    const sheet = select('[data-preloader-sheet]', preloader)
    const line = select('[data-preloader-text]', preloader)
    const stamp = select('[data-preloader-stamp]', preloader)
    const caption = line.textContent

    gsap
      .timeline({
        onComplete: () => {
          preloader.remove()
          resumeScroll()
        }
      })
      .fromTo(sheet, { y: 40, rotation: -4, autoAlpha: 0 }, { y: 0, rotation: -1, autoAlpha: 1, duration: 0.25, ease: 'power2.out' })
      .add(typeText(line, caption, { duration: preloaderTiming.typing }), 0.1)
      .add(stampDown(stamp))
      .call(resolve, null, `+=${preloaderTiming.hold}`)
      .to(sheet, { yPercent: -160, rotation: -6, duration: preloaderTiming.exit, ease: 'power3.in' })
      .to(preloader, { autoAlpha: 0, duration: preloaderTiming.exit * 0.6 }, '<0.2')
  })
