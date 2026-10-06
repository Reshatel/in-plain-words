import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { motion } from '../config.js'
import { prefersReducedMotion } from './motion-mode.js'

export const revealWords = (element, vars = {}) => {
  if (prefersReducedMotion) {
    return gsap.fromTo(element, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.fadeDuration, ...vars })
  }

  const split = SplitText.create(element, { type: 'words', mask: 'words', wordsClass: 'word' })
  return gsap.from(split.words, { yPercent: 100, duration: motion.duration, ease: motion.ease, stagger: motion.stagger, ...vars })
}

export const typeText = (element, text, vars = {}) => {
  if (prefersReducedMotion) {
    element.textContent = text
    return gsap.fromTo(element, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.fadeDuration, ...vars })
  }

  return gsap.fromTo(element, { text: '' }, { text, duration: text.length * motion.typingSpeed, ease: 'none', ...vars })
}

export const countUp = (element, value, vars = {}) => {
  const counter = { value: 0 }
  const render = () => {
    element.textContent = Math.round(counter.value).toLocaleString('en-US')
  }

  if (prefersReducedMotion) {
    counter.value = value
    render()
    return gsap.timeline()
  }

  render()
  return gsap.to(counter, { value, duration: 1.4, ease: 'power2.out', onUpdate: render, ...vars })
}
