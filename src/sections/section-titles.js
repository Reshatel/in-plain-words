import { selectAll } from '../dom.js'
import { revealTimeline } from '../fx/reveal.js'
import { revealWords } from '../fx/words.js'

export const initSectionTitles = () => {
  selectAll('.section-title').forEach((title) => {
    revealTimeline(title).add(revealWords(title))
  })
}
