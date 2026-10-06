import { gsap } from 'gsap'
import { motion } from '../config.js'
import { prefersReducedMotion } from './motion-mode.js'

const tiltDirection = (index) => (index % 2 ? 1 : -1)

export const restingTilt = (index) => tiltDirection(index) * motion.paperRest

export const paperIn = (targets, { rest = restingTilt, ...vars } = {}) => {
  const sheets = gsap.utils.toArray(targets)

  if (prefersReducedMotion) {
    return gsap.fromTo(sheets, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.fadeDuration, stagger: motion.stagger, ...vars })
  }

  return gsap.fromTo(
    sheets,
    { autoAlpha: 0, y: motion.paperOffset, rotation: (index) => tiltDirection(index) * motion.paperTilt },
    { autoAlpha: 1, y: 0, rotation: rest, duration: motion.duration, ease: motion.paperEase, stagger: motion.stagger, ...vars }
  )
}

export const shakeSheet = (sheet) => {
  if (prefersReducedMotion) return gsap.timeline()

  return gsap.to(sheet, { keyframes: { x: [0, -6, 5, -3, 2, 0], easeEach: 'none' }, duration: 0.35 })
}
