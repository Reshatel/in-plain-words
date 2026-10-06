export const practices = [
  {
    id: 'property',
    tab: 'Property',
    official: 'Real estate transaction support',
    human: 'Buy or sell a flat without surprises',
    services: ['Title and encumbrance check', 'Purchase agreement review', 'Deposit and handover supervision', 'Lease disputes'],
    priceFrom: 380,
    situationId: 'property-deal'
  },
  {
    id: 'family',
    tab: 'Family',
    official: 'Matrimonial and family law proceedings',
    human: 'Divorce, kids and property — calmly',
    services: ['Uncontested divorce', 'Property split agreements', 'Child arrangements and support', 'Prenuptial agreements'],
    priceFrom: 450,
    situationId: 'divorce'
  },
  {
    id: 'business',
    tab: 'Business',
    official: 'Corporate legal support for small enterprises',
    human: 'Start and run a business safely',
    services: ['Company registration', 'Founders’ agreements', 'Client and supplier contracts', 'Tax inspection support'],
    priceFrom: 160,
    situationId: 'company'
  },
  {
    id: 'ip',
    tab: 'IT & trademarks',
    official: 'Intellectual property protection',
    human: 'Keep your name, code and ideas yours',
    services: ['Trademark search and filing', 'Software licence agreements', 'NDA and contractor IP clauses', 'Takedown of copycats'],
    priceFrom: 230,
    situationId: 'brand'
  },
  {
    id: 'court',
    tab: 'Court',
    official: 'Litigation and court representation',
    human: 'Someone in your corner in court',
    services: ['Honest case assessment', 'Statements of claim and defence', 'Court hearings', 'Appeals'],
    priceFrom: 620,
    situationId: 'court'
  },
  {
    id: 'consumer',
    tab: 'Consumer disputes',
    official: 'Consumer rights protection',
    human: 'Get your money back from a shop or service',
    services: ['Refund claims', 'Faulty goods and warranty', 'Airline and travel compensation', 'Bank and insurer complaints'],
    priceFrom: 50,
    situationId: 'advice'
  }
]

export const practiceLabel = (practiceId) => practices.find((practice) => practice.id === practiceId)?.tab ?? ''
