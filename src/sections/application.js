import { gsap } from 'gsap'
import { motion, storageKeys } from '../config.js'
import { consultationTopics, meetingFormats } from '../data/application.js'
import { escapeHtml, select, selectAll } from '../dom.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { paperIn } from '../fx/paper.js'
import { revealTimeline } from '../fx/reveal.js'
import { stampDown } from '../fx/stamp.js'
import { readLocal, writeLocal } from '../storage.js'
import '../styles/sections/application.css'

const todayIso = () => new Date().toISOString().slice(0, 10)

const fieldValidators = {
  name: (value) => (value.trim().length >= 2 ? '' : 'Please tell me your name'),
  phone: (value) => (value.replace(/\D/g, '').length >= 7 ? '' : 'I need a number I can call back'),
  email: (value) => (!value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'This email looks off'),
  topic: (value) => (value ? '' : 'Pick the closest topic'),
  consent: (value, field) => (field.checked ? '' : 'I need your consent to reply')
}

const formMarkup = () => `
  <form class="request sheet" novalidate data-request-form>
    <header class="request__head">
      <p class="legal">Form No. 1 · Consultation request</p>
      <span class="stamp request__stamp" data-request-stamp>Received</span>
    </header>
    <div class="request__grid">
      <div class="field" data-field="name">
        <label class="field__label legal" for="request-name">Your name</label>
        <input class="field__input" id="request-name" name="name" type="text" autocomplete="name" required />
        <p class="field__error hand" data-field-error></p>
      </div>
      <div class="field" data-field="phone">
        <label class="field__label legal" for="request-phone">Phone</label>
        <input class="field__input" id="request-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required />
        <p class="field__error hand" data-field-error></p>
      </div>
      <div class="field" data-field="email">
        <label class="field__label legal" for="request-email">Email <span class="field__optional">optional</span></label>
        <input class="field__input" id="request-email" name="email" type="email" autocomplete="email" />
        <p class="field__error hand" data-field-error></p>
      </div>
      <div class="field" data-field="topic">
        <label class="field__label legal" for="request-topic">Topic</label>
        <select class="field__input" id="request-topic" name="topic" required>
          <option value="">Choose…</option>
          ${consultationTopics.map((topic) => `<option>${escapeHtml(topic)}</option>`).join('')}
        </select>
        <p class="field__error hand" data-field-error></p>
      </div>
      <div class="field" data-field="date">
        <label class="field__label legal" for="request-date">Preferred date <span class="field__optional">optional</span></label>
        <input class="field__input" id="request-date" name="date" type="date" min="${todayIso()}" />
      </div>
      <fieldset class="field field--format">
        <legend class="field__label legal">Format</legend>
        <div class="request__formats">
          ${meetingFormats
            .map(
              (format, index) => `
            <label class="request__format">
              <input type="radio" name="format" value="${format.id}" ${index === 0 ? 'checked' : ''} />
              <span>${escapeHtml(format.label)}</span>
            </label>`
            )
            .join('')}
        </div>
      </fieldset>
      <div class="field field--wide" data-field="situation">
        <label class="field__label legal" for="request-situation">What happened? <span class="field__optional">in your own words</span></label>
        <textarea class="field__input" id="request-situation" name="situation" rows="3"></textarea>
      </div>
    </div>
    <div class="request__attachment" data-request-attachment hidden></div>
    <div class="field field--consent" data-field="consent">
      <label class="request__consent">
        <input type="checkbox" name="consent" required />
        <span>I agree that my data will be used to reply to this request. <a href="/privacy.html" class="marker-link">Privacy, in plain words</a></span>
      </label>
      <p class="field__error hand" data-field-error></p>
    </div>
    <button class="button request__submit" type="submit">Send request</button>
  </form>`

const attachmentMarkup = ({ number, situation, range, term }) => `
  <div class="request__receipt legal" data-request-receipt>
    <p>Attached: estimate No. ${escapeHtml(number)}</p>
    <p class="request__receipt-main">${escapeHtml(situation)} · <strong>${escapeHtml(range)}</strong></p>
    <p>${escapeHtml(term)}</p>
    <button class="request__detach" type="button" data-request-detach>Detach</button>
  </div>`

export const initApplication = () => {
  const root = select('[data-application]')
  if (!root) return

  root.innerHTML = formMarkup()

  const form = select('[data-request-form]', root)
  const attachment = select('[data-request-attachment]', form)
  let attachedEstimate = readLocal(storageKeys.estimate)

  const renderAttachment = (animate) => {
    attachment.hidden = !attachedEstimate
    if (!attachedEstimate) return
    attachment.innerHTML = attachmentMarkup(attachedEstimate)
    if (!animate) return
    paperIn(select('[data-request-receipt]', attachment), { rest: -2, delay: 0.9 })
  }

  const showError = (field, message) => {
    const error = select('[data-field-error]', field)
    field.classList.toggle('is-invalid', Boolean(message))
    error.textContent = message
    if (!message) return
    if (prefersReducedMotion) return
    gsap.fromTo(error, { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.3 })
  }

  const validateField = (name) => {
    const field = select(`[data-field="${name}"]`, form)
    const input = form.elements[name]
    const message = fieldValidators[name](input.value, input)
    showError(field, message)
    return !message
  }

  form.addEventListener('focusout', (event) => {
    const { name } = event.target
    if (!fieldValidators[name] || !event.target.value) return
    validateField(name)
  })

  form.addEventListener('input', (event) => {
    const field = event.target.closest('[data-field]')
    if (!field?.classList.contains('is-invalid')) return
    validateField(event.target.name)
  })

  attachment.addEventListener('click', (event) => {
    if (!event.target.closest('[data-request-detach]')) return
    attachedEstimate = null
    writeLocal(storageKeys.estimate, null)
    renderAttachment(false)
  })

  document.addEventListener('estimate:attached', (event) => {
    attachedEstimate = event.detail
    renderAttachment(true)
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const invalid = Object.keys(fieldValidators).filter((name) => !validateField(name))
    if (invalid.length) {
      form.elements[invalid[0]].focus()
      return
    }

    const formatId = form.elements.format.value
    writeLocal(storageKeys.application, {
      name: form.elements.name.value.trim(),
      topic: form.elements.topic.value,
      date: form.elements.date.value,
      format: meetingFormats.find((format) => format.id === formatId)?.label ?? '',
      estimate: attachedEstimate,
      sentAt: new Date().toISOString()
    })

    select('.request__submit', form).disabled = true
    gsap
      .timeline({ onComplete: () => window.location.assign('/thanks.html') })
      .add(stampDown(select('[data-request-stamp]', form)))
      .to(form, prefersReducedMotion ? { autoAlpha: 0, duration: 0.3 } : { y: -120, rotation: -3, autoAlpha: 0, duration: 0.6, ease: 'power3.in' }, '+=0.35')
  })

  renderAttachment(false)
  gsap.set(select('[data-request-stamp]', form), { autoAlpha: 0 })
  revealTimeline(root).add(paperIn(form, { rest: 0.5, duration: motion.duration }))
}
