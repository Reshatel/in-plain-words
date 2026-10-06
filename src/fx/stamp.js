import { gsap } from 'gsap'
import { motion } from '../config.js'
import { prefersReducedMotion } from './motion-mode.js'
import { shakeSheet } from './paper.js'

export const stampDown = (stamp, sheet = stamp.parentElement) => {
  if (prefersReducedMotion) {
    return gsap.fromTo(stamp, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.fadeDuration })
  }

  return gsap
    .timeline()
    .fromTo(
      stamp,
      { autoAlpha: 0, scale: 2.4, rotation: -18 },
      { autoAlpha: 1, scale: 1, rotation: -8, duration: motion.stampDuration, ease: motion.stampEase }
    )
    .add(shakeSheet(sheet))
}
