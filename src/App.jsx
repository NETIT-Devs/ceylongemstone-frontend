import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Home from './Pages/Home.jsx';
import About from './Pages/About.jsx';
import Contact from './Pages/contact.jsx';
import GemstoneDetails from './Pages/GemstoneDetail.jsx';
import Gemstones from './Pages/Gemstones.jsx';
import Jewellery from './Pages/Juwellery.jsx';
import TrustPage from './Pages/TrustPage.jsx'; // Import the Trust Page
import Checkout from './Pages/Checkout.jsx';
import Consultation from './Pages/Consultation.jsx';
import InternationalCustomers from './Pages/InternationalCustomers.jsx';
import Reviews from './Pages/Reviews.jsx';
import Blog from './Pages/Blog.jsx';
import Login from './Pages/Login.jsx';
import { ForgotPassword, ResetPassword } from './Pages/PasswordRecovery.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx';
import JoinWithUs from './Pages/JoinWithUs.jsx';
import { apiGet } from './services/api.js';
import './components/SiteFooter.css';
import './components/SiteHeader.css';
import './components/InquiryModal.css';

function InventoryGemstoneRoute({ gemstoneId }) {
  const [gemstone, setGemstone] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    apiGet(`/api/gemstones/${gemstoneId}`)
      .then(async (response) => {
        let result;
        try {
          result = await response.json();
        } catch {
          throw new Error('The gemstone service returned an invalid response.');
        }
        if (!response.ok || result.success !== true || !result.data) {
          throw new Error(result.message || 'Unable to load this gemstone.');
        }

        if (isCurrent) {
          setGemstone({
            ...result.data,
            id: Number(result.data.id),
            inventoryId: Number(result.data.id),
            productKey: `inventory-gemstone-${result.data.id}`,
            category: result.data.category_name || 'Gemstone',
            treatment: result.data.treatment_status,
            basePriceUSD: Number(result.data.price) || 0,
            stock_quantity: Number.isSafeInteger(Number(result.data.stock_quantity))
              ? Math.max(0, Number(result.data.stock_quantity))
              : 0,
            videoUrl: result.data.videoUrl || result.data.video_url,
          });
        }
      })
      .catch((requestError) => {
        console.error('Unable to load inventory gemstone:', requestError);
        if (isCurrent) {
          setError(requestError.message || 'Unable to load this gemstone.');
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [gemstoneId]);

  if (gemstone) return <GemstoneDetails key={gemstone.id} gem={gemstone} />;
  if (error) {
    return (
      <main role="alert">
        <p>Unable to load this gemstone: {error}</p>
        <a href="/gemstones">Return to the gemstone collection</a>
      </main>
    );
  }
  return <main aria-live="polite">Loading gemstone…</main>;
}

// Ensure initial default currency is USD and international mode enabled for foreign currencies
if (typeof window !== 'undefined') {
  try {
    const currentCurrency = window.localStorage.getItem('ceylon-currency');
    if (!currentCurrency) {
      window.localStorage.setItem('ceylon-currency', 'USD');
      window.localStorage.setItem('ceylon-international-enabled', 'true');
    } else if (currentCurrency === 'LKR') {
      window.localStorage.setItem('ceylon-international-enabled', 'false');
    } else {
      window.localStorage.setItem('ceylon-international-enabled', 'true');
    }
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }
}

function App() {
  const location = useLocation();
  const currentPage = location.pathname.toLowerCase();
  const currentHash = location.hash.toLowerCase();

  useEffect(() => {
    if (currentPage === '/admin-access') {
      window.location.assign('/admin');
    }
  }, [currentPage]);

  if (currentPage === '/admin-access') {
    return null;
  }

  if (currentPage === '/international') {
    return <InternationalCustomers />;
  }

  if (currentPage === '/reviews') {
    return <Reviews />;
  }

  // Blog Page
  if (currentPage === '/blog') {
    return <Blog />;
  }

  // Super Admin Dashboard (Direct Access)
  if (currentPage === '/super-admin') {
    return <AdminDashboard isSuperAdmin={true} />;
  }

  // Admin Dashboard (Direct Access)
  if (currentPage === '/admin' || currentPage === '/admin-dashboard') {
    return <AdminDashboard isSuperAdmin={false} />;
  }

  // Customer order history - requires signed in session
  if (currentPage === '/my-orders' || currentPage === '/orders') {
    return <Navigate to="/" replace />;
  }

  // Join With Us Page
  if (currentPage === '/join-us' || currentPage === '/join-with-us') {
    return <JoinWithUs />;
  }

  // Login Page
  if (currentPage === '/login') {
    return <Login />;
  }

  if (currentPage === '/forgot-password') {
    return <ForgotPassword />;
  }

  if (currentPage === '/reset-password') {
    return <ResetPassword />;
  }

  // About Page
  if (currentPage === '/about' || currentHash === '#about') {
    return <About />;
  }

  // Contact Page
  if (currentPage === '/contact' || currentHash === '#contact') {
    return <Contact />;
  }

  if (currentPage === '/checkout') {
    return <Checkout />;
  }

  if (currentPage === '/consultation') {
    return <Consultation />;
  }

  if (currentPage === '/jewellery' || currentPage === '/jewelry' || currentPage === '/juwellery') {
    return <Jewellery />;
  }

  // Trust & Certification Page
  if (currentPage === '/trust' || currentPage === '/trust-certification' || currentHash === '#trust') {
    return <TrustPage />;
  }

  const inventoryGemstoneMatch = currentPage.match(/^\/gemstones\/inventory\/(\d+)$/);
  if (inventoryGemstoneMatch) {
    return <InventoryGemstoneRoute gemstoneId={inventoryGemstoneMatch[1]} />;
  }

  const gemstoneDetailMatch = currentPage.match(/^\/gemstones\/(\d+)$/);

  if (gemstoneDetailMatch) {
    return <InventoryGemstoneRoute gemstoneId={gemstoneDetailMatch[1]} />;
  }

  // Gemstones (Home/Shop) Page
  if (currentPage === '/gemstones' || currentHash === '#gemstones' || currentPage === '/shop') {
    return <Gemstones />;
  }

  // Default page (shows the Home page)
  return <Home />;
}

export default App;