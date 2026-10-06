import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { select } from '../dom.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { scrollToTarget } from '../scroll.js'
import '../styles/sections/footer.css'

export const initFooter = () => {
  const footer = select('[data-footer]')
  if (!footer) return

  select('[data-back-to-top]', footer)?.addEventListener('click', () => scrollToTarget(0))

  const word = select('[data-footer-word]', footer)
  const underline = select('[data-footer-underline]', footer)
  if (!word || prefersReducedMotion) return

  const split = SplitText.create(word, { type: 'chars', mask: 'chars' })
  const page = select('#page')

  gsap
    .timeline({
      scrollTrigger: {
        trigger: page ?? footer,
        start: page ? 'bottom bottom' : 'top bottom',
        end: () => `+=${footer.offsetHeight}`,
        scrub: 0.6
      }
    })
    .from(split.chars, { yPercent: 110, stagger: 0.04, ease: 'power2.out' })
    .fromTo(underline, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none' }, '-=0.3')
}
