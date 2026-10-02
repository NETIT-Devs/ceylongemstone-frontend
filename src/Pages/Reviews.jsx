import { useState } from "react";
import {
  FaEnvelope,
  FaFacebookF,
  FaHeart,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShoppingBag,
  FaSearch,
  FaStar,
  FaWhatsapp
} from "react-icons/fa";
import CollectionDrawerPanel from "../components/CollectionDrawerPanel.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import SiteInquiryModal from "../components/SiteInquiryModal.jsx";
import { useCustomerReviews } from "../useCustomerReviews.js";
import { useSharedCollection } from "../useSharedCollection.js";
import "./About.css";
import "./Reviews.css";

const Reviews = () => {
  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", email: "", rating: 5, comment: "" });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [customerReviews, setCustomerReviews] = useCustomerReviews();

  return (
    <div className="reviews-page">
      <nav className="about-navbar reviews-page-navbar">
        <a href="/" className="about-navbar-logo">
          <img src="/logo.png" alt="Ceylon Royal Gemstones" />
          <div className="about-logo-text"><span>CEYLON</span><small>ROYAL GEMSTONES</small></div>
        </a>
        <div className="about-nav-links">
          <a href="/">Home</a>
          <a href="/gemstones">Gemstones</a>
          <a href="/About">Heritage</a>
          <a href="/trust">Certification</a>
          <a href="/reviews" className="active">Reviews</a>
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
          <button type="button" className="about-inquire-btn" onClick={() => setIsInquiryOpen(true)}>
            INQUIRE NOW
          </button>
        </div>
      </nav>

      <main>
        {/* Dark Hero Header Section */}
        <section className="about-hero reviews-page-hero">
          <div className="hero-overlay"></div>
          <div className="about-hero-content">
            <div className="hero-logo-wrapper">
              <img
                src="/logo.png"
                alt="Ceylon Royal Gemstones Logo"
                className="hero-bright-logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://cdn-icons-png.flaticon.com/512/3063/3063822.png";
                }}
              />
              <div className="logo-glow-effect"></div>
            </div>

            <span className="gold-subtitle">COLLECTOR TESTIMONIALS</span>

            <h1>Reviews from Collectors</h1>

            <p>
              Authentic thoughts and experiences from gemstone collectors and buyers around the world.
            </p>

            <div className="about-gold-line"></div>
          </div>
        </section>

        <section className="reviews-page-content" aria-label="Collector reviews">
          <div className="reviews-page-summary">
            <span className="reviews-page-summary-stars" aria-label="5 out of 5 stars">
              {[...Array(5)].map((_, index) => <FaStar key={index} />)}
            </span>
            <span>Collector experiences</span>
          </div>

          <div className="reviews-page-grid">
            {customerReviews.map((review) => (
              <article className="reviews-page-card" key={review.id}>
                <div className="reviews-page-card-top">
                  <span className="reviews-page-stars" aria-label={`${review.rating} out of 5 stars`}>
                    {[...Array(review.rating)].map((_, index) => <FaStar key={index} />)}
                  </span>
                  <span className="reviews-page-mark" aria-hidden="true">“</span>
                </div>
                <p className="reviews-page-comment">{review.comment}</p>
                <div className="reviews-page-author">
                    {review.avatar ? (
                      <img src={review.avatar} alt={`${review.name}, collector`} />
                    ) : (
                      <span className="reviews-page-avatar-fallback" aria-hidden="true">
                        {review.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  <div>
                    <strong>{review.name}</strong>
                    <span><FaMapMarkerAlt /> {review.location}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* REVIEW FORM */}
        <section className="review-form-section" aria-label="Submit a review">
          <div className="review-form-container">
            <div className="review-form-header">
              <span className="review-form-subtitle">SHARE YOUR EXPERIENCE</span>
              <h2>Write a Review</h2>
              <div className="review-form-divider"></div>
            </div>

            {reviewSubmitted ? (
              <div className="review-success-message">
                <FaStar />
                <h3>Thank You!</h3>
                <p>Your review has been submitted successfully.</p>
                <button
                  type="button"
                  className="review-submit-btn"
                  onClick={() => {
                    setReviewSubmitted(false);
                    setReviewForm({ name: "", email: "", rating: 5, comment: "" });
                  }}
                >
                  Write Another Review
                </button>
              </div>
            ) : (
              <form
                className="review-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setCustomerReviews((previous) => [{
                    ...reviewForm,
                    id: `review-${Date.now()}`,
                    name: reviewForm.name.trim(),
                    email: reviewForm.email.trim(),
                    location: "Collector submission",
                    avatar: "",
                    createdAt: new Date().toISOString()
                  }, ...previous]);
                  setReviewSubmitted(true);
                }}
              >
                <div className="review-form-group">
                  <label htmlFor="review-name">Your Name</label>
                  <input
                    id="review-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="review-form-group">
                  <label htmlFor="review-email">Email Address</label>
                  <input
                    id="review-email"
                    type="email"
                    placeholder="Enter your email"
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="review-form-group">
                  <label>Rating</label>
                  <div className="review-rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`review-star-btn ${reviewForm.rating >= star ? "active" : ""}`}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="review-form-group">
                  <label htmlFor="review-comment">Your Review</label>
                  <textarea
                    id="review-comment"
                    placeholder="Share your experience with our gemstones..."
                    rows="5"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="review-submit-btn">
                  SUBMIT REVIEW
                </button>
              </form>
            )}
          </div>
        </section>
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
            <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" className="footer-whatsapp"><FaWhatsapp /> WhatsApp</a>
            <a href="#"><FaMapMarkerAlt /> Ratnapura, Sri Lanka</a>
          </div>
          <div>
            <h4>FOLLOW US</h4>
            <p>Follow our journey and discover the world of Ceylon gemstones.</p>
            <div className="footer-social-icons">
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" className="footer-whatsapp-icon" aria-label="WhatsApp"><FaWhatsapp /></a>
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
      {isInquiryOpen && <SiteInquiryModal source="Reviews" onClose={() => setIsInquiryOpen(false)} />}
    </div>
  );
};

export default Reviews;