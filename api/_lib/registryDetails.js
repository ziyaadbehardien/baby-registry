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
    'As we begin this beautiful new chapter of our lives as mom & dad, our hearts are filled with love, excitement, and gratitude. One of our greatest blessings is knowing that our little love bug will grow up surrounded by such wonderful family and loved ones. Thank you for being part of our journey and for being people he will be so lucky to know, love, and learn from. We can’t wait for you to be part of his story, too.',

  // `colors` render as swatches on the "Nursery theme" card.
  nursery: {
    title: 'Soft colours & neutrals',
    detail: 'Natural oak accents',
    colors: [
      { name: 'Baby blue', hex: '#9EC3E1' },
      { name: 'Sage', hex: '#A3B18A' },
      { name: 'Moss', hex: '#7D8F69' },
      { name: 'Oat', hex: '#E8DCC4' },
      { name: 'Linen', hex: '#F5F0E6' },
      { name: 'Oak', hex: '#C49A6C' },
    ],
  },

  note: {
    quote: 'A SPACE WHERE LITTLE DREAMS AND LOTS OF LOVE WILL GROW.',
    greeting: 'Dearest Family and Friends,',
    paragraphs: [
      'As we count down the months until we meet our little boy, we’re slowly preparing for the beautiful changes that lie ahead.',
      "From dreaming about his nursery to choosing the little things he’ll need, every step brings us closer to welcoming him home. we want to gather pieces that will make our home a warm, safe, and special place for him to grow. Your presence in our little one's life is already the greatest gift we could ever pray for. For those who have asked how they might help us welcome our baby, this registry represents our most essential needs and dreams for the first year. Thank you for wrapping our beginning in such generous kindness.",
      'We cannot wait for you to meet our little one.',
    ],
    signOff: 'With all our love,',
  },

  // Set to null to hide the "Shower gathering details" button. To show it, use e.g.
  // { date: 'YYYY-MM-DD', time: '2:00 pm – 5:00 pm', location: '…', details: '…' }.
  shower: null,
};
