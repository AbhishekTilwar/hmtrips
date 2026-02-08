import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBuJszZZh_dirx8Z0Ge2QDA2QsHeNjIxZs',
  authDomain: 'hmtours-febe0.firebaseapp.com',
  projectId: 'hmtours-febe0',
  storageBucket: 'hmtours-febe0.firebasestorage.app',
  messagingSenderId: '93300490763',
  appId: '1:93300490763:web:bb0f14b7f1471cf8463d0e',
  measurementId: 'G-RPXKZ6XR4C',
}

const app = initializeApp(firebaseConfig)
let analytics = null
try {
  analytics = getAnalytics(app)
} catch (_) {}

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
export { analytics }
export default app
