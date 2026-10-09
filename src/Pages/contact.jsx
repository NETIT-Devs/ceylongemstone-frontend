import { useState } from "react";

import {
  FaHeart,
  FaShoppingBag,
  FaTimes,
  FaTrash,
  FaShieldAlt,
  FaGem,
  FaLock,
  FaUser,
  FaShippingFast,
  FaWhatsapp,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebookF
} from "react-icons/fa";

import "./contact.css";
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";
import CollectionDrawerActions from "../components/CollectionDrawerActions.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import {
  getCollectionItemKey,
  useSharedCollection
} from "../useSharedCollection.js";


/* =========================================================
   GEM DATA
========================================================= */

const gems = [
  {
    id: 1,
    name: "ROYAL BLUE SAPPHIRE",
    origin: "Ratnapura, Sri Lanka",
    carat: "4.52 Ct",
    price: "$12,500",
    image: "/blueGem.jpg"
  },
  {
    id: 2,
    name: "PADPARADSCHA SAPPHIRE",
    origin: "Elahera, Sri Lanka",
    carat: "3.18 Ct",
    price: "$18,900",
    image: "/PADPARADSCHAgem1.jpg"
  },
  {
    id: 3,
    name: "CEYLON ALEXANDRITE",
    origin: "Balangoda, Sri Lanka",
    carat: "2.05 Ct",
    price: "$22,000",
    image: "/ALEXANDRITEgem.jpg"
  }
];

const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });


/* =========================================================
   CONTACT PAGE
========================================================= */

const Contact = () => {

  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [selectedGem, setSelectedGem] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);


  /* =======================================================
     WISHLIST
  ======================================================= */

  const toggleWishlist = (gem) => {
    const productKey = getCollectionItemKey(gem);
    setWishlist((current) =>
      current.filter((item) => getCollectionItemKey(item) !== productKey)
    );
  };


  /* =======================================================
     CART
  ======================================================= */

  const activeItems = activeDrawer === "cart" ? cart : wishlist;

  /* =======================================================
     FORM INPUT
  ======================================================= */

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

  };


  /* =======================================================
     CONTACT FORM
  ======================================================= */

  const handleSubmit = (e) => {

    e.preventDefault();

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });

  };


  return (

    <div className="contact-container">


      {/* ===================================================
          NAVBAR
      =================================================== */}

      <nav className="about-navbar">

        <a
          href="/"
          className="about-navbar-logo"
        >

          <img
            src="/logo.png"
            alt="Ceylon Royal Gemstones"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          <div className="about-logo-text">

            <span>
              CEYLON
            </span>

            <small>
              ROYAL GEMSTONES
            </small>

          </div>

        </a>


        <MobileSiteMenu />
        <div className="about-nav-links">

          <a href="/">
            Home
          </a>

          <a href="/#gemstones">
            Shop
          </a>

          <a href="/About">
            Heritage
          </a>
          <a href="/trust">
            Certification
          </a>

          <a href="/reviews">
            Reviews
          </a>

          <a
            href="/contact"
            className="active"
          >
            Contact
          </a>

          <a href="/blog">Blog</a>

          <InternationalNavEntry />

        </div>


        <div className="about-nav-actions">

          <InternationalNavEntry mobile />

          <button
            className="about-nav-icon about-badge-btn"
            title="Wishlist"
            type="button"
            onClick={() =>
              setActiveDrawer("wishlist")
            }
          >

            <FaHeart />

            {wishlist.length > 0 && (

              <span className="about-badge">
                {wishlist.reduce((total, item) => total + item.quantity, 0)}
              </span>

            )}

          </button>


          <button
            className="about-nav-icon about-badge-btn"
            title="Shopping Cart"
            type="button"
            onClick={() =>
              setActiveDrawer("cart")
            }
          >

            <FaShoppingBag />

            {cart.length > 0 && (

              <span className="about-badge">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>

            )}

          </button>


          <button
            className="about-inquire-btn"
            type="button"
            onClick={() =>
              setSelectedGem(gems[0])
            }
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


      {/* ===================================================
          CONTACT HERO
      =================================================== */}

      <section className="contact-hero">

        <div className="contact-hero-overlay"></div>

        <div className="contact-hero-content">


          {/* HERO LOGO */}

          <div className="hero-logo-wrapper">

            <img
              src="/logo.png"
              alt="Ceylon Royal Gemstones Logo"
              className="hero-bright-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://cdn-icons-png.flaticon.com/512/3063/3063822.png";
              }}
            />

            <div className="logo-glow-effect"></div>

          </div>


          {/* SUBTITLE */}

          <span className="gold-subtitle">
            ESTABLISHED IN CEYLON
          </span>


          <h1>
            Contact Our Team
          </h1>

          <p>
            Whether you are looking for a rare Ceylon
            gemstone, need certification information,
            or would like to discuss a private enquiry,
            our team is here to assist you.
          </p>

          <div className="contact-gold-line"></div>

        </div>

      </section>


      {/* ===================================================
          CONTACT SECTION
      =================================================== */}

      <section className="contact-main-section">

        <div className="contact-section-header">

          <span className="contact-gold-subtitle">
            GET IN TOUCH
          </span>

          <h2>
            We Would Love To Hear From You
          </h2>

          <div className="contact-gold-divider"></div>

          <p>
            Connect with our gemstone specialists for
            personalised assistance and enquiries.
          </p>

        </div>


        <div className="contact-grid">


          {/* LEFT */}

          <div className="contact-info-card">

            <div className="contact-info-overlay"></div>

            <div className="contact-info-content">

              <span className="contact-small-title">
                CEYLON ROYAL GEMSTONES
              </span>

              <h2>
                Let's Discuss
                <span>
                  Your Perfect Gem
                </span>
              </h2>

              <p>
                From rare Ceylon sapphires to exceptional
                collector gemstones, our team provides
                personalised guidance throughout your
                gemstone journey.
              </p>


              <div className="contact-info-item">

                <div className="contact-icon">
                  ✉
                </div>

                <div>

                  <span>
                    EMAIL
                  </span>

                  <p>
                    info@ceylonroyalgems.com
                  </p>

                </div>

              </div>


              <div className="contact-info-item">

                <div className="contact-icon">
                  ☎
                </div>

                <div>

                  <span>
                    PHONE
                  </span>

                  <p>
                    +94 11 234 5678
                  </p>

                </div>

              </div>


              <div className="contact-info-item">

                <div className="contact-icon whatsapp-icon">
                  ●
                </div>

                <div>

                  <span>
                    WHATSAPP
                  </span>

                  <p>
                    +94 77 123 4567
                  </p>

                </div>

              </div>


              <div className="contact-info-item">

                <div className="contact-icon">
                  ◆
                </div>

                <div>

                  <span>
                    LOCATION
                  </span>

                  <p>
                    Colombo & Ratnapura,
                    Sri Lanka
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* RIGHT FORM */}

          <div className="contact-form-card">

            <div className="form-heading">

              <span>
                PRIVATE ENQUIRY
              </span>

              <h3>
                Send Us A Message
              </h3>

              <p>
                Fill in the details below and our team
                will get back to you shortly.
              </p>

            </div>


            {submitted && (

              <div className="contact-success">

                <div className="success-icon">
                  ✓
                </div>

                <div>

                  <strong>
                    Message Sent Successfully
                  </strong>

                  <p>
                    Thank you for contacting Ceylon
                    Royal Gemstones. Our team will
                    contact you shortly.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSubmitted(false)
                  }
                >
                  <FaTimes />
                </button>

              </div>

            )}


            <form
              className="contact-form"
              id="contact-form"
              onSubmit={handleSubmit}
            >

              <div className="form-row">

                <div className="form-group">

                  <label>
                    FULL NAME
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    EMAIL ADDRESS
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email address"
                    required
                  />

                </div>

              </div>


              <div className="form-row">

                <div className="form-group">

                  <label>
                    PHONE / WHATSAPP
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+94 XX XXX XXXX"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    SUBJECT
                  </label>

                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                  />

                </div>

              </div>


              <div className="form-group">

                <label>
                  MESSAGE
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your gemstone requirements..."
                  rows="6"
                  required
                ></textarea>

              </div>


              <button
                type="submit"
                className="contact-submit-btn"
              >

                SEND MESSAGE

                <span>
                  →
                </span>

              </button>

            </form>

          </div>

        </div>

      </section>


      <section className="contact-shipping-policy" id="shipping-policies">
        <div className="contact-shipping-policy-inner">
          <div className="contact-shipping-heading">
            <span>BEFORE YOU ORDER</span>
            <h2>Shipping &amp; Returns — Rules &amp; Regulations</h2>
            <p>Clear delivery and return terms, confirmed for your gemstone and destination.</p>
          </div>

          <div className="contact-shipping-policy-grid">
            <article>
              <FaShippingFast aria-hidden="true" />
              <h3>Tracked Delivery</h3>
              <p>Available shipping methods, insurance, delivery estimates and costs are confirmed with your order quote.</p>
            </article>
            <article>
              <FaShieldAlt aria-hidden="true" />
              <h3>Returns &amp; Exchanges</h3>
              <p>Eligibility and return conditions can vary by item. Please request the written terms before completing payment.</p>
            </article>
            <article>
              <FaMapMarkerAlt aria-hidden="true" />
              <h3>International Orders</h3>
              <p>Customs duties and import taxes depend on your country. Contact us for documentation and destination guidance.</p>
            </article>
          </div>

          {/* Rules & Regulations Box */}
          <div className="contact-rules-box">
            <div className="contact-rules-box-header">
              <h3>Rules &amp; Regulations</h3>
            </div>
            <div className="contact-rules-box-content">
              <div className="contact-rules-section">
                <h4>Shipping Rules</h4>
                <ul>
                  <li>All gemstones are shipped via insured, tracked courier services (FedEx/DHL).</li>
                  <li>Delivery estimates: 3-5 business days for domestic, 5-10 business days for international.</li>
                  <li>Shipping costs are calculated based on destination, weight, and insurance value.</li>
                  <li>Orders over $5,000 include complimentary express shipping and full insurance coverage.</li>
                  <li>Tracking information is provided via email once your order has been dispatched.</li>
                </ul>
              </div>
              <div className="contact-rules-section">
                <h4>Return &amp; Exchange Policy</h4>
                <ul>
                  <li>Returns accepted within 14 days of delivery, provided the gemstone is in its original condition.</li>
                  <li>All returned items must include original certification, packaging, and invoice.</li>
                  <li>Custom-made or specially cut gemstones are non-returnable unless defective.</li>
                  <li>Refunds are processed within 5-7 business days after item inspection.</li>
                  <li>Exchange requests are subject to availability and price adjustment if applicable.</li>
                </ul>
              </div>
              <div className="contact-rules-section">
                <h4>International Regulations</h4>
                <ul>
                  <li>Buyers are responsible for all customs duties, import taxes, and brokerage fees.</li>
                  <li>Some countries may require an import permit for gemstones above a certain value.</li>
                  <li>We declare accurate values on all customs documents as required by law.</li>
                  <li>Orders to certain restricted countries may require additional documentation.</li>
                  <li>Contact us before ordering if you have questions about import regulations in your country.</li>
                </ul>
              </div>
              <div className="contact-rules-section">
                <h4>Insurance &amp; Liability</h4>
                <ul>
                  <li>All shipments are fully insured against loss, theft, and damage during transit.</li>
                  <li>Insurance coverage is void if the package is signed for in damaged condition without notation.</li>
                  <li>Claims for damaged items must be reported within 48 hours of delivery.</li>
                  <li>Photographic evidence is required for all damage or loss claims.</li>
                  <li>We are not liable for delays caused by customs, weather, or carrier service disruptions.</li>
                </ul>
              </div>
            </div>
          </div>

          <a className="contact-policy-link" href="mailto:info@ceylonroyalgems.com?subject=Shipping%20and%20returns%20question">
            Ask us about delivery or returns <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* ===================================================
          VALUES
      =================================================== */}

      <section className="contact-values-section">

        <div className="contact-section-header dark">

          <span className="contact-gold-subtitle">
            OUR PROMISE
          </span>

          <h2>
            A Professional Gemstone Experience
          </h2>

          <div className="contact-gold-divider"></div>

        </div>


        <div className="contact-values-grid">

          <div className="contact-value-card">

            <FaGem className="contact-value-icon" />

            <h3>
              Authenticity
            </h3>

            <p>
              Transparent gemstone information and
              responsible presentation.
            </p>

          </div>


          <div className="contact-value-card">

            <FaShieldAlt className="contact-value-icon" />

            <h3>
              Trusted Service
            </h3>

            <p>
              Personalised communication designed
              around customer confidence.
            </p>

          </div>


          <div className="contact-value-card">

            <FaShippingFast className="contact-value-icon" />

            <h3>
              Global Delivery
            </h3>

            <p>
              Supporting clients and collectors
              around the world.
            </p>

          </div>


          <div className="contact-value-card">

            <FaLock className="contact-value-icon" />

            <h3>
              Secure Experience
            </h3>

            <p>
              A professional and secure enquiry
              experience from start to finish.
            </p>

          </div>

        </div>

      </section>


      {/* ===================================================
          CTA
      =================================================== */}

      <section className="contact-cta">

        <div className="contact-cta-overlay"></div>

        <div className="contact-cta-content">

          <span className="contact-gold-subtitle">
            CEYLON ROYAL GEMSTONES
          </span>

          <h2>
            Looking For A
            <span>
              Rare Ceylon Gemstone?
            </span>
          </h2>

          <p>
            Tell us what you are looking for and
            our gemstone specialists will assist you.
          </p>

          <button
            className="contact-gold-btn"
            type="button"
            onClick={() =>
              setSelectedGem(gems[0])
            }
          >
            PRIVATE INQUIRY
            <span>
              →
            </span>
          </button>

        </div>

      </section>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer
        className="contact-footer"
        id="contact"
      >

        <div className="contact-footer-grid">


          {/* BRAND */}

          <div className="footer-brand">

            <div className="footer-logo contact-footer-logo">

              <img
                src="/logo.png"
                alt="Ceylon Royal Gemstones"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <div className="contact-footer-logo-text">

                <strong>
                  CEYLON
                </strong>

                <small>
                  ROYAL GEMSTONES
                </small>

              </div>

            </div>

            <p>
              Discover the timeless beauty of authentic
              Sri Lankan gemstones, carefully sourced,
              crafted and presented with royal elegance.
            </p>

          </div>


          {/* EXPLORE */}

          <div className="contact-footer-column">

            <h4>
              EXPLORE
            </h4>

            <a href="/">
              Home
            </a>

            <a href="/#gemstones">
              Shop
            </a>

            <a href="/About">
              Our Heritage
            </a>
            <a href="/trust">
              Trust & Certification
            </a>

            <a href="/reviews">
              Reviews
            </a>

            <a href="/contact">
              Contact
            </a>

          </div>


          {/* CONTACT */}

          <div className="contact-footer-column">

            <h4>
              CONTACT
            </h4>

            <a href="tel:+94112345678">
              <FaPhoneAlt />
              +94 11 234 5678
            </a>

            <a href="mailto:info@ceylonroyalgems.com">
              <FaEnvelope />
              info@ceylonroyalgems.com
            </a>

            <a
              href="https://wa.me/94771234567"
              target="_blank"
              rel="noreferrer"
              className="footer-whatsapp"
            >
              <FaWhatsapp />
              WhatsApp
            </a>

            <a href="#">
              <FaMapMarkerAlt />
              Colombo & Ratnapura, Sri Lanka
            </a>

          </div>


          {/* FOLLOW */}

          <div className="contact-footer-column">

            <h4>
              FOLLOW US
            </h4>

            <p>
              Follow our journey and discover the world
              of Ceylon gemstones.
            </p>

            <div className="footer-social-icons">

              <a href="#">
                <FaInstagram />
              </a>

              <a href="#">
                <FaFacebookF />
              </a>

              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noreferrer"
                className="footer-whatsapp-icon"
              >
                <FaWhatsapp />
              </a>

            </div>

          </div>

        </div>


        <div className="contact-footer-bottom">

          <p>
            © 2026 Ceylon Royal Gemstones. All Rights Reserved.
          </p>

          <span>
            NATURAL • AUTHENTIC • CEYLON
          </span>

        </div>

      </footer>


      {/* ===================================================
          DRAWER
      =================================================== */}

      {activeDrawer && (

        <div
          className="about-drawer-backdrop"
          onClick={() =>
            setActiveDrawer(null)
          }
        >

          <div
            className="about-drawer"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="about-drawer-header">

              <h3>
                {activeDrawer === "cart"
                  ? "Shopping Cart"
                  : "Your Wishlist"}
              </h3>

              <button
                type="button"
                aria-label="Close panel"
                onClick={() =>
                  setActiveDrawer(null)
                }
              >
                <FaTimes />
              </button>

            </div>


            <div className="about-drawer-body">

              {activeItems.length === 0 ? (
                <div className="drawer-empty">
                  <FaGem />
                  <p>Nothing here yet.</p>
                </div>
              ) : (
                activeItems.map((gem) => (
                  <div
                    className="drawer-item"
                    key={getCollectionItemKey(gem)}
                  >
                    <img src={gem.image} alt={gem.name} />
                    <div>
                      <h4>{gem.name}</h4>
                      <p>{gem.carat}</p>
                      <span>{formatPrice(gem.price)}</span>
                      {Number(gem.quantity) > 1 && (
                        <small>Qty {gem.quantity}</small>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${gem.name}`}
                      onClick={() => {
                        if (activeDrawer === "cart") {
                          const productKey = getCollectionItemKey(gem);
                          setCart((current) => current.filter(
                            (item) => getCollectionItemKey(item) !== productKey
                          ));
                        } else {
                          toggleWishlist(gem);
                        }
                      }}
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

          </div>

        </div>

      )}


      {/* ===================================================
          INQUIRY MODAL
      =================================================== */}

      {selectedGem && (

        <div
          className="about-modal-backdrop"
          onClick={() =>
            setSelectedGem(null)
          }
        >

          <div
            className="about-inquiry-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="about-modal-close"
              type="button"
              aria-label="Close inquiry form"
              onClick={() =>
                setSelectedGem(null)
              }
            >
              <FaTimes />
            </button>


            <img
              src="/logo.png"
              alt="Ceylon Royal Gemstones"
              className="about-modal-logo"
            />


            <span>
              PRIVATE GEMSTONE INQUIRY
            </span>


            <h3>
              {selectedGem.name}
            </h3>


            <p>
              {selectedGem.origin}
              {" • "}
              {selectedGem.carat}
            </p>


            <form
              onSubmit={(e) => {

                e.preventDefault();

                alert(
                  "Your inquiry has been sent successfully!"
                );

                setSelectedGem(null);

              }}
            >

              <input
                type="text"
                placeholder="Your Full Name"
                required
              />

              <input
                type="email"
                placeholder="Email Address"
                required
              />

              <input
                type="tel"
                placeholder="WhatsApp / Phone Number"
                required
              />

              <textarea
                placeholder="Tell us about your requirements..."
                rows="4"
                required
              ></textarea>

              <button type="submit">
                SEND INQUIRY
              </button>

            </form>

          </div>

        </div>

      )}

    </div>

  );
};


export default Contact;