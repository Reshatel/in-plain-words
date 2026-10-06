import { gsap } from 'gsap'
import { faqEntries } from '../data/faq.js'
import { escapeHtml, padNumber, select, selectAll } from '../dom.js'
import { markerErase, markerSweep } from '../fx/marker.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { paperIn } from '../fx/paper.js'
import { revealTimeline } from '../fx/reveal.js'
import '../styles/sections/faq.css'

const highlightKeyPhrase = (answer, keyPhrase) =>
  escapeHtml(answer).replace(escapeHtml(keyPhrase), `<span class="marker" data-faq-marker>${escapeHtml(keyPhrase)}</span>`)

const entryMarkup = ({ question, answer, keyPhrase }, index) => `
  <div class="faq__item sheet" data-faq-item>
    <h3 class="faq__heading">
      <button class="faq__question" type="button" id="faq-question-${index}" aria-expanded="false" aria-controls="faq-answer-${index}">
        <span class="faq__number legal">${padNumber(index + 1)}</span>
        <span class="faq__text">${escapeHtml(question)}</span>
        <span class="faq__icon" aria-hidden="true"></span>
      </button>
    </h3>
    <div class="faq__answer" id="faq-answer-${index}" role="region" aria-labelledby="faq-question-${index}" hidden data-faq-answer>
      <p>${highlightKeyPhrase(answer, keyPhrase)}</p>
    </div>
  </div>`

const toggleEntry = (item) => {
  const button = select('.faq__question', item)
  const answer = select('[data-faq-answer]', item)
  const marker = select('[data-faq-marker]', item)
  const opening = button.getAttribute('aria-expanded') !== 'true'
  const duration = prefersReducedMotion ? 0 : 0.45

  button.setAttribute('aria-expanded', String(opening))

  if (opening) {
    answer.hidden = false
    gsap.set(marker, { backgroundSize: '0% 100%' })
    gsap
      .timeline()
      .fromTo(answer, { height: 0 }, { height: 'auto', duration, ease: 'power2.out' })
      .add(markerSweep(marker), '-=0.1')
    return
  }

  markerErase(marker)
  gsap.to(answer, { height: 0, duration, ease: 'power2.in', onComplete: () => (answer.hidden = true) })
}

export const initFaq = () => {
  const list = select('[data-faq]')
  if (!list) return

  list.innerHTML = faqEntries.map(entryMarkup).join('')

  list.addEventListener('click', (event) => {
    const button = event.target.closest('.faq__question')
    if (!button) return
    toggleEntry(button.closest('[data-faq-item]'))
  })

  revealTimeline(list).add(paperIn(selectAll('[data-faq-item]', list), { rest: 0 }))
}
