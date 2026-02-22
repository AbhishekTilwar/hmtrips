import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  initializeFirestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Use Vite env vars (see .env.example). Fallback to defaults for local dev.
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ??
    "AIzaSyBuJszZZh_dirx8Z0Ge2QDA2QsHeNjIxZs",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ??
    "hmtours-febe0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "hmtours-febe0",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
    "hmtours-febe0.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "93300490763",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ??
    "1:93300490763:web:bb0f14b7f1471cf8463d0e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-RPXKZ6XR4C",
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let analytics = null;

try {
  app = initializeApp(firebaseConfig);

  // Initialize Auth
  auth = getAuth(app);

  // Initialize Firestore with NEW persistent cache API (not deprecated)
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
    ignoreUndefinedProperties: true,
  });

  // Initialize Storage
  storage = getStorage(app);

  // Initialize Analytics (only in browser and production)
  if (typeof window !== "undefined" && import.meta.env.PROD) {
    try {
      analytics = getAnalytics(app);
    } catch (analyticsError) {
      console.warn("Firebase Analytics not available:", analyticsError.message);
    }
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw new Error("Failed to initialize Firebase. Check your configuration.");
}

// Google Auth Provider with custom settings
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Network state monitoring
let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000;

// Monitor network state
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    isOnline = true;
    reconnectAttempts = 0;
    console.log("🟢 Network connection restored");

    // Notify user
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent("firebase:online"));
    }
  });

  window.addEventListener("offline", () => {
    isOnline = false;
    console.warn("🔴 Network connection lost - working offline");

    // Notify user
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent("firebase:offline"));
    }
  });
}

// Enhanced error handler for Firestore operations
export function handleFirestoreError(error, operation = "Firestore operation") {
  // Check if it's a network error
  if (
    error.message?.includes("ERR_NAME_NOT_RESOLVED") ||
    error.message?.includes("ERR_NETWORK_CHANGED") ||
    error.message?.includes("ERR_QUIC_PROTOCOL_ERROR") ||
    error.message?.includes("NETWORK_IDLE_TIMEOUT") ||
    error.code === "unavailable" ||
    !isOnline
  ) {
    console.warn(
      `${operation} failed due to network issue. Using cached data.`,
    );
    return "You're offline. Showing cached data. Changes will sync when you're back online.";
  }

  // Handle specific Firestore error codes
  switch (error.code) {
    case "permission-denied":
      console.error("Permission denied. Check Firestore security rules.");
      return "You do not have permission to perform this action.";

    case "unavailable":
      console.error("Firestore service unavailable. Using cached data.");
      return isOnline
        ? "Service temporarily unavailable. Please try again."
        : "You're offline. Changes will sync when you're back online.";

    case "unauthenticated":
      console.error("User not authenticated.");
      return "Please sign in to continue.";

    case "not-found":
      console.error("Requested document not found.");
      return "The requested item was not found.";

    case "already-exists":
      console.error("Document already exists.");
      return "This item already exists.";

    case "resource-exhausted":
      console.error("Quota exceeded.");
      return "Service quota exceeded. Please try again later.";

    case "failed-precondition":
      console.error("Operation failed due to precondition.");
      return "Operation cannot be performed at this time.";

    case "aborted":
      console.error("Operation aborted due to conflict.");
      return "Operation was cancelled due to a conflict. Please try again.";

    case "out-of-range":
      console.error("Operation out of valid range.");
      return "Invalid operation range.";

    case "unimplemented":
      console.error("Operation not implemented.");
      return "This feature is not yet available.";

    case "internal":
      console.error("Internal Firestore error.");
      return "An internal error occurred. Please try again.";

    case "deadline-exceeded":
      console.error("Operation deadline exceeded.");
      return "Operation timed out. Please check your connection and try again.";

    case "data-loss":
      console.error("Data loss detected.");
      return "Data corruption detected. Please contact support.";

    case "cancelled":
      console.error("Operation cancelled.");
      return "Operation was cancelled.";

    default:
      console.error("Unknown Firestore error:", error);
      return "An unexpected error occurred. Please try again.";
  }
}

// Retry wrapper for Firestore operations with exponential backoff
export async function retryOperation(
  operation,
  maxRetries = 3,
  initialDelay = 1000,
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const isNetworkError =
        error.code === "unavailable" ||
        error.code === "deadline-exceeded" ||
        error.message?.includes("ERR_") ||
        !isOnline;

      if (isLastAttempt) {
        // On last attempt, throw with friendly message
        throw new Error(handleFirestoreError(error, "Operation"));
      }

      // Only retry on network errors
      if (isNetworkError) {
        const delay = initialDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(
          `Retry attempt ${attempt}/${maxRetries} after ${delay}ms (network error)`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // For non-network errors, don't retry
        throw error;
      }
    }
  }
}

// Check connection status
export function isFirebaseConnected() {
  return isOnline;
}

// Wait for network to be online
export function waitForOnline(timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (isOnline) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(
        new Error("Timeout waiting for network connection. Working offline."),
      );
    }, timeout);

    const handleOnline = () => {
      cleanup();
      resolve(true);
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
    }
  });
}

// Graceful operation wrapper that handles network issues
export async function gracefulOperation(operation, fallbackValue = null) {
  try {
    return await retryOperation(operation, 2, 500);
  } catch (error) {
    console.warn("Operation failed, using fallback:", error.message);
    return fallbackValue;
  }
}

// Network status hook helper
export function onNetworkStatusChange(callback) {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

// Export initialized services
export { auth, db, storage, analytics };
export default app;
