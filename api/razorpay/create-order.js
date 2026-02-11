// Razorpay: create order (server-only; secret never exposed to client)
// POST body: { amount, receipt, tourName } — amount in INR (rupees), we convert to paise

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

function json(res, status, data) {
  res.setHeader('Content-Type', 'application/json')
  res.status(status).json(data)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' })
    return
  }

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    json(res, 500, { error: 'Razorpay keys not configured' })
    return
  }

  try {
    const { amount, receipt, tourName } = req.body || {}
    const amountNum = Number(amount)
    if (!Number.isFinite(amountNum) || amountNum < 1) {
      json(res, 400, { error: 'Invalid amount (min ₹1)' })
      return
    }
    const amountPaise = Math.round(amountNum * 100)
    const receiptStr = (receipt || '').toString().slice(0, 40) || `order_${Date.now()}`

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: receiptStr,
        notes: tourName ? { tourName: String(tourName).slice(0, 256) } : undefined,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      json(res, response.status, { error: data.error?.description || 'Razorpay order failed' })
      return
    }
    json(res, 200, { orderId: data.id, amount: data.amount, currency: data.currency })
  } catch (e) {
    json(res, 500, { error: e.message || 'Server error' })
  }
}
