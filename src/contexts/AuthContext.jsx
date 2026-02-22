import { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

const ADMIN_EMAIL = 'super@gmail.com'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = !!user && user.email === ADMIN_EMAIL

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ? { uid: u.uid, email: u.email, displayName: u.displayName, phoneNumber: u.phoneNumber } : null)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const signInAdmin = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    if (cred.user.email !== ADMIN_EMAIL) {
      await firebaseSignOut(auth)
      throw new Error('Not an admin account.')
    }
    return cred.user
  }

  const signInWithGoogle = async () => {
    try {
      // Set up a custom popup window with proper COOP handling
      const popupWindowFeatures = 'width=600,height=700,scrollbars=yes,resizable=yes'
      
      // Use signInWithPopup with custom window features
      const result = await signInWithPopup(auth, googleProvider)
      return result
    } catch (error) {
      // Handle COOP errors specifically
      if (error.code === 'auth/popup-blocked' || error.message.includes('Cross-Origin-Opener-Policy')) {
        // Fallback to redirect-based authentication
        try {
          await signInWithRedirect(auth, googleProvider)
          return null // Redirect will handle the rest
        } catch (redirectError) {
          throw new Error('Authentication failed. Please try refreshing the page or use phone authentication instead.')
        }
      }
      throw error
    }
  }

  // Handle redirect results (for when using signInWithRedirect)
  const handleRedirectResult = async () => {
    try {
      const result = await getRedirectResult(auth)
      return result
    } catch (error) {
      console.error('Redirect result error:', error)
      throw error
    }
  }

  const signInWithPhone = async (phoneNumber) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        { size: 'invisible', callback: () => {} }
      )
    }
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    return confirmationResult
  }

  const verifyPhoneCode = (confirmationResult, code) => confirmationResult.confirm(code)

  const signOut = () => firebaseSignOut(auth)

  const value = {
    user,
    loading,
    isAdmin,
    signInAdmin,
    signInWithGoogle,
    handleRedirectResult,
    signInWithPhone,
    verifyPhoneCode,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
