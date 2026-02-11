import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Use Vite env vars (see .env.example). Fallback to defaults for local dev.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyBuJszZZh_dirx8Z0Ge2QDA2QsHeNjIxZs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'hmtours-febe0.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'hmtours-febe0',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'hmtours-febe0.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '93300490763',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:93300490763:web:bb0f14b7f1471cf8463d0e',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-RPXKZ6XR4C',
}

const app = initializeApp(firebaseConfig)
let analytics = null
try {
  analytics = getAnalytics(app)
} catch (_) {}

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
export { analytics }
export default app
