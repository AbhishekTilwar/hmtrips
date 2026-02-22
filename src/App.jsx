import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import SplashScreen from "./components/SplashScreen";
import NetworkStatus from "./components/NetworkStatus";

// Import recommendation and analytics services
import { enhancedRecommendationEngine } from "./services/enhancedRecommendationEngine";
import { recommendationAnalytics } from "./services/recommendationAnalytics";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Component to handle Firebase redirect results
function AuthRedirectHandler() {
  const { handleRedirectResult } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check if this is a redirect callback from Firebase
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.has("state") && urlParams.has("mode")) {
      // This is likely a Firebase redirect callback
      handleRedirectResult()
        .then((result) => {
          if (result) {
            console.log("Redirect sign-in successful:", result.user);
          }
        })
        .catch((error) => {
          console.error("Redirect sign-in error:", error);
          // Redirect to home or show error
        });
    }
  }, [location, handleRedirectResult]);

  return null;
}

import SiteLayout from "./components/SiteLayout";
import UpcomingTours from "./pages/UpcomingTours";
import ExploreTrips from "./pages/ExploreTrips";
import Itinerary from "./pages/Itinerary";
import Watchlist from "./pages/Watchlist";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTrips from "./pages/admin/AdminTrips";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPayments from "./pages/admin/AdminPayments";

const SPLASH_DURATION_MS = 2500;
const SPLASH_FADEOUT_MS = 500;

function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashRemoved, setSplashRemoved] = useState(false);

  // Initialize recommendation engines on app start
  useEffect(() => {
    console.log("Initializing Netflix-style recommendation system...");

    // Preload recommendation engines if needed
    // This could include initializing ML models, warming caches, etc.
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSplashVisible(false), SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!splashVisible) {
      const t = setTimeout(() => setSplashRemoved(true), SPLASH_FADEOUT_MS);
      return () => clearTimeout(t);
    }
  }, [splashVisible]);

  return (
    <AuthProvider>
      <NetworkStatus />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
      <ScrollToTop />
      <AuthRedirectHandler />
      {!splashRemoved && <SplashScreen visible={splashVisible} />}
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="trips" element={<AdminTrips />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>
        <Route path="/" element={<SiteLayout />}>
          <Route index element={<UpcomingTours />} />
          <Route path="itinerary/:id" element={<Itinerary />} />
          <Route path="explore-trips" element={<ExploreTrips />} />
          <Route path="watchlist" element={<Watchlist />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
