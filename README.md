# HM Tours — Tours & Packages

Tours and packages website for **HM Tours**. Plan your vacation with trips, itineraries, and travel planning. Built with React, Vite, and Tailwind CSS.

## Features

- **Explore Trips & Holidays** — Hero search, filter by destination/month/nights/trip name, trip search results
- **Trip detail / Itinerary** — Day-wise itinerary, trip highlights, shore excursions, inclusions, entertainment shows, booking CTA
- **User auth** — Google Sign-In and phone-based login; inquiries, orders, and payments are stored in Firestore and visible in the admin portal
- **Admin portal** (`/admin`) — Email/password login (super@gmail.com & Test@123). Dashboard with stats, trips CRUD, inquiries, orders, payments. Trip creation with name, details, itinerary, image URLs (online), inclusions/exclusions
- Responsive layout, purple–orange gradient theme, premium typography (Cormorant Garamond + Outfit)

## Firebase & Admin setup

1. **Create admin user** — In [Firebase Console](https://console.firebase.google.com) → Authentication → Users → Add user: email `super@gmail.com`, password `Test@123`.
2. **Enable sign-in methods** — Authentication → Sign-in method: enable **Email/Password**, **Google**, and **Phone**.
3. **Firestore** — Trips, inquiries, orders, and payments are stored in Firestore. Rules are in your project; ensure the `tours`, `inquiries`, `orders`, and `payments` collections exist (they are created on first write).
4. **Admin** — Open `/admin/login`, sign in with the admin credentials, then use Dashboard, Trips, Inquiries, Orders, Payments.

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
