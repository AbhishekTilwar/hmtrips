// Razorpay: verify payment signature (server-only)
// POST body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }

import crypto from 'node:crypto'

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

  if (!RAZORPAY_KEY_SECRET) {
    json(res, 500, { error: 'Razorpay secret not configured' })
    return
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      json(res, 400, { error: 'Missing payment details' })
      return
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(body).digest('hex')
    const valid = expected === razorpay_signature

    json(res, 200, {
      success: valid,
      razorpayPaymentId: valid ? razorpay_payment_id : undefined,
    })
  } catch (e) {
    json(res, 500, { error: e.message || 'Server error' })
  }
}
