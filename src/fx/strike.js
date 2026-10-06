import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { motion } from '../config.js'
import { prefersReducedMotion } from './motion-mode.js'

const svgNamespace = 'http://www.w3.org/2000/svg'

const createStrikeLine = (width) => {
  const svg = document.createElementNS(svgNamespace, 'svg')
  const path = document.createElementNS(svgNamespace, 'path')
  const drift = Math.random() * 3

  svg.setAttribute('viewBox', `0 0 ${width} 12`)
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.setAttribute('aria-hidden', 'true')
  svg.classList.add('strike__line')
  path.setAttribute('d', `M2 ${7 + drift} C ${width * 0.3} ${4 - drift}, ${width * 0.6} ${9 + drift}, ${width - 2} ${5 - drift}`)
  svg.append(path)

  return { svg, path }
}

export const strikeThrough = (element) => {
  const split = SplitText.create(element, { type: 'lines', linesClass: 'strike__row' })
  const paths = split.lines.map((line) => {
    const { svg, path } = createStrikeLine(Math.max(line.offsetWidth, 20))
    line.append(svg)
    return path
  })

  if (prefersReducedMotion) {
    return gsap.fromTo(paths, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.fadeDuration })
  }

  return gsap.fromTo(
    paths,
    { drawSVG: '0%' },
    { drawSVG: '100%', duration: motion.strikeDuration, ease: 'power2.inOut', stagger: motion.strikeDuration * 0.6 }
  )
}
