export default function ItineraryMap({ tour }) {
  const ports = tour?.ports || [tour?.origin, tour?.destination].filter(Boolean)
  const hasGoa = ports.some((p) => p?.toLowerCase().includes('goa'))
  const hasMumbai = ports.some((p) => p?.toLowerCase().includes('mumbai'))

  return (
    <section className="bg-gradient-to-b from-sky-100 to-sky-50 py-8 md:py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-xl md:rounded-2xl overflow-hidden bg-sky-100/80 border border-sky-200/60 shadow-inner aspect-[2/1] min-h-[200px] sm:min-h-[280px] lg:min-h-[320px]">
          {/* Simplified west coast India map - sea (light blue) and land (light green) */}
          <svg
            viewBox="0 0 800 400"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Sea background */}
            <rect width="800" height="400" fill="#bae6fd" />
            {/* Land - simplified Maharashtra/Goa coast */}
            <path
              d="M 80 120 L 200 100 L 320 140 L 400 160 L 520 180 L 650 160 L 750 200 L 780 250 L 750 320 L 650 350 L 400 340 L 200 320 L 100 280 Z"
              fill="#86efac"
              stroke="#4ade80"
              strokeWidth="2"
            />
            {/* Dotted route curve - Mumbai to Goa and back */}
            <path
              d="M 180 180 Q 350 80 520 160 Q 600 200 520 260 Q 400 280 180 220"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeDasharray="12 8"
              strokeLinecap="round"
            />
            {/* Arrow markers along route */}
            <circle cx="180" cy="180" r="14" fill="#ef4444" stroke="#fff" strokeWidth="3" />
            <text x="180" y="185" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">M</text>
            <circle cx="520" cy="160" r="14" fill="#3b82f6" stroke="#fff" strokeWidth="3" />
            <text x="520" y="165" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">G</text>
            <circle cx="520" cy="260" r="12" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
            <circle cx="180" cy="220" r="12" fill="#ef4444" stroke="#fff" strokeWidth="2" />
            {/* Port labels */}
            <text x="180" y="210" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="600">Mumbai</text>
            <text x="520" y="145" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="600">Goa</text>
          </svg>
        </div>
      </div>
    </section>
  )
}
