import { useState, useEffect } from 'react';
import { isFirebaseConnected, onNetworkStatusChange } from '../lib/firebase';

/**
 * NetworkStatus Component
 * Shows user-friendly notifications when network connection changes
 *
 * Features:
 * - Offline notification with retry button
 * - Online notification (auto-hides after 3s)
 * - Uses cached data when offline
 * - Smooth animations
 */
export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(isFirebaseConnected());
  const [showOnlineNotification, setShowOnlineNotification] = useState(false);

  useEffect(() => {
    // Check initial status
    setIsOnline(isFirebaseConnected());

    // Listen for network status changes
    const cleanup = onNetworkStatusChange((online) => {
      setIsOnline(online);

      // Show "back online" notification briefly
      if (online) {
        setShowOnlineNotification(true);
        setTimeout(() => {
          setShowOnlineNotification(false);
        }, 3000); // Hide after 3 seconds
      }
    });

    return cleanup;
  }, []);

  // Don't render anything if online and not showing notification
  if (isOnline && !showOnlineNotification) {
    return null;
  }

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div
          className="fixed top-0 left-0 right-0 z-50 animate-slide-down"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-3 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                {/* Offline Icon */}
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                  />
                </svg>

                <div className="flex-1">
                  <p className="font-semibold text-sm">You're Offline</p>
                  <p className="text-xs opacity-90">
                    Don't worry! We're showing you cached data. Your changes will sync when you're back online.
                  </p>
                </div>
              </div>

              {/* Retry Button */}
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-1.5 bg-white text-red-600 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all flex items-center gap-2 flex-shrink-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Notification (Toast) */}
      {showOnlineNotification && isOnline && (
        <div
          className="fixed top-4 right-4 z-50 animate-slide-in-right"
          role="alert"
          aria-live="polite"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 max-w-sm">
            {/* Online Icon */}
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div>
              <p className="font-semibold">Back Online!</p>
              <p className="text-sm opacity-90">Connection restored. Syncing your data...</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowOnlineNotification(false)}
              className="flex-shrink-0 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              aria-label="Close notification"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

/**
 * Simplified NetworkStatus indicator for use in headers/footers
 */
export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(isFirebaseConnected());

  useEffect(() => {
    setIsOnline(isFirebaseConnected());

    const cleanup = onNetworkStatusChange((online) => {
      setIsOnline(online);
    });

    return cleanup;
  }, []);

  if (isOnline) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full">
      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
      <span className="font-medium">Offline</span>
    </div>
  );
}
