import React, { useState, useRef } from 'react';
import {
  FaArrowLeft,
  FaBuilding,
  FaCheck,
  FaCheckCircle,
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
  FaSearch,
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

const GEMSTONE_OPTIONS = [
  'Sapphire',
  'Ruby',
  'Emerald',
  'Amethyst',
  'Spinel',
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
  const [phone, setPhone] = useState('');
  const [selectedGemstones, setSelectedGemstones] = useState(['Sapphire']);
  const [otherGemstone, setOtherGemstone] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [refId, setRefId] = useState('');

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
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG).');
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
    if (!businessName.trim() || !email.trim() || !phone.trim()) {
      alert('Please fill in all required fields (Business Name, Email Address, Contact Number).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedRef = 'CRG-PARTNER-' + Math.floor(100000 + Math.random() * 900000);
      setRefId(generatedRef);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const resetForm = () => {
    setBusinessName('');
    setEmail('');
    setPhone('');
    setSelectedGemstones(['Sapphire']);
    setOtherGemstone('');
    setCertificateFile(null);
    setCertificatePreview(null);
    setIsSubmitted(false);
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
            title="Search"
            aria-label="Search gemstones"
            onClick={() => {
              const query = prompt('Search gemstones:');
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
          <span>← Back to Home</span>
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
            Join our growing network and build a trusted partnership with Ceylon Royal Gemstones.
          </p>

          <p className="joinus-hero-desc">
            Partner with Ceylon Royal Gemstones — direct, ethical sourcing of certified Ceylon sapphires and rare gems.
          </p>

          <ul className="joinus-hero-highlights">
            <li>
              <FaCheck /> Direct ethical sourcing from Sri Lanka’s legendary Ratnapura mines
            </li>
            <li>
              <FaCheck /> Internationally recognized certification (GIA, GRS, GIC, Gubelin standard)
            </li>
            <li>
              <FaCheck /> Preferential wholesale pricing and dedicated global account management
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
              <span className="joinus-form-tag">PARTNERSHIP PROGRAM</span>
              <h2 className="joinus-form-title">PARTNERSHIP APPLICATION</h2>
              <p className="joinus-form-subtitle">
                Submit your business credentials below to apply for our verified global gemstone network.
              </p>
            </div>

            {isSubmitted ? (
              <div className="joinus-success-card">
                <div className="joinus-success-icon">
                  <FaCheckCircle />
                </div>
                <h3 className="joinus-success-title">APPLICATION RECEIVED</h3>
                <p className="joinus-success-message">
                  Thank you for applying to partner with Ceylon Royal Gemstones. Our executive partnership
                  team will review your business credentials and contact you within 24 to 48 business hours.
                </p>
                <div className="joinus-success-ref">
                  REFERENCE: <span>{refId}</span>
                </div>
                <div className="joinus-success-actions">
                  <button type="button" className="joinus-primary-btn" onClick={resetForm}>
                    SUBMIT ANOTHER APPLICATION
                  </button>
                  <button
                    type="button"
                    className="joinus-secondary-btn"
                    onClick={() => setIsFormOpen(false)}
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="joinus-form-grid">
                  {/* Business Name */}
                  <div className="joinus-form-group">
                    <label className="joinus-label" htmlFor="modal-business-name">
                      Business Name *
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
                      Email Address *
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

                  {/* Contact Number */}
                  <div className="joinus-form-group full-width">
                    <label className="joinus-label" htmlFor="modal-business-phone">
                      Contact Number *
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
                        required
                      />
                    </div>
                  </div>

                  {/* Type of Gemstones (Multi-select) */}
                  <div className="joinus-form-group full-width">
                    <label className="joinus-label">
                      Type of Gemstones *
                      <span className="joinus-label-optional">(select all that apply)</span>
                    </label>
                    <div className="joinus-gem-pills">
                      {GEMSTONE_OPTIONS.map((gem) => {
                        const isSelected = selectedGemstones.includes(gem);
                        return (
                          <button
                            key={gem}
                            type="button"
                            className={`joinus-gem-pill ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleGemstone(gem)}
                          >
                            {isSelected && <FaCheck className="joinus-gem-pill-icon" />}
                            <span>{gem}</span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedGemstones.includes('Other') && (
                      <div className="joinus-input-wrap" style={{ marginTop: '8px' }}>
                        <FaGem className="joinus-input-icon" />
                        <input
                          type="text"
                          className="joinus-input"
                          placeholder="Please specify other gemstone types..."
                          value={otherGemstone}
                          onChange={(e) => setOtherGemstone(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Certificate Upload (Image) */}
                  <div className="joinus-form-group full-width">
                    <label className="joinus-label">
                      Certificate Upload (Image)
                      <span className="joinus-label-optional">(business license or gemology certificate)</span>
                    </label>
                    <input
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
                            Accepts JPG, PNG, WEBP (Max 10MB)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Application Button */}
                  <div className="joinus-submit-wrap">
                    <button type="submit" className="joinus-submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? 'PROCESSING APPLICATION...' : 'SUBMIT APPLICATION'}
                    </button>
                  </div>
                </div>
              </form>
            )}
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
              Direct purveyors of authentic Ceylon sapphires, rubies, and precious natural gems.
              Ethically sourced from Sri Lanka’s legendary mines with world-class international certifications.
            </p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/gemstones">Shop Gemstones</a></li>
              <li><a href="/About">Heritage & Craft</a></li>
              <li><a href="/trust">Certification</a></li>
              <li><a href="/join-us">Join With Us</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Gemstone Specialties</h4>
            <ul>
              <li><a href="/gemstones">Royal Blue Sapphires</a></li>
              <li><a href="/gemstones">Padparadscha Sapphires</a></li>
              <li><a href="/gemstones">Pigeon Blood Rubies</a></li>
              <li><a href="/gemstones">Rare Alexandrites</a></li>
              <li><a href="/gemstones">Star Sapphires</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Global Headquarters</h4>
            <p><FaMapMarkerAlt /> Colombo & Ratnapura, Sri Lanka</p>
            <p><FaPhoneAlt /> +94 11 234 5678</p>
            <p><FaEnvelope /> partners@ceylonroyalgemstones.com</p>
            <div className="footer-socials">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="WhatsApp"><FaWhatsapp /></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid rgba(201,162,75,0.2)', fontSize: '12px', color: 'rgba(247,243,232,0.6)' }}>
          <p>© {new Date().getFullYear()} Ceylon Royal Gemstones. All Rights Reserved. Luxury Gemstone B2B Network.</p>
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
                      <strong>${(item.price * item.quantity).toLocaleString()}</strong>
                      <div className="gem-quantity-control">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() =>
                            updateQuantity(
                              activeDrawer === 'wishlist' ? setWishlist : setCart,
                              getCollectionItemKey(item),
                              -1
                            )
                          }
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() =>
                            updateQuantity(
                              activeDrawer === 'wishlist' ? setWishlist : setCart,
                              getCollectionItemKey(item),
                              1
                            )
                          }
                        >
                          +
                        </button>
                      </div>
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
