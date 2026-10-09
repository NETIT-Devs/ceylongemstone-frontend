import { useEffect } from 'react';
import Home from './Pages/Home.jsx';
import About from './Pages/About.jsx';
import Contact from './Pages/contact.jsx';
import GemstoneDetails from './Pages/GemstoneDetail.jsx';
import Gemstones, { products } from './Pages/Gemstones.jsx';
import TrustPage from './Pages/TrustPage.jsx'; // 1. Trust Page එක Import කරගන්න
import Checkout from './Pages/Checkout.jsx';
import Consultation from './Pages/Consultation.jsx';
import InternationalCustomers from './Pages/InternationalCustomers.jsx';
import Reviews from './Pages/Reviews.jsx';
import Blog from './Pages/Blog.jsx';
import Login from './Pages/Login.jsx';
import MyOrders from './Pages/MyOrders.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx';
import JoinWithUs from './Pages/JoinWithUs.jsx';
import { getApprovedGems } from './useGemSubmissions.js';
import { hasAdminAccess } from './adminAccess.js';
import './components/SiteFooter.css';
import './components/SiteHeader.css';
import './components/InquiryModal.css';

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
  const currentPage = window.location.pathname.toLowerCase();
  const currentHash = window.location.hash.toLowerCase();

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

  // Customer order history is available only to signed-in customers.
  if (currentPage === '/my-orders' || currentPage === '/orders') {
    if (hasAdminAccess('/super-admin')) {
      window.location.replace('/super-admin');
      return null;
    }
    if (hasAdminAccess('/admin')) {
      window.location.replace('/admin');
      return null;
    }

    const customerSession = (() => {
      try {
        return JSON.parse(window.localStorage.getItem('ceylon-user') || 'null');
      } catch {
        return null;
      }
    })();

    if (customerSession?.loggedIn === true) {
      return <MyOrders />;
    }

    window.location.replace('/login?redirect=%2Fmy-orders');
    return null;
  }

  // Join With Us Page
  if (currentPage === '/join-us' || currentPage === '/join-with-us') {
    return <JoinWithUs />;
  }

  // Login Page
  if (currentPage === '/login') {
    return <Login />;
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

  // Trust & Certification Page (2. නව රවුටින් කොන්දේසිය එකතු කිරීම)
  if (currentPage === '/trust' || currentPage === '/trust-certification' || currentHash === '#trust') {
    return <TrustPage />;
  }

  const gemstoneDetailMatch = currentPage.match(/^\/gemstones\/(\d+)$/);

  if (gemstoneDetailMatch) {
    const gem = [...products, ...getApprovedGems()].find(
      (product) => product.id === Number(gemstoneDetailMatch[1])
    );

    return gem ? <GemstoneDetails gem={gem} /> : <Home />;
  }

  // Gemstones (Home/Shop) Page
  if (currentPage === '/gemstones' || currentHash === '#gemstones' || currentPage === '/shop') {
    return <Gemstones />;
  }

  // Default Page (Home එක පෙන්වයි)
  return <Home />;
}

export default App;