import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

const COLLECTIONS = {
  tours: 'tours',
  inquiries: 'inquiries',
  orders: 'orders',
  payments: 'payments',
  users: 'users',
}

// ——— Tours (admin CRUD) ———
export async function getToursFromFirestore() {
  try {
    const snap = await getDocs(
      query(collection(db, COLLECTIONS.tours), orderBy('departureDate', 'asc'))
    )
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (_) {
    const snap = await getDocs(collection(db, COLLECTIONS.tours))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }
}

export async function getTourByIdFromFirestore(id) {
  const ref = doc(db, COLLECTIONS.tours, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function createTour(data) {
  const ref = await addDoc(collection(db, COLLECTIONS.tours), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTour(id, data) {
  await updateDoc(doc(db, COLLECTIONS.tours, id), data)
}

export async function deleteTour(id) {
  await deleteDoc(doc(db, COLLECTIONS.tours, id))
}

// ——— Inquiries (user submits, admin views) ———
export async function createInquiry(data) {
  const {
    userId,
    userEmail,
    userPhone,
    userName,
    tourId,
    tourName,
    message,
    numberOfGuests,
    preferredDate,
    tripInterest,
    notes,
    ...rest
  } = data
  await addDoc(collection(db, COLLECTIONS.inquiries), {
    userId: userId ?? null,
    userEmail: userEmail ?? null,
    userPhone: userPhone ?? null,
    userName: userName ?? null,
    tourId: tourId ?? null,
    tourName: tourName ?? null,
    message: message ?? '',
    numberOfGuests: numberOfGuests ?? null,
    preferredDate: preferredDate ?? null,
    tripInterest: tripInterest ?? null,
    notes: notes ?? null,
    ...rest,
    createdAt: serverTimestamp(),
  })
}

export async function getInquiries() {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.inquiries), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() }))
}

// ——— Orders (user places, admin views) ———
export async function createOrder({ userId, userEmail, userPhone, userName, tourId, tourName, amount, guests, status = 'pending' }) {
  const ref = await addDoc(collection(db, COLLECTIONS.orders), {
    userId: userId || null,
    userEmail: userEmail || null,
    userPhone: userPhone || null,
    userName: userName || null,
    tourId,
    tourName,
    amount: amount || 0,
    guests: guests || 1,
    status,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getOrders() {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.orders), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() }))
}

export async function updateOrderStatus(orderId, status) {
  await updateDoc(doc(db, COLLECTIONS.orders, orderId), { status, updatedAt: serverTimestamp() })
}

// ——— Payments (user pays, admin views) ———
export async function createPayment({ orderId, userId, amount, status = 'pending', method }) {
  await addDoc(collection(db, COLLECTIONS.payments), {
    orderId,
    userId: userId || null,
    amount: amount || 0,
    status,
    method: method || 'online',
    createdAt: serverTimestamp(),
  })
}

export async function getPayments() {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.payments), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() }))
}
