import { useState, useEffect } from "react";
import {
  getToursFromFirestore,
  getTourByIdFromFirestore,
} from "../lib/firestore";
import { tours as staticTours, getTourById as getStaticById } from "./tours";

/** Infer vibe from destination/origin when not set (for Firestore tours). */
function getVibeFromDestination(destination, origin) {
  const d = (destination || "").toLowerCase();
  const o = (origin || "").toLowerCase();
  if (
    /leh|kashmir|himalaya|snow|winter|gulmarg|manali|shimla|norway|nordic|fjords/.test(
      d + " " + o,
    )
  )
    return "cold";
  if (/lakshadweep|island|kadmat|kavaratti/.test(d)) return "island";
  if (/goa|beach|tropical|maharashtra|konkan|malvan|tarkarli/.test(d))
    return "tropical";
  if (/europe|mediterranean|barcelona|rome|paris/.test(d)) return "urban";
  return "urban";
}

export function useTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // First, immediately set static tours for faster initial render
    setTours(staticTours);

    // Then asynchronously fetch Firestore data
    getToursFromFirestore()
      .then((data) => {
        if (cancelled) return;
        // Merge Firestore trips with static tours (dual-source loading)
        const firestoreTours = (data || []).map(normalizeTour);
        const merged = mergeTours(firestoreTours, staticTours);
        setTours(merged);
      })
      .catch((error) => {
        console.error("Error fetching tours from Firestore:", error);
        // Fallback to static tours on error
        if (!cancelled) setTours(staticTours);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { tours, loading };
}

/** Merge Firestore trips with static tours - Firestore takes priority for duplicates */
function mergeTours(firestoreTours, staticTours) {
  const tourMap = new Map();

  // Add static tours first (as fallback)
  staticTours.forEach((tour) => {
    tourMap.set(tour.id, tour);
  });

  // Override with Firestore trips (admin edits take priority)
  firestoreTours.forEach((tour) => {
    tourMap.set(tour.id, tour);
  });

  // Convert back to array
  return Array.from(tourMap.values());
}

function normalizeTour(t) {
  const tripTag = t.tripTag || t.shipName || "";
  const vibe = ["cold", "tropical", "island", "urban"].includes(t.vibe)
    ? t.vibe
    : getVibeFromDestination(t.destination, t.origin);
  return {
    id: t.id,
    name: t.name || "",
    tagline: t.tagline || "",
    tripTag,
    shipName: tripTag,
    origin: t.origin || "",
    destination: t.destination || "",
    vibe,
    category: t.category || "",
    nights: Number(t.nights) || 0,
    departureDate: t.departureDate || "",
    endDate: t.endDate || "",
    image: t.image || "",
    pricePerGuest: Number(t.pricePerGuest) || 0,
    pricePerNight: Number(t.pricePerNight) || 0,
    offer: t.offer || null,
    offers: Array.isArray(t.offers) ? t.offers : [],
    viewing: Number(t.viewing) || 0,
    ports: Array.isArray(t.ports) ? t.ports : [],
    highlights: Array.isArray(t.highlights) ? t.highlights : [],
    highlightImages: Array.isArray(t.highlightImages) ? t.highlightImages : [],
    itinerary: Array.isArray(t.itinerary) ? t.itinerary : [],
    inclusions: Array.isArray(t.inclusions) ? t.inclusions : [],
    exclusions: Array.isArray(t.exclusions) ? t.exclusions : [],
    galleryThumbnails: Array.isArray(t.galleryThumbnails)
      ? t.galleryThumbnails
      : [],
    shoreExcursionImages: Array.isArray(t.shoreExcursionImages)
      ? t.shoreExcursionImages
      : [],
    inclusionDetails: Array.isArray(t.inclusionDetails)
      ? t.inclusionDetails
      : [],
    inclusionNote: t.inclusionNote || "",
    entertainmentShows: Array.isArray(t.entertainmentShows)
      ? t.entertainmentShows
      : [],
    // About Destination - optional section with destination details
    aboutDestination: t.aboutDestination || null,
  };
}

export function useTourById(id) {
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setTour(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    getTourByIdFromFirestore(id)
      .then((t) => {
        if (cancelled) return;
        setTour(t ? normalizeTour(t) : getStaticById(id));
      })
      .catch(() => {
        if (!cancelled) setTour(getStaticById(id));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { tour, loading };
}
