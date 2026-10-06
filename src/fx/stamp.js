import { gsap } from 'gsap'
import { motion } from '../config.js'
import { prefersReducedMotion } from './motion-mode.js'

export const stampDown = (stamp, vars = {}) => {
  if (prefersReducedMotion) {
    return gsap.fromTo(stamp, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.fadeDuration, immediateRender: true, ...vars })
  }

  return gsap.fromTo(
    stamp,
    { autoAlpha: 0, scale: 1.6, rotation: -14 },
    { autoAlpha: 1, scale: 1, rotation: -8, duration: motion.stampDuration, ease: motion.stampEase, immediateRender: true, ...vars }
  )
}
