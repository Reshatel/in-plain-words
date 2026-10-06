export const motion = {
  ease: 'power3.out',
  paperEase: 'back.out(1.4)',
  stampEase: 'power4.in',
  duration: 0.9,
  fadeDuration: 0.6,
  stagger: 0.08,
  stampStagger: 0.15,
  stampDuration: 0.25,
  strikeDuration: 0.5,
  markerDuration: 0.6,
  scribbleDuration: 0.8,
  flipDuration: 0.7,
  revealStart: 'top 80%',
  paperOffset: 60,
  paperTilt: 6,
  paperRest: 1,
  typingSpeed: 0.035
}

export const office = {
  brand: 'In Plain Words',
  monogram: 'IPW',
  lawyer: 'Anna Holt',
  phone: '+1 (555) 014-2290',
  phoneHref: 'tel:+15550142290',
  email: 'hello@inplainwords.law',
  address: '14 Paper Lane, Suite 3, Springfield',
  hours: 'Mon–Sat, 9:00–19:00'
}

export const storageKeys = {
  visited: 'inPlainWords.visited',
  calculator: 'inPlainWords.calculator',
  estimate: 'inPlainWords.estimate',
  application: 'inPlainWords.application'
}

export const media = {
  mobile: '(max-width: 899px)',
  desktop: '(min-width: 900px)',
  finePointer: '(hover: hover) and (pointer: fine)'
}

export const pricingRules = {
  hearingRate: 75,
  hearingsMax: 10,
  rangeLow: 0.9,
  rangeHigh: 1.15,
  rounding: 10,
  englishSupportFactor: 1.2
}

export const preloaderTiming = {
  typing: 0.5,
  hold: 0.15,
  exit: 0.4
}

export const headerScroll = {
  revealOffset: 120
}

export const reviewsDesk = {
  tossThreshold: 90,
  maxTilt: 7
}

export const heroParallax = {
  range: 18,
  duration: 0.8
}

const unsplash = (id, width) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`

export const photos = {
  lawyer: unsplash('1573496359142-b8d87734a5a2', 720),
  lawyerSmall: unsplash('1573496359142-b8d87734a5a2', 420),
  courtAssociate: unsplash('1560250097-0b93528c311a', 320),
  ipAssociate: unsplash('1580489944761-15a19d654956', 320)
}
