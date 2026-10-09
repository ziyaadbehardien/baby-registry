/**
 * Landing-page content ("Our Story"). Edit these values to personalise the registry.
 *
 * Served only to signed-in guests via GET /api/v1/registry-details — it is deliberately kept out
 * of the UI bundle, which anyone can download. The family photo lives in private/ for the same
 * reason (see api/v1/hero-photo.js).
 *
 * The dates, nursery theme and shower details below are still placeholders from the design
 * mock-up — update them when they're known.
 */
export const registryDetails = {
  familyName: 'Behardien',
  parents: 'Ziyaad & Tashreeqa',
  parentsTagline: 'Parents-to-be',
  monogram: 'B',
  dueDate: '2027-02-28',

  headline: 'Welcoming Baby Behardien with boundless love & gratitude.',
  intro:
    "We are overjoyed to begin this transformative chapter together. As we prepare our home for our little one's arrival, your warmth, presence, and prayers mean everything to us.",

  // `colors` render as swatches on the "Nursery theme" card.
  nursery: {
    title: 'Sage & Oat',
    detail: 'Natural oak accents',
    colors: [
      { name: 'Sage', hex: '#A3B18A' },
      { name: 'Moss', hex: '#7D8F69' },
      { name: 'Oat', hex: '#E8DCC4' },
      { name: 'Linen', hex: '#F5F0E6' },
      { name: 'Oak', hex: '#C49A6C' },
    ],
  },
  focus: { title: 'Eco & Organic', detail: 'Heirloom quality pieces' },

  note: {
    quote: 'We are preparing not just a room, but a sanctuary of quiet warmth.',
    greeting: 'Dearest Family and Friends,',
    paragraphs: [
      'As we step quietly through these final nesting weeks, the nursery has slowly transformed into our favourite sanctuary. The morning light spills across simple oak shelves, soft knitted blankets, and the gentle whisper of linen curtains. Every item chosen for our little one has been selected with deep intention, prioritising non-toxic, sustainable materials and items made to endure and be cherished.',
      "Your presence in our little one's life is already the greatest gift we could ever pray for. For those who have asked how they might help us welcome our baby, this registry represents our most essential needs and dreams for the first year.",
      'Thank you for wrapping our beginning in such generous kindness. We cannot wait for you to meet our little one.',
    ],
    signOff: 'With all our tender love,',
  },

  // Set to null to hide the "Shower gathering details" button.
  shower: {
    date: '2025-09-20',
    time: '2:00 pm – 5:00 pm',
    location: 'The Behardien home',
    details: 'A relaxed afternoon of tea, cake and good company. Little ones welcome.',
  },
};
