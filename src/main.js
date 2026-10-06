import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/700.css'
import '@fontsource/plus-jakarta-sans/800.css'
import '@fontsource/jetbrains-mono/400.css'
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

import { bindAnchorLinks, resetToTop, scrollToTarget, startSmoothScroll } from './scroll.js'
import { initSectionTitles } from './sections/section-titles.js'
import { runPreloader } from './sections/preloader.js'
import { initHeader } from './sections/header.js'
import { initHero } from './sections/hero.js'
import { initTranslator } from './sections/translator.js'
import { initNumbers } from './sections/numbers.js'
import { initServices } from './sections/services.js'
import { initProcess } from './sections/process.js'
import { initCases } from './sections/cases.js'
import { initDossier } from './sections/dossier.js'
import { initCalculator } from './calculator/calculator.js'
import { initReviews } from './sections/reviews.js'
import { initFaq } from './sections/faq.js'
import { initApplication } from './sections/application.js'
import { initFooter } from './sections/footer.js'
import { initNotFound, initPrivacy, initThanks } from './pages/subpages.js'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip, TextPlugin, Draggable, InertiaPlugin)

const entryHash = resetToTop()

const bootLanding = () => {
  resetToTop()
  startSmoothScroll()
  bindAnchorLinks()
  initHeader()
  const introReady = runPreloader()
  initHero(introReady)
  initSectionTitles()
  initTranslator()
  initNumbers()
  initServices()
  initProcess()
  initCases()
  initDossier()
  initCalculator()
  initReviews()
  initFaq()
  initApplication()
  initFooter()
  initThanks()
  initNotFound()
  initPrivacy()
  if (!entryHash) return
  introReady.then(() => scrollToTarget(entryHash))
}


document.fonts.ready.then(bootLanding)
window.addEventListener('load', () => ScrollTrigger.refresh())
