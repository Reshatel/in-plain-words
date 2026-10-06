import { gsap } from 'gsap'
import { motion, photos } from '../config.js'
import { associates, lawyerFile } from '../data/dossier.js'
import { escapeHtml, select, selectAll } from '../dom.js'
import { paperIn } from '../fx/paper.js'
import { revealTimeline } from '../fx/reveal.js'
import { drawScribble } from '../fx/scribble.js'
import { stampDown } from '../fx/stamp.js'
import { paperclip } from '../fx/svg.js'
import { typeText } from '../fx/words.js'
import '../styles/sections/dossier.css'

const signaturePath =
  'M8 58 C 18 18, 44 14, 38 48 S 26 84, 52 58 S 84 16, 92 46 S 108 72, 122 44 C 132 24, 144 62, 154 50 S 178 32, 188 54 C 196 70, 214 30, 232 40 S 256 62, 284 30'

const fieldMarkup = ({ label, value }) => `
  <div class="dossier__field">
    <dt class="legal">${escapeHtml(label)}</dt>
    <dd data-dossier-value="${escapeHtml(value)}">${escapeHtml(value)}</dd>
  </div>`

const associateMarkup = ({ name, role, photo, note }) => `
  <article class="associate sheet" data-associate>
    <img class="associate__photo photo" src="${photos[photo]}" alt="${escapeHtml(name)}" width="320" height="320" loading="lazy" />
    <div>
      <h3 class="associate__name">${escapeHtml(name)}</h3>
      <p class="associate__role legal">${escapeHtml(role)}</p>
      <p class="associate__note hand">${escapeHtml(note)}</p>
    </div>
  </article>`

export const initDossier = () => {
  const root = select('[data-dossier]')
  if (!root) return

  root.innerHTML = `
    <article class="dossier__sheet sheet sheet--ruled" data-dossier-sheet>
      <header class="dossier__head">
        <p class="legal">Personal file · No. 0001</p>
        <span class="stamp dossier__stamp" data-dossier-stamp>Verified</span>
      </header>
      <div class="dossier__body">
        <figure class="dossier__photo sheet" data-dossier-photo>
          ${paperclip('dossier__clip')}
          <img class="photo" src="${photos.lawyerSmall}" alt="${escapeHtml(lawyerFile.name)}" width="420" height="525" loading="lazy" />
        </figure>
        <div class="dossier__details">
          <h3 class="dossier__name">${escapeHtml(lawyerFile.name)}</h3>
          <p class="dossier__role legal">${escapeHtml(lawyerFile.role)}</p>
          <dl class="dossier__fields">${lawyerFile.fields.map(fieldMarkup).join('')}</dl>
          <p class="dossier__licence legal">${escapeHtml(lawyerFile.licence)}</p>
          <div class="dossier__signature">
            <svg class="scribble" viewBox="0 0 292 90" aria-hidden="true" fill="none"><path d="${signaturePath}" /></svg>
            <span class="legal">Signature</span>
          </div>
        </div>
      </div>
    </article>
    <div class="dossier__associates">
      <p class="legal dossier__associates-title">Also on the team</p>
      ${associates.map(associateMarkup).join('')}
    </div>`

  const sheet = select('[data-dossier-sheet]', root)
  const values = selectAll('[data-dossier-value]', root)

  const timeline = revealTimeline(root)
    .add(paperIn(sheet, { rest: -0.6 }))
    .add(paperIn(select('[data-dossier-photo]', root), { rest: -3 }), '-=0.6')

  values.forEach((value) => timeline.add(typeText(value, value.dataset.dossierValue)))

  timeline
    .add(drawScribble(select('.dossier__signature path', root), { duration: 1.2 }))
    .add(stampDown(select('[data-dossier-stamp]', root)), '-=0.3')
    .add(paperIn(selectAll('[data-associate]', root), { stagger: motion.stagger * 2 }), '-=0.8')

  gsap.set(values, { minHeight: '1.6em' })
}
