/** Destination vibe for immersive theming: cold | tropical | island | urban */
export const tours = [
  {
    id: 'a57a0384-8f34-4956-a417-8277d7ca4e83',
    name: 'Mumbai → Goa & Lakshadweep',
    tagline: '5-Night Roundtrip Voyage',
    shipName: 'Explorer',
    origin: 'Mumbai',
    destination: 'Goa, Lakshadweep',
    vibe: 'island',
    nights: 5,
    departureDate: '2026-03-15',
    endDate: '2026-03-20',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    pricePerGuest: 24999,
    pricePerNight: 4999,
    offer: 'Flat 10% Off',
    offers: ['2nd Guest Free', '25% Discount'],
    viewing: 235,
    ports: ['Mumbai', 'Goa', 'Lakshadweep', 'Mumbai'],
    highlights: ['Goa beaches', 'Lakshadweep islands', 'Scenic routes', 'Gourmet dining'],
    highlightImages: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80',
      'https://images.unsplash.com/photo-1473496169904-7ba300e6cbcb?w=600&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    ],
    itinerary: [
      { day: 1, port: 'Mumbai', description: 'Departure 6:00 PM. Welcome dinner and live entertainment.' },
      { day: 2, port: 'En route', description: 'Travel day. Relax, spa, pools, and activities. Themed dinner night.' },
      { day: 3, port: 'Goa', description: 'Arrive Goa morning. Beaches and heritage tours. Overnight stay.' },
      { day: 4, port: 'Lakshadweep', description: 'Island paradise. Snorkelling, kayaking, and beach barbecue.' },
      { day: 5, port: 'En route', description: 'Leisure day. Farewell gala dinner and show.' },
      { day: 6, port: 'Mumbai', description: 'Return after breakfast.' },
    ],
    inclusions: ['Accommodation', 'All meals', 'Entertainment', 'Fitness & pool', 'Port taxes'],
    exclusions: ['Shore excursions', 'Spa', 'Premium beverages'],
  },
  {
    id: 'b68b1495-9g45-5067-b528-9388e8db5f94',
    name: 'Mumbai → Goa Express',
    tagline: '3-Night Weekend Getaway',
    shipName: 'Weekend Getaway',
    origin: 'Mumbai',
    destination: 'Goa',
    vibe: 'tropical',
    nights: 3,
    departureDate: '2026-02-20',
    endDate: '2026-02-23',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    pricePerGuest: 14999,
    pricePerNight: 4999,
    offer: 'Flat 10% Off',
    offers: ['2nd Guest Free', '25% Discount'],
    viewing: 189,
    ports: ['Mumbai', 'Goa', 'Goa', 'Mumbai'],
    highlights: ['Quick escape', 'Goa shores', 'Pool parties', 'Live music'],
    highlightImages: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
      'https://images.unsplash.com/photo-1536935338788-423bbd3fd26e?w=600&q=80',
      'https://images.unsplash.com/photo-1571266028243-d220e8d2d7e2?w=600&q=80',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80',
    ],
    galleryThumbnails: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
      'https://images.unsplash.com/photo-1473496169904-7ba300e6cbcb?w=400&q=80',
    ],
    shoreExcursionImages: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80',
    ],
    itinerary: [
      { day: 1, port: 'Mumbai', subtitle: 'Welcome', description: 'Depart from Mumbai. Check in, enjoy welcome dinner, live entertainment, and begin your weekend trip.' },
      { day: 2, port: 'Goa', subtitle: 'Arrive in Goa at 3:00 PM | Evening & Overnight Stay', description: 'Arrive in Goa by mid-afternoon. With an overnight halt, the night is yours—sunset views, dinner, beach walks, live music, or Goa\'s nightlife. Return at your own pace after a full evening.' },
      { day: 3, port: 'Goa', subtitle: 'Full Day in Goa', description: 'Leisure day in Goa. Beach and city tours, or relax at the resort. Pool, spa, and entertainment.' },
      { day: 4, port: 'Mumbai', subtitle: 'Return', description: 'Return by noon after breakfast.' },
    ],
    inclusionDetails: [
      'Inclusive of all meals at Food Court & Starlight Restaurant',
      'Jain food available at Starlight',
      'All Inclusive unlimited beverage package',
    ],
    inclusionNote: 'Note: Regular beverage package included.',
    entertainmentShows: [
      { name: 'Indian Cinemagic', available: true },
      { name: 'Baile Baile', available: true },
      { name: 'Burlesque Show', available: true },
      { name: 'Romance in Bollywood', available: false },
      { name: "Magician's Cut", available: true },
      { name: 'Magical Evening', available: false },
      { name: 'Magical Workshop', available: true },
    ],
    inclusions: ['Cabin accommodation', 'All meals', 'Entertainment', 'Pool access'],
    exclusions: ['Shore excursions', 'Spa', 'Alcoholic beverages'],
  },
  {
    id: 'c79c25a6-0h56-6178-c639-a499f9ec6ga5',
    name: '2-Night Mumbai Weekend Getaway',
    tagline: '2-Night Escape',
    shipName: 'Weekend Escape',
    origin: 'Mumbai',
    destination: 'Mumbai',
    vibe: 'urban',
    nights: 2,
    departureDate: '2026-02-07',
    endDate: '2026-02-09',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    pricePerGuest: 31832,
    pricePerNight: 15916,
    offer: 'Flat 10% Off',
    offers: ['Flat 25% Off'],
    viewing: 142,
    ports: ['Mumbai', 'Mumbai'],
    highlights: ['Quick getaway', 'Full trip experience', 'Spa & dining', 'Stargazing'],
    highlightImages: [
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6f6aa59b3?w=600&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
      'https://images.unsplash.com/photo-1473496169904-7ba300e6cbcb?w=600&q=80',
    ],
    itinerary: [
      { day: 1, port: 'Mumbai', description: 'Friday 6:00 PM departure. Dinner and show.' },
      { day: 2, port: 'En route', description: 'Full day on trip. All facilities open.' },
      { day: 3, port: 'Mumbai', description: 'Sunday morning return.' },
    ],
    inclusions: ['Interior/Sea view cabin', 'All meals', 'Entertainment', 'Fitness centre'],
    exclusions: ['Spa', 'Premium dining', 'Beverages'],
  },
  {
    id: 'd80d36b7-1i67-7289-d740-b5a0g0fd7hb6',
    name: 'Mumbai → Lakshadweep Explorer',
    tagline: '4-Night Island Hopping',
    shipName: 'Explorer',
    origin: 'Mumbai',
    destination: 'Lakshadweep',
    vibe: 'island',
    nights: 4,
    departureDate: '2026-05-01',
    endDate: '2026-05-05',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    pricePerGuest: 19999,
    pricePerNight: 4999,
    offer: null,
    viewing: 98,
    ports: ['Mumbai', 'Kadmat', 'Kavaratti', 'Mumbai'],
    highlights: ['Multiple islands', 'Snorkelling', 'Cultural tours', 'Seafood feasts'],
    highlightImages: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80',
      'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80',
      'https://images.unsplash.com/photo-1528184039938-81d9a8f1e7c9?w=600&q=80',
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
    ],
    itinerary: [
      { day: 1, port: 'Mumbai', description: 'Departure. Evening travel.' },
      { day: 2, port: 'En route', description: 'Travel day with activities.' },
      { day: 3, port: 'Kadmat Island', description: 'Snorkelling and beach day.' },
      { day: 4, port: 'Kavaratti', description: 'Capital island visit. Local culture.' },
      { day: 5, port: 'Mumbai', description: 'Return.' },
    ],
    inclusions: ['Accommodation', 'All meals', 'Snorkelling gear', 'Port fees'],
    exclusions: ['Optional excursions', 'Spa', 'Premium drinks'],
  },
  {
    id: 'e91e47c8-2j78-8390-e851-c6b1h1ge8ic7',
    name: 'Himalayan Winter Voyage',
    tagline: '5-Night Snow & Mountains',
    shipName: 'Northern Explorer',
    origin: 'Mumbai',
    destination: 'Kashmir, Leh',
    vibe: 'cold',
    nights: 5,
    departureDate: '2026-12-10',
    endDate: '2026-12-15',
    image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80',
    pricePerGuest: 42999,
    pricePerNight: 8599,
    offer: 'Early Bird 15% Off',
    viewing: 312,
    ports: ['Mumbai', 'Srinagar', 'Gulmarg', 'Leh', 'Mumbai'],
    highlights: ['Snow-capped peaks', 'Skiing & sledding', 'Frozen lakes', 'Mountain lodges'],
    highlightImages: [
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&q=80',
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600&q=80',
      'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=600&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    ],
    itinerary: [
      { day: 1, port: 'Mumbai', description: 'Departure. Fly to Srinagar. Transfer to mountain lodge.' },
      { day: 2, port: 'Srinagar', description: 'Dal Lake, shikara ride. Winter markets and local cuisine.' },
      { day: 3, port: 'Gulmarg', description: 'Skiing, gondola to Apharwat. Snow activities.' },
      { day: 4, port: 'Leh', description: 'High-altitude lakes and monasteries. Stargazing.' },
      { day: 5, port: 'En route', description: 'Leisure. Farewell dinner with mountain views.' },
      { day: 6, port: 'Mumbai', description: 'Return after breakfast.' },
    ],
    inclusions: ['Lodge accommodation', 'All meals', 'Ski gear', 'Local guides'],
    exclusions: ['Flights', 'Optional spa', 'Premium beverages'],
  },
];

export const getTourById = (id) => tours.find((t) => t.id === id);

// Static filter options (fallback when no tours)
export const DESTINATIONS = ['Where to?', 'Mumbai', 'Goa', 'Lakshadweep', 'At Sea'];
export const MONTHS = ['Travel month?', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const NIGHTS_OPTIONS = ['Nights?', '2', '3', '4', '5'];

/** Derive filter options from a tours array (e.g. from Firestore) */
export function getFilterOptionsFromTours(toursList) {
  if (!toursList?.length) return { destinations: DESTINATIONS, months: MONTHS, nights: NIGHTS_OPTIONS, tripNames: ['Trip name?'] }
  const destinations = ['Where to?']
  const nightsSet = new Set()
  toursList.forEach((t) => {
    if (t.origin && !destinations.includes(t.origin)) destinations.push(t.origin)
    const destParts = (t.destination || '').split(',').map((s) => s.trim()).filter(Boolean)
    destParts.forEach((d) => { if (d && !destinations.includes(d)) destinations.push(d) })
    if (t.nights) nightsSet.add(String(t.nights))
  })
  const nights = ['Nights?', ...Array.from(nightsSet).sort((a, b) => Number(a) - Number(b))]
  const tripNames = ['Trip name?', ...toursList.map((t) => t.name).filter(Boolean)]
  return { destinations, months: MONTHS, nights, tripNames }
}
