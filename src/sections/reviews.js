import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { media, motion, reviewsDesk } from '../config.js'
import { clientNotes } from '../data/reviews.js'
import { escapeHtml, select, selectAll } from '../dom.js'
import { prefersReducedMotion } from '../fx/motion-mode.js'
import { paperIn } from '../fx/paper.js'
import { revealTimeline } from '../fx/reveal.js'
import '../styles/sections/reviews.css'

const noteMarkup = ({ author, topic, text }) => `
  <figure class="client-note" data-client-note>
    <blockquote class="client-note__text hand">“${escapeHtml(text)}”</blockquote>
    <figcaption class="client-note__author">
      <span>${escapeHtml(author)}</span>
      <span class="legal">${escapeHtml(topic)}</span>
    </figcaption>
  </figure>`

const randomTilt = () => gsap.utils.random(-reviewsDesk.maxTilt, reviewsDesk.maxTilt, 0.5)

const scatterSlots = (count) =>
  Array.from({ length: count }, (_, index) => ({
    left: (index % 3) * 33 + gsap.utils.random(0, 5),
    top: Math.floor(index / 3) * 46 + gsap.utils.random(0, 8)
  }))

export const initReviews = () => {
  const desk = select('[data-reviews-desk]')
  if (!desk) return

  desk.innerHTML = clientNotes.map(noteMarkup).join('')

  const notes = selectAll('[data-client-note]', desk)
  const hint = select('[data-reviews-hint]')
  const tilts = notes.map(randomTilt)
  let topLayer = notes.length

  revealTimeline(desk).add(paperIn(notes, { rest: (index) => tilts[index] }))

  const layouts = gsap.matchMedia()

  layouts.add(media.desktop, () => {
    const canDrag = window.matchMedia(media.finePointer).matches
    hint.textContent = canDrag ? 'Drag the notes around — they don’t mind.' : 'A few words from people I helped.'
    scatterSlots(notes.length).forEach((slot, index) => Object.assign(notes[index].style, { left: `${slot.left}%`, top: `${slot.top}%` }))

    if (!canDrag) return () => {
      notes.forEach((note) => {
        note.style.left = ''
        note.style.top = ''
      })
    }

    const draggables = Draggable.create(notes, {
      type: 'x,y',
      bounds: desk,
      inertia: !prefersReducedMotion,
      zIndexBoost: false,
      onPress() {
        topLayer += 1
        this.target.style.zIndex = topLayer
        gsap.to(this.target, { scale: 1.04, duration: 0.2 })
      },
      onRelease() {
        gsap.to(this.target, { scale: 1, duration: 0.3 })
      }
    })

    return () => {
      draggables.forEach((draggable) => draggable.kill())
      notes.forEach((note) => {
        note.style.left = ''
        note.style.top = ''
      })
      gsap.set(notes, { x: 0, y: 0 })
    }
  })

  layouts.add(media.mobile, () => {
    hint.textContent = 'Swipe the top note away to read the next one.'
    notes.forEach((note, index) => (note.style.zIndex = notes.length - index))

    const sendToBottom = (note) => {
      const lowest = Math.min(...notes.map((item) => Number(item.style.zIndex)))
      note.style.zIndex = lowest - 1
    }

    const draggables = Draggable.create(notes, {
      type: 'x',
      zIndexBoost: false,
      onDragEnd() {
        const direction = Math.sign(this.x)
        const tossed = Math.abs(this.x) > reviewsDesk.tossThreshold
        if (!tossed) {
          gsap.to(this.target, { x: 0, duration: 0.4, ease: motion.paperEase })
          return
        }
        const note = this.target
        gsap
          .timeline()
          .to(note, { x: direction * window.innerWidth, rotation: direction * 24, duration: 0.35, ease: 'power2.in' })
          .call(() => sendToBottom(note))
          .to(note, { x: 0, rotation: randomTilt(), duration: 0.5, ease: motion.paperEase })
      }
    })

    return () => draggables.forEach((draggable) => draggable.kill())
  })
}
