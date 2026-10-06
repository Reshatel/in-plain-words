import { pricingRules } from '../config.js'
import { complexityLevels, extraServices, situations, speedOptions } from '../data/calculator.js'

const findById = (list, id) => list.find((item) => item.id === id)

const roundTo = (value, step) => Math.round(value / step) * step

export const emptySelection = () => ({
  situationId: null,
  complexityId: 'simple',
  speedId: 'normal',
  hearings: 0,
  extras: [],
  englishSupport: false
})

export const isSelectionComplete = (selection) => Boolean(findById(situations, selection.situationId))

export const composeEstimate = (selection) => {
  const situation = findById(situations, selection.situationId)
  if (!situation) return { lines: [], total: 0, range: [0, 0], days: 0 }

  const complexity = findById(complexityLevels, selection.complexityId) ?? complexityLevels[0]
  const speed = findById(speedOptions, selection.speedId) ?? speedOptions[0]
  const englishFactor = selection.englishSupport ? pricingRules.englishSupportFactor : 1

  const base = situation.base
  const englishSurcharge = base * (englishFactor - 1)
  const complexitySurcharge = base * englishFactor * (complexity.factor - 1)
  const speedSurcharge = base * englishFactor * complexity.factor * (speed.priceFactor - 1)
  const hearingsCost = selection.hearings * pricingRules.hearingRate
  const chosenExtras = extraServices.filter((extra) => selection.extras.includes(extra.id))

  const lines = [
    { id: 'base', label: situation.label, amount: base },
    englishSurcharge && { id: 'english', label: `English-language support ×${pricingRules.englishSupportFactor}`, amount: englishSurcharge },
    complexitySurcharge && { id: 'complexity', label: `${complexity.label} ×${complexity.factor}`, amount: complexitySurcharge },
    speedSurcharge && { id: 'speed', label: `${speed.label} pace ×${speed.priceFactor}`, amount: speedSurcharge },
    hearingsCost && { id: 'hearings', label: `Court hearings × ${selection.hearings}`, amount: hearingsCost },
    ...chosenExtras.map((extra) => ({ id: extra.id, label: extra.label, amount: extra.price }))
  ]
    .filter(Boolean)
    .map((line) => ({ ...line, amount: Math.round(line.amount) }))

  const total = lines.reduce((sum, line) => sum + line.amount, 0)
  const range = [roundTo(total * pricingRules.rangeLow, pricingRules.rounding), roundTo(total * pricingRules.rangeHigh, pricingRules.rounding)]
  const days = Math.max(1, Math.round(situation.days * speed.termFactor * complexity.factor))

  return { lines, total, range, days }
}

export const formatMoney = (amount) => `$${Math.round(amount).toLocaleString('en-US')}`

export const formatRange = ([low, high]) => `${formatMoney(low)}–${formatMoney(high)}`

export const formatTerm = (days) => (days === 1 ? '1 working day' : `${days} working days`)

export const situationLabel = (situationId) => findById(situations, situationId)?.label ?? ''
