import { gsap } from 'gsap'
import { motion } from '../config.js'

export const revealTimeline = (trigger, vars = {}) =>
  gsap.timeline({ scrollTrigger: { trigger, start: motion.revealStart, once: true }, ...vars })
