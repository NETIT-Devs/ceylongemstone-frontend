import { useState } from 'react';
import {
  FaEnvelope,
  FaFacebookF,
  FaGem,
  FaHeart,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShoppingBag,
  FaTimes,
  FaTrash,
  FaUser,
  FaWhatsapp
} from 'react-icons/fa';
import TrustAndCertification from '../components/TrustAndCertification';
import CollectionDrawerActions from '../components/CollectionDrawerActions.jsx';
import InternationalNavEntry from '../components/InternationalNavEntry.jsx';
import { getCollectionItemKey, useSharedCollection } from '../useSharedCollection.js';
import './About.css';
import './TrustPage.css';
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";

const TrustPage = () => {
  const [wishlist, setWishlist] = useSharedCollection('ceylon-wishlist');
  const [cart, setCart] = useSharedCollection('ceylon-cart');
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const updateQuantity = (setCollection, productKey, change) => {
    setCollection((items) => items
      .map((item) => getCollectionItemKey(item) === productKey
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item)
      .filter((item) => item.quantity > 0));
  };

  return (
    <main className="trust-page-shell">
      <nav className="about-navbar" aria-label="Main navigation">
        <a href="/" className="about-navbar-logo">
          <img
            src="/logo.png"
            alt="Ceylon Royal Gemstones"
            className="navbar-logo-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://cdn-icons-png.flaticon.com/512/3063/3063822.png";
            }}
          />
          <div className="about-logo-text">
            <span>CEYLON</span>
            <small>ROYAL GEMSTONES</small>
          </div>
        </a>
        <MobileSiteMenu />
        <div className="about-nav-links">
          <a href="/">Home</a>
          <a href="/gemstones">Shop</a>
          <a href="/About">Heritage</a>
          <a href="/trust" className="active">Certification</a>
          <a href="/reviews">Reviews</a>
          <a href="/contact">Contact</a>
          <a href="/blog">Blog</a>
          <InternationalNavEntry />
        </div>
        <div className="about-nav-actions">
          <InternationalNavEntry mobile />
          <button
            type="button"
            className="about-nav-icon"
            aria-label={`Open wishlist, ${wishlist.reduce((total, item) => total + item.quantity, 0)} items`}
            title="Wishlist"
            onClick={() => setActiveDrawer('wishlist')}
          >
            <FaHeart />
            {wishlist.length > 0 && <span className="about-badge">{wishlist.reduce((total, item) => total + item.quantity, 0)}</span>}
          </button>
          <button
            type="button"
            className="about-nav-icon"
            aria-label={`Open cart, ${cart.reduce((total, item) => total + item.quantity, 0)} items`}
            title="Shopping Cart"
            onClick={() => setActiveDrawer('cart')}
          >
            <FaShoppingBag />
            {cart.length > 0 && <span className="about-badge">{cart.reduce((total, item) => total + item.quantity, 0)}</span>}
          </button>
          <button
            type="button"
            className="about-inquire-btn"
            onClick={() => setIsInquiryOpen(true)}
          >
            INQUIRE NOW
          </button>
          <a
            href="/join-us"
            className="navbar-joinus-btn"
            title="Join With Us"
          >
            <span>JOIN US</span>
          </a>
          <a
            href="/login"
            className="navbar-login-btn"
            title="Login / Register"
          >
            <FaUser />
            <span>LOGIN</span>
          </a>
        </div>
      </nav>

      <TrustAndCertification
        inquiryOpen={isInquiryOpen}
        onInquiryClose={() => setIsInquiryOpen(false)}
      />

      <footer className="about-footer">
        <div className="about-footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="Ceylon Royal Gemstones" />
              <div>
                <strong>CEYLON</strong>
                <small>ROYAL GEMSTONES</small>
              </div>
            </div>
            <p>
              Discover the timeless beauty of authentic Sri Lankan gemstones,
              carefully sourced, crafted and presented with royal elegance.
            </p>
          </div>

          <div>
            <h4>EXPLORE</h4>
            <a href="/">Home</a>
            <a href="/#gemstones">Shop</a>
            <a href="/About">Our Heritage</a>
            <a href="/trust">Trust &amp; Certification</a>
            <a href="/reviews">Reviews</a>
            <a href="/contact">Contact</a>
          </div>

          <div>
            <h4>CONTACT</h4>
            <a href="tel:+94712345678"><FaPhoneAlt /> &nbsp; +94 71 234 5678</a>
            <a href="mailto:info@ceylonroyalgemstones.com">
              <FaEnvelope /> &nbsp; info@ceylonroyalgemstones.com
            </a>
            <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" className="footer-whatsapp">
              <FaWhatsapp /> &nbsp; WhatsApp
            </a>
            <a href="#"><FaMapMarkerAlt /> &nbsp; Ratnapura, Sri Lanka</a>
          </div>

          <div>
            <h4>FOLLOW US</h4>
            <p>Follow our journey and discover the world of Ceylon gemstones.</p>
            <div className="footer-social-icons">
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a
                href="https://wa.me/94712345678"
                target="_blank"
                rel="noreferrer"
                className="footer-whatsapp-icon"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>
        <div className="about-footer-bottom">
          <p>© 2026 Ceylon Royal Gemstones. All Rights Reserved.</p>
          <span>NATURAL · AUTHENTIC · CEYLON</span>
        </div>
      </footer>

      {activeDrawer && (
        <div
          className="gem-drawer-backdrop"
          onClick={() => setActiveDrawer(null)}
        >
          <aside
            className="gem-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trust-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="gem-drawer-header">
              <h3 id="trust-drawer-title">
                {activeDrawer === 'wishlist' ? 'Wishlist' : 'Shopping Cart'}
              </h3>
              <button type="button" aria-label="Close drawer" onClick={() => setActiveDrawer(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="gem-drawer-body">
              {(activeDrawer === 'wishlist' ? wishlist : cart).length === 0 ? (
                <div className="drawer-empty">
                  <FaGem />
                  <p>Your {activeDrawer} is empty.</p>
                </div>
              ) : (
                (activeDrawer === 'wishlist' ? wishlist : cart).map((item) => (
                  <div className="drawer-item" key={getCollectionItemKey(item)}>
                    <img src={item.image} alt={item.name} />
                    <div className="gem-drawer-item-info">
                      <h4>{item.name}</h4>
                      <p>{item.carat} Ct</p>
                      <strong>${Number(item.price).toLocaleString()}</strong>
                      <p>Qty 1</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => updateQuantity(
                        activeDrawer === 'wishlist' ? setWishlist : setCart,
                        getCollectionItemKey(item),
                        -item.quantity
                      )}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              )}
            </div>
            <CollectionDrawerActions
              activeDrawer={activeDrawer}
              wishlist={wishlist}
              cart={cart}
              setWishlist={setWishlist}
              setCart={setCart}
              setActiveDrawer={setActiveDrawer}
            />
          </aside>
        </div>
      )}
    </main>
  );
};

export default TrustPage;