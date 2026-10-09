import { useState, useRef } from 'react';
import {
  FaArrowLeft,
  FaBuilding,
  FaCheck,
  FaCloudUploadAlt,
  FaEnvelope,
  FaFacebookF,
  FaGem,
  FaGlobeAmericas,
  FaHandshake,
  FaHeadset,
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
import CollectionDrawerActions from '../components/CollectionDrawerActions.jsx';
import InternationalNavEntry from '../components/InternationalNavEntry.jsx';
import SiteInquiryModal from '../components/SiteInquiryModal.jsx';
import { getCollectionItemKey, useSharedCollection } from '../useSharedCollection.js';
import './About.css';
import './JoinWithUs.css';
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";

const GEMSTONE_OPTIONS = [
  'Blue Sapphire',
  'Yellow Sapphire',
  'Green Gemstone',
  'Padparadscha Sapphire',
  'Ruby',
  'Star Sapphire',
  "Cat's Eye",
  'Alexandrite',
  'Other'
];

const BENEFITS = [
  {
    icon: FaGem,
    title: 'Trusted Gemstone Sourcing',
    description:
      'Direct mine-to-market access to ethically mined, 100% natural, certified Ceylon sapphires, rubies, and rare natural gemstones with verified provenance.'
  },
  {
    icon: FaGlobeAmericas,
    title: 'Global Business Opportunities',
    description:
      'Expand your business footprint with our verified international distribution network, wholesale pricing, and fully insured door-to-door worldwide shipping.'
  },
  {
    icon: FaHandshake,
    title: 'Long-Term Partnership',
    description:
      'Build a lasting, mutually rewarding commercial relationship with transparent trade practices, dedicated B2B account managers, and priority collector allocations.'
  },
  {
    icon: FaHeadset,
    title: 'Premium Support',
    description:
      'Dedicated gemological advisory, bespoke international certification assistance (GIA / GRS / GIC), and 24/7 personalized concierge partner assistance.'
  }
];

export default function JoinWithUs() {
  const [wishlist, setWishlist] = useSharedCollection('ceylon-wishlist');
  const [cart, setCart] = useSharedCollection('ceylon-cart');
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  // Application Form Modal State (Opens ONLY when "JOIN WITH US" button is clicked)
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedGemstones, setSelectedGemstones] = useState([]);
  const [otherGemstone, setOtherGemstone] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const toggleGemstone = (gem) => {
    if (selectedGemstones.includes(gem)) {
      if (selectedGemstones.length > 1) {
        setSelectedGemstones(selectedGemstones.filter((g) => g !== gem));
      }
    } else {
      setSelectedGemstones([...selectedGemstones, gem]);
    }
  };

  const handleFileChange = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a JPG, PNG, or WEBP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Please upload an image smaller than 10 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setCertificateFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCertificatePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeCertificate = (e) => {
    e.stopPropagation();
    setCertificateFile(null);
    setCertificatePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!businessName.trim() || !email.trim() || !location.trim() || !phone.trim()) {
      alert('Please fill in all required fields (Business Name, Email, Location, and Contact Number).');
      return;
    }
    if (selectedGemstones.length === 0) {
      alert('Please select at least one gemstone type.');
      return;
    }
    if (selectedGemstones.includes('Other') && !otherGemstone.trim()) {
      alert('Please specify the other gemstone type.');
      return;
    }

    const gemstoneTypes = selectedGemstones
      .map((gemstone) => (
        gemstone === 'Other' ? `Other: ${otherGemstone.trim()}` : gemstone
      ))
      .join(', ');
    const message = [
      'Hello, I would like to submit a partnership application.',
      '',
      `Business name: ${businessName.trim()}`,
      `Email: ${email.trim()}`,
      `Location: ${location.trim()}`,
      `Phone number: ${phone.trim()}`,
      `Gemstone types: ${gemstoneTypes}`,
      certificateFile
        ? `Certificate image: ${certificateFile.name} (I will attach it in this WhatsApp chat.)`
        : 'Certificate image: I can provide it in this WhatsApp chat if needed.'
    ].join('\n');
    const whatsappUrl = `https://wa.me/94712345678?text=${encodeURIComponent(message)}`;
    const whatsappWindow = window.open(whatsappUrl, '_blank');

    if (whatsappWindow) {
      whatsappWindow.opener = null;
    } else {
      window.location.assign(whatsappUrl);
    }
  };

  const updateQuantity = (setCollection, productKey, change) => {
    setCollection((prev) =>
      prev
        .map((item) =>
          getCollectionItemKey(item) === productKey
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const wishlistCount = wishlist.reduce((total, item) => total + item.quantity, 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="joinus-page-shell">
      {/* NAVBAR */}
      <nav className="about-navbar" aria-label="Main navigation">
        <a href="/" className="about-navbar-logo">
          <img
            src="/logo.png"
            alt="Ceylon Royal Gemstones"
            className="navbar-logo-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png';
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
          <a href="/trust">Certification</a>
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
            aria-label={`Open wishlist, ${wishlistCount} items`}
            title="Wishlist"
            onClick={() => setActiveDrawer('wishlist')}
          >
            <FaHeart />
            {wishlistCount > 0 && <span className="about-badge">{wishlistCount}</span>}
          </button>

          <button
            type="button"
            className="about-nav-icon"
            aria-label={`Open cart, ${cartCount} items`}
            title="Shopping Cart"
            onClick={() => setActiveDrawer('cart')}
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

          <a href="/join-us" className="navbar-joinus-btn active" title="Join With Us">
            <span>JOIN US</span>
          </a>

          <a href="/login" className="navbar-login-btn" title="Login / Register">
            <FaUser />
            <span>LOGIN</span>
          </a>
        </div>
      </nav>

      {/* 1. BACK TO HOME */}
      <div className="joinus-top-bar">
        <a href="/" className="joinus-back-btn">
          <FaArrowLeft />
          <span>Back to Home</span>
        </a>
      </div>

      {/* 2. HERO / INTRODUCTION SECTION */}
      <section className="joinus-hero-section">
        <div className="joinus-hero-content">
          <div className="joinus-luxury-tag">
            <FaGem />
            <span>PARTNER WITH US</span>
          </div>

          <h1 className="joinus-hero-title">
            JOIN WITH US
            <span>CEYLON ROYAL PARTNERS</span>
          </h1>

          <p className="joinus-hero-tagline">
            Grow with us as a trusted Ceylon gemstone partner.
          </p>

          <p className="joinus-hero-desc">
            Ethical sourcing, certified gems and global support.
          </p>

          <ul className="joinus-hero-highlights">
            <li>
              <FaCheck /> Ethically sourced Ceylon gemstones
            </li>
            <li>
              <FaCheck /> Internationally recognized certification
            </li>
            <li>
              <FaCheck /> Wholesale pricing and dedicated support
            </li>
          </ul>

          <div className="joinus-hero-actions">
            <button
              type="button"
              className="joinus-primary-btn"
              onClick={() => setIsFormOpen(true)}
            >
              JOIN WITH US
            </button>
            <a
              href="#benefits"
              className="joinus-secondary-btn"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              VIEW BENEFITS
            </a>
          </div>
        </div>

        {/* HERO IMAGE AREA - Uses public/joinUs.jpg */}
        <div className="joinus-hero-image-wrap">
          <div className="joinus-hero-image-inner">
            <img
              src="/joinUs.jpg"
              alt="Ceylon Royal Gemstones Partner Collaboration"
              className="joinus-hero-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/about1.jpg';
              }}
            />
            <div className="joinus-image-badge">
              <div className="joinus-image-badge-text">
                <h5>CEYLON ROYAL NETWORK</h5>
                <p>Authentic Heritage • Global Excellence</p>
              </div>
              <div className="joinus-image-badge-icon">
                <FaHandshake />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENEFITS SECTION */}
      <section className="joinus-benefits-section" id="benefits">
        <div className="joinus-section-header">
          <span className="joinus-section-tag">WHY WORK WITH US</span>
          <h2 className="joinus-section-title">BENEFITS</h2>
          <p className="joinus-section-subtitle">
            Unmatched trade integrity, direct sourcing and luxury support for your gemstone business.
          </p>
        </div>

        <div className="joinus-benefits-grid">
          {BENEFITS.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div className="joinus-benefit-card" key={index}>
                <div className="joinus-benefit-icon-box">
                  <IconComponent />
                </div>
                <h3 className="joinus-benefit-title">{benefit.title}</h3>
                <p className="joinus-benefit-desc">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="joinus-cta-banner">
        <h3>READY TO PARTNER WITH US?</h3>
        <p>
          Build a trusted partnership — apply using the form below.
        </p>
        <button
          type="button"
          className="joinus-primary-btn"
          onClick={() => setIsFormOpen(true)}
        >
          JOIN WITH US
        </button>
      </section>

      {/* 5. APPLICATION FORM MODAL (OPENS ONLY ON CLICKING JOIN WITH US) */}
      {isFormOpen && (
        <div
          className="joinus-modal-backdrop"
          onClick={() => setIsFormOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="joinus-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="joinus-modal-close-btn"
              onClick={() => setIsFormOpen(false)}
              aria-label="Close application form"
            >
              <FaTimes />
            </button>

            <div className="joinus-form-header">
              <h2 className="joinus-form-title">PARTNERSHIP APPLICATION</h2>
              <p className="joinus-form-subtitle">
                Tell us about your business and gemstone interests.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="joinus-form-grid">
                  {/* Business Name */}
                  <div className="joinus-form-group">
                    <label className="joinus-label" htmlFor="modal-business-name">
                      Business Name <span aria-hidden="true">*</span>
                    </label>
                    <div className="joinus-input-wrap">
                      <FaBuilding className="joinus-input-icon" />
                      <input
                        id="modal-business-name"
                        type="text"
                        className="joinus-input"
                        placeholder="e.g. Royal Gems & Jewelry Ltd."
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="joinus-form-group">
                    <label className="joinus-label" htmlFor="modal-business-email">
                      Email Address <span aria-hidden="true">*</span>
                    </label>
                    <div className="joinus-input-wrap">
                      <FaEnvelope className="joinus-input-icon" />
                      <input
                        id="modal-business-email"
                        type="email"
                        className="joinus-input"
                        placeholder="e.g. partner@gemstonetrading.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Business Location */}
                  <div className="joinus-form-group">
                    <label className="joinus-label" htmlFor="modal-business-location">
                      Location <span aria-hidden="true">*</span>
                    </label>
                    <div className="joinus-input-wrap">
                      <FaMapMarkerAlt className="joinus-input-icon" />
                      <input
                        id="modal-business-location"
                        type="text"
                        className="joinus-input"
                        placeholder="City, country"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        autoComplete="country-name"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className="joinus-form-group">
                    <label className="joinus-label" htmlFor="modal-business-phone">
                      Phone Number <span aria-hidden="true">*</span>
                    </label>
                    <div className="joinus-input-wrap">
                      <FaPhoneAlt className="joinus-input-icon" />
                      <input
                        id="modal-business-phone"
                        type="tel"
                        className="joinus-input"
                        placeholder="e.g. +94 77 123 4567 / +1 (555) 000-1234"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        required
                      />
                    </div>
                  </div>

                  {/* Type of Gemstones (Multi-select) */}
                  <div className="joinus-form-group full-width">
                    <div className="joinus-label" id="gemstone-types-label">
                      Types of Gemstones <span aria-hidden="true">*</span>
                      <span className="joinus-label-optional">(select all that apply)</span>
                    </div>
                    <div className="joinus-gem-pills" role="group" aria-labelledby="gemstone-types-label">
                      {GEMSTONE_OPTIONS.map((gem) => {
                        const isSelected = selectedGemstones.includes(gem);
                        return (
                          <button
                            key={gem}
                            type="button"
                            className={`joinus-gem-pill ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleGemstone(gem)}
                            aria-pressed={isSelected}
                          >
                            {isSelected && <FaCheck className="joinus-gem-pill-icon" />}
                            <span>{gem}</span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedGemstones.includes('Other') && (
                      <div className="joinus-input-wrap joinus-other-gemstone">
                        <FaGem className="joinus-input-icon" />
                        <input
                          aria-label="Specify other gemstone types"
                          type="text"
                          className="joinus-input"
                          placeholder="Please specify other gemstone types..."
                          value={otherGemstone}
                          onChange={(e) => setOtherGemstone(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Certificate Upload (Image) */}
                  <div className="joinus-form-group full-width">
                    <div className="joinus-label">
                      Certificate Upload (Image)
                      <span className="joinus-label-optional">(business license or gemology certificate)</span>
                    </div>
                    <input
                      id="modal-certificate-upload"
                      type="file"
                      ref={fileInputRef}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="joinus-file-input"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                    />

                    {certificatePreview ? (
                      <div className="joinus-preview-wrap">
                        <div className="joinus-preview-left">
                          <img
                            src={certificatePreview}
                            alt="Certificate preview"
                            className="joinus-preview-thumb"
                          />
                          <div className="joinus-preview-info">
                            <div className="joinus-preview-name">{certificateFile?.name}</div>
                            <div className="joinus-preview-size">
                              {(certificateFile?.size ? certificateFile.size / 1024 : 0).toFixed(1)} KB • Image
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="joinus-preview-remove"
                          onClick={removeCertificate}
                          title="Remove file"
                          aria-label="Remove uploaded image"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`joinus-upload-area ${isDragging ? 'is-dragging' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Upload business license or gemology certificate image"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="joinus-upload-prompt">
                          <FaCloudUploadAlt className="joinus-upload-icon" />
                          <div className="joinus-upload-text">
                            Drag and drop certificate image here, or <span>browse file</span>
                          </div>
                          <div className="joinus-upload-hint">
                            Accepts JPG, PNG, WEBP (Max 10MB). Attach the image in WhatsApp after it opens.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Application Button */}
                  <div className="joinus-submit-wrap">
                    <button type="submit" className="joinus-submit-btn">
                      SUBMIT APPLICATION
                    </button>
                  </div>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
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
            <a href="/gemstones">Shop</a>
            <a href="/About">Our Heritage</a>
            <a href="/trust">Trust &amp; Certification</a>
            <a href="/reviews">Reviews</a>
            <a href="/contact">Contact</a>
          </div>

          <div>
            <h4>CONTACT</h4>
            <a href="tel:+94712345678">
              <FaPhoneAlt /> &nbsp; +94 71 234 5678
            </a>
            <a href="mailto:info@ceylonroyalgemstones.com">
              <FaEnvelope /> &nbsp; info@ceylonroyalgemstones.com
            </a>
            <a
              href="https://wa.me/94712345678"
              target="_blank"
              rel="noreferrer"
              className="footer-whatsapp"
            >
              <FaWhatsapp /> &nbsp; WhatsApp
            </a>
            <a href="#">
              <FaMapMarkerAlt /> &nbsp; Ratnapura, Sri Lanka
            </a>
          </div>

          <div>
            <h4>FOLLOW US</h4>
            <p>
              Follow our journey and discover the world
              of Ceylon gemstones.
            </p>
            <div className="footer-social-icons">
              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>
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

      {/* INQUIRY MODAL (ONLY when user explicitly clicks "INQUIRE NOW" in navbar) */}
      {isInquiryOpen && (
        <SiteInquiryModal
          onClose={() => setIsInquiryOpen(false)}
          source="Join With Us"
        />
      )}

      {/* DRAWER (Cart / Wishlist) */}
      {activeDrawer && (
        <div
          className="gem-drawer-overlay"
          onClick={() => setActiveDrawer(null)}
          role="presentation"
        >
          <aside
            className="gem-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="joinus-drawer-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gem-drawer-header">
              <h3 id="joinus-drawer-title">
                {activeDrawer === 'wishlist' ? 'Wishlist' : 'Shopping Cart'}
              </h3>
              <button
                type="button"
                aria-label="Close drawer"
                onClick={() => setActiveDrawer(null)}
              >
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
                      onClick={() =>
                        updateQuantity(
                          activeDrawer === 'wishlist' ? setWishlist : setCart,
                          getCollectionItemKey(item),
                          -item.quantity
                        )
                      }
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
    </div>
  );
}
