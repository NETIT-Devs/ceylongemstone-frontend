import React, { useState } from "react";
import {
  FaHeart,
  FaShoppingBag,
  FaSearch,
  FaTimes,
  FaTrash,
  FaGem,
  FaWhatsapp,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebookF
} from "react-icons/fa";

import "./About.css";
import CollectionDrawerActions from "../components/CollectionDrawerActions.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import { getCollectionItemKey, useSharedCollection } from "../useSharedCollection.js";

const About = () => {

  // =====================================================
  // GEM DATA
  // =====================================================

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


  // =====================================================
  // STATES
  // =====================================================

  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [selectedGem, setSelectedGem] = useState(null);


  // =====================================================
  // PROCESS STEPS
  // =====================================================

  const steps = [
    {
      id: "01",
      title: "Traditional Gem Mining",
      subtitle: "Ethically Sourced Ceylon Treasures",
      description:
        "Our journey begins deep in the rich soils of Ratnapura. Using time-honored, sustainable techniques passed down through generations, our artisans carefully extract raw gemstones while respecting nature.",
      image:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1000",
      badge: "MINING & PIT EXTRACTION"
    },
    {
      id: "02",
      title: "Precision Cutting & Lapidary",
      subtitle: "Unlocking Natural Brilliance",
      description:
        "Every rough gem is uniquely assessed. Master lapidaries inspect light refraction and crystal axes before hand-cutting each facet to maximize fire, clarity, and magnificent color display.",
      image:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1000",
      badge: "MASTER CRAFTSMANSHIP"
    },
    {
      id: "03",
      title: "Polishing & Authentication",
      subtitle: "Certified Perfection",
      description:
        "The final stage involves high-precision polishing to achieve mirror-like luster. Each stone undergoes rigorous gemological testing and international certification before entering our signature collection.",
      image:
        "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=1000",
      badge: "CERTIFIED ELEGANCE"
    }
  ];


  // =====================================================
  // VALUES
  // =====================================================

  const values = [
    {
      icon: <FaGem />,
      title: "Authenticity",
      text: "We value genuine Ceylon gemstones and transparent sourcing."
    },
    {
      icon: <FaHeart />,
      title: "Craftsmanship",
      text: "Every gemstone receives careful attention from skilled artisans."
    },
    {
      icon: <FaShoppingBag />,
      title: "Excellence",
      text: "We focus on exceptional quality, presentation and service."
    },
    {
      icon: <FaGem />,
      title: "Trust",
      text: "Our commitment is built around confidence and long-term relationships."
    }
  ];


  return (
    <div className="about-container">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="about-navbar">

        {/* LOGO */}

        <a href="/" className="about-navbar-logo">

          <img
            src="/logo.png"
            alt="Ceylon Royal Gemstones"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://cdn-icons-png.flaticon.com/512/3063/3063822.png";
            }}
          />

          <div className="about-logo-text">
            <span>CEYLON</span>
            <small>ROYAL GEMSTONES</small>
          </div>

        </a>


        {/* NAV LINKS */}

        <div className="about-nav-links">

          <a href="/">
            Home
          </a>

          <a href="/#Gemstones">
            Gemstones
          </a>

          <a
            href="/About"
            className="active"
          >
            Heritage
          </a>
          <a href="/trust">
            Certification
          </a>

          <a href="/reviews">
            Reviews
          </a>

          <a href="/contact">
            Contact
          </a>

          <a href="/blog">
            Blog
          </a>

          <a href="/login">
            Login
          </a>

          <InternationalNavEntry />

        </div>


        {/* NAV ACTIONS */}

        <div className="about-nav-actions">

          <InternationalNavEntry mobile />

          {/* SEARCH */}

          <button
            className="about-nav-icon"
            title="Search"
            onClick={() => {
              const query = prompt("Search gemstones:");
              if (query) {
                window.location.href = `/?search=${encodeURIComponent(query)}`;
              }
            }}
          >

            <FaSearch />

          </button>


          {/* WISHLIST */}

          <button
            className="about-nav-icon"
            title="Wishlist"
            onClick={() => setActiveDrawer("wishlist")}
          >

            <FaHeart />

            {wishlist.length > 0 && (
              <span className="about-badge">
                {wishlist.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}

          </button>


          {/* CART */}

          <button
            className="about-nav-icon"
            title="Shopping Cart"
            onClick={() => setActiveDrawer("cart")}
          >

            <FaShoppingBag />

            {cart.length > 0 && (
              <span className="about-badge">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}

          </button>


          {/* INQUIRE */}

          <button
            className="about-inquire-btn"
            onClick={() => setSelectedGem(gems[0])}
          >
            INQUIRE NOW
          </button>

        </div>

      </nav>


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="about-hero">

        <div className="hero-overlay"></div>

        <div className="about-hero-content">

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


          <span className="gold-subtitle">
            ESTABLISHED IN CEYLON
          </span>


          <h1>
            Crafting The Legacy
            <br />
            Of Natural Gems
          </h1>


          <p>
            From deep earth shafts to royal crowns —
            explore the authentic art of traditional gem
            mining and precision cutting.
          </p>


          <div className="about-gold-line"></div>

        </div>

      </section>


      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="about-stats-section">

        <div className="stat-card">

          <h2>100%</h2>

          <p>
            Natural & Unheated
          </p>

        </div>


        <div className="stat-card gold-border">

          <h2>30+</h2>

          <p>
            Years of Heritage
          </p>

        </div>


        <div className="stat-card">

          <h2>GIA / GRS</h2>

          <p>
            Certified Quality
          </p>

        </div>

      </section>


      {/* =====================================================
          PROCESS SECTION
      ====================================================== */}

      <section className="process-section">

        <div className="section-header">

          <span className="gold-subtitle">
            OUR JOURNEY & ARTISTRY
          </span>

          <h2>
            How Our Gems Come To Life
          </h2>

          <div className="gold-divider"></div>

          <p className="about-section-description">
            From the depths of Sri Lankan soil to the final
            polished gemstone, every Ceylon gem passes through
            a journey of expertise, craftsmanship and care.
          </p>

        </div>


        <div className="process-list">

          {steps.map((step, index) => (

            <div
              className={`process-row ${
                index % 2 !== 0 ? "reverse" : ""
              }`}
              key={step.id}
            >

              {/* IMAGE */}

              <div className="process-image-wrapper">

                <div className="image-glow"></div>

                <img
                  src={step.image}
                  alt={step.title}
                  className="process-img"
                />

                <span className="process-badge">
                  {step.badge}
                </span>

              </div>


              {/* CONTENT */}

              <div className="process-content">

                <span className="step-number">
                  {step.id}
                </span>

                <span className="process-label">
                  CEYLON ROYAL GEMSTONES
                </span>

                <h3>
                  {step.title}
                </h3>

                <h4 className="step-subtitle">
                  {step.subtitle}
                </h4>

                <p>
                  {step.description}
                </p>


                <div className="certification-tags">

                  <span>
                    AUTHENTIC
                  </span>

                  <span>
                    HANDCRAFTED
                  </span>

                  <span>
                    PREMIUM
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* =====================================================
          VALUES
      ====================================================== */}

      <section className="values-section">

        <div className="section-header">

          <span className="gold-subtitle">
            WHAT WE STAND FOR
          </span>

          <h2>
            Our Values
          </h2>

          <div className="gold-divider"></div>

        </div>


        <div className="values-grid">

          {values.map((value, index) => (

            <div
              className="value-card"
              key={index}
            >

              <div className="value-icon">
                {value.icon}
              </div>

              <h3>
                {value.title}
              </h3>

              <p>
                {value.text}
              </p>

            </div>

          ))}

        </div>

      </section>


      {/* =====================================================
          SHOWROOM
      ====================================================== */}

      <section className="showroom-spotlight">

        <div className="showroom-overlay"></div>

        <div className="showroom-content">

          <span className="gold-subtitle">
            THE CEYLON LEGACY
          </span>

          <h2>
            Authentic Royal
            <span>Craftsmanship</span>
          </h2>

          <p>
            We preserve traditional artisanal techniques
            while delivering world-class clarity, brilliance
            and timeless elegance.
          </p>

          <button
            className="gold-btn"
            onClick={() => setSelectedGem(gems[0])}
          >
            EXPLORE COLLECTION
          </button>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="about-footer">

        <div className="about-footer-grid">

          {/* BRAND */}

          <div className="footer-brand">

            <div className="footer-logo">

              <img
                src="/logo.png"
                alt="Ceylon Royal Gemstones"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://cdn-icons-png.flaticon.com/512/3063/3063822.png";
                }}
              />

              <div>
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

          <div>

            <h4>
              EXPLORE
            </h4>

            <a href="/">
              Home
            </a>

            <a href="/#gemstones">
              Gemstones
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

          <div>

            <h4>
              CONTACT
            </h4>

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


          {/* SOCIAL */}

          <div>

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
                href="https://wa.me/94712345678"
                target="_blank"
                rel="noreferrer"
                className="footer-whatsapp-icon"
              >
                <FaWhatsapp />
              </a>

            </div>

          </div>

        </div>


        <div className="about-footer-bottom">

          <p>
            © 2026 Ceylon Royal Gemstones. All Rights Reserved.
          </p>

          <span>
            NATURAL • AUTHENTIC • CEYLON
          </span>

        </div>

      </footer>


      {/* =====================================================
          WISHLIST / CART DRAWER
      ====================================================== */}

      {activeDrawer && (

        <div
          className="about-drawer-backdrop"
          onClick={() => setActiveDrawer(null)}
        >

          <div
            className="about-drawer"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="about-drawer-header">

              <h3>
                {activeDrawer === "cart"
                  ? "Shopping Cart"
                  : "Your Wishlist"}
              </h3>

              <button
                onClick={() => setActiveDrawer(null)}
              >
                <FaTimes />
              </button>

            </div>


            <div className="about-drawer-body">

              {(activeDrawer === "cart"
                ? cart
                : wishlist
              ).length === 0 ? (

                <div className="drawer-empty">

                  <FaGem />

                  <p>
                    Nothing here yet.
                  </p>

                </div>

              ) : (

                (activeDrawer === "cart"
                  ? cart
                  : wishlist
                ).map((gem) => (

                  <div
                    className="drawer-item"
                    key={getCollectionItemKey(gem)}
                  >

                    <img
                      src={gem.image}
                      alt={gem.name}
                    />

                    <div>

                      <h4>
                        {gem.name}
                      </h4>

                      <p>
                        {gem.carat}
                      </p>

                      <span>
                        ${(Number(gem.price || 0) * (Number(gem.quantity) || 1)).toLocaleString("en-US")}
                      </span>

                    </div>


                    <button
                      onClick={() => {
                        const productKey = getCollectionItemKey(gem);
                        (activeDrawer === "cart" ? setCart : setWishlist)((current) =>
                          current.filter((item) => getCollectionItemKey(item) !== productKey)
                        );
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


      {/* =====================================================
          INQUIRY MODAL
      ====================================================== */}

      {selectedGem && (

        <div
          className="about-modal-backdrop"
          onClick={() => setSelectedGem(null)}
        >

          <div
            className="about-inquiry-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="about-modal-close"
              aria-label="Close inquiry form"
              onClick={() => setSelectedGem(null)}
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

export default About;