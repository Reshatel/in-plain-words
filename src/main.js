import '@fontsource/literata/600.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/caveat/600.css'
import 'lenis/dist/lenis.css'
import './styles/tokens.css'
import './styles/base.css'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { Flip } from 'gsap/Flip'
import { TextPlugin } from 'gsap/TextPlugin'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import Lenis from 'lenis'

import { motion } from './config.js'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip, TextPlugin, Draggable, InertiaPlugin)

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const startSmoothScroll = () => {
  if (prefersReducedMotion) return

  const lenis = new Lenis()
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

const revealHeroTitle = () => {
  if (!document.querySelector('.hero__title')) return

  SplitText.create('.hero__title', {
    type: 'words',
    mask: 'words',
    onSplit: (self) =>
      gsap.from(self.words, {
        yPercent: 100,
        duration: motion.duration,
        ease: motion.ease,
        stagger: motion.stagger
      })
  })
}

startSmoothScroll()
document.fonts.ready.then(revealHeroTitle)
