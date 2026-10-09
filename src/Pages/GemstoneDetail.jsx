import { useRef, useState } from 'react';

import {
  FaArrowLeft,
  FaChevronDown,
  FaEnvelope,
  FaFileAlt,
  FaFacebookF,
  FaHeart,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlay,
  FaSearchMinus,
  FaSearchPlus,
  FaShoppingBag,
  FaSyncAlt,
  FaUser,
  FaWhatsapp
} from 'react-icons/fa';
import './GemstoneDetail.css';
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";
import CollectionDrawerActions from '../components/CollectionDrawerActions.jsx';
import InternationalNavEntry from '../components/InternationalNavEntry.jsx';
import { formatCurrencyPrice, getCurrentCurrency } from '../currency.js';
import {
  getCollectionItemKey,
  normalizeCollectionItem,
  useSharedCollection
} from '../useSharedCollection.js';

const GemstoneDetail = ({ gem }) => {
  const [currency] = useState(getCurrentCurrency);
  const viewLabels = ['Front', 'Back', 'Right', 'Left'];
  const rawGalleryViews = Array.isArray(gem?.galleryViews) && gem.galleryViews.length > 0
    ? gem.galleryViews
    : Array.isArray(gem?.images) && gem.images.length > 0
      ? gem.images
      : gem?.image
        ? [gem.image]
        : [];
  const galleryViews = rawGalleryViews
    .map((view, index) => typeof view === 'string'
      ? { label: viewLabels[index] || `View ${index + 1}`, url: view }
      : { label: view.label || viewLabels[index] || `View ${index + 1}`, url: view.url || view.src })
    .filter((view) => view.url);
  const suppliedRotationFrames = Array.isArray(gem?.rotationFrames)
    ? gem.rotationFrames
        .map((frame) => typeof frame === 'string' ? frame : frame.url)
        .filter(Boolean)
    : [];
  const clockwiseViewLabels = ['Front', 'Right', 'Back', 'Left'];
  const galleryRotationFrames = clockwiseViewLabels
    .map((label) => galleryViews.find(
      (view) => view.label.toLowerCase() === label.toLowerCase()
    )?.url)
    .filter(Boolean);
  const rotationFrames = suppliedRotationFrames.length > 1
    ? suppliedRotationFrames
    : galleryRotationFrames.length > 1
      ? galleryRotationFrames
      : galleryViews.map((view) => view.url);
  const hasRotationFrames = rotationFrames.length > 1;

  const [activeMedia, setActiveMedia] = useState({
    type: 'image',
    url: galleryViews[0]?.url || gem?.image || ''
  });
  const [activeTab, setActiveTab] = useState('specs');
  const detailSectionRef = useRef(null);
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const dragStartX = useRef(null);

  const handleRotationPointerDown = (event) => {
    if (!is360Mode || !hasRotationFrames) return;
    dragStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleRotationPointerMove = (event) => {
    if (dragStartX.current === null || !hasRotationFrames) return;
    const deltaX = event.clientX - dragStartX.current;
    if (Math.abs(deltaX) < 12) return;

    const direction = deltaX < 0 ? 1 : -1;
    setRotationIndex((current) =>
      (current + direction + rotationFrames.length) % rotationFrames.length
    );
    dragStartX.current = event.clientX;
  };

  // Customer Reviews State
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'Alexander Wright',
      rating: 5,
      date: 'September 12, 2026',
      comment: 'An exquisite Royal Blue Sapphire. The clarity and cut exceed expectations. Truly a masterpiece.',
      photo: null
    }
  ]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newPhoto, setNewPhoto] = useState(null);
  const [wishlist, setWishlist] = useSharedCollection('ceylon-wishlist');
  const [cart, setCart] = useSharedCollection('ceylon-cart');
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [showPaymentNotice, setShowPaymentNotice] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  const wishlistCount = wishlist.reduce((total, item) => total + item.quantity, 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const drawerItems = activeDrawer === 'wishlist' ? wishlist : cart;
  const gemProductKey = gem ? getCollectionItemKey(gem) : '';
  const isWishlisted = wishlist.some(
    (item) => getCollectionItemKey(item) === gemProductKey
  );

  const addProductToCart = (product) => {
    const productKey = getCollectionItemKey(product);

    setCart((current) => {
      const alreadyInCart = current.some(
        (item) => getCollectionItemKey(item) === productKey
      );

      if (alreadyInCart) return current;

      return [
        ...current,
        normalizeCollectionItem({ ...product, quantity: 1 })
      ];
    });
  };

  const addGemToCart = () => {
    addProductToCart(gem);
    setAddedToCart(true);
    setActiveDrawer('cart');
  };

  const toggleGemWishlist = () => {
    const productKey = getCollectionItemKey(gem);

    setWishlist((current) => {
      const alreadyWishlisted = current.some(
        (item) => getCollectionItemKey(item) === productKey
      );

      if (alreadyWishlisted) {
        return current.filter(
          (item) => getCollectionItemKey(item) !== productKey
        );
      }

      return [
        ...current,
        normalizeCollectionItem({ ...gem, quantity: 1 })
      ];
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    alert('Your inquiry has been sent successfully!');
    setShowInquiryForm(false);
  };

  const showDetailsTab = (tab) => {
    setActiveTab(tab);
    detailSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const reviewObj = {
      id: Date.now(),
      name: 'Private Collector',
      rating: newRating,
      date: 'Just now',
      comment: newComment,
      photo: newPhoto
    };

    setReviews([reviewObj, ...reviews]);
    setNewComment('');
    setNewPhoto(null);
  };

  if (!gem) {
    return (
      <div className="gem-fallback">
        <h2>Gemstone Not Found</h2>
        <p>The requested luxury gemstone could not be located in our vault.</p>
        <button onClick={() => window.location.href = '/gemstones'} className="vault-btn">
          RETURN TO VAULT
        </button>
      </div>
    );
  }

  const gemName = gem.name || gem.title || 'this gemstone';
  const gemDescription = gem.description ||
    `A ${gem.color ? `${gem.color} ` : ''}${gemName}${gem.carat ? ` weighing ${gem.carat} ct` : ''}.`;
  const whatsappMessage = `Hello, I'm interested in ${gemName} (Ref. ${gem.id || 'N/A'}). Please share more details and certificate information.`;

  return (
    <div className="luxury-detail-wrapper">
      <header className="gem-detail-navbar about-navbar">
        <a href="/" className="gem-detail-brand about-navbar-logo">
          <img src="/logo.png" alt="Ceylon Royal Gemstones" />
          <span className="about-logo-text">
            <strong>CEYLON</strong>
            <small>ROYAL GEMSTONES</small>
          </span>
        </a>

        <MobileSiteMenu />
        <nav className="gem-detail-nav-links about-nav-links" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/gemstones" className="active">Shop</a>
          <a href="/About">Heritage</a>
          <a href="/trust">Certification</a>
          <a href="/reviews">Reviews</a>
          <a href="/contact">Contact</a>
          <a href="/blog">Blog</a>
          <InternationalNavEntry />
        </nav>

        <div className="gem-detail-nav-actions about-nav-actions">
          <InternationalNavEntry mobile />
          <button
            type="button"
            className="gem-detail-nav-icon about-nav-icon"
            aria-label={`Wishlist, ${wishlistCount} items`}
            title="Wishlist"
            onClick={() => setActiveDrawer('wishlist')}
          >
            <FaHeart />
            {wishlistCount > 0 && <span className="gem-detail-badge about-badge">{wishlistCount}</span>}
          </button>
          <button
            type="button"
            className="gem-detail-nav-icon about-nav-icon"
            aria-label={`Cart, ${cartCount} items`}
            title="Shopping Cart"
            onClick={() => setActiveDrawer('cart')}
          >
            <FaShoppingBag />
            {cartCount > 0 && <span className="gem-detail-badge about-badge">{cartCount}</span>}
          </button>
          <button
            type="button"
            className="gem-detail-inquire-link about-inquire-btn"
            onClick={() => setShowInquiryForm(true)}
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
      </header>

      <a href="/gemstones#collection" className="detail-back-collection">
        <FaArrowLeft aria-hidden="true" />
        <span>BACK TO COLLECTION</span>
      </a>

      {/* Hero Showcase Grid */}
      <div className="showcase-grid">
        {/* Media Gallery */}
        <div className="media-stage">
          <div
            className={`main-display-frame ${is360Mode && hasRotationFrames ? 'is-rotatable' : ''} ${!is360Mode && activeMedia.type === 'video' ? 'video-active' : ''}`}
            onPointerDown={handleRotationPointerDown}
            onPointerMove={handleRotationPointerMove}
            onPointerUp={() => { dragStartX.current = null; }}
            onPointerCancel={() => { dragStartX.current = null; }}
          >
            {is360Mode && hasRotationFrames ? (
              <img
                src={rotationFrames[rotationIndex]}
                alt={`${gem.name || gem.title} 360 degree view`}
                className="display-media"
                    style={{ transform: `scale(${zoomLevel})` }}
                draggable="false"
              />
            ) : activeMedia.type === 'image' ? (
              <img
                src={activeMedia.url}
                alt={`${gem.name || gem.title} ${galleryViews.find((view) => view.url === activeMedia.url)?.label || 'view'}`}
                className="display-media"
                style={{ transform: `scale(${zoomLevel})` }}
              />
            ) : (
              <video
                src={activeMedia.url}
                poster={gem.image}
                controls
                autoPlay
                muted
                playsInline
                preload="metadata"
                className="display-media"
              />
            )}
            <span className="media-view-label">
              {is360Mode && hasRotationFrames
                ? '360° INTERACTIVE VIEW'
                : activeMedia.type === 'video'
                  ? 'VIDEO INSPECTION'
                  : galleryViews.find((view) => view.url === activeMedia.url)?.label || 'FRONT VIEW'}
            </span>
            <div className="gallery-mode-controls">
              {(is360Mode || activeMedia.type === 'image') && (
                <div
                  className="image-zoom-controls"
                  aria-label="Image zoom controls"
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    aria-label="Zoom out"
                    title="Zoom out"
                    disabled={zoomLevel <= 1}
                    onClick={() => setZoomLevel((level) => Math.max(1, level - 0.25))}
                  >
                    <FaSearchMinus />
                  </button>
                  <button
                    type="button"
                    className="zoom-level"
                    aria-label={`Reset zoom, current level ${zoomLevel.toFixed(2)} times`}
                    title="Reset zoom"
                    onClick={() => setZoomLevel(1)}
                  >
                    {zoomLevel.toFixed(1)}×
                  </button>
                  <button
                    type="button"
                    aria-label="Zoom in"
                    title="Zoom in"
                    disabled={zoomLevel >= 3}
                    onClick={() => setZoomLevel((level) => Math.min(3, level + 0.25))}
                  >
                    <FaSearchPlus />
                  </button>
                </div>
              )}
              <button
                type="button"
                className={`rotation-toggle ${is360Mode ? 'active' : ''}`}
                disabled={!hasRotationFrames}
                title={hasRotationFrames ? 'Toggle interactive 360 degree view' : 'Add more product angle photos to enable 360 degree view'}
                aria-pressed={is360Mode}
                onClick={() => {
                  setIs360Mode((current) => !current);
                  setZoomLevel(1);
                }}
              >
                <FaSyncAlt /> 360°
              </button>
            </div>
            {is360Mode && hasRotationFrames && (
              <span className="rotation-hint">DRAG TO ROTATE</span>
            )}
          </div>

          <div className="thumbnail-strip">
            {viewLabels.map((label) => {
              const view = galleryViews.find(
                (galleryView) => galleryView.label.toLowerCase() === label.toLowerCase()
              );

              return (
                <button
                  key={label}
                  type="button"
                  className={`thumb-card view-thumb ${view && activeMedia.url === view.url && activeMedia.type === 'image' ? 'active' : ''} ${view ? '' : 'unavailable'}`}
                  disabled={!view}
                  onClick={() => {
                    setIs360Mode(false);
                    setZoomLevel(1);
                    setActiveMedia({ type: 'image', url: view.url });
                  }}
                  aria-label={view ? `${label} view` : `${label} image not provided`}
                >
                  {view ? (
                    <>
                      <img src={view.url} alt="" />
                      <span className="thumb-label">{view.label}</span>
                    </>
                  ) : (
                    <span>{label}<small>PHOTO NEEDED</small></span>
                  )}
                </button>
              );
            })}

            {gem.videoUrl && (
              <button
                type="button"
                className={`thumb-card video-card ${activeMedia.url === gem.videoUrl && activeMedia.type === 'video' ? 'active' : ''}`}
                onClick={() => {
                  setIs360Mode(false);
                  setZoomLevel(1);
                  setActiveMedia({ type: 'video', url: gem.videoUrl });
                }}
              >
                <FaPlay className="play-icon" />
                <span>VIDEO</span>
              </button>
            )}
            {!gem.videoUrl && (
              <button type="button" className="thumb-card video-card unavailable" disabled>
                <FaPlay className="play-icon" />
                <span>VIDEO<small>CLIP NEEDED</small></span>
              </button>
            )}
          </div>
        </div>

        {/* Product Information */}
        <div className="luxury-info">
          <div className="header-meta">
            <span className="sku-badge">REF. #{gem.id || 'CRG-8801'}</span>
            <span className="status-pill">AVAILABLE</span>
          </div>

          <h1 className="gem-heading">{gem.name || gem.title}</h1>

          <div className="price-container">
            <div className="price-usd">
              {formatCurrencyPrice(gem.basePriceUSD ?? gem.price ?? gem.priceUSD ?? 0, currency)}
            </div>
          </div>

          <h2 className="gem-about-heading">ABOUT THE GEM</h2>
          <p className="gem-narrative">
            {gemDescription}
          </p>

          <div className="quick-specs-grid">
            <div className="spec-chip">
              <span className="chip-label">ORIGIN</span>
              <span className="chip-val">{gem.origin || 'Not provided'}</span>
            </div>
            <div className="spec-chip">
              <span className="chip-label">CARAT</span>
              <span className="chip-val">{gem.carat || 'Natural'}</span>
            </div>
            <div className="spec-chip">
              <span className="chip-label">CUT</span>
              <span className="chip-val">{gem.cut || gem.shape || 'Not provided'}</span>
            </div>
          </div>

          <div className="detail-links-row">
            <button
              type="button"
              className="detail-section-link"
              onClick={() => showDetailsTab('specs')}
            >
              MORE SPECIFICATIONS <FaChevronDown aria-hidden="true" />
            </button>
            <button
              type="button"
              className="detail-section-link"
              onClick={() => showDetailsTab('certificate')}
            >
              VIEW CERTIFICATE <FaFileAlt aria-hidden="true" />
            </button>
          </div>

          <div className="cta-button-group">
            <button
              type="button"
              className="gold-btn"
              onClick={addedToCart
                ? () => setActiveDrawer('cart')
                : addGemToCart}
            >
              <FaShoppingBag /> {addedToCart ? 'VIEW CART' : 'ADD TO CART'}
            </button>
            <button
              type="button"
              className={`outline-btn ${isWishlisted ? 'wishlisted' : ''}`}
              aria-pressed={isWishlisted}
              onClick={toggleGemWishlist}
            >
              <FaHeart /> {isWishlisted ? 'SAVED TO WISHLIST' : 'ADD TO WISHLIST'}
            </button>
          </div>
          <a
            className="whatsapp-inquiry-btn"
            href={`https://wa.me/94712345678?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noreferrer"
          >
            <FaWhatsapp aria-hidden="true" /> INQUIRE ABOUT THIS GEM ON WHATSAPP
          </a>

          <div className="purchase-quantity-row">
            <span>QUANTITY</span>
            <strong className="purchase-single-quantity">1</strong>
            <strong>
              {formatCurrencyPrice(gem.basePriceUSD ?? gem.price ?? gem.priceUSD ?? 0, currency)}
            </strong>
          </div>

          <button
            type="button"
            className="pay-now-btn"
            onClick={() => setShowPaymentNotice(true)}
          >
            PAY NOW
          </button>
          <p className="payment-setup-note">Secure online checkout is not available yet.</p>
        </div>
      </div>

      {/* Specifications & Certificate Tabs */}
      <div className="tabs-wrapper" ref={detailSectionRef}>
        <div className="tab-navigation">
          <button 
            className={`tab-link ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            GEM SPECIFICATIONS
          </button>
          <button 
            className={`tab-link ${activeTab === 'certificate' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificate')}
          >
            LAB CERTIFICATE
          </button>
        </div>

        <div className="tab-body">
          {activeTab === 'specs' ? (
            <div className="specs-grid">
              <div className="spec-row">
                <span className="spec-name">Gemstone Variety</span>
                <span className="spec-value">{gem.name || gem.title}</span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Weight (Carats)</span>
                <span className="spec-value">{gem.carat || 'Available upon request'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Shape / Cut</span>
                <span className="spec-value">
                  {[gem.shape, gem.cut].filter(Boolean).join(' / ') || 'Not provided'}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Color Grade</span>
                <span className="spec-value">{gem.color || 'Not provided'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Clarity Grade</span>
                <span className="spec-value">{gem.clarity || 'Not provided'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Treatment</span>
                <span className="spec-value">{gem.treatment || 'Not provided'}</span>
              </div>
            </div>
          ) : (
            <div className="cert-display-area">
              {gem.certImage && gem.certification ? (
                <div className="cert-card">
                  <div className="cert-header-info">
                    <h3>Gemstone Authenticity Report</h3>
                    <p><strong>Certificate / Store ID:</strong> {gem.certificateNumber}</p>
                    <p><strong>Certificate Details:</strong> {gem.certification}</p>
                  </div>
                  <div className="cert-image-frame">
                    <img src={gem.certImage} alt="Official Lab Certificate" />
                  </div>
                </div>
              ) : (
                <div className="empty-cert-box">
                  <div className="empty-icon">📜</div>
                  <h4>Laboratory Certificate Pending</h4>
                  <p><strong>Store ID:</strong> {gem.certificateNumber}</p>
                  <p>The official certification report for this piece is currently being processed or pending upload.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Premium Reviews & Client Photographs */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h2>CLIENT REVIEWS & GALLERY</h2>
          <p>Verified testimonials from private collectors and gemstone enthusiasts.</p>
        </div>

        {/* Add Review Form */}
        <form className="luxury-review-form" onSubmit={handleReviewSubmit}>
          <h3>Share Your Experience</h3>
          
          <div className="form-row">
            <div className="input-group">
              <label>Rating</label>
              <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}>
                <option value="5">★★★★★ Exceptional (5/5)</option>
                <option value="4">★★★★☆ Excellent (4/5)</option>
                <option value="3">★★★☆☆ Good (3/5)</option>
              </select>
            </div>

            <div className="input-group">
              <label>Upload Photograph (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
            </div>
          </div>

          <div className="input-group">
            <label>Review Remarks</label>
            <textarea 
              rows="3" 
              placeholder="Describe your purchasing experience or gem quality..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            ></textarea>
          </div>

          {newPhoto && (
            <div className="photo-preview-box">
              <p>Image Preview:</p>
              <img src={newPhoto} alt="Upload Preview" />
            </div>
          )}

          <button type="submit" className="submit-gold-btn">SUBMIT TESTIMONIAL</button>
        </form>

        {/* Reviews Feed */}
        <div className="reviews-feed">
          {reviews.map((rev) => (
            <div key={rev.id} className="review-card-luxury">
              <div className="review-top">
                <div className="reviewer-info">
                  <div className="avatar-circle">{rev.name.charAt(0)}</div>
                  <div>
                    <span className="reviewer-name">{rev.name}</span>
                    <span className="review-date">{rev.date}</span>
                  </div>
                </div>
                <div className="star-rating">{'★'.repeat(rev.rating)}</div>
              </div>

              <p className="review-text">{rev.comment}</p>

              {rev.photo && (
                <div className="review-photo-frame">
                  <img src={rev.photo} alt="Client Gemstone" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="gem-detail-footer">
        <div className="gem-detail-footer-grid">
          <div className="gem-detail-footer-brand">
            <a href="/" className="gem-detail-brand gem-detail-footer-logo">
              <img src="/logo.png" alt="" />
              <span>
                <strong>CEYLON</strong>
                <small>ROYAL GEMSTONES</small>
              </span>
            </a>
            <p>Exceptional Ceylon gemstones, carefully sourced and presented with confidence.</p>
          </div>

          <div className="gem-detail-footer-links">
            <h2>EXPLORE</h2>
            <a href="/">Home</a>
            <a href="/gemstones">Shop</a>
            <a href="/About">Our Heritage</a>
            <a href="/trust">Trust & Certification</a>
            <a href="/reviews">Reviews</a>
            <a href="/contact">Contact</a>
          </div>

          <div className="gem-detail-footer-links">
            <h2>CONTACT</h2>
            <a href="tel:+94712345678"><FaPhoneAlt /> +94 71 234 5678</a>
            <a href="mailto:info@ceylonroyalgemstones.com">
              <FaEnvelope /> info@ceylonroyalgemstones.com
            </a>
            <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer">
              <FaWhatsapp /> WhatsApp
            </a>
            <span><FaMapMarkerAlt /> Ratnapura, Sri Lanka</span>
          </div>

          <div className="gem-detail-footer-links gem-detail-social-links">
            <h2>FOLLOW US</h2>
            <p>Discover the people and places behind Ceylon gemstones.</p>
            <div>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://wa.me/94712345678" aria-label="WhatsApp" target="_blank" rel="noreferrer">
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>

        <div className="gem-detail-footer-bottom">
          <span>© 2026 Ceylon Royal Gemstones. All Rights Reserved.</span>
          <span>NATURAL · AUTHENTIC · CEYLON</span>
        </div>
      </footer>

      {showInquiryForm && (
        <div
          className="gem-detail-inquiry-backdrop"
          onClick={() => setShowInquiryForm(false)}
        >
          <div
            className="gem-detail-inquiry-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="gem-detail-inquiry-close about-modal-close"
              aria-label="Close inquiry form"
              onClick={() => setShowInquiryForm(false)}
            >
              ×
            </button>

            <img
              src="/logo.png"
              alt="Ceylon Royal Gemstones"
              className="gem-detail-inquiry-logo about-modal-logo"
            />

            <span>PRIVATE GEMSTONE INQUIRY</span>
            <h3>{gem.name || gem.title}</h3>
            <p>
              {gem.category} • {gem.carat || 'Custom'} Ct
            </p>

            <form onSubmit={handleInquirySubmit}>
              <input type="text" placeholder="Your Full Name" required />
              <input type="email" placeholder="Email Address" required />
              <input type="tel" placeholder="WhatsApp / Phone Number" required />
              <textarea placeholder="Tell us about your requirements..." rows="4" required />
              <button type="submit">SEND INQUIRY</button>
            </form>
          </div>
        </div>
      )}

      {showPaymentNotice && (
        <div
          className="payment-notice-backdrop"
          onClick={() => setShowPaymentNotice(false)}
        >
          <section
            className="payment-notice-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-notice-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="payment-notice-close"
              aria-label="Close payment notice"
              onClick={() => setShowPaymentNotice(false)}
            >×</button>
            <span>PAYMENT SETUP</span>
            <h2 id="payment-notice-title">Online checkout is not connected yet</h2>
            <p>
              Add a supported payment provider to accept secure online payments.
              You can contact our team to arrange this gemstone purchase.
            </p>
            <a href="/contact#contact-form">CONTACT THE GEMSTONE TEAM</a>
          </section>
        </div>
      )}

      {activeDrawer && (
        <div className="detail-cart-backdrop" onClick={() => setActiveDrawer(null)}>
          <aside
            className="detail-cart-panel"
            aria-label={activeDrawer === 'wishlist' ? 'Wishlist' : 'Shopping cart'}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="detail-cart-header">
              <div>
                <span>{activeDrawer === 'wishlist' ? 'YOUR SAVED ITEMS' : 'YOUR SELECTION'}</span>
                <h2>{activeDrawer === 'wishlist' ? 'Wishlist' : 'Shopping Cart'}</h2>
              </div>
              <button
                type="button"
                className="detail-cart-close"
                aria-label={`Close ${activeDrawer === 'wishlist' ? 'wishlist' : 'shopping cart'}`}
                onClick={() => setActiveDrawer(null)}
              >×</button>
            </div>

            {drawerItems.length === 0 ? (
              <p className="detail-cart-empty">
                Your {activeDrawer === 'wishlist' ? 'wishlist' : 'cart'} is currently empty.
              </p>
            ) : (
              <div className="detail-cart-items">
                {drawerItems.map((item) => {
                  const productKey = getCollectionItemKey(item);
                  const itemName = item.name || item.title;
                  return (
                    <div className="detail-cart-item" key={productKey}>
                      <img src={item.image || item.images?.[0]} alt={itemName} />
                      <div className="detail-cart-item-info">
                        <strong>{itemName}</strong>
                        <span>{formatCurrencyPrice(item.price, currency)}</span>
                        <span>Qty 1</span>
                      </div>
                      <button
                        type="button"
                        className="detail-cart-remove"
                        onClick={() => (activeDrawer === 'wishlist' ? setWishlist : setCart)(
                          (current) => current.filter((entry) => getCollectionItemKey(entry) !== productKey)
                        )}
                        aria-label={`Remove ${itemName}`}
                      >×</button>
                    </div>
                  );
                })}
              </div>
            )}

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
    </div>
  );
};

export default GemstoneDetail;