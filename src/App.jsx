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
import { hasAdminAccess, readAdminSession } from './adminAccess.js';
import './components/SiteFooter.css';
import './components/SiteHeader.css';
import './components/InquiryModal.css';

function App() {
  const currentPage = window.location.pathname.toLowerCase();
  const currentHash = window.location.hash.toLowerCase();
  const query = new URLSearchParams(window.location.search);

  if (currentPage === '/admin-access') {
    window.location.href = '/admin';
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

  // My Orders Page (Accessible directly or after login)
  if (currentPage === '/my-orders' || currentPage === '/orders') {
    return <MyOrders />;
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
    const gem = products.find(
      (product) => product.id === Number(gemstoneDetailMatch[1])
    );

    return gem ? <GemstoneDetails gem={gem} /> : <Home />;
  }

  // Gemstones (Home) Page
  if (currentPage === '/gemstones' || currentHash === '#gemstones') {
    return <Gemstones />;
  }

  // Default Page (Home එක පෙන්වයි)
  return <Home />;
}

export default App;