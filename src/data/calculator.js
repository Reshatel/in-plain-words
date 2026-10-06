export const situations = [
  { id: 'advice', label: 'Just need advice', base: 50, days: 1 },
  { id: 'contract-check', label: 'Check a contract before I sign', base: 90, days: 2 },
  { id: 'property-deal', label: 'Buying or selling a flat', base: 380, days: 14 },
  { id: 'divorce', label: 'Divorce & splitting property', base: 450, days: 60 },
  { id: 'inheritance', label: 'Inheritance', base: 300, days: 30 },
  { id: 'company', label: 'Starting a company', base: 160, days: 5 },
  { id: 'brand', label: 'Protect my brand name', base: 230, days: 21 },
  { id: 'debt', label: 'Someone owes me money', base: 350, days: 45 },
  { id: 'court', label: 'I need a lawyer in court', base: 620, days: 90 }
]

export const complexityLevels = [
  { id: 'simple', label: 'Simple', hint: 'Clear facts, documents in order', factor: 1 },
  { id: 'nuanced', label: 'Some nuances', hint: 'A few unclear points or missing papers', factor: 1.4 },
  { id: 'complex', label: 'Complex, other side has a lawyer', hint: 'Expect pushback at every step', factor: 1.9 }
]

export const speedOptions = [
  { id: 'normal', label: 'Normal', hint: 'Standard pace', priceFactor: 1, termFactor: 1 },
  { id: 'faster', label: 'Faster', hint: 'About 30% sooner', priceFactor: 1.3, termFactor: 0.7 },
  { id: 'urgent', label: 'Urgent', hint: 'Twice as fast, priority queue', priceFactor: 1.6, termFactor: 0.5 }
]

export const extraServices = [
  { id: 'translation', label: 'Document translation', price: 50 },
  { id: 'notary', label: 'Notary certification', price: 40 },
  { id: 'visit', label: 'Home or office visit', price: 40 }
]

export const calculatorSteps = ['What happened?', 'How complex is it?', 'How fast?', 'Anything else?']
