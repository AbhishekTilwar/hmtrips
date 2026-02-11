/**
 * Load Razorpay Checkout script and open payment modal.
 * Key ID is safe to use in frontend; secret stays on server (create-order API).
 */
const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

function loadScript() {
  return new Promise((resolve, reject) => {
    if (typeof window.Razorpay !== 'undefined') {
      resolve(window.Razorpay)
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}

/**
 * @param {Object} opts
 * @param {string} opts.keyId - Razorpay Key ID (from env)
 * @param {string} opts.orderId - Razorpay order id from create-order API
 * @param {number} opts.amount - Amount in paise (from API response)
 * @param {string} opts.currency - e.g. INR
 * @param {string} opts.name - Business name
 * @param {string} opts.description - Order description
 * @param {string} opts.prefillEmail - Optional
 * @param {string} opts.prefillContact - Optional
 * @param {function} opts.handler - (response) => void, response has razorpay_payment_id, razorpay_order_id, razorpay_signature
 */
export async function openRazorpayCheckout(opts) {
  const Razorpay = await loadScript()
  return new Promise((resolve, reject) => {
    const options = {
      key: opts.keyId,
      amount: opts.amount,
      currency: opts.currency || 'INR',
      name: opts.name || 'HM Tours',
      description: opts.description || opts.orderId || 'Trip booking',
      order_id: opts.orderId,
      prefill: {
        email: opts.prefillEmail || '',
        contact: opts.prefillContact || '',
      },
      handler(response) {
        resolve(response)
      },
      modal: {
        ondismiss() {
          reject(new Error('Payment closed'))
        },
      },
    }
    const rzp = new Razorpay(options)
    rzp.on('payment.failed', (resp) => {
      reject(new Error(resp.error?.description || 'Payment failed'))
    })
    rzp.open()
  })
}
