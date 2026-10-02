import { useState, useEffect, useRef } from "react";
import {
  FaArrowRight,
  FaEnvelope,
  FaFacebookF,
  FaGlobeAmericas,
  FaHeart,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSearch,
  FaShoppingBag,
  FaShieldAlt,
  FaShippingFast,
  FaVideo,
  FaWhatsapp
} from "react-icons/fa";
import ConsultantBooking from "../components/ConsultantBooking.jsx";
import CollectionDrawerPanel from "../components/CollectionDrawerPanel.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import SiteInquiryModal from "../components/SiteInquiryModal.jsx";
import { useSharedCollection } from "../useSharedCollection.js";
import "./InternationalCustomers.css";

const currencies = {
  USD: { symbol: "$", rate: 1, flag: "https://flagcdn.com/w40/us.png" },
  GBP: { symbol: "£", rate: 0.79, flag: "https://flagcdn.com/w40/gb.png" },
  EUR: { symbol: "€", rate: 0.92, flag: "https://flagcdn.com/w40/eu.png" },
  LKR: { symbol: "Rs ", rate: 305, flag: "https://flagcdn.com/w40/lk.png" },
  AED: { symbol: "د.إ ", rate: 3.67, flag: "https://flagcdn.com/w40/ae.png" }
};

const InternationalCustomers = () => {
  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [currency, setCurrency] = useState(() =>
    window.localStorage.getItem("ceylon-currency") || "USD"
  );
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const currencyRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const changeCurrency = (nextCurrency) => {
    window.localStorage.setItem("ceylon-currency", nextCurrency);
    window.localStorage.setItem(
      "ceylon-international-enabled",
      String(nextCurrency !== "LKR")
    );

    if (nextCurrency === "LKR") {
      window.location.assign("/");
      return;
    }

    setCurrency(nextCurrency);
  };

  const indicativePrice = (usdAmount) => {
    const selected = currencies[currency] || currencies.USD;
    return `${selected.symbol}${Math.round(usdAmount * selected.rate).toLocaleString("en-US")}`;
  };

  const wishlistCount = wishlist.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="international-page">
      <nav className="about-navbar international-navbar">
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
        <div className="about-nav-links">
          <a href="/">Home</a>
          <a href="/gemstones">Gemstones</a>
          <a href="/About">Heritage</a>
          <a href="/trust">Certification</a>
          <a href="/reviews">Reviews</a>
          <a href="/contact">Contact</a>
          <a href="/blog">Blog</a>
          <a href="/login">Login</a>
          <InternationalNavEntry active />
        </div>
        <div className="about-nav-actions international-nav-actions">
          <div className="currency-selector" ref={currencyRef}>
            <button
              type="button"
              className="currency-current"
              aria-label="Select currency"
              aria-expanded={currencyOpen}
              onClick={() => setCurrencyOpen((open) => !open)}
            >
              <img src={currencies[currency]?.flag || currencies.USD.flag} alt={currency} className="currency-flag" />
              <span className="currency-symbol">{(currencies[currency] || currencies.USD).symbol.trim()}</span>
              <span className="currency-chevron">▾</span>
            </button>
            {currencyOpen && (
              <div className="currency-dropdown">
                {Object.entries(currencies).map(([code, option]) => (
                  <button
                    type="button"
                    key={code}
                    className={`currency-option ${currency === code ? "selected" : ""}`}
                    onClick={() => {
                      changeCurrency(code);
                      setCurrencyOpen(false);
                    }}
                  >
                    <img src={option.flag} alt={code} className="currency-flag" />
                    <span>{option.symbol.trim()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <InternationalNavEntry mobile active />

          <button
            type="button"
            className={`about-nav-icon home-search-toggle ${isSearchOpen ? "is-open" : ""}`}
            title="Search"
            aria-label={isSearchOpen ? "Close gemstone search" : "Open gemstone search"}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <FaSearch />
          </button>

          <button
            type="button"
            className="about-nav-icon"
            title="Wishlist"
            aria-label={`Open wishlist, ${wishlistCount} items`}
            onClick={() => setActiveDrawer("wishlist")}
          >
            <FaHeart />
            {wishlistCount > 0 && <span className="about-badge">{wishlistCount}</span>}
          </button>

          <button
            type="button"
            className="about-nav-icon"
            title="Shopping Cart"
            aria-label={`Open cart, ${cartCount} items`}
            onClick={() => setActiveDrawer("cart")}
          >
            <FaShoppingBag />
            {cartCount > 0 && <span className="about-badge">{cartCount}</span>}
          </button>

          <button
            type="button"
            className="about-inquire-btn"
            onClick={() => setIsInquiryOpen(true)}
          >
            INQUIRE NOW
          </button>
        </div>
      </nav>

      {isSearchOpen && (
        <div className="search-bar-overlay" id="home-gemstone-search" role="search">
          <input
            type="text"
            placeholder="Search natural sapphires, rubies, emeralds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
            autoFocus
          />
          <button
            type="button"
            className="close-search-btn"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search overlay"
          >
            ✕
          </button>
        </div>
      )}

      <main>
        <section className="international-intro">
          <div className="international-intro-copy">
            <p className="international-eyebrow">INTERNATIONAL CUSTOMER DESK</p>
            <h1>Buying Ceylon gems from abroad</h1>
            <p className="international-lead">
              Get destination-specific delivery, import and gemstone guidance before you decide.
            </p>
            <a className="international-primary-link" href="#consultation">
              Request a video consultation <FaArrowRight />
            </a>
          </div>
          <figure className="international-gem-image">
            <video controls autoPlay muted loop playsInline poster="/blueGem.jpg" aria-label="Ceylon gemstone cutting and craftsmanship">
              <source src="/INv1.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
            <figcaption>Ceylon gemstone cutting and craftsmanship</figcaption>
          </figure>
        </section>

        <section className="international-currency-band" aria-label="Indicative currency display">
          <div>
            <span>DISPLAY CURRENCY</span>
            <strong>{currency}</strong>
          </div>
          <p>Example reference price</p>
          <strong className="international-price">{indicativePrice(12500)}</strong>
          <small>Indicative conversion only. Final invoice currency and amount are confirmed with your quote.</small>
        </section>

        <section className="international-services" aria-label="International customer information">
          <article className="international-service-row" id="shipping">
            <FaShippingFast aria-hidden="true" />
            <div>
              <h2>International shipping</h2>
              <p>Tracked and insured shipping options can be discussed for your destination. We confirm the carrier, cost and estimated delivery window before an order is finalized.</p>
            </div>
          </article>
          <article className="international-service-row">
            <FaGlobeAmericas aria-hidden="true" />
            <div>
              <h2>Worldwide delivery details</h2>
              <p>Share your delivery country and postal code so our team can check service availability and provide a destination-specific delivery estimate.</p>
            </div>
          </article>
          <article className="international-service-row" id="shipping-returns">
            <FaShieldAlt aria-hidden="true" />
            <div>
              <h2>Shipping &amp; return policy</h2>
              <p>Shipping terms, insurance coverage and return eligibility depend on the order and destination. Request the applicable written terms before payment.</p>
            </div>
          </article>
          <article className="international-service-row" id="customs">
            <FaGlobeAmericas aria-hidden="true" />
            <div>
              <h2>Customs &amp; import information</h2>
              <p>Import duties, taxes and customs procedures vary by country and are set by local authorities. Confirm your local requirements; charges at destination may be payable by the recipient.</p>
            </div>
          </article>
        </section>

        <section className="international-contact-band">
          <div>
            <p className="international-eyebrow">PERSONAL SUPPORT</p>
            <h2>Talk with CEYLON ROYAL GEMSTONES</h2>
            <p>Ask about a stone, shipping quote, documentation or import requirements.</p>
          </div>
          <div className="international-contact-actions">
            <a href="#consultation"><FaVideo /> Video consultation</a>
            <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer">
              <FaWhatsapp /> WhatsApp
            </a>
            <a href="mailto:info@ceylonroyalgemstones.com">
              <FaEnvelope /> Email
            </a>
            <a href="tel:+94712345678">
              <FaPhoneAlt /> Call
            </a>
          </div>
        </section>

        <ConsultantBooking sectionId="consultation" />
      </main>

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

          <div className="international-footer-column">
            <h4>EXPLORE</h4>
            <a href="/">Home</a>
            <a href="/gemstones">Gemstones</a>
            <a href="/About">Our Heritage</a>
            <a href="/trust">Trust &amp; Certification</a>
            <a href="/reviews">Reviews</a>
            <a href="/contact">Contact</a>
          </div>
          <div className="international-footer-column">
            <h4>CONTACT</h4>
            <a href="tel:+94712345678"><FaPhoneAlt /> +94 71 234 5678</a>
            <a href="mailto:info@ceylonroyalgemstones.com"><FaEnvelope /> info@ceylonroyalgemstones.com</a>
            <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" className="footer-whatsapp">
              <FaWhatsapp /> WhatsApp
            </a>
            <a href="#"><FaMapMarkerAlt /> Ratnapura, Sri Lanka</a>
          </div>
          <div className="international-footer-column">
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
          <span>NATURAL • AUTHENTIC • CEYLON</span>
        </div>
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
        <SiteInquiryModal source="International Customer" onClose={() => setIsInquiryOpen(false)} />
      )}
    </div>
  );
};

export default InternationalCustomers;