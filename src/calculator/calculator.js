import { gsap } from 'gsap'
import { motion, pricingRules, storageKeys } from '../config.js'
import { calculatorSteps, complexityLevels, extraServices, situations, speedOptions } from '../data/calculator.js'
import { escapeHtml, select, selectAll } from '../dom.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { paperIn } from '../fx/paper.js'
import { revealTimeline } from '../fx/reveal.js'
import { drawScribble } from '../fx/scribble.js'
import { scribbleCheck } from '../fx/svg.js'
import { scrollToTarget } from '../scroll.js'
import { readLocal, writeLocal } from '../storage.js'
import { composeEstimate, emptySelection, formatRange, formatTerm, isSelectionComplete, situationLabel } from './pricing.js'
import { createReceipt, receiptMarkup } from './receipt.js'
import '../styles/sections/calculator.css'

const choiceMarkup = (name, { id, label, hint }, meta = '') => `
  <label class="choice">
    <input class="choice__input" type="radio" name="${name}" value="${id}" />
    <span class="choice__body">
      <span class="choice__label">${escapeHtml(label)}</span>
      <span class="choice__meta legal">${escapeHtml(meta || hint)}</span>
    </span>
  </label>`

const toggleMarkup = (name, value, label, meta) => `
  <label class="toggle">
    <input class="toggle__input" type="checkbox" name="${name}" value="${value}" />
    <span class="toggle__box" aria-hidden="true">${scribbleCheck()}</span>
    <span class="toggle__label">${escapeHtml(label)}</span>
    <span class="toggle__meta legal">${escapeHtml(meta)}</span>
  </label>`

const formMarkup = () => `
  <form class="estimate sheet" novalidate data-estimate-form>
    <ol class="estimate__progress">
      ${calculatorSteps
        .map(
          (title, index) => `
        <li class="estimate__progress-item" data-progress-item>
          <span class="estimate__progress-mark">${index + 1}${scribbleCheck('estimate__progress-check')}</span>
          <span class="estimate__progress-title">${escapeHtml(title)}</span>
        </li>`
        )
        .join('')}
    </ol>

    <fieldset class="estimate__step" data-step>
      <legend class="estimate__title">${calculatorSteps[0]}</legend>
      <div class="choice-grid">
        ${situations.map((situation) => choiceMarkup('situation', situation, `from $${situation.base} · ${formatTerm(situation.days)}`)).join('')}
      </div>
    </fieldset>

    <fieldset class="estimate__step" data-step hidden>
      <legend class="estimate__title">${calculatorSteps[1]}</legend>
      <div class="choice-grid choice-grid--wide">
        ${complexityLevels.map((level) => choiceMarkup('complexity', level, `${level.hint} · ×${level.factor}`)).join('')}
      </div>
    </fieldset>

    <fieldset class="estimate__step" data-step hidden>
      <legend class="estimate__title">${calculatorSteps[2]}</legend>
      <div class="choice-grid choice-grid--wide">
        ${speedOptions.map((speed) => choiceMarkup('speed', speed, `${speed.hint} · price ×${speed.priceFactor}`)).join('')}
      </div>
    </fieldset>

    <fieldset class="estimate__step" data-step hidden>
      <legend class="estimate__title">${calculatorSteps[3]}</legend>
      <div class="estimate__hearings">
        <label class="estimate__hearings-label" for="hearings">Court hearings <span class="legal">$${pricingRules.hearingRate} each</span></label>
        <div class="estimate__range">
          <input type="range" id="hearings" name="hearings" min="0" max="${pricingRules.hearingsMax}" step="1" value="0" />
          <output class="estimate__range-value" for="hearings" data-hearings-output>0</output>
        </div>
      </div>
      <div class="toggle-list">
        ${extraServices.map((extra) => toggleMarkup('extras', extra.id, extra.label, `+$${extra.price}`)).join('')}
        ${toggleMarkup('englishSupport', 'yes', 'English-language support', `×${pricingRules.englishSupportFactor} on base`)}
      </div>
    </fieldset>

    <div class="estimate__nav">
      <button class="button button--ghost" type="button" data-step-back>Back</button>
      <button class="button" type="button" data-step-next>Next</button>
      <button class="button" type="button" data-estimate-send hidden>Send estimate</button>
      <button class="button button--text estimate__reset" type="button" data-estimate-reset>Start over</button>
    </div>
  </form>`

const createEstimateNumber = () => `${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`

const formatReceiptDate = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export const initCalculator = () => {
  const root = select('[data-calculator]')
  if (!root) return

  root.innerHTML = formMarkup() + receiptMarkup()

  const saved = readLocal(storageKeys.calculator)
  const state = {
    selection: { ...emptySelection(), ...saved?.selection },
    step: saved?.step ?? 0,
    number: saved?.number ?? createEstimateNumber()
  }

  const form = select('[data-estimate-form]', root)
  const steps = selectAll('[data-step]', form)
  const progressItems = selectAll('[data-progress-item]', form)
  const backButton = select('[data-step-back]', form)
  const nextButton = select('[data-step-next]', form)
  const sendButton = select('[data-estimate-send]', form)
  const hearingsOutput = select('[data-hearings-output]', form)
  const receiptRoot = select('[data-receipt]', root)
  const receiptToggle = select('[data-receipt-toggle]', receiptRoot)
  const receiptBody = select('[data-receipt-body]', receiptRoot)
  const receipt = createReceipt(receiptRoot, { number: state.number, date: formatReceiptDate() })
  const checkedSteps = new Set()

  const persist = () => writeLocal(storageKeys.calculator, state)

  const syncInputs = () => {
    const { selection } = state
    selectAll('input[name="situation"]', form).forEach((input) => (input.checked = input.value === selection.situationId))
    selectAll('input[name="complexity"]', form).forEach((input) => (input.checked = input.value === selection.complexityId))
    selectAll('input[name="speed"]', form).forEach((input) => (input.checked = input.value === selection.speedId))
    selectAll('input[name="extras"]', form).forEach((input) => (input.checked = selection.extras.includes(input.value)))
    select('input[name="englishSupport"]', form).checked = selection.englishSupport
    form.elements.hearings.value = selection.hearings
    hearingsOutput.textContent = selection.hearings
  }

  const syncProgress = () => {
    progressItems.forEach((item, index) => {
      const done = index < state.step
      item.classList.toggle('is-current', index === state.step)
      item.classList.toggle('is-done', done)
      if (!done || checkedSteps.has(index)) return
      checkedSteps.add(index)
      drawScribble(select('.estimate__progress-check path', item), { duration: 0.4 })
    })
  }

  const syncNavigation = () => {
    const lastStep = state.step === steps.length - 1
    backButton.disabled = state.step === 0
    nextButton.hidden = lastStep
    nextButton.disabled = !isSelectionComplete(state.selection)
    sendButton.hidden = !lastStep
    sendButton.disabled = !isSelectionComplete(state.selection)
  }

  const recalculate = () => {
    receipt.update(composeEstimate(state.selection))
    syncNavigation()
    persist()
  }

  const showStep = (nextStep, direction = 1) => {
    const previous = steps[state.step]
    const next = steps[nextStep]
    state.step = nextStep
    steps.forEach((step) => (step.hidden = step !== next))
    syncProgress()
    syncNavigation()
    persist()
    if (previous === next || prefersReducedMotion) return
    gsap.fromTo(next, { autoAlpha: 0, x: 40 * direction }, { autoAlpha: 1, x: 0, duration: 0.45, ease: motion.ease })
  }

  form.addEventListener('change', (event) => {
    const { name, value, checked } = event.target
    const { selection } = state
    if (name === 'situation') selection.situationId = value
    if (name === 'complexity') selection.complexityId = value
    if (name === 'speed') selection.speedId = value
    if (name === 'englishSupport') selection.englishSupport = checked
    if (name === 'extras') {
      selection.extras = checked ? [...new Set([...selection.extras, value])] : selection.extras.filter((id) => id !== value)
    }
    recalculate()
  })

  form.elements.hearings.addEventListener('input', (event) => {
    state.selection.hearings = Number(event.target.value)
    hearingsOutput.textContent = event.target.value
    recalculate()
  })

  nextButton.addEventListener('click', () => {
    if (!isSelectionComplete(state.selection)) return
    showStep(Math.min(state.step + 1, steps.length - 1))
  })

  backButton.addEventListener('click', () => showStep(Math.max(state.step - 1, 0), -1))

  select('[data-estimate-reset]', form).addEventListener('click', () => {
    state.selection = emptySelection()
    state.number = createEstimateNumber()
    checkedSteps.clear()
    select('[data-receipt-number]', receiptRoot).textContent = state.number
    syncInputs()
    recalculate()
    showStep(0, -1)
  })

  receiptToggle.addEventListener('click', () => {
    const expanded = receiptRoot.classList.toggle('is-expanded')
    receiptToggle.setAttribute('aria-expanded', String(expanded))
  })

  sendButton.addEventListener('click', () => {
    if (!isSelectionComplete(state.selection)) return

    const estimate = composeEstimate(state.selection)
    const summary = {
      number: state.number,
      date: formatReceiptDate(),
      situation: situationLabel(state.selection.situationId),
      range: formatRange(estimate.range),
      term: formatTerm(estimate.days),
      lines: estimate.lines
    }

    writeLocal(storageKeys.estimate, summary)
    document.dispatchEvent(new CustomEvent('estimate:attached', { detail: summary }))

    const receiptVisible = receiptBody.offsetParent !== null
    if (prefersReducedMotion || !receiptVisible) {
      scrollToTarget('#contact')
      return
    }

    gsap
      .timeline()
      .to(receiptBody, { rotation: -4, y: 8, transformOrigin: '0% 0%', duration: 0.18, ease: 'power2.out' })
      .to(receiptBody, { y: 260, x: -120, rotation: -18, autoAlpha: 0, duration: 0.65, ease: 'power2.in' })
      .call(() => scrollToTarget('#contact'))
      .set(receiptBody, { clearProps: 'transform' })
      .to(receiptBody, { autoAlpha: 1, duration: 0.4, delay: 1.2 })
  })

  document.addEventListener('estimate:preselect', (event) => {
    const { situationId } = event.detail
    if (!situations.some((situation) => situation.id === situationId)) return
    state.selection.situationId = situationId
    syncInputs()
    recalculate()
    showStep(1)
  })

  syncInputs()
  steps.forEach((step, index) => (step.hidden = index !== state.step))
  syncProgress()
  recalculate()

  revealTimeline(root).add(paperIn([form, select('[data-receipt-paper]', receiptRoot)], { rest: (index) => (index ? 1.2 : -0.5) }))
}
