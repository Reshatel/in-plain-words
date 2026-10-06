import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { motion } from '../config.js'
import { closedCases } from '../data/cases.js'
import { practiceLabel, practices } from '../data/practices.js'
import { escapeHtml, select, selectAll } from '../dom.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { paperIn } from '../fx/paper.js'
import { revealTimeline } from '../fx/reveal.js'
import { stampDown } from '../fx/stamp.js'
import { pauseScroll, resumeScroll } from '../scroll.js'
import '../styles/sections/cases.css'

const filterMarkup = ({ id, label }, index) =>
  `<button class="cases__filter" type="button" aria-pressed="${index === 0}" data-case-filter="${id}">${escapeHtml(label)}</button>`

const caseFolderMarkup = (entry) => `
  <li class="case-folder" data-case-folder data-practice="${entry.practiceId}">
    <button class="case-folder__open" type="button" aria-haspopup="dialog" data-case-open="${entry.id}">
      <span class="case-folder__tab legal">No. ${entry.number}</span>
      <span class="case-folder__sheet sheet" data-flip-id="${entry.id}" data-case-preview></span>
      <span class="case-folder__cover" data-case-cover>
        <span class="case-folder__practice legal">${escapeHtml(practiceLabel(entry.practiceId))}</span>
        <span class="case-folder__situation">${escapeHtml(entry.situation)}</span>
        <span class="case-folder__result">${escapeHtml(entry.result)}</span>
        <span class="case-folder__more legal">Open the file →</span>
      </span>
      <span class="stamp case-folder__stamp" data-case-stamp>${escapeHtml(entry.stamp)}</span>
    </button>
  </li>`

const caseStoryMarkup = (entry) => `
  <p class="case-modal__number legal">Case No. ${entry.number} · ${escapeHtml(practiceLabel(entry.practiceId))}</p>
  <h3 class="case-modal__title" id="case-modal-title">${escapeHtml(entry.result)}</h3>
  <dl class="case-modal__story">
    <div class="case-modal__part"><dt class="legal">The situation</dt><dd>${escapeHtml(entry.story.situation)}</dd></div>
    <div class="case-modal__part"><dt class="legal">What we did</dt><dd>${escapeHtml(entry.story.action)}</dd></div>
    <div class="case-modal__part"><dt class="legal">The result</dt><dd>${escapeHtml(entry.story.outcome)}</dd></div>
  </dl>
  <span class="stamp case-modal__stamp">${escapeHtml(entry.stamp)}</span>`

const initCaseModal = (grid) => {
  const modal = select('[data-case-modal]')
  if (!modal) return

  const sheet = select('[data-case-sheet]', modal)
  const content = select('[data-case-content]', modal)
  const backdrop = select('.case-modal__backdrop', modal)
  let returnFocus = null

  const closeCase = () => {
    if (modal.hidden) return
    gsap
      .timeline({
        onComplete: () => {
          modal.hidden = true
          gsap.set([sheet, backdrop], { clearProps: 'all' })
          resumeScroll()
          returnFocus?.focus()
        }
      })
      .to(sheet, { y: 60, rotation: 2, autoAlpha: 0, duration: 0.35, ease: 'power2.in' })
      .to(backdrop, { autoAlpha: 0, duration: 0.25 }, '<0.1')
  }

  const openCase = (trigger) => {
    const entry = closedCases.find((item) => item.id === trigger.dataset.caseOpen)
    if (!entry) return

    const preview = select('[data-case-preview]', trigger)
    returnFocus = trigger
    content.innerHTML = caseStoryMarkup(entry)
    sheet.dataset.flipId = entry.id
    pauseScroll()

    const reveal = () => {
      const state = Flip.getState(preview)
      modal.hidden = false
      gsap.set(preview, { clearProps: 'transform' })
      gsap.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
      select('[data-case-close]', sheet).focus({ preventScroll: true })

      if (prefersReducedMotion) {
        gsap.fromTo(sheet, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.fadeDuration })
        return
      }

      Flip.from(state, { targets: sheet, duration: 0.65, ease: 'power3.inOut', scale: true })
      gsap.fromTo(content.children, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06, delay: 0.45 })
      stampDown(select('.case-modal__stamp', content), sheet).delay(0.9)
    }

    if (prefersReducedMotion) {
      reveal()
      return
    }
    gsap.to(preview, { y: -46, duration: 0.3, ease: 'power2.out', onComplete: reveal })
  }

  grid.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-case-open]')
    if (!trigger) return
    openCase(trigger)
  })

  modal.addEventListener('click', (event) => {
    if (!event.target.closest('[data-case-close]')) return
    closeCase()
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    closeCase()
  })
}

export const initCases = () => {
  const grid = select('[data-case-grid]')
  if (!grid) return

  const filterBar = select('[data-case-filters]')
  const practiceIds = new Set(closedCases.map((entry) => entry.practiceId))
  const filters = [{ id: 'all', label: 'All' }, ...practices.filter((practice) => practiceIds.has(practice.id)).map(({ id, tab }) => ({ id, label: tab }))]

  filterBar.innerHTML = filters.map(filterMarkup).join('')
  grid.innerHTML = closedCases.map(caseFolderMarkup).join('')

  const folders = selectAll('[data-case-folder]', grid)
  const filterButtons = selectAll('[data-case-filter]', filterBar)

  const applyFilter = (practiceId) => {
    const state = Flip.getState(folders)
    filterButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.caseFilter === practiceId)))
    folders.forEach((folder) => folder.classList.toggle('is-filtered-out', practiceId !== 'all' && folder.dataset.practice !== practiceId))

    Flip.from(state, {
      duration: prefersReducedMotion ? 0 : 0.6,
      ease: 'power2.inOut',
      absolute: true,
      onEnter: (entering) => gsap.fromTo(entering, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.4 }),
      onLeave: (leaving) => gsap.to(leaving, { autoAlpha: 0, scale: 0.9, duration: 0.3 })
    })
  }

  filterBar.addEventListener('click', (event) => {
    const button = event.target.closest('[data-case-filter]')
    if (!button) return
    applyFilter(button.dataset.caseFilter)
  })

  const stamps = folders.map((folder) => stampDown(select('[data-case-stamp]', folder), select('[data-case-cover]', folder)))
  const timeline = revealTimeline(grid).add(paperIn(folders, { rest: 0 }))
  stamps.forEach((stamp, index) => timeline.add(stamp, `-=${index === 0 ? 0.2 : 0.6 - motion.stampStagger}`))

  initCaseModal(grid)
}
