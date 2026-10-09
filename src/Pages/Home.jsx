import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

import {
  FaHeart,
  FaShoppingBag,
  FaShieldAlt,
  FaShippingFast,
  FaGem,
  FaLock,
  FaTimes,
  FaTrash,
  FaStar,
  FaUser,
  FaWhatsapp,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebookF
} from "react-icons/fa";

import "./Home.css";
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";
import hero1Img from "../assets/hero1.jpeg";
import hero3Img from "/BlueHero.png";
import hero4Img from "/HeroNew.jpeg";
import CollectionDrawerActions from "../components/CollectionDrawerActions.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import { useCustomerReviews } from "../useCustomerReviews.js";
import { hasAdminAccess } from "../adminAccess.js";
import {
  getCollectionItemKey,
  useSharedCollection
} from "../useSharedCollection.js";
import {
  currencyRates,
  formatCurrencyPrice,
  getCurrentCurrency
} from "../currency.js";
import { products as gemstonesProducts, categories } from "./Gemstones.jsx";


// =====================================================
// GEM DATA
// =====================================================

// Map Gemstones products → Home card format
const categoryKeyMap = {
  "Blue Sapphire":        "BLUE SAPPHIRE",
  "Yellow Sapphire":      "YELLOW SAPPHIRE",
  "Green Gemstone":       "GREEN GEMSTONE",
  "Padparadscha Sapphire":"PADPARADSCHA SAPPHIRE",
  "Ruby":                 "RUBY",
  "Star Sapphire":        "STAR SAPPHIRE",
  "Cat's Eye":            "CAT'S EYE",
  "Alexandrite":          "ALEXANDRITE",
};

const tagMap = {
  "Blue Sapphire":        "CERTIFIED NATURAL",
  "Yellow Sapphire":      "UNTREATED NATURAL",
  "Green Gemstone":       "NATURAL GREEN GEM",
  "Padparadscha Sapphire":"RARE COLLECTOR",
  "Ruby":                 "FINE VIVID RED",
  "Star Sapphire":        "RARE ASTERISM",
  "Cat's Eye":            "CHATOYANT BERYL",
  "Alexandrite":          "COLOR CHANGE RARE",
};

const initialGems = gemstonesProducts.map((p) => ({
  id:           p.id,
  detailId:     p.id,
  categoryKey:  categoryKeyMap[p.category] || p.category.toUpperCase(),
  productKey:   p.productKey || `gem-${p.id}`,
  name:         p.name.toUpperCase(),
  origin:       p.origin || "Sri Lanka",
  carat:        `${p.carat} Ct`,
  basePriceUSD: p.price,
  image:        p.image,
  tag:          tagMap[p.category] || "NATURAL GEM",
}));


// =====================================================
// =====================================================
// HERO SLIDES (Image Slideshow)
// =====================================================

const heroSlides = [
  {
    id: 1,
    image: hero1Img,
    alt: "Royal Blue Sapphire"
  },
  {
    id: 2,
    image: "/hero2.png",
    alt: "Ceylon Gemstone"
  },
  {
    id: 3,
    image: hero3Img,
    alt: "Ceylon Royal Sapphire Cluster"
  },
  {
    id: 4,
    image: hero4Img,
    alt: "Rare Ceylon Green Gemstones"
  }
];


// =====================================================
// HERITAGE SLIDES (Videos with poster fallbacks)
// =====================================================

const heritageSlides = [
  {
    id: 1,
    video: "/gemV3.mp4",
    poster: "/ceti.jpg",
    caption: "Authentic Ceylon Gemstone Mining & Heritage"
  },
  {
    id: 2,
    video: "/gemV2.mp4",
    poster: "/gem_view_14.jpg",
    caption: "Precision Master Cutting & Certification"
  },
  {
    id: 3,
    video: "/gemV3.mp4",
    poster: "/ceti.jpg",
    caption: "Authentic Ceylon Gemstone Mining & Heritage"
  }
];
// =====================================================
// CURRENCY
// =====================================================

// =====================================================
// HOME
// =====================================================

const Home = () => {

  // =====================================================
  // STATES
  // =====================================================

  const [selectedGem, setSelectedGem] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [showMyOrdersLink] = useState(() => {
    try {
      const customer = JSON.parse(
        window.localStorage.getItem("ceylon-user") || "null"
      );
      return customer?.loggedIn === true && !hasAdminAccess("/admin");
    } catch {
      return false;
    }
  });

  const [currency, setCurrency] = useState(getCurrentCurrency);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const currencyRef = useRef(null);


  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");

  const [activeDrawer, setActiveDrawer] = useState(null);
  const [customerReviews] = useCustomerReviews();


  // =====================================================
  // CLOSE CURRENCY DROPDOWN
  // =====================================================

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        currencyRef.current &&
        !currencyRef.current.contains(event.target)
      ) {
        setCurrencyOpen(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);


  // =====================================================
  // HERITAGE SLIDER & VIDEO PLAYBACK
  // =====================================================

  const heritageVideoRefs = useRef([]);

  useEffect(() => {
    heritageVideoRefs.current.forEach((el, idx) => {
      if (!el) return;
      el.muted = true;
      el.defaultMuted = true;
      if (idx === currentSlide) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    });
  }, [currentSlide]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(
        (prev) => (prev + 1) % heritageSlides.length
      );
    }, 6000);

    return () => clearInterval(timer);
  }, []);


  // =====================================================
  // HERO IMAGE SLIDESHOW
  // =====================================================

  useEffect(() => {
    const heroTimer = setInterval(() => {
      setHeroSlideIndex(
        (prev) => (prev + 1) % heroSlides.length
      );
    }, 5000);

    return () => clearInterval(heroTimer);
  }, []);

  useEffect(() => {
    const handleHashScroll = () => {
      if (window.location.hash === "#main-categories" || window.location.hash === "#categories") {
        const el = document.getElementById("main-categories");
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }
      }
    };
    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);


  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (basePriceUSD) =>
    formatCurrencyPrice(basePriceUSD, currency);



  const removeCollectionItem = (setItems, productKey) => {
    setItems((current) =>
      current.filter((item) => getCollectionItemKey(item) !== productKey)
    );
  };

  const wishlistCount = wishlist.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );





  return (

    <div className="home-full-wrapper">


      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="about-navbar">


        {/* LOGO */}

        <a
          href="/"
          className="about-navbar-logo"
        >

          <img
            src="/logo.png"
            alt="Ceylon Royal Gemstones"
            className="navbar-logo-img"
            onError={(e) => {

              e.target.onerror = null;

              e.target.src =
                "/logo.png";

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


        {/* NAV LINKS */}

        <MobileSiteMenu />
        <div className="about-nav-links">

          <a
            href="/"
            className="active"
          >
            Home
          </a>

          <a href="/Gemstones">
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

          <a href="/contact">
            Contact
          </a>

          <a href="/blog">
            Blog
          </a>

          {showMyOrdersLink && <a href="/my-orders">My Orders</a>}

          <InternationalNavEntry />

        </div>


        {/* NAV ACTIONS */}

        <div className="about-nav-actions">


          {/* =================================================
              CURRENCY
          ================================================= */}

          <div
            className="currency-selector"
            ref={currencyRef}
          >

            <button
              type="button"
              className="currency-current"
              onClick={() =>
                setCurrencyOpen(
                  !currencyOpen
                )
              }
              aria-label="Select currency"
            >

              <img
                src={(currencyRates[currency] || currencyRates.USD).flag}
                alt={`${currency} flag`}
                className="currency-flag"
              />

              <span className="home-currency-current-code">{currency}</span>

              <span className="currency-symbol">
                {currencyRates[currency].symbol.trim()}
              </span>

              <span className="currency-chevron">
                ▾
              </span>

            </button>


            {currencyOpen && (

              <div className="currency-dropdown">

                {Object.entries(currencyRates).map(([code, option]) => (

                  <button
                    type="button"
                    key={code}
                    className={
                      `currency-option ${
                        currency === code
                          ? "selected"
                          : ""
                      }`
                    }
                    onClick={() => {

                      setCurrency(code);
                      window.localStorage.setItem("ceylon-currency", code);
                      window.dispatchEvent(new Event("ceylon-currency-change"));
                      const foreignCurrency = code !== "LKR";
                      window.localStorage.setItem(
                        "ceylon-international-enabled",
                        String(foreignCurrency)
                      );
                      window.dispatchEvent(new Event("ceylon-international-mode-change"));

                      setCurrencyOpen(false);

                    }}
                  >

                    <img src={option.flag} alt={`${code} flag`} className="currency-flag" />
                    <span className="home-currency-option-code">{code}</span>
                    <span className="home-currency-option-symbol">{option.symbol.trim()}</span>

                  </button>

                ))}

              </div>

            )}

          </div>

          <InternationalNavEntry mobile />


          {/* =================================================
              WISHLIST
          ================================================= */}

          <button
            className="about-nav-icon"
            title="Wishlist"
            onClick={() =>
              setActiveDrawer(
                "wishlist"
              )
            }
          >

            <FaHeart />

            {wishlistCount > 0 && (

              <span className="about-badge">
                {wishlistCount}
              </span>

            )}

          </button>


          {/* =================================================
              CART
          ================================================= */}

          <button
            className="about-nav-icon"
            title="Shopping Cart"
            onClick={() =>
              setActiveDrawer("cart")
            }
          >

            <FaShoppingBag />

            {cartCount > 0 && (

              <span className="about-badge">
                {cartCount}
              </span>

            )}

          </button>


          {/* =================================================
              INQUIRE NOW
          ================================================= */}

          <button
            className="about-inquire-btn"
            onClick={() =>
              setSelectedGem(
                initialGems[0]
              )
            }
          >

            INQUIRE NOW

          </button>

          {/* =================================================
              JOIN US
          ================================================= */}

          <a
            href="/join-us"
            className="navbar-joinus-btn"
            title="Join With Us"
          >
            <span>JOIN US</span>
          </a>

          {/* =================================================
              LOGIN
          ================================================= */}

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


      {/* =====================================================
          FIRST SCREEN / HERO & TRUST FOLD
      ====================================================== */}
      <div className="hero-viewport-fold">

        {/* HERO SECTION */}
        <section
          className="gem-hero"
          id="home"
        >

          {/* HERO IMAGE SLIDESHOW */}
          <div className="hero-slides-wrapper">
            {heroSlides.map((slide, idx) => (
              <img
                key={slide.id}
                src={slide.image}
                alt={slide.alt}
                className={`hero-slide-img ${heroSlideIndex === idx ? "active" : ""}`}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
                onError={(e) => {
                  if (!e.target.dataset.triedFallback) {
                    e.target.dataset.triedFallback = "true";
                    e.target.src = `/hero${idx + 1}.jpg`;
                  }
                }}
              />
            ))}
          </div>

          {/* HERO SLIDE DOTS */}
          <div className="hero-slide-dots">
            {heroSlides.map((slide, idx) => (
              <span
                key={slide.id}
                className={`hero-dot ${heroSlideIndex === idx ? "active" : ""}`}
                onClick={() => setHeroSlideIndex(idx)}
                title={slide.alt}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* HERO NAVIGATION ARROWS */}
          <button
            type="button"
            className="hero-arrow-btn hero-arrow-prev"
            onClick={() => setHeroSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            type="button"
            className="hero-arrow-btn hero-arrow-next"
            onClick={() => setHeroSlideIndex((prev) => (prev + 1 % heroSlides.length))}
            aria-label="Next slide"
          >
            ›
          </button>


          <div className="hero-overlay" />

          <div className="hero-glow glow-one" />

          <div className="hero-glow glow-two" />


          <div className="hero-main-container center-layout">

            <div className="hero-content home-hero-copy">


              <motion.div
                className="hero-badge"
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 0.8
                }}
              >

                <span className="badge-dot" />

                AUTHENTIC · RARE · TIMELESS

              </motion.div>


              <motion.h1
                initial={{
                  opacity: 0,
                  y: 30
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 1,
                  delay: 0.2
                }}
              >

                Discover the

                <br />

                <span className="gold-gradient">
                  Beauty Within
                </span>

              </motion.h1>


              <motion.p
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 1,
                  delay: 0.4
                }}
              >

                Discover exceptional gemstones from Sri Lanka and the
                <br />
                world's finest origins.

              </motion.p>


              <motion.div
                className="hero-actions"
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 1,
                  delay: 0.6
                }}
              >

                <a
                  href="/Gemstones"
                  className="btn-primary"
                >
                  Explore Collection &rarr;
                </a>

                <a
                  href="https://wa.me/94712345678?text=Hi%2C%20I%20would%20like%20to%20book%20a%20video%20consultation."
                  className="btn-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  Book a Video Consultation
                </a>

              </motion.div>

            </div>

          </div>

        </section>


        {/* =====================================================
            HERO TRUST BAR
        ====================================================== */}

        <div className="hero-trust-bar">

          <div className="trust-bar-item">

            <FaShieldAlt className="trust-bar-icon" />

            <div>

              <h4>
                100% Certified Natural
              </h4>

              <p>
                Authentic Sri Lankan Gemstones
              </p>

            </div>

          </div>


          <div className="trust-bar-item">

            <FaShippingFast className="trust-bar-icon" />

            <div>

              <h4>
                Worldwide Express Shipping
              </h4>

              <p>
                Safe & Secure Delivery
              </p>

            </div>

          </div>


          <div className="trust-bar-item">

            <FaGem className="trust-bar-icon" />

            <div>

              <h4>
                GIA / GRS Certified
              </h4>

              <p>
                International Lab Reports
              </p>

            </div>

          </div>


          <div className="trust-bar-item">

            <FaLock className="trust-bar-icon" />

            <div>

              <h4>
                Secure Payments
              </h4>

              <p>
                Your Trust, Our Priority
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          GEMSTONE CATEGORIES
      ====================================================== */}

      <section
        className="gem-category-section"
        id="main-categories"
      >
        <span id="gemstones" style={{ display: "none" }} />

        <div className="gem-section-heading">

          <span>EXPLORE OUR COLLECTION</span>

          <h2>
            Gemstone <strong>Categories</strong>
          </h2>

          <p>
            Discover exceptional gemstones from the finest gemstone regions of Sri Lanka.
          </p>

        </div>

        <div className="gem-category-grid">

          {categories
            .filter((category) => category !== "Padparadscha Sapphire")
            .map((category) => {

            return (
              <button
                key={category}
                type="button"
                className="gem-category-card"
                onClick={() => {
                  const destination = category === "All Gemstones"
                    ? "/Gemstones"
                    : `/Gemstones?category=${encodeURIComponent(category)}`;
                  window.location.assign(destination);
                }}
              >

                <div className="category-gem-icon">
                  <FaGem />
                </div>

                <span>{category}</span>

                <small>
                  Explore Collection
                </small>

              </button>
            );
          })}

        </div>

      </section>


      {/* =====================================================
          HERITAGE SECTION
      ====================================================== */}

      <section
        className="heritage-section-full"
        id="story"
      >

        <div className="heritage-slider-container-full">

          <div className="heritage-slider-frame-full">

            <div
              className="heritage-slider-track-full"
              style={{
                transform:
                  `translateX(-${currentSlide * 100}%)`
              }}
            >

              {heritageSlides.map(
                (slide, index) => (

                  <div
                    key={slide.id}
                    className="heritage-slide-full"
                  >

                    {slide.video ? (
                      currentSlide === index ? (
                        <video
                          ref={(el) => {
                            heritageVideoRefs.current[index] = el;
                          }}
                          src={slide.video}
                          poster={slide.poster}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="slide-img-full"
                        />
                      ) : (
                        <div className="slide-img-full" style={{ backgroundColor: "#041d1a" }} />
                      )
                    ) : (
                      <img
                        src={slide.poster}
                        alt={slide.caption}
                        className="slide-img-full"
                        loading="lazy"
                      />
                    )}

                    <div className="slide-caption-overlay">
                      {slide.caption}
                    </div>

                  </div>

                )
              )}

            </div>


            <div className="slider-dots-full">

              {heritageSlides.map(
                (_, index) => (

                  <span
                    key={index}
                    className={
                      `dot-full ${
                        currentSlide === index
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      setCurrentSlide(
                        index
                      )
                    }
                  />

                )
              )}

            </div>

          </div>

        </div>


        <div className="heritage-content-below">

          <span className="subtitle">
            OUR LEGACY
          </span>

          <h2>
            Centuries of Craftsmanship & Trust
          </h2>

          <p>

            Sri Lanka, historically known as Ratna-Dweepa
            (Gem Island), produces some of the world's
            most breathtaking gemstones. For generations,
            Ceylon Royal Gemstones has preserved the art
            of ethical mining, precision cutting, and
            global certification.

          </p>


          <div className="heritage-features-inline">

            <div className="feature-box">

              <h4>
                GIA & GRS Certified
              </h4>

              <p>
                Every gemstone comes with internationally
                recognized laboratory certificates.
              </p>

            </div>


            <div className="feature-box">

              <h4>
                Ethically Mined
              </h4>

              <p>
                Committed to eco-friendly extraction and
                direct miner empowerment.
              </p>

            </div>

          </div>


          <div className="heritage-action-btn">

            <a
              href="/About"
              className="btn-about-us"
            >

              More Details About Us

              <span>
                →
              </span>

            </a>

          </div>

        </div>

      </section>


      {/* =====================================================
          CUSTOMER REVIEWS
      ====================================================== */}

      <section
        className="reviews-section"
        id="reviews"
      >

        <div className="reviews-container">

          <div className="reviews-header">

            <span className="subtitle">
              CLIENT TESTIMONIALS
            </span>

            <h2>
              REVIEWS FROM COLLECTORS
            </h2>

            <div className="gold-line" />

            <p>

              Read genuine reviews from distinguished
              gemstone connoisseurs and luxury jewelry
              collectors around the globe.

            </p>

          </div>


          <div className="reviews-grid">

            {customerReviews.map(
              (review) => (

                <div
                  className="review-card"
                  key={review.id}
                >

                  <div className="star-rating">

                    {[...Array(
                      review.rating
                    )].map(
                      (_, i) => (

                        <FaStar
                          key={i}
                          className="star-icon"
                        />

                      )
                    )}

                  </div>


                  <p className="review-comment">

                    "{review.comment}"

                  </p>


                  <div className="review-user-info">

                    {review.avatar ? (
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="review-avatar"
                      />
                    ) : (
                      <span className="review-avatar-fallback" aria-hidden="true">
                        {review.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}

                    <div>

                      <h4 className="user-name">
                        {review.name}
                      </h4>

                      <span className="user-location">
                        {review.location}
                      </span>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          ORDER WITH CONFIDENCE
      ====================================================== */}

      <section className="trust-section">

        <div className="section-header">

          <h2>
            Order With Confidence
          </h2>

          <div className="gold-line" />

        </div>


        <div className="trust-grid">

          <div className="trust-card">

            <span className="trust-icon">
              🚚
            </span>

            <h3>
              Worldwide Express Shipping
            </h3>

            <p>
              FedEx / DHL Insured
            </p>

          </div>


          <div className="trust-card">

            <span className="trust-icon">
              🔒
            </span>

            <h3>
              Secure Payments
            </h3>

            <p>
              Encrypted Checkout
            </p>

          </div>


          <div className="trust-card">

            <span className="trust-icon">
              📜
            </span>

            <h3>
              GIA / GRS Certified
            </h3>

            <p>
              100% Authentic Gems
            </p>

          </div>


          <div className="trust-card">

            <span className="trust-icon">
              💬
            </span>

            <h3>
              24/7 Concierge
            </h3>

            <p>
              Personal Support
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          WISHLIST / CART DRAWER
          SAME AS ABOUT PAGE
      ====================================================== */}

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


            {/* DRAWER HEADER */}

            <div className="about-drawer-header">

              <h3>

                {activeDrawer === "cart"
                  ? "Your Cart"
                  : "Your Wishlist"}

              </h3>


              <button
                onClick={() =>
                  setActiveDrawer(null)
                }
              >

                <FaTimes />

              </button>

            </div>


            {/* DRAWER BODY */}

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

                (
                  activeDrawer === "cart"
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
                      onError={(e) => {

                        e.target.src =
                          "https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&q=80&w=600";

                      }}
                    />


                    <div>

                      <h4>
                        {gem.name}
                      </h4>

                      <p>
                        {gem.carat}
                      </p>

                      <span>
                        {formatPrice(gem.basePriceUSD ?? gem.price)}
                      </span>

                      <small>Qty 1</small>

                    </div>


                    <button
                      onClick={() => {

                        if (
                          activeDrawer ===
                          "cart"
                        ) {

                          removeCollectionItem(
                            setCart,
                            getCollectionItemKey(gem)
                          );

                        } else {

                          removeCollectionItem(
                            setWishlist,
                            getCollectionItemKey(gem)
                          );

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


      {/* =====================================================
          INQUIRY MODAL
          EXACT ABOUT PAGE STYLE
      ====================================================== */}

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


            {/* CLOSE */}

            <button
              type="button"
              className="about-modal-close"
              aria-label="Close inquiry form"
              onClick={() =>
                setSelectedGem(null)
              }
            >

              <FaTimes />

            </button>


            {/* LOGO */}

            <img
              src="/logo.png"
              alt="Ceylon Royal Gemstones"
              className="about-modal-logo"
              onError={(e) => {

                e.target.onerror = null;

                e.target.src =
                  "/logo.png";

              }}
            />


            {/* SUBTITLE */}

            <span>
              PRIVATE GEMSTONE INQUIRY
            </span>


            {/* GEM NAME */}

            <h3>
              {selectedGem.name}
            </h3>


            {/* GEM DETAILS */}

            <p>

              {selectedGem.origin}

              {" • "}

              {selectedGem.carat}

            </p>


            {/* FORM */}

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
              />


              <button type="submit">
                SEND INQUIRY
              </button>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          FOOTER
          SAME AS ABOUT PAGE
      ====================================================== */}

      <footer
        className="about-footer"
        id="contact"
      >

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
                    "/logo.png";

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

          <div>

            <h4>
              CONTACT
            </h4>


            <a href="tel:+94712345678">

              <FaPhoneAlt />

              &nbsp; +94 71 234 5678

            </a>


            <a href="mailto:info@ceylonroyalgemstones.com">

              <FaEnvelope />

              &nbsp; info@ceylonroyalgemstones.com

            </a>


            <a
              href="https://wa.me/94712345678"
              target="_blank"
              rel="noreferrer"
              className="footer-whatsapp"
            >

              <FaWhatsapp />

              &nbsp; WhatsApp

            </a>


            <a href="#">

              <FaMapMarkerAlt />

              &nbsp; Ratnapura, Sri Lanka

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


        {/* FOOTER BOTTOM */}

        <div className="about-footer-bottom">

          <p>
            © 2026 Ceylon Royal Gemstones. All Rights Reserved.
          </p>

          <span>
            NATURAL • AUTHENTIC • CEYLON
          </span>

        </div>

      </footer>

    </div>

  );

};

export default Home;