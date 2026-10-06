import { gsap } from 'gsap'
import { storageKeys } from '../config.js'
import { escapeHtml, select, selectAll } from '../dom.js'
import { paperIn } from '../fx/paper.js'
import { stampDown } from '../fx/stamp.js'
import { readLocal } from '../storage.js'
import '../styles/pages.css'

const summaryRows = (application) =>
  [
    ['Name', application.name],
    ['Topic', application.topic],
    ['Format', application.format],
    ['Preferred date', application.date && new Date(application.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })]
  ].filter(([, value]) => value)

export const initThanks = () => {
  const sheet = select('[data-thanks]')
  if (!sheet) return

  const application = readLocal(storageKeys.application)
  const summary = select('[data-thanks-summary]', sheet)
  const estimateBox = select('[data-thanks-estimate]', sheet)

  if (application) {
    select('[data-thanks-title]', sheet).textContent = `Thank you, ${application.name}. Your request is on my desk.`
    summary.hidden = false
    summary.innerHTML = summaryRows(application)
      .map(([label, value]) => `<div class="thanks__row"><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`)
      .join('')
  }

  const estimate = application?.estimate
  if (estimate) {
    estimateBox.hidden = false
    estimateBox.innerHTML = `
      <p class="legal">Attached estimate No. ${escapeHtml(estimate.number)} · ${escapeHtml(estimate.date)}</p>
      <ul class="thanks__lines legal">
        ${estimate.lines.map((line) => `<li><span>${escapeHtml(line.label)}</span><span>$${line.amount.toLocaleString('en-US')}</span></li>`).join('')}
      </ul>
      <p class="thanks__total legal"><span>TOTAL</span><strong>${escapeHtml(estimate.range)}</strong></p>
      <p class="legal">Term: ${escapeHtml(estimate.term)}</p>`
  }

  gsap.timeline({ delay: 0.2 }).add(paperIn(sheet, { rest: -0.5 })).add(stampDown(select('[data-thanks-stamp]', sheet), sheet), '-=0.3')
}

export const initNotFound = () => {
  const sheet = select('[data-not-found]')
  if (!sheet) return

  gsap.timeline({ delay: 0.2 }).add(paperIn(sheet, { rest: 1 })).add(stampDown(select('[data-not-found-stamp]', sheet), sheet), '-=0.3')
}

export const initPrivacy = () => {
  const summary = select('[data-privacy-summary]')
  if (!summary) return

  gsap
    .timeline({ delay: 0.2 })
    .add(paperIn(summary, { rest: -1 }))
    .add(paperIn(select('[data-privacy-full]'), { rest: 0 }), '-=0.6')
    .fromTo(selectAll('li', summary), { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, stagger: 0.08, duration: 0.4 }, '-=0.6')
}
