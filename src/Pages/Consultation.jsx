import {
  FaEnvelope,
  FaFacebookF,
  FaHeart,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSearch,
  FaShoppingBag,
  FaWhatsapp
} from "react-icons/fa";
import ConsultantBooking from "../components/ConsultantBooking.jsx";
import CollectionDrawerPanel from "../components/CollectionDrawerPanel.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import SiteInquiryModal from "../components/SiteInquiryModal.jsx";
import { useSharedCollection } from "../useSharedCollection.js";
import { useState } from "react";
import "./Consultation.css";

const Consultation = () => {
  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState(null);

  return (
    <div className="consultation-page">
      <nav className="about-navbar consultation-navbar">
        <a href="/" className="about-navbar-logo">
          <img src="/logo.png" alt="Ceylon Royal Gemstones" />
          <div className="about-logo-text"><span>CEYLON</span><small>ROYAL GEMSTONES</small></div>
        </a>
        <div className="about-nav-links">
          <a href="/">Home</a>
          <a href="/gemstones">Gemstones</a>
          <a href="/About">Heritage</a>
          <a href="/trust">Certification</a>
          <a href="/reviews">Reviews</a>
          <a href="/contact">Contact</a>
          <a href="/blog">Blog</a>
          <a href="/login">Login</a>
          <InternationalNavEntry />
        </div>
        <div className="about-nav-actions">
          <InternationalNavEntry mobile />
          <button
            type="button"
            className="about-nav-icon"
            title="Search"
            aria-label="Search gemstones"
            onClick={() => {
              const query = prompt("Search gemstones:");
              if (query) {
                window.location.href = `/?search=${encodeURIComponent(query)}`;
              }
            }}
          >
            <FaSearch />
          </button>
          <button
            type="button"
            className="about-nav-icon"
            title="Wishlist"
            aria-label={`Open wishlist, ${wishlist.reduce((sum, item) => sum + item.quantity, 0)} items`}
            onClick={() => setActiveDrawer("wishlist")}
          >
            <FaHeart />
            {wishlist.length > 0 && <span className="about-badge">{wishlist.reduce((sum, item) => sum + item.quantity, 0)}</span>}
          </button>
          <button
            type="button"
            className="about-nav-icon"
            title="Shopping Cart"
            aria-label={`Open cart, ${cart.reduce((sum, item) => sum + item.quantity, 0)} items`}
            onClick={() => setActiveDrawer("cart")}
          >
            <FaShoppingBag />
            {cart.length > 0 && <span className="about-badge">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
          </button>
          <button type="button" onClick={() => setIsInquiryOpen(true)} className="about-inquire-btn">
            INQUIRE NOW
          </button>
        </div>
      </nav>

      <main>
        <section className="consultation-video-section">
          <div className="consultation-video-frame">
            <video controls autoPlay muted loop playsInline poster="/blueGem.jpg">
              <source src="/gemV1.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
            <span className="consultation-video-caption">A closer look at Ceylon gemstone craftsmanship</span>
          </div>
          <div className="consultation-video-copy">
            <p className="consultation-eyebrow">ONE-TO-ONE ONLINE APPOINTMENT</p>
            <h1>Meet a gemstone specialist</h1>
            <p>Choose a consultation focus, share your time zone and preferred appointment time, and send a request to our team.</p>
            <a href="#specialists">Choose a specialist <span aria-hidden="true">↓</span></a>
          </div>
        </section>

        <ConsultantBooking sectionId="specialists" />
      </main>

      <footer className="about-footer">
        <div className="about-footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="Ceylon Royal Gemstones" />
              <div><strong>CEYLON</strong><small>ROYAL GEMSTONES</small></div>
            </div>
            <p>Discover the timeless beauty of authentic Sri Lankan gemstones, carefully sourced, crafted and presented with royal elegance.</p>
          </div>
          <div>
            <h4>EXPLORE</h4>
            <a href="/">Home</a>
            <a href="/gemstones">Gemstones</a>
            <a href="/About">Our Heritage</a>
            <a href="/trust">Trust &amp; Certification</a>
            <a href="/reviews">Reviews</a>
            <a href="/contact">Contact</a>
          </div>
          <div>
            <h4>CONTACT</h4>
            <a href="tel:+94712345678"><FaPhoneAlt /> +94 71 234 5678</a>
            <a href="mailto:info@ceylonroyalgemstones.com"><FaEnvelope /> info@ceylonroyalgemstones.com</a>
            <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" className="footer-whatsapp">
              <FaWhatsapp /> WhatsApp
            </a>
            <a href="#"><FaMapMarkerAlt /> Ratnapura, Sri Lanka</a>
          </div>
          <div>
            <h4>FOLLOW US</h4>
            <p>Follow our journey and discover the world of Ceylon gemstones.</p>
            <div className="footer-social-icons">
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" className="footer-whatsapp-icon" aria-label="WhatsApp">
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>
        <div className="about-footer-bottom"><p>© 2026 Ceylon Royal Gemstones. All Rights Reserved.</p><span>NATURAL • AUTHENTIC • CEYLON</span></div>
      </footer>
      <CollectionDrawerPanel
        activeDrawer={activeDrawer}
        setActiveDrawer={setActiveDrawer}
        wishlist={wishlist}
        setWishlist={setWishlist}
        cart={cart}
        setCart={setCart}
      />
      {isInquiryOpen && (
        <SiteInquiryModal source="Video Consultation" onClose={() => setIsInquiryOpen(false)} />
      )}
    </div>
  );
};

export default Consultation;