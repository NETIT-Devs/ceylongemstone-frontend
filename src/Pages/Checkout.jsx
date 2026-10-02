import { useState } from "react";
import {
  FaArrowLeft,
  FaEnvelope,
  FaFacebookF,
  FaHeart,
  FaInstagram,
  FaLock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSearch,
  FaShoppingBag,
  FaTimes,
  FaWhatsapp
} from "react-icons/fa";
import { useSharedCollection } from "../useSharedCollection.js";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import "./Checkout.css";

const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });

const Checkout = () => {
  const [wishlist] = useSharedCollection("ceylon-wishlist");
  const [cart] = useSharedCollection("ceylon-cart");
  const [notice, setNotice] = useState("");
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * (Number(item.quantity) || 1),
    0
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    setNotice("Payment is not connected yet. Your order has not been charged.");
  };

  const handleInquirySubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const inquiry = [
      "Gemstone inquiry from the checkout page",
      `Name: ${formData.get("name")}`,
      `Email: ${formData.get("email")}`,
      `Phone: ${formData.get("phone")}`,
      `Inquiry: ${formData.get("message")}`
    ].join("\n");

    window.open(
      `https://wa.me/94712345678?text=${encodeURIComponent(inquiry)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setIsInquiryOpen(false);
  };

  return (
    <div className="checkout-page">
      <nav className="about-navbar checkout-navbar">
        <a href="/" className="about-navbar-logo">
          <img src="/logo.png" alt="Ceylon Royal Gemstones" />
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
          <InternationalNavEntry />
        </div>

        <div className="about-nav-actions">
          <InternationalNavEntry mobile />
          <button
            className="about-nav-icon"
            type="button"
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
          <a
            className="about-nav-icon"
            href="/gemstones#wishlist"
            aria-label={`Open wishlist, ${wishlist.reduce((sum, item) => sum + item.quantity, 0)} items`}
            title="Wishlist"
          >
            <FaHeart />
            {wishlist.length > 0 && (
              <span className="about-badge">
                {wishlist.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </a>
          <a
            className="about-nav-icon"
            href="/gemstones#cart"
            aria-label={`Open cart, ${cart.reduce((sum, item) => sum + item.quantity, 0)} items`}
            title="Shopping Cart"
          >
            <FaShoppingBag />
            {cart.length > 0 && (
              <span className="about-badge">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </a>
          <button
            className="about-inquire-btn"
            type="button"
            onClick={() => setIsInquiryOpen(true)}
          >
            INQUIRE NOW
          </button>
        </div>
      </nav>

      <main className="checkout-content">
        <div className="checkout-main">
          <a className="checkout-back" href="/gemstones">
            <FaArrowLeft /> Continue shopping
          </a>
          <p className="checkout-eyebrow">SECURE CHECKOUT</p>
          <h1>Shipping details</h1>

          {cart.length === 0 ? (
            <div className="checkout-empty">
              <p>Your cart is empty.</p>
              <a href="/gemstones">Explore gemstones</a>
            </div>
          ) : (
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="checkout-fields">
                <label>Full name<input name="name" autoComplete="name" required /></label>
                <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
                <label>Phone<input name="phone" type="tel" autoComplete="tel" required /></label>
                <label>Country<input name="country" autoComplete="country-name" required defaultValue="Sri Lanka" /></label>
                <label className="checkout-field-wide">Street address<input name="address" autoComplete="street-address" required /></label>
                <label>City<input name="city" autoComplete="address-level2" required /></label>
                <label>Postal code<input name="postal" autoComplete="postal-code" required /></label>
              </div>
              <button className="checkout-pay" type="submit">
                <FaLock /> PAY {formatPrice(total)}
              </button>
              {notice && <p className="checkout-notice" role="status">{notice}</p>}
            </form>
          )}
        </div>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          {cart.map((item) => (
            <div className="checkout-item" key={item.productKey || item.id || item.name}>
              <img src={item.image} alt={item.name} />
              <div>
                <strong>{item.name}</strong>
                <span>Qty {Number(item.quantity) || 1}</span>
              </div>
              <b>{formatPrice(Number(item.price || 0) * (Number(item.quantity) || 1))}</b>
            </div>
          ))}
          <div className="checkout-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
          <p className="checkout-secure"><FaLock /> Your details are kept private.</p>
        </aside>
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
            <a href="mailto:info@ceylonroyalgemstones.com">
              <FaEnvelope /> info@ceylonroyalgemstones.com
            </a>
            <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer">
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
              <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" aria-label="WhatsApp">
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

      {isInquiryOpen && (
        <div
          className="about-modal-backdrop"
          onClick={() => setIsInquiryOpen(false)}
        >
          <section
            className="about-inquiry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-inquiry-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="about-modal-close"
              type="button"
              aria-label="Close inquiry form"
              onClick={() => setIsInquiryOpen(false)}
            >
              <FaTimes />
            </button>
            <img
              className="about-modal-logo"
              src="/logo.png"
              alt="Ceylon Royal Gemstones"
            />
            <span>PRIVATE GEMSTONE INQUIRY</span>
            <h3 id="checkout-inquiry-title">Contact Our Team</h3>
            <p>Send your gemstone question to our team.</p>
            <form onSubmit={handleInquirySubmit}>
              <input type="text" name="name" placeholder="Your Full Name" autoComplete="name" required />
              <input type="email" name="email" placeholder="Email Address" autoComplete="email" required />
              <input type="tel" name="phone" placeholder="WhatsApp / Phone Number" autoComplete="tel" required />
              <textarea name="message" placeholder="Tell us about your requirements..." rows="4" required />
              <button type="submit">SEND INQUIRY VIA WHATSAPP</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default Checkout;