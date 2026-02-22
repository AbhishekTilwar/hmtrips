import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTourById, useTours } from '../data/toursData'
import { getTourById } from '../data/tours'
import { useAuth } from '../contexts/AuthContext'
import { createOrder, createPayment, updatePayment, updateOrderStatus, createInquiry } from '../lib/firestore'
import { openRazorpayCheckout } from '../lib/razorpay'
import ScrollReveal from '../components/ScrollReveal'
import { getVibe } from '../utils/destinationVibe'
import TourCard from '../components/TourCard'
import { useCRMRecommendations } from '../hooks/useCRM'

// Use environment variable or empty string for relative paths
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

/**
 * About Destination Component
 * Displays destination details in a collapsible card format
 * Shows: Speciality, Traditional Food, Language, Culture
 * Works for both old trips (without data) and new trips (with data)
 * For old trips: Shows a default message about the destination
 */
function AboutDestination({ data, destination }) {
  // State to track if section is expanded or collapsed
  // Start expanded if user clicked "Read More" link
  const [isExpanded, setIsExpanded] = useState(() => {
    // Check if URL has hash #about-destination
    if (typeof window !== 'undefined') {
      return window.location.hash === '#about-destination'
    }
    return false
  })

  // Extract fields with fallback to empty string
  const { speciality = '', traditionalFood = '', language = '', culture = '' } = data || {}

  // Check if any field has content
  const hasContent = speciality || traditionalFood || language || culture
  
  // For old trips without data, show a default message
  const defaultMessage = `Discover the beauty and charm of ${destination || 'this destination'}. Explore local attractions, experience the culture, and create unforgettable memories on your journey.`

  // Icon components for each field
  const icons = {
    speciality: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    food: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    language: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    culture: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  }

  return (
    <section className="py-10 md:py-16 bg-gradient-to-b from-amber-50/50 to-white border-y border-amber-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="slideUp" duration={500}>
          {/* Header with destination name and toggle button */}
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div>
              <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950">
                About {destination || 'Destination'}
              </h2>
              <p className="text-neutral-600 text-sm mt-1">
                Learn more about the local culture, food, and traditions
              </p>
            </div>
            
            {/* Expand/Collapse button with animation */}
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full transition-all duration-300 group-hover:shadow-md"
              aria-label={isExpanded ? 'Show less' : 'Read more'}
            >
              <span className="text-sm font-medium">
                {isExpanded ? 'Show Less' : 'Read More'}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Collapsible content */}
          <div 
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isExpanded ? 'max-h-[800px] opacity-100 mt-6' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hasContent ? (
                <>
                  {/* Speciality Card */}
                  {speciality && (
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                          {icons.speciality}
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900 mb-1">Speciality</h3>
                          <p className="text-neutral-600 text-sm leading-relaxed">{speciality}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Traditional Food Card */}
                  {traditionalFood && (
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                          {icons.food}
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900 mb-1">Traditional Food</h3>
                          <p className="text-neutral-600 text-sm leading-relaxed">{traditionalFood}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Language Card */}
                  {language && (
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          {icons.language}
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900 mb-1">Language</h3>
                          <p className="text-neutral-600 text-sm leading-relaxed">{language}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Culture Card */}
                  {culture && (
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                          {icons.culture}
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900 mb-1">Culture</h3>
                          <p className="text-neutral-600 text-sm leading-relaxed">{culture}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Default message for old trips without data */
                <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-amber-100">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 rounded-xl">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">Discover {destination || 'This Destination'}</h3>
                      <p className="text-neutral-600 text-sm leading-relaxed">{defaultMessage}</p>
                      <p className="text-neutral-500 text-xs mt-3">
                        Contact our travel experts to learn more about this amazing destination!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview text when collapsed - shows first available field or default */}
          {!isExpanded && (
            <div className="mt-4 p-4 bg-white/50 rounded-lg border border-amber-100">
              <p className="text-neutral-600 text-sm line-clamp-2">
                <span className="font-medium text-neutral-800">Quick glimpse: </span>
                {hasContent ? (speciality || traditionalFood || language || culture) : defaultMessage}
              </p>
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  )
}

// Smooth Sliding Card Carousel - Real Card Effect
function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const displayImages = images || []

  // Auto-play every 2.5 seconds
  useEffect(() => {
    if (!isPaused && displayImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayImages.length)
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [isPaused, displayImages.length])

  if (displayImages.length === 0) {
    return (
      <div className="h-40 sm:h-48 md:h-56 lg:h-64 rounded-xl bg-neutral-100 flex items-center justify-center border border-neutral-200">
        <span className="text-neutral-400 text-sm">No highlight images</span>
      </div>
    )
  }

  if (displayImages.length === 1) {
    return (
      <div className="h-40 sm:h-48 md:h-56 lg:h-64 rounded-xl overflow-hidden shadow-lg border border-neutral-200">
        <img 
          src={displayImages[0]} 
          alt="Highlight" 
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>
    )
  }

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % displayImages.length)
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)

  // Preload all images for fast loading
  useEffect(() => {
    displayImages.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [displayImages])

  return (
    <div 
      className="relative py-3 sm:py-4 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Cards Track with Smooth Sliding */}
      <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 flex items-center justify-center">
        {displayImages.map((img, index) => {
          // Calculate position from current
          let position = index - currentIndex
          
          // Handle wrapping
          if (position > displayImages.length / 2) {
            position -= displayImages.length
          } else if (position < -displayImages.length / 2) {
            position += displayImages.length
          }

          // Only show 3 cards
          if (position < -1 || position > 1) return null

          const isCenter = position === 0
          const isLeft = position === -1
          const isRight = position === 1

          return (
            <div
              key={index}
              onClick={() => {
                if (isLeft) prevSlide()
                if (isRight) nextSlide()
              }}
              className="absolute rounded-lg sm:rounded-xl overflow-hidden shadow-lg cursor-pointer"
              style={{
                width: isCenter ? '50%' : '28%',
                height: isCenter ? '100%' : '72%',
                left: isCenter ? '25%' : isLeft ? '5%' : '67%',
                zIndex: isCenter ? 10 : 5,
                opacity: isCenter ? 1 : 0.5,
                transform: `translateX(0) scale(${isCenter ? 1 : 0.95})`,
                transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            >
              <img 
                src={img} 
                alt={`Highlight ${index + 1}`}
                className="w-full h-full object-cover"
                loading="eager"
              />
              
              {/* Dark overlay for side cards */}
              {!isCenter && (
                <div className="absolute inset-0 bg-black/30" />
              )}

              {/* Navigation arrows on center card */}
              {isCenter && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center z-20"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center z-20"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3 sm:mt-4">
        {displayImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-amber-500 w-5' : 'bg-neutral-300 w-1.5 hover:bg-neutral-400'
            }`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="text-center mt-2 text-xs sm:text-sm text-neutral-500">
        {currentIndex + 1} / {displayImages.length}
        {isPaused && <span className="text-amber-500 ml-2">(Paused)</span>}
      </div>
    </div>
  )
}
// Key ID is public; fallback so payment works even without .env (secret stays on server)
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SEo7lCnNbH00WM'

// Primary and Alternative contact numbers
const PRIMARY_NUMBER = '8278717103'
const ALTERNATIVE_NUMBER = '8805795706'

// Send WhatsApp message function
function sendWhatsAppMessage(phone, message) {
  const encodedMessage = encodeURIComponent(message)
  window.open(`https://wa.me/91${phone}?text=${encodedMessage}`, '_blank')
}

function BookSection({ tour, formatPrice, formatDateShort }) {
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phoneNumber || '')
  const [guests, setGuests] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [bookingData, setBookingData] = useState(null)

  const totalAmount = (tour.pricePerGuest || 0) * guests
  const advanceAmount = Math.round(totalAmount * 0.5)
  const balanceAmount = totalAmount - advanceAmount
  
  // Calculate balance due date (7 days before travel)
  const travelDate = new Date(tour.departureDate)
  const balanceDueDate = new Date(travelDate)
  balanceDueDate.setDate(balanceDueDate.getDate() - 7)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPaymentError('')
    setSubmitting(true)
    
    try {
      // Validate inputs
      if (!email || !phone) {
        setPaymentError('Please enter both email and phone number.')
        setSubmitting(false)
        return
      }

      if (guests < 1) {
        setPaymentError('Number of guests must be at least 1.')
        setSubmitting(false)
        return
      }

      // Create order with 50% payment structure
      const orderId = await createOrder({
        userId: user?.uid || null,
        userEmail: email,
        userPhone: phone,
        userName: user?.displayName || 'Guest',
        tourId: tour.id,
        tourName: tour.name,
        destination: tour.destination,
        amount: totalAmount,
        advancePaid: 0,
        balanceDue: balanceAmount,
        guests,
        bookingDate: new Date().toISOString(),
        travelDate: tour.departureDate,
        returnDate: tour.endDate,
        status: 'pending',
        paymentStatus: 'pending_advance',
      })

      // Create payment record for advance
      const paymentId = await createPayment({
        orderId,
        userId: user?.uid || null,
        amount: advanceAmount,
        totalAmount,
        balanceAmount,
        status: 'pending',
        method: 'razorpay',
        type: 'advance',
      })

      const keyId = RAZORPAY_KEY_ID
      if (!keyId) {
        setPaymentError('Payment is not configured. Please contact support.')
        setSubmitting(false)
        return
      }

      // Create Razorpay order for advance amount only
      const apiUrl = `${API_BASE}/api/razorpay/create-order`
      console.log('Calling API:', apiUrl)
      const createOrderRes = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: advanceAmount,
          receipt: orderId,
          tourName: tour.name,
        }),
      })
      console.log('API Response status:', createOrderRes.status)
      const createOrderText = await createOrderRes.text()
      let createOrderData = {}
      try {
        createOrderData = createOrderText ? JSON.parse(createOrderText) : {}
      } catch (_) {
        createOrderData = {}
      }
      if (!createOrderRes.ok) {
        setPaymentError(createOrderData.error || (createOrderRes.status === 404 ? 'Payment API not found. For local dev, set VITE_API_BASE_URL in .env to your Vercel URL and restart.' : 'Could not create payment.'))
        setSubmitting(false)
        return
      }

      // Open Razorpay checkout
      const response = await openRazorpayCheckout({
        keyId,
        orderId: createOrderData.orderId,
        amount: createOrderData.amount,
        currency: createOrderData.currency || 'INR',
        name: 'HM Orbit Tours',
        description: `${tour.name} — Advance Payment (50%)`,
        prefillEmail: email,
        prefillContact: phone,
      })

      // Verify payment
      const verifyRes = await fetch(`${API_BASE}/api/razorpay/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      })
      const verifyText = await verifyRes.text()
      let verifyData = {}
      try {
        verifyData = verifyText ? JSON.parse(verifyText) : {}
      } catch (_) {
        verifyData = {}
      }
      if (!verifyData.success) {
        setPaymentError('Payment verification failed. Please contact support with your order details.')
        setSubmitting(false)
        return
      }

      // Update payment and order status
      await updatePayment(paymentId, {
        status: 'completed',
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
      })
      await updateOrderStatus(orderId, 'confirmed')

      // Send WhatsApp notification to admin AFTER successful payment
      const whatsappMessage = `🎯 NEW BOOKING CONFIRMED

👤 Guest: ${user?.displayName || 'Guest'}
📧 Email: ${email}
📱 Phone: ${phone}

✈️ Trip: ${tour.name}
📍 Destination: ${tour.destination}
👥 Guests: ${guests}
📅 Booking Date: ${new Date().toLocaleDateString('en-IN')}
🗓️ Travel Date: ${formatDateShort(tour.departureDate)}
🏠 Return Date: ${formatDateShort(tour.endDate)}
⏱️ Duration: ${tour.nights} Nights / ${tour.nights + 1} Days

💰 Total Amount: ₹${totalAmount.toLocaleString('en-IN')}
💳 Paid: ₹${advanceAmount.toLocaleString('en-IN')}
📌 Balance: ₹${balanceAmount.toLocaleString('en-IN')} (Due by ${formatDateShort(balanceDueDate)})

Status: Advance Payment Received ✅`

      // Send to primary number
      sendWhatsAppMessage(PRIMARY_NUMBER, whatsappMessage)

      // Store booking data for success screen
      setBookingData({
        orderId,
        totalAmount,
        advancePaid: advanceAmount,
        balanceAmount,
        balanceDueDate,
        guests,
        email,
        phone,
      })
      
      setSubmitted(true)
    } catch (err) {
      if (err?.message === 'Payment closed') {
        setPaymentError('Payment was cancelled.')
      } else {
        setPaymentError(err?.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Group discount message
  const showGroupDiscount = guests >= 10

  if (submitted && bookingData) {
    return (
      <section id="book" className="py-12 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-neutral-950 mb-4">Booking Confirmed!</h2>
          <p className="text-neutral-600 mb-8">Thank you for choosing HM Orbit Tours. Your journey awaits!</p>
          
          <div className="bg-neutral-50 rounded-xl p-6 max-w-md mx-auto text-left">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Booking ID</span>
                <span className="font-medium">#{bookingData.orderId.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Guests</span>
                <span className="font-medium">{bookingData.guests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Amount</span>
                <span className="font-medium">₹{bookingData.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Paid (50%)</span>
                <span className="font-medium">₹{bookingData.advancePaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-amber-600">
                <span>Balance Due</span>
                <span className="font-medium">₹{bookingData.balanceAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-3 border-t border-neutral-200">
                <span className="text-neutral-500">Balance Due Date:</span>
                <p className="font-medium text-neutral-900">{formatDateShort(bookingData.balanceDueDate)}</p>
                <p className="text-xs text-neutral-500 mt-1">(7 days before travel)</p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-neutral-500 mt-6">Confirmation sent to {bookingData.email}</p>
        </div>
      </section>
    )
  }

  return (
    <section id="book" className="py-12 md:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-neutral-950 mb-4 text-center">
          Complete Your Reservation
        </h2>
        
        {/* Group Discount Notice */}
        {showGroupDiscount && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-amber-800 text-sm font-medium text-center">
              🎉 Group Discount Available!<br />
              <span className="text-amber-700">Contact us for special rates:</span><br />
              <a href={`tel:+91${PRIMARY_NUMBER}`} className="text-amber-900 font-bold text-lg">{PRIMARY_NUMBER}</a>
              <span className="text-amber-600 text-xs block mt-1">Alternative: {ALTERNATIVE_NUMBER}</span>
            </p>
          </div>
        )}
        
        {/* Cancellation Policy */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 max-w-md mx-auto">
          <p className="text-blue-700 text-xs text-center">
            ℹ️ Cancellation Policy: 10% cancellation charges apply
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Number of Guests</label>
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value) || 1)}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Price Summary */}
          <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Total Trip Cost</span>
              <span className="font-medium">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span>Advance Required (50%)</span>
              <span className="font-semibold">₹{advanceAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-200">
              <span>Balance Due by {formatDateShort(balanceDueDate)}</span>
              <span>₹{balanceAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {paymentError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{paymentError}</p>
          )}

          <button 
            type="submit" 
            disabled={submitting} 
            className="btn-gradient w-full py-4 rounded-lg disabled:opacity-50 font-medium"
          >
            {submitting ? 'Processing…' : `Pay ₹${advanceAmount.toLocaleString('en-IN')} (50%)`}
          </button>
          
          <p className="text-xs text-neutral-500 text-center">
            🔒 Secured by Razorpay
          </p>
        </form>
      </div>
    </section>
  )
}

export default function Itinerary() {
  const { id } = useParams()
  const { tour: tourFromHook, loading: tourLoading } = useTourById(id)
  const tour = tourFromHook || (id ? getTourById(id) : null)
  const { user } = useAuth()

  // Load all tours to provide context for recommendations
  const { tours: allTours } = useTours()
  const toursForRecommendations = allTours.length > 0 ? allTours : [tour]

  // Get CRM recommendations
  const {
    recommendations,
    trendingTours,
    recentlyViewed,
    loading: recommendationsLoading
  } = useCRMRecommendations(toursForRecommendations, {
    limit: 6,
    includeTrending: true,
    includeRecent: false
  })

  if (tourLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 pt-20">
        <p className="text-neutral-600">Loading…</p>
      </div>
    )
  }
  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 pt-20">
        <div className="text-center">
          <h1 className="font-display text-2xl text-neutral-950">Tour not found</h1>
          <Link to="/" className="mt-4 inline-block btn-gradient">Back to Tours</Link>
        </div>
      </div>
    )
  }

  const formatDate = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }
  const formatDateShort = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  const formatPrice = (n) => `₹${(n / 1000).toFixed(0)}K`
  const routeLabel = tour.ports?.length ? tour.ports.join(' - ') : `${tour.origin} - ${tour.destination}`
  const nightsDays = `${tour.nights}N/${tour.nights + 1}D`
  const vibe = getVibe(tour)
  const isCold = vibe === 'cold'

  return (
    <div className={`vibe-${vibe} min-h-screen`}>
      {/* Hero - destination themed with parallax & vibe overlay */}
      <section className="relative min-h-[55vh] sm:min-h-[65vh] md:min-h-[75vh] flex items-end overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: '#4f46e5' }}  // Default background color to fill space
        >
          <img
            src={tour.image}
            alt={tour.name}
            className="w-full h-full object-contain"
            style={{ 
              objectPosition: 'top center',
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
          <div className="absolute inset-0 hero-overlay-vibe" />
        </div>
        {/* Snowflakes for cold destinations */}
        {isCold && (
          <div className="snowflakes" aria-hidden>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="snowflake" />
            ))}
          </div>
        )}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Upcoming Tours
          </Link>
          <p className="text-white/80 font-medium uppercase tracking-wider text-sm mb-2 accent-text">
            {tour.tagline}
          </p>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight max-w-4xl drop-shadow-lg">
            {tour.name}
          </h1>
          <div className="mt-4 md:mt-6 flex flex-wrap gap-x-4 gap-y-1 md:gap-6 text-white/90 text-sm md:text-base">
            <span>Departs {formatDate(tour.departureDate)}</span>
            <span className="hidden sm:inline">•</span>
            <span>{tour.nights} Night{tour.nights > 1 ? 's' : ''}</span>
            <span className="hidden sm:inline">•</span>
            <span>{tour.origin} → {tour.destination}</span>
          </div>
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
            <p className="font-display text-xl md:text-3xl font-semibold text-white">
              From {formatPrice(tour.pricePerGuest)}
              <span className="text-base md:text-lg font-body font-normal text-white/80 ml-2">per guest</span>
            </p>
            <a href="#book" className="btn-gradient min-h-[44px] md:min-h-0 inline-flex items-center justify-center w-full sm:w-auto">
              Book Now
            </a>
          </div>
        </div>
      </section>

      {/* Trip summary strip - vibe tint */}
      <section className="section-bg-vibe border-b border-neutral-200 shadow-sm">
        <ScrollReveal variant="slideUp" duration={600}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-neutral-950">
                {routeLabel} {nightsDays}
              </h2>
              <p className="text-sm">
                <span className="text-pink-600 font-medium">Embarkation: {formatDateShort(tour.departureDate)}</span>
                {' · '}
                <span className="text-pink-600 font-medium">Disembarkation: {tour.endDate ? formatDateShort(tour.endDate) : '—'}</span>
              </p>
              <p className="text-sm text-neutral-600">
                Route: {tour.ports?.join(' | ') || `${tour.origin} | ${tour.destination}`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-left md:text-right w-full sm:w-auto">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Starting From</p>
                <p className="font-display text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                  ₹{tour.pricePerGuest?.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-neutral-500">Excl. GST Per Person in Double Occupancy</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <a href="#book" className="btn-gradient text-sm py-3 md:py-2.5 px-5 min-h-[44px] md:min-h-0 inline-flex items-center justify-center">
                  View Packages
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm min-h-[44px] md:min-h-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Change Itinerary
                </Link>
              </div>
            </div>
          </div>
          {/* Gallery thumbnails - 3 preview images */}
          {(tour.galleryThumbnails || tour.highlightImages?.slice(0, 3) || []).length > 0 && (
            <div className="flex gap-4 mt-6 pt-6 border-t border-neutral-100 overflow-x-auto">
              {(tour.galleryThumbnails || tour.highlightImages?.slice(0, 3)).map((src, i) => (
                <div key={i} className="flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                  <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

        </div>
        </ScrollReveal>
      </section>

      {/* Your Trip Highlight - Auto-sliding Carousel */}
      <section className="py-10 md:py-16 bg-white border-y border-neutral-200">
        <ScrollReveal variant="slideUp" staggerIndex={1} duration={600}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-6 md:mb-8">
            Your Trip Highlight
          </h2>
          <ImageCarousel images={tour.highlightImages || []} />
        </div>
        </ScrollReveal>
      </section>

      {/* About Destination - Collapsible section with destination details */}
      <section id="about-destination">
        <AboutDestination data={tour.aboutDestination} destination={tour.destination} />
      </section>

      {/* Expert Advisor - Compact Premium Section */}
      <section className="py-6 md:py-8 bg-gradient-to-b from-cyan-50 to-cyan-100">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="text-center mb-4">
            <h3 className="font-display text-lg md:text-xl font-semibold text-cyan-900">
              Need Expert Advice?
            </h3>
            <p className="text-cyan-600 text-xs mt-1">
              Talk to our travel experts for personalized recommendations
            </p>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 mb-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <a href={`tel:+91${PRIMARY_NUMBER}`} className="flex items-center gap-2 text-white text-2xl font-bold hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {PRIMARY_NUMBER}
                </a>
              </div>
              <div className="flex gap-1.5">
                <a href={`tel:+91${PRIMARY_NUMBER}`} className="flex items-center justify-center w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors" title="Call">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </a>
                <a href={`sms:+91${PRIMARY_NUMBER}`} className="flex items-center justify-center w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors" title="SMS">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </a>
                <a href={`https://wa.me/91${PRIMARY_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors" title="WhatsApp">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg px-4 py-2.5 flex items-center justify-between shadow-sm border border-cyan-200">
            <div className="flex items-center gap-2">
              <a href={`tel:+91${ALTERNATIVE_NUMBER}`} className="text-cyan-700 text-sm font-medium hover:text-cyan-900 transition-colors">
                {ALTERNATIVE_NUMBER}
              </a>
            </div>
            <div className="flex gap-1">
              <a href={`tel:+91${ALTERNATIVE_NUMBER}`} className="text-cyan-500 hover:text-cyan-700 p-1.5 rounded hover:bg-cyan-100 transition-colors" title="Call">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </a>
              <a href={`sms:+91${ALTERNATIVE_NUMBER}`} className="text-cyan-500 hover:text-cyan-700 p-1.5 rounded hover:bg-cyan-100 transition-colors" title="SMS">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </a>
              <a href={`https://wa.me/91${ALTERNATIVE_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-700 p-1.5 rounded hover:bg-cyan-100 transition-colors" title="WhatsApp">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Itinerary - Day wise details */}
      <section id="itinerary" className="py-10 md:py-16 section-bg-vibe border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="slideLeft" duration={500}>
          <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-1">
            Itinerary
          </h2>
          <p className="text-neutral-600 text-sm mb-8">Day wise details of your package</p>

          <div className="relative space-y-0">
            {/* Timeline line (optional vertical connector) */}
            <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-200 via-blue-100 to-transparent hidden sm:block" aria-hidden />

            {tour.itinerary.map((day, i) => (
              <div key={day.day} className="relative flex gap-4 sm:gap-6 pb-8 last:pb-0">
                {/* Day number - prominent circle */}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-display text-base font-bold shadow-lg ring-4 ring-white">
                  {day.day}
                </div>

                {/* Day content card */}
                <div className="flex-1 min-w-0 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      Day {day.day}
                    </span>
                    <span className="text-neutral-300">·</span>
                    <h3 className="font-display text-lg md:text-xl font-semibold text-neutral-900 break-words">
                      {day.port}
                    </h3>
                  </div>
                  {day.subtitle && (
                    <p className="mt-1.5 text-emerald-600 text-sm font-medium break-words">
                      {day.subtitle}
                    </p>
                  )}
                  <p className="mt-3 text-neutral-600 text-sm leading-relaxed break-words max-w-3xl">
                    {day.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Shore Excursions */}
      {(tour.shoreExcursionImages || []).length > 0 && (
        <section className="py-16 bg-neutral-50 border-y border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-2 inline-flex items-center gap-2">
              Shore Excursions
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-300 text-neutral-600 text-xs" title="Information">i</span>
            </h2>
            <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
              {tour.shoreExcursionImages.map((src, i) => (
                <div key={i} className="flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                  <img src={src} alt={`Shore excursion ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <Link to="#itinerary" className="inline-flex items-center gap-1 mt-4 text-blue-600 font-medium text-sm hover:text-blue-700">
              View Full Itinerary
              <span className="text-lg">&gt;</span>
            </Link>
          </div>
        </section>
      )}

      {/* Inclusions + Entertainment Shows - two columns */}
      <section className="py-10 md:py-16 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Inclusions */}
            <div>
              <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-6">
                Inclusions
              </h2>
              <ul className="space-y-3">
                {(tour.inclusions || []).map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-neutral-700">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              {(tour.inclusions || []).length === 0 && (
                <p className="text-neutral-500 text-sm">Inclusions will be updated soon. Contact us for details.</p>
              )}
              {tour.inclusionNote && (
                <p className="mt-4 text-neutral-500 text-sm">{tour.inclusionNote}</p>
              )}
              <a href="#inclusions" className="inline-flex items-center gap-1 mt-4 text-blue-600 font-medium text-sm hover:text-blue-700">
                View Inclusions & Exclusions
                <span className="text-lg">&gt;</span>
              </a>
            </div>

            {/* Entertainment Shows */}
            <div>
              <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-6">
                Entertainment Shows
              </h2>
              {(tour.entertainmentShows || []).length > 0 ? (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        <th className="text-left py-3 px-4 font-semibold text-neutral-950">Entertainment Shows</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-950">{tour.nights} Night</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tour.entertainmentShows.map((show, i) => (
                        <tr key={i} className="border-b border-neutral-100 last:border-0">
                          <td className="py-3 px-4 text-neutral-700">{show.name}</td>
                          <td className="py-3 px-4">
                            {show.available ? (
                              <span className="text-emerald-500" aria-label="Available">
                                <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            ) : (
                              <span className="text-red-500" aria-label="Not available">
                                <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Entertainment schedule available on board.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Book CTA + form (creates order & payment for admin) */}
      <BookSection tour={tour} formatPrice={formatPrice} formatDateShort={formatDateShort} />

      {/* CRM Recommendations - Personalized for logged-in users */}
      {user && (
        <section className="py-12 md:py-16 bg-gradient-to-b from-white to-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              {/* Recently Viewed Section */}
              {recentlyViewed && recentlyViewed.length > 0 && (
                <div className="mb-12">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
                    Recently Viewed
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentlyViewed.map((recTour, index) => (
                      <ScrollReveal key={recTour.id} variant="slideUp" staggerIndex={index} duration={400}>
                        <TourCard tour={recTour} />
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended For You Section */}
              {recommendations && recommendations.length > 0 && (
                <div className="mb-12">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
                    Recommended For You
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((recTour, index) => (
                      <ScrollReveal key={recTour.id} variant="slideUp" staggerIndex={index} duration={400}>
                        <TourCard tour={recTour} />
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Now Section */}
              {trendingTours && trendingTours.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
                    Trending Now
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingTours.map((recTour, index) => (
                      <ScrollReveal key={recTour.id} variant="slideUp" staggerIndex={index} duration={400}>
                        <TourCard tour={recTour} />
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
