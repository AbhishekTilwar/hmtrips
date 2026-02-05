# HM Trips — Tours & Packages

Tours and packages website for **HM Trips**. Plan your vacation with trips, itineraries, and travel planning. Built with React, Vite, and Tailwind CSS.

## Features

- **Explore Trips & Holidays** — Hero search, filter by destination/month/nights/trip name, trip search results
- **Trip detail / Itinerary** — Day-wise itinerary, trip highlights, shore excursions, inclusions, entertainment shows, booking CTA
- Responsive layout, purple–orange gradient theme, premium typography (Cormorant Garamond + Outfit)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Project structure

- `src/pages/UpcomingTours.jsx` — Main trips listing page
- `src/pages/Itinerary.jsx` — Trip detail / itinerary page
- `src/data/tours.js` — Sample trip data (edit to add your own)
- `src/components/` — Navbar, Footer, TourCard, CallbackCard, StickyBottomBar, etc.
