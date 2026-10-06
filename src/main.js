import '@fontsource/literata/600.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/caveat/600.css'
import 'lenis/dist/lenis.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { Flip } from 'gsap/Flip'
import { TextPlugin } from 'gsap/TextPlugin'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'

import { bindAnchorLinks, startSmoothScroll } from './scroll.js'
import { initSectionTitles } from './sections/section-titles.js'
import { runPreloader } from './sections/preloader.js'
import { initHeader } from './sections/header.js'
import { initHero } from './sections/hero.js'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip, TextPlugin, Draggable, InertiaPlugin)

const bootLanding = () => {
  startSmoothScroll()
  bindAnchorLinks()
  initHeader()
  initHero(runPreloader())
  initSectionTitles()
}

document.fonts.ready.then(bootLanding)
