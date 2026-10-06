import { gsap } from 'gsap'
import { motion } from '../config.js'
import { practices } from '../data/practices.js'
import { escapeHtml, select, selectAll } from '../dom.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { revealTimeline } from '../fx/reveal.js'
import { strikeThrough } from '../fx/strike.js'
import { revealWords } from '../fx/words.js'
import { scrollToTarget } from '../scroll.js'
import '../styles/sections/services.css'

const tabMarkup = (practice, index) => `
  <button class="folder__tab" type="button" role="tab" id="practice-tab-${practice.id}" aria-controls="practice-sheet"
    aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-practice="${practice.id}">${escapeHtml(practice.tab)}</button>`

const sheetMarkup = (practice) => `
  <p class="folder__official legal" data-official>${escapeHtml(practice.official)}</p>
  <h3 class="folder__human" data-human>${escapeHtml(practice.human)}</h3>
  <ul class="folder__list">
    ${practice.services.map((service) => `<li class="folder__item">${escapeHtml(service)}</li>`).join('')}
  </ul>
  <div class="folder__footer">
    <p class="folder__price"><span class="legal">from</span> $${practice.priceFrom}</p>
    <button class="button" type="button" data-estimate="${practice.situationId}">Estimate</button>
  </div>`

const prepareStrike = (sheet) =>
  gsap
    .timeline({ paused: true })
    .add(strikeThrough(select('[data-official]', sheet)))
    .add(revealWords(select('[data-human]', sheet)), '-=0.1')
    .fromTo(selectAll('.folder__item, .folder__footer', sheet), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 }, '-=0.5')

const lockTallestSheet = (sheet) => {
  const probe = sheet.cloneNode(false)
  probe.removeAttribute('id')
  probe.removeAttribute('data-folder-sheet')
  probe.setAttribute('aria-hidden', 'true')
  Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', width: `${sheet.offsetWidth}px`, minHeight: '0', transform: 'none' })
  sheet.parentElement.append(probe)
  const tallest = Math.max(
    ...practices.map((practice) => {
      probe.innerHTML = sheetMarkup(practice)
      return probe.offsetHeight
    })
  )
  probe.remove()
  sheet.style.minHeight = `${tallest}px`
}

export const initServices = () => {
  const folder = select('[data-folder]')
  if (!folder) return

  const tabList = select('[data-folder-tabs]', folder)
  const sheet = select('[data-folder-sheet]', folder)
  let activeId = practices[0].id
  let switching = null

  tabList.innerHTML = practices.map(tabMarkup).join('')
  sheet.id = 'practice-sheet'
  sheet.innerHTML = sheetMarkup(practices[0])
  sheet.setAttribute('aria-labelledby', `practice-tab-${activeId}`)

  const tabs = selectAll('[data-practice]', tabList)

  const showPractice = (practiceId) => {
    if (practiceId === activeId) return
    const practice = practices.find((entry) => entry.id === practiceId)
    if (!practice) return

    activeId = practiceId
    tabs.forEach((tab) => {
      const selected = tab.dataset.practice === practiceId
      tab.setAttribute('aria-selected', String(selected))
      tab.tabIndex = selected ? 0 : -1
    })
    sheet.setAttribute('aria-labelledby', `practice-tab-${practiceId}`)

    let strike = null
    switching?.kill()
    switching = gsap
      .timeline()
      .to(sheet, prefersReducedMotion ? { autoAlpha: 0, duration: 0.2 } : { y: -50, rotation: 2, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
      .call(() => {
        sheet.innerHTML = sheetMarkup(practice)
        strike = prepareStrike(sheet)
      })
      .fromTo(
        sheet,
        prefersReducedMotion ? { autoAlpha: 0 } : { y: -70, rotation: -3, autoAlpha: 0 },
        prefersReducedMotion ? { autoAlpha: 1, duration: 0.3 } : { y: 0, rotation: 0, autoAlpha: 1, duration: 0.6, ease: motion.paperEase }
      )
      .add(() => strike.play(), '-=0.2')
  }

  tabList.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-practice]')
    if (!tab) return
    showPractice(tab.dataset.practice)
  })

  tabList.addEventListener('keydown', (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    if (!step) return
    const currentIndex = tabs.findIndex((tab) => tab.dataset.practice === activeId)
    const nextTab = tabs[(currentIndex + step + tabs.length) % tabs.length]
    nextTab.focus()
    nextTab.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    showPractice(nextTab.dataset.practice)
  })

  sheet.addEventListener('click', (event) => {
    const estimateButton = event.target.closest('[data-estimate]')
    if (!estimateButton) return
    document.dispatchEvent(new CustomEvent('estimate:preselect', { detail: { situationId: estimateButton.dataset.estimate } }))
    scrollToTarget('#pricing')
  })

  const opening = prefersReducedMotion
    ? gsap.fromTo(sheet, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.fadeDuration })
    : gsap.fromTo(sheet, { rotationX: -75, autoAlpha: 0, transformOrigin: '50% 100%' }, { rotationX: 0, autoAlpha: 1, duration: 1, ease: motion.ease })

  lockTallestSheet(sheet)
  let pendingResize = null
  window.addEventListener('resize', () => {
    pendingResize?.kill()
    pendingResize = gsap.delayedCall(0.2, lockTallestSheet, [sheet])
  })
  const firstStrike = prepareStrike(sheet)

  revealTimeline(folder)
    .fromTo(tabs, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 })
    .add(opening, 0.1)
    .add(() => firstStrike.play(), '-=0.3')
}
