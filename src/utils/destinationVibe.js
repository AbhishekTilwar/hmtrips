/**
 * Destination vibe theming: cold | tropical | island | urban
 * Used for immersive UI (colors, overlays, effects) on cards and itinerary.
 */
export const VIBE_COLORS = {
  cold: {
    overlay: 'linear-gradient(180deg, rgba(224,242,254,0.2) 0%, rgba(186,230,253,0.4) 50%, rgba(14,165,233,0.3) 100%)',
    accent: '#0ea5e9',
    accentDim: '#7dd3fc',
    bgTint: 'rgba(241,245,249,0.95)',
    cardBorder: 'rgba(148,163,184,0.3)',
    glow: 'rgba(14,165,233,0.25)',
  },
  tropical: {
    overlay: 'linear-gradient(180deg, rgba(254,243,199,0.15) 0%, rgba(253,230,138,0.25) 50%, rgba(34,197,94,0.2) 100%)',
    accent: '#16a34a',
    accentDim: '#86efac',
    bgTint: 'rgba(240,253,244,0.95)',
    cardBorder: 'rgba(134,239,172,0.4)',
    glow: 'rgba(34,197,94,0.3)',
  },
  island: {
    overlay: 'linear-gradient(180deg, rgba(204,251,241,0.2) 0%, rgba(153,246,228,0.35) 50%, rgba(20,184,166,0.25) 100%)',
    accent: '#0d9488',
    accentDim: '#5eead4',
    bgTint: 'rgba(240,253,250,0.95)',
    cardBorder: 'rgba(94,234,212,0.4)',
    glow: 'rgba(20,184,166,0.3)',
  },
  urban: {
    overlay: 'linear-gradient(180deg, rgba(241,245,249,0.1) 0%, rgba(226,232,240,0.3) 50%, rgba(30,64,175,0.2) 100%)',
    accent: '#1e40af',
    accentDim: '#93c5fd',
    bgTint: 'rgba(239,246,255,0.95)',
    cardBorder: 'rgba(147,197,253,0.4)',
    glow: 'rgba(30,64,175,0.25)',
  },
}

export function getVibe(tour) {
  return tour?.vibe && ['cold', 'tropical', 'island', 'urban'].includes(tour.vibe)
    ? tour.vibe
    : 'urban'
}
