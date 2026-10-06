import { gsap } from 'gsap'
import { motion } from '../config.js'
import { prefersReducedMotion } from './motion-mode.js'

export const drawScribble = (paths, vars = {}) => {
  if (prefersReducedMotion) {
    return gsap.fromTo(paths, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.fadeDuration, ...vars })
  }

  return gsap.fromTo(
    paths,
    { drawSVG: '0%' },
    { drawSVG: '100%', duration: motion.scribbleDuration, ease: 'power1.inOut', stagger: motion.stagger, ...vars }
  )
}
