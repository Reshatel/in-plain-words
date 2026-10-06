import { gsap } from 'gsap'
import { motion } from '../config.js'
import { escapeHtml, select, selectAll } from '../dom.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { formatMoney, formatRange, formatTerm } from './pricing.js'

export const receiptMarkup = () => `
  <aside class="receipt" aria-label="Your estimate" data-receipt>
    <button class="receipt__toggle" type="button" aria-expanded="false" data-receipt-toggle>
      <span class="legal">Your estimate</span>
      <strong data-receipt-mini>—</strong>
    </button>
    <div class="receipt__paper" data-receipt-paper data-lenis-prevent>
      <div class="receipt__stub">
        <p class="receipt__brand legal">IN PLAIN WORDS · ESTIMATE No. <span data-receipt-number></span></p>
        <p class="receipt__date legal" data-receipt-date></p>
      </div>
      <div class="receipt__body" data-receipt-body>
        <ul class="receipt__lines legal" data-receipt-lines aria-live="polite"></ul>
        <p class="receipt__empty legal" data-receipt-empty>Choose what happened — the receipt will fill in by itself.</p>
        <div class="receipt__divider" aria-hidden="true"></div>
        <p class="receipt__row receipt__total legal"><span>TOTAL</span><strong data-receipt-total>$0</strong></p>
        <p class="receipt__row legal"><span>Term</span><span data-receipt-term>—</span></p>
        <div class="receipt__barcode" aria-hidden="true"></div>
        <p class="receipt__thanks hand">Thank you!</p>
        <p class="receipt__note legal">Estimate, not an offer</p>
      </div>
    </div>
  </aside>`

const lineMarkup = ({ id, label, amount }) =>
  `<li class="receipt__line" data-line-id="${id}"><span class="receipt__label">${escapeHtml(label)}</span><span class="receipt__dots" aria-hidden="true"></span><span data-line-amount>${formatMoney(amount)}</span></li>`

export const createReceipt = (root, { number, date }) => {
  const lineList = select('[data-receipt-lines]', root)
  const empty = select('[data-receipt-empty]', root)
  const totalOutput = select('[data-receipt-total]', root)
  const miniOutput = select('[data-receipt-mini]', root)
  const termOutput = select('[data-receipt-term]', root)
  const displayed = { low: 0, high: 0 }

  select('[data-receipt-number]', root).textContent = number
  select('[data-receipt-date]', root).textContent = date

  const renderTotal = () => {
    const text = displayed.high ? formatRange([displayed.low, displayed.high]) : '$0'
    totalOutput.textContent = text
    miniOutput.textContent = displayed.high ? text : '—'
  }

  const update = (estimate) => {
    const current = new Map(selectAll('[data-line-id]', lineList).map((line) => [line.dataset.lineId, line]))
    const nextIds = new Set(estimate.lines.map((line) => line.id))

    current.forEach((line, id) => {
      if (nextIds.has(id)) return
      gsap.to(line, { autoAlpha: 0, x: 24, height: 0, duration: 0.3, onComplete: () => line.remove() })
    })

    estimate.lines.forEach((line) => {
      const existing = current.get(line.id)
      if (existing) {
        select('.receipt__label', existing).textContent = line.label
        select('[data-line-amount]', existing).textContent = formatMoney(line.amount)
        lineList.append(existing)
        return
      }
      lineList.insertAdjacentHTML('beforeend', lineMarkup(line))
      const added = lineList.lastElementChild
      if (prefersReducedMotion) return
      gsap.from(added, { autoAlpha: 0, x: -28, duration: 0.45, ease: motion.ease })
    })

    empty.hidden = estimate.lines.length > 0
    termOutput.textContent = estimate.days ? `≈ ${formatTerm(estimate.days)}` : '—'

    const [low, high] = estimate.range
    if (prefersReducedMotion) {
      Object.assign(displayed, { low, high })
      renderTotal()
      return
    }
    gsap.to(displayed, { low, high, duration: 0.6, ease: 'power2.out', snap: { low: 1, high: 1 }, onUpdate: renderTotal, overwrite: true })
  }

  return { update }
}
