import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaSearch,
  FaHeart,
  FaShoppingBag,
  FaShieldAlt,
  FaShippingFast,
  FaGem,
  FaLock,
  FaTimes,
  FaTrash,
  FaStar,
  FaWhatsapp,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebookF
} from "react-icons/fa";

import "./Home.css";
import CollectionDrawerActions from "../components/CollectionDrawerActions.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import { useCustomerReviews } from "../useCustomerReviews.js";
import {
  getCollectionItemKey,
  normalizeCollectionItem,
  useSharedCollection
} from "../useSharedCollection.js";


// =====================================================
// GEM DATA
// =====================================================

const initialGems = [
  {
    id: 1,
    detailId: 1,
    productKey: "royal-blue-sapphire",
    name: "ROYAL BLUE SAPPHIRE",
    origin: "Ratnapura, Sri Lanka",
    carat: "4.52 Ct",
    basePriceUSD: 12500,
    image: "/blueGem.jpg",
    tag: "CERTIFIED NATURAL",
  },
  {
    id: 2,
    detailId: 4,
    productKey: "ceylon-padparadscha",
    name: "PADPARADSCHA SAPPHIRE",
    origin: "Elahera, Sri Lanka",
    carat: "3.18 Ct",
    basePriceUSD: 18900,
    image: "/PADPARADSCHAgem2.jpg",
    tag: "RARE COLLECTOR",
  },
  {
    id: 11,
    detailId: 11,
    productKey: "ceylon-green-gemstone",
    name: "CEYLON GREEN GEMSTONE",
    origin: "Balangoda, Sri Lanka",
    carat: "2.05 Ct",
    basePriceUSD: 22000,
    image: "/ALEXANDRITEgem.jpg",
    tag: "NATURAL GREEN GEM",
  },
  {
    id: 4,
    detailId: 10,
    productKey: "golden-yellow-sapphire",
    name: "GOLDEN YELLOW SAPPHIRE",
    origin: "Ratnapura, Sri Lanka",
    carat: "5.10 Ct",
    basePriceUSD: 14200,
    image: "/yellowGem.jpg",
    tag: "UNTREATED NATURAL",
  }
];


// =====================================================
// HERO SLIDES (Image Slideshow - replaces video)
// =====================================================

const heroSlides = [
  {
    id: 1,
    image: "/hero1.jpg",
    alt: "hero1"
  },
  {
    id: 2,
    image: "/hero2.jpg",
    alt: "hero2"
  },
  {
    id: 3,
    image: "/Ruby.jpg",
    alt: "Natural Ceylon Ruby"
  },
  {
    id: 4,
    image: "/PADPARADSCHAgem2.jpg",
    alt: "Rare Padparadscha Sapphire"
  },
  {
    id: 5,
    image: "/ALEXANDRITEgem.jpg",
    alt: "Ceylon Alexandrite Gemstone"
  }
];


// =====================================================
// HERITAGE SLIDES (Images instead of videos)
// =====================================================

const heritageSlides = [
  {
    id: 1,
    image: "/ceti.jpg",
    caption: "Authentic Ceylon Gemstone Mining & Heritage"
  },
  {
    id: 2,
    image: "/gem_view_14.jpg",
    caption: "Precision Master Cutting & Certification"
  },
  {
    id: 3,
    image: "/StarSapphire.jpg",
    caption: "Ethically Sourced Royal Gems Since 1985"
  }
];


// =====================================================
// CURRENCY
// =====================================================

const currencyRates = {
  USD: { symbol: "$", rate: 1 },
  GBP: { symbol: "£", rate: 0.79 },
  EUR: { symbol: "€", rate: 0.92 },
  LKR: { symbol: "Rs ", rate: 305 },
  AED: { symbol: "د.إ ", rate: 3.67 }
};


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

  const [currency, setCurrency] = useState(() =>
    window.localStorage.getItem("ceylon-currency") || "USD"
  );
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const currencyRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
  // HERITAGE SLIDER
  // =====================================================

  useEffect(() => {

    const timer = setInterval(() => {

      setCurrentSlide(
        (prev) =>
          (prev + 1) % heritageSlides.length
      );

    }, 5000);

    return () => clearInterval(timer);

  }, []);


  // =====================================================
  // HERO IMAGE SLIDESHOW
  // =====================================================

  useEffect(() => {

    const heroTimer = setInterval(() => {

      setHeroSlideIndex(
        (prev) =>
          (prev + 1) % heroSlides.length
      );

    }, 4000);

    return () => clearInterval(heroTimer);

  }, []);


  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (basePriceUSD) => {

    const curr =
      currencyRates[currency] ||
      currencyRates.USD;

    const converted =
      Math.round(
        basePriceUSD * curr.rate
      );

    return `${curr.symbol}${converted.toLocaleString()}`;
  };


  // =====================================================
  // WISHLIST
  // =====================================================

  const toggleWishlist = (gem) => {
    const productKey = getCollectionItemKey(gem);

    setWishlist((current) => {
      const exists = current.some(
        (item) => getCollectionItemKey(item) === productKey
      );

      if (exists) {
        return current.filter(
          (item) => getCollectionItemKey(item) !== productKey
        );
      }

      return [...current, normalizeCollectionItem({ ...gem, quantity: 1 })];
    });
  };


  // =====================================================
  // CART
  // =====================================================

  const addToCart = (gem, amount = 1) => {
    const productKey = getCollectionItemKey(gem);

    setCart((current) => {
      const exists = current.some(
        (item) => getCollectionItemKey(item) === productKey
      );

      if (exists) {
        return current.map((item) =>
          getCollectionItemKey(item) === productKey
            ? { ...item, quantity: item.quantity + amount }
            : item
        );
      }

      return [
        ...current,
        normalizeCollectionItem({ ...gem, quantity: amount })
      ];
    });

    setActiveDrawer("cart");
  };

  const changeCollectionQuantity = (setItems, productKey, amount) => {
    setItems((current) =>
      current
        .map((item) =>
          getCollectionItemKey(item) === productKey
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

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


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredGems =
    initialGems.filter(
      (gem) =>
        gem.name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        gem.origin
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )
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
                "https://cdn-icons-png.flaticon.com/512/3063/3063822.png";

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

        <div className="about-nav-links">

          <a
            href="/"
            className="active"
          >
            Home
          </a>

          <a href="/Gemstones">
            Gemstones
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

          <a href="/login">
            Login
          </a>

          <a href="/my-orders">
            My Orders
          </a>

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
                src={{
                  USD:
                    "https://flagcdn.com/w40/us.png",

                  GBP:
                    "https://flagcdn.com/w40/gb.png",

                  EUR:
                    "https://flagcdn.com/w40/eu.png",

                  LKR:
                    "https://flagcdn.com/w40/lk.png",

                  AED:
                    "https://flagcdn.com/w40/ae.png"

                }[currency]}
                alt={currency}
                className="currency-flag"
              />

              <span className="currency-symbol">

                {currencyRates[
                  currency
                ].symbol.trim()}

              </span>

              <span className="currency-chevron">
                ▾
              </span>

            </button>


            {currencyOpen && (

              <div className="currency-dropdown">

                {[
                  {
                    code: "USD",
                    flag:
                      "https://flagcdn.com/w40/us.png"
                  },
                  {
                    code: "GBP",
                    flag:
                      "https://flagcdn.com/w40/gb.png"
                  },
                  {
                    code: "EUR",
                    flag:
                      "https://flagcdn.com/w40/eu.png"
                  },
                  {
                    code: "LKR",
                    flag:
                      "https://flagcdn.com/w40/lk.png"
                  },
                  {
                    code: "AED",
                    flag:
                      "https://flagcdn.com/w40/ae.png"
                  }
                ].map((item) => (

                  <button
                    type="button"
                    key={item.code}
                    className={
                      `currency-option ${
                        currency === item.code
                          ? "selected"
                          : ""
                      }`
                    }
                    onClick={() => {

                      setCurrency(
                        item.code
                      );

                      window.localStorage.setItem("ceylon-currency", item.code);
                      const foreignCurrency = item.code !== "LKR";
                      window.localStorage.setItem(
                        "ceylon-international-enabled",
                        String(foreignCurrency)
                      );
                      window.dispatchEvent(new Event("ceylon-international-mode-change"));

                      setCurrencyOpen(
                        false
                      );

                    }}
                  >

                    <img
                      src={item.flag}
                      alt={item.code}
                      className="currency-flag"
                    />

                    <span>
                      {currencyRates[
                        item.code
                      ].symbol.trim()}
                    </span>

                  </button>

                ))}

              </div>

            )}

          </div>

          <InternationalNavEntry mobile />


          {/* =================================================
              SEARCH
          ================================================= */}

          <button
            type="button"
            className={`about-nav-icon home-search-toggle ${
              isSearchOpen ? "is-open" : ""
            }`}
            title="Search"
            aria-label={isSearchOpen ? "Close gemstone search" : "Open gemstone search"}
            aria-expanded={isSearchOpen}
            aria-controls="home-gemstone-search"
            onClick={() => setIsSearchOpen(true)}
          >

            <FaSearch />

          </button>


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

        </div>

      </nav>


      {/* =====================================================
          SEARCH BAR
      ====================================================== */}

      <AnimatePresence>

        {isSearchOpen && (

          <motion.div
            className="search-bar-overlay"
            id="home-gemstone-search"
            role="search"
            initial={{
              opacity: 0,
              y: -20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -20
            }}
          >

            <input
              type="text"
              aria-label="Search gemstones"
              placeholder="Search by gemstone name, origin, or category..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              autoFocus
            />

            <button
              type="button"
              className="close-search-btn"
              onClick={() => {

                setIsSearchOpen(
                  false
                );

                setSearchQuery("");

              }}
            >

              <FaTimes />

            </button>

          </motion.div>

        )}

      </AnimatePresence>


      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section
        className="gem-hero"
        id="home"
      >

        {/* HERO IMAGE SLIDESHOW */}
        <AnimatePresence mode="wait">
          <motion.img
            key={heroSlides[heroSlideIndex].id}
            src={heroSlides[heroSlideIndex].image}
            alt={heroSlides[heroSlideIndex].alt}
            className="hero-background-video"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            loading="eager"
          />
        </AnimatePresence>

        {/* HERO SLIDE DOTS */}
        <div className="hero-slide-dots">
          {heroSlides.map((slide, idx) => (
            <span
              key={slide.id}
              className={`hero-dot ${heroSlideIndex === idx ? "active" : ""}`}
              onClick={() => setHeroSlideIndex(idx)}
            />
          ))}
        </div>


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
                href="#Gemstones"
                className="btn-primary"
              >
                Explore Collection &rarr;
              </a>

              <a
                href="/consultation"
                className="btn-secondary"
              >
                📹 Book a Video Consultation
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


      {/* =====================================================
          FEATURED GEMSTONES
      ====================================================== */}

      <section
        className="featured-section"
        id="gemstones"
      >

        <div className="section-header">

          <span className="subtitle">
            CURATED SELECTION
          </span>

          <h2>
            EXQUISITE GEMSTONES
          </h2>

          <div className="gold-line" />

        </div>


        {filteredGems.length === 0 ? (

          <p className="no-results-msg">
            No gemstones matched your search criteria.
          </p>

        ) : (

          <div className="gems-grid">

            {filteredGems.map((gem) => {

              const isWishlisted =
                wishlist.some(
                  (item) =>
                    getCollectionItemKey(item) ===
                    getCollectionItemKey(gem)
                );


              return (

                <div
                  className="gem-card"
                  key={gem.productKey}
                >


                  <span className="gem-tag-green">
                    {gem.tag}
                  </span>


                  {/* WISHLIST */}

                  <button
                    className={
                      `card-wishlist-btn ${
                        isWishlisted
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      toggleWishlist(gem)
                    }
                    title="Add to Wishlist"
                  >

                    <FaHeart />

                  </button>


                  {/* IMAGE */}

                  <div className="gem-image-wrapper">

                    <img
                      src={gem.image}
                      alt={gem.name}
                      onError={(e) => {

                        e.target.src =
                          "https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&q=80&w=600";

                      }}
                    />

                  </div>


                  {/* INFO */}

                  <div className="gem-info">

                    <span className="gem-origin">
                      {gem.origin}
                    </span>

                    <h3>
                      {gem.name}
                    </h3>


                    <div className="gem-details-row">

                      <span className="weight-text">
                        Weight: {gem.carat}
                      </span>

                      <span className="price-text">
                        {formatPrice(
                          gem.basePriceUSD
                        )}
                      </span>

                    </div>

                  </div>


                  {/* ACTION BUTTONS */}

                  <div className="card-action-btns">

                    <button
                      className="btn-inquire-card"
                      onClick={() =>
                        window.location.assign(`/gemstones/${gem.detailId}`)
                      }
                    >
                      VIEW DETAILS
                    </button>


                    <button
                      className="btn-cart-card"
                      onClick={() =>
                        addToCart(gem)
                      }
                      title="Add to Cart"
                    >

                      <FaShoppingBag />

                    </button>

                  </div>

                </div>

              );

            })}

          </div>

        )}

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
                (slide) => (

                  <div
                    key={slide.id}
                    className="heritage-slide-full"
                  >

                    <img
                      src={slide.image}
                      alt={slide.caption}
                      className="slide-img-full"
                      loading="lazy"
                    />

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
                  ? "Add to Cart"
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
                        {formatPrice(
                          (gem.basePriceUSD ?? gem.price) * gem.quantity
                        )}
                      </span>

                      <div className="home-collection-quantity">
                        <button
                          type="button"
                          aria-label={`Decrease ${gem.name} quantity`}
                          onClick={() =>
                            changeCollectionQuantity(
                              activeDrawer === "cart"
                                ? setCart
                                : setWishlist,
                              getCollectionItemKey(gem),
                              -1
                            )
                          }
                        >
                          −
                        </button>
                        <span>{gem.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${gem.name} quantity`}
                          onClick={() =>
                            changeCollectionQuantity(
                              activeDrawer === "cart"
                                ? setCart
                                : setWishlist,
                              getCollectionItemKey(gem),
                              1
                            )
                          }
                        >
                          +
                        </button>
                      </div>

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
                  "https://cdn-icons-png.flaticon.com/512/3063/3063822.png";

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