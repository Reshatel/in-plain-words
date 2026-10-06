import { gsap } from 'gsap'
import { motion } from '../config.js'
import { prefersReducedMotion } from './motion-mode.js'

export const markerSweep = (targets, vars = {}) => {
  if (prefersReducedMotion) return gsap.set(targets, { backgroundSize: '100% 100%' })

  return gsap.fromTo(
    targets,
    { backgroundSize: '0% 100%' },
    { backgroundSize: '100% 100%', duration: motion.markerDuration, ease: 'power2.inOut', stagger: motion.stagger, ...vars }
  )
}

export const markerErase = (targets) => gsap.to(targets, { backgroundSize: '0% 100%', duration: motion.markerDuration / 2, ease: 'power2.in' })
