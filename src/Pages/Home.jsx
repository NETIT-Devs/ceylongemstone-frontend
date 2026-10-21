import { useState, useEffect, useRef, useMemo } from "react";
import ShopNavDropdown from "../components/ShopNavDropdown.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
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
import CollectionDrawerActions from "../components/CollectionDrawerActions.jsx";
import ProductOfferPrice from "../components/ProductOfferPrice.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import { useCustomerReviews } from "../useCustomerReviews.js";
import {
  getCollectionItemKey,
  normalizeCollectionItem,
  useSharedCollection
} from "../useSharedCollection.js";
import { useGemInventory } from "../useGemInventory.js";
import {
  formatProductOfferEndDate,
  withActiveProductOffer
} from "../productOffers.js";
import { apiGet, resolveMediaUrl } from "../services/api.js";
import {
  persistCustomerCartItem,
  useCustomerCart
} from "../services/customerCart.js";
import { normalizeTreatment } from "../treatments.js";
import {
  currencyRates,
  formatCurrencyPrice,
  getCurrentCurrency
} from "../currency.js";
const getReviewInitials = (review) => {
  if (review?.initials) return review.initials;
  if (!review?.name) return "CR";
  const parts = review.name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return review.name.trim().slice(0, 2).toUpperCase();
};

// =====================================================
// =====================================================
// HERO SLIDES (Loaded dynamically from backend)
// =====================================================

const heroSlides = [];


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
  const [managedHeroSlides, setManagedHeroSlides] = useState([]);
  const homeHeroSlides = useMemo(
    () => [...heroSlides, ...managedHeroSlides],
    [managedHeroSlides]
  );

  useEffect(() => {
    let isActive = true;
    const loadHeroSlides = async () => {
      try {
        const response = await apiGet("/api/banners/active");
        const data = await response.json();
        if (!response.ok || data?.success !== true || !Array.isArray(data.banners)) {
          throw new Error(data?.message || "Unable to load homepage hero slides.");
        }

        if (isActive) {
          setManagedHeroSlides(data.banners
            .filter((banner) => String(banner.media_type).toUpperCase() === "IMAGE")
            .map((banner) => ({
              id: `banner-${banner.id}`,
              image: resolveMediaUrl(banner.media_url),
              alt: banner.title
            })));
        }
      } catch (error) {
        console.error("Homepage hero slides could not be loaded:", error);
      }
    };

    void loadHeroSlides();
    return () => {
      isActive = false;
    };
  }, []);

  const readMyOrdersLinkStatus = () => {
    try {
      const customer = JSON.parse(
        window.localStorage.getItem("ceylon-user") || "null"
      );
      if (customer?.loggedIn === true) return true;
      const admin = JSON.parse(
        window.localStorage.getItem("ceylon-admin-session") || "null"
      );
      if (admin?.accountId) return true;
      return false;
    } catch {
      return false;
    }
  };
  const [showMyOrdersLink, setShowMyOrdersLink] = useState(readMyOrdersLinkStatus);

  useEffect(() => {
    const syncMyOrdersLink = () => setShowMyOrdersLink(readMyOrdersLinkStatus());

    window.addEventListener("storage", syncMyOrdersLink);
    window.addEventListener("ceylon-user-auth-change", syncMyOrdersLink);

    return () => {
      window.removeEventListener("storage", syncMyOrdersLink);
      window.removeEventListener("ceylon-user-auth-change", syncMyOrdersLink);
    };
  }, []);

  const [currency, setCurrency] = useState(getCurrentCurrency);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const currencyRef = useRef(null);


  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const {
    isLoading: customerCartLoading,
    error: customerCartError,
    deletingCartIds,
    removeCartItem
  } = useCustomerCart(activeDrawer === "cart", setCart);
  const {
    reviews: customerReviews,
    loading: reviewsLoading,
    error: reviewsError,
  } = useCustomerReviews();
  const [backendGemstones, setBackendGemstones] = useState([]);
  const [backendGemstonesError, setBackendGemstonesError] = useState("");
  const [backendJewellery, setBackendJewellery] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadGemstones = async () => {
      try {
        const response = await apiGet("/api/gemstones");
        const result = await response.json();
        if (!response.ok || result.success !== true || !Array.isArray(result.data)) {
          throw new Error(result.message || "Unable to load gemstones.");
        }
        if (isMounted) setBackendGemstones(result.data);
      } catch (error) {
        console.error("Unable to load gemstones for the home page:", error);
        if (isMounted) {
          setBackendGemstonesError(error.message || "Unable to load gemstones.");
        }
      }
    };
    const loadJewellery = async () => {
      try {
        const response = await apiGet("/api/jewellery");
        const result = await response.json();
        if (!response.ok || result.success !== true || !Array.isArray(result.data)) {
          throw new Error(result.message || "Unable to load jewellery.");
        }
        if (isMounted) setBackendJewellery(result.data);
      } catch (error) {
        console.error("Unable to load jewellery for the home page:", error);
      }
    };
    loadGemstones();
    loadJewellery();
    return () => {
      isMounted = false;
    };
  }, []);

  const homeShopProducts = useMemo(
    () => backendGemstones
      .filter((gemstone) =>
        Number(gemstone.status) !== 0 &&
        (!gemstone.approval_status || gemstone.approval_status === "approved")
      )
      .map((gemstone) => {
        const price = Number(gemstone.price);
        const stockQuantity = Number(gemstone.stock);
        const offerRate = gemstone.discountRate ?? gemstone.offer_rate;
        const galleryViews = (gemstone.galleryViews || []).map((view) => ({
          ...view,
          url: resolveMediaUrl(view.url)
        }));
        return {
          ...gemstone,
          id: Number(gemstone.id),
          inventoryId: Number(gemstone.id),
          productKey: `inventory-gemstone-${gemstone.id}`,
          category: gemstone.category_name || "Gemstone",
          treatment: normalizeTreatment(gemstone.treatment_status),
          price: Number.isFinite(price) ? price : 0,
          basePriceUSD: Number.isFinite(price) ? price : 0,
          stockQuantity: Number.isSafeInteger(stockQuantity)
            ? Math.max(0, stockQuantity)
            : 0,
          image: resolveMediaUrl(
            gemstone.main_image || gemstone.image || galleryViews[0]?.url || ""
          ),
          galleryViews,
          discountRate: offerRate,
          offerStartDate: gemstone.offerStartDate ?? gemstone.offer_start_date,
          offerEndDate: gemstone.offerEndDate ?? gemstone.offer_end_date
        };
      }),
    [backendGemstones]
  );
  const homeJewelleryProducts = useMemo(
    () => backendJewellery
      .filter((item) => ["approved", "active"].includes(item.status))
      .map((item) => {
        const rawPrice = Number(item.price);
        const sourceCurrency = item.currency || "USD";
        const sourceRate = currencyRates[sourceCurrency]?.rate || 1;
        const price = Number.isFinite(rawPrice) ? rawPrice / sourceRate : 0;
        return {
          ...item,
          id: item.id,
          productKey: item.product_code || `jewellery-db-${item.id}`,
          product_code: item.product_code,
          name: item.product_name,
          category: item.jewellery_type || "Other",
          color: item.color || "Other",
          shape: item.gemstone_type ? `${item.gemstone_type} ${item.jewellery_type || ""}`.trim() : (item.jewellery_type || "Jewellery"),
          cut: Number(item.is_handcrafted) === 1 ? "Handcrafted" : "Precision Crafted",
          treatment: Number(item.is_handcrafted) === 1 ? "Handcrafted" : "Fine Jewellery",
          material: item.material || "18K Gold",
          price,
          basePriceUSD: price,
          currency: sourceCurrency,
          stockQuantity: Number.isSafeInteger(Number(item.stock_quantity))
            ? Math.max(0, Number(item.stock_quantity))
            : 0,
          image: resolveMediaUrl(item.image_url),
          discountRate: item.discountRate ?? item.offer_rate,
          offerStartDate: item.offerStartDate ?? item.offer_start_date,
          offerEndDate: item.offerEndDate ?? item.offer_end_date,
          status: item.status,
          itemType: "jewellery"
        };
      }),
    [backendJewellery]
  );
  const homeGemCategories = useMemo(
    () => [
      "All Gemstones",
      ...new Set(homeShopProducts.map((product) => product.category).filter(Boolean))
    ],
    [homeShopProducts]
  );
  const [inventory] = useGemInventory(homeShopProducts);
  const featuredJewellery = useMemo(
    () => homeJewelleryProducts.slice(0, 4),
    [homeJewelleryProducts]
  );
  const featuredGems = useMemo(
    () => homeShopProducts.slice(0, 8),
    [homeShopProducts]
  );

  useEffect(() => {
    const syncCurrency = () => setCurrency(getCurrentCurrency());
    window.addEventListener("ceylon-currency-change", syncCurrency);
    window.addEventListener("storage", syncCurrency);
    return () => {
      window.removeEventListener("ceylon-currency-change", syncCurrency);
      window.removeEventListener("storage", syncCurrency);
    };
  }, []);


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

  const activeHeroSlideIndex = homeHeroSlides.length
    ? heroSlideIndex % homeHeroSlides.length
    : 0;

  useEffect(() => {
    if (!homeHeroSlides.length) return;
    const heroTimer = setInterval(() => {
      setHeroSlideIndex(
        (prev) => (prev + 1) % homeHeroSlides.length
      );
    }, 5000);

    return () => clearInterval(heroTimer);
  }, [homeHeroSlides.length]);

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
  // CUSTOMER REVIEWS SLIDESHOW
  // =====================================================

  const [reviewSlideIndex, setReviewSlideIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 680) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 680) setCardsPerView(1);
      else if (window.innerWidth < 1024) setCardsPerView(2);
      else setCardsPerView(3);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const displayReviews = customerReviews;

  const maxReviewIndex = Math.max(0, displayReviews.length - cardsPerView);

  const activeReviewSlideIndex = Math.min(reviewSlideIndex, maxReviewIndex);

  useEffect(() => {
    if (maxReviewIndex <= 0) return;
    const timer = setInterval(() => {
      setReviewSlideIndex((prev) => (prev >= maxReviewIndex ? 0 : prev + 1));
    }, 3200);
    return () => clearInterval(timer);
  }, [maxReviewIndex]);

  const handlePrevReview = () => {
    if (maxReviewIndex <= 0) return;
    setReviewSlideIndex((prev) => (prev <= 0 ? maxReviewIndex : prev - 1));
  };

  const handleNextReview = () => {
    if (maxReviewIndex <= 0) return;
    setReviewSlideIndex((prev) => (prev >= maxReviewIndex ? 0 : prev + 1));
  };

  const reviewTouchStartX = useRef(null);
  const handleReviewTouchStart = (e) => {
    reviewTouchStartX.current = e.touches[0].clientX;
  };
  const handleReviewTouchEnd = (e) => {
    if (reviewTouchStartX.current === null) return;
    const diff = reviewTouchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNextReview();
      else handlePrevReview();
    }
    reviewTouchStartX.current = null;
  };


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

  const toggleFeaturedWishlist = (product) => {
    const productKey = getCollectionItemKey(product);
    setWishlist((current) =>
      current.some((item) => getCollectionItemKey(item) === productKey)
        ? current.filter((item) => getCollectionItemKey(item) !== productKey)
        : [...current, normalizeCollectionItem({ ...product, quantity: 1 })]
    );
  };

  const addFeaturedGemToCart = async (product, openCart = true) => {
    const productKey = getCollectionItemKey(product);
    if ((inventory[productKey] ?? 0) < 1) return false;

    const cartItem = cart.find((item) => getCollectionItemKey(item) === productKey);
    let savedCartItem;
    try {
      savedCartItem = await persistCustomerCartItem(
        "gemstone",
        product.inventoryId || product.id,
        cartItem?.quantity || 1
      );
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save this gemstone to your cart.");
      return false;
    }

    const offerProduct = withActiveProductOffer(product);
    const originalPrice = Number(offerProduct.basePriceUSD ?? offerProduct.price);
    const discountRate = Number(offerProduct.discountRate);
    const offerPrice = discountRate > 0 && discountRate <= 100
      ? Math.round(originalPrice * (1 - discountRate / 100))
      : originalPrice;

    const cartProduct = {
      ...offerProduct,
      itemType: "gemstone",
      name: offerProduct.name || offerProduct.title,
      price: offerPrice,
      basePriceUSD: originalPrice
    };
    setCart((current) => {
      const exists = current.some((item) => getCollectionItemKey(item) === productKey);
      if (exists) {
        return current.map((item) => getCollectionItemKey(item) === productKey
          ? { ...item, quantity: savedCartItem.quantity }
          : item);
      }

      return [
        ...current,
        {
          ...normalizeCollectionItem(cartProduct),
          quantity: savedCartItem.quantity
        }
      ];
    });
    if (openCart) setActiveDrawer("cart");
    return true;
  };

  const addFeaturedJewelleryToCart = async (product, openCart = true) => {
    if (Number(product.stockQuantity) < 1) return false;
    const productKey = getCollectionItemKey(product);
    const cartItem = cart.find((item) => getCollectionItemKey(item) === productKey);
    let savedCartItem;
    try {
      savedCartItem = await persistCustomerCartItem(
        "jewellery",
        product.rawId || product.id,
        cartItem?.quantity || 1
      );
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save this jewellery item to your cart.");
      return false;
    }

    const offerProduct = withActiveProductOffer(product);
    const originalPrice = Number(offerProduct.basePriceUSD ?? offerProduct.price);
    const discountRate = Number(offerProduct.discountRate);
    const offerPrice = discountRate > 0 && discountRate <= 100
      ? Math.round(originalPrice * (1 - discountRate / 100))
      : originalPrice;

    const cartProduct = {
      ...offerProduct,
      id: product.id,
      itemType: "jewellery",
      name: offerProduct.name || offerProduct.title,
      image: offerProduct.image || offerProduct.image_url,
      price: offerPrice,
      basePriceUSD: originalPrice
    };
    setCart((current) => {
      const exists = current.some((item) => getCollectionItemKey(item) === productKey);
      if (exists) {
        return current.map((item) => getCollectionItemKey(item) === productKey
          ? { ...item, quantity: savedCartItem.quantity }
          : item);
      }

      return [
        ...current,
        {
          ...normalizeCollectionItem(cartProduct),
          quantity: savedCartItem.quantity
        }
      ];
    });
    if (openCart) setActiveDrawer("cart");
    return true;
  };

  const addWishlistItemsToCart = async () => {
    for (const item of wishlist) {
      const isJewellery = item.itemType === "jewellery" ||
        item.rawId != null ||
        item.jewellery_id != null ||
        String(item.id).startsWith("db-") ||
        String(item.productKey).startsWith("jewellery-db-");
      const added = isJewellery
        ? await addFeaturedJewelleryToCart(item, false)
        : await addFeaturedGemToCart(item, false);
      if (!added) return false;
    }

    setWishlist([]);
    setActiveDrawer("cart");
    return true;
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

          <BrandLogo
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

          <ShopNavDropdown />

          <a href="/About">
            Our Story
          </a>

          <a href="/trust">
            Certification
          </a>

          <a href="/reviews">
            Reviews
          </a>

          <a href="/blog">
            Blog
          </a>

          <a href="/contact">
            Contact
          </a>

          {/* {showMyOrdersLink && (
            <a href="/my-orders">
              My Orders
            </a>
          )} */}

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

          {/* <button
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

          </button> */}


          {/* =================================================
              INQUIRE NOW
          ================================================= */}

          <button
            className="about-inquire-btn"
            disabled={!homeShopProducts.length}
            onClick={() => setSelectedGem(homeShopProducts[0] || null)}
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
            {homeHeroSlides.map((slide, idx) => (
              <img
                key={slide.id}
                src={slide.image}
                alt={slide.alt}
                className={`hero-slide-img ${activeHeroSlideIndex === idx ? "active" : ""}`}
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
            {homeHeroSlides.map((slide, idx) => (
              <span
                key={slide.id}
                className={`hero-dot ${activeHeroSlideIndex === idx ? "active" : ""}`}
                onClick={() => setHeroSlideIndex(idx)}
                title={slide.alt}
                aria-label={`Slide ${idx + 1}`}
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
                  href="/Gemstones"
                  className="btn-primary"
                >
                  Explore Collection &rarr;
                </a>

                <a
                  href="/join-us"
                  className="btn-primary"
                >
                  Join Us
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
              <h4>100% Certified Natural</h4>
              <p>Authentic Sri Lankan Gemstones</p>
            </div>
          </div>

          <div className="trust-bar-item">
            <FaShippingFast className="trust-bar-icon" />
            <div>
              <h4>Worldwide Express Shipping</h4>
              <p>Safe & Secure Delivery</p>
            </div>
          </div>

          <div className="trust-bar-item">
            <FaGem className="trust-bar-icon" />
            <div>
              <h4>GIA / GRS Certified</h4>
              <p>International Lab Reports</p>
            </div>
          </div>

          <div className="trust-bar-item">
            <FaLock className="trust-bar-icon" />
            <div>
              <h4>Secure Payments</h4>
              <p>Your Trust, Our Priority</p>
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

          {homeGemCategories.map((category) => {

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

      <section className="home-shop-featured-section">
        <div className="gem-section-heading">
          <span>HANDPICKED FOR YOU</span>
          <h2>Featured <strong>Gemstones</strong></h2>
          <p>Explore available gemstones from our current collection.</p>
          {backendGemstonesError && (
            <p role="status" className="admin-empty-state">
              Gemstones could not be loaded: {backendGemstonesError}
            </p>
          )}
        </div>

        <div className="gem-product-grid home-shop-featured-grid">
          {featuredGems.map((product) => {
            const productKey = getCollectionItemKey(product);
            const inStock = (inventory[productKey] ?? 0) > 0;
            const offerProduct = withActiveProductOffer(product);
            const originalPrice = Number(offerProduct.basePriceUSD ?? offerProduct.price);
            const discountRate = Number(offerProduct.discountRate);
            const hasDiscount = discountRate > 0 && discountRate <= 100;
            const offerPrice = hasDiscount
              ? Math.round(originalPrice * (1 - discountRate / 100))
              : originalPrice;
            const isWishlisted = wishlist.some(
              (item) => getCollectionItemKey(item) === productKey
            );

            return (
              <article className="gem-product-card" key={productKey}>
                <div className="product-image-box">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = "/logo.png";
                    }}
                  />
                  <span className="product-treatment">{product.treatment}</span>
                  {hasDiscount ? (
                    <span className="product-discount-label">{discountRate}% OFF</span>
                  ) : offerProduct.discountLabel?.trim() ? (
                    <span className="product-discount-label">{offerProduct.discountLabel}</span>
                  ) : null}
                  <button
                    type="button"
                    className={`product-wishlist ${isWishlisted ? "liked" : ""}`}
                    aria-label={`${isWishlisted ? "Remove from" : "Add to"} wishlist: ${product.name}`}
                    onClick={() => toggleFeaturedWishlist(product)}
                  >
                    <FaHeart />
                  </button>
                </div>

                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3>
                    <a
                      className="product-name-link"
                      href={`/gemstones/${product.id}`}
                    >
                      {product.name}
                    </a>
                  </h3>
                  <div className="product-details">
                    <span className="product-carat">{product.carat} Ct</span>
                    <span>{product.shape}</span>
                    <span>{product.cut}</span>
                  </div>
                  <div className="product-card-actions">
                    <button
                      type="button"
                      className={`product-stock-status ${inStock ? "in-stock" : "out-of-stock"}`}
                      disabled
                      aria-label={`${product.name} ${inStock ? "available" : "out of stock"}`}
                    >
                      {inStock ? "AVAILABLE" : "OUT OF STOCK"}
                    </button>
                    <button
                      type="button"
                      className="product-view-details"
                      onClick={() => window.location.assign(`/gemstones/${product.id}`)}
                    >
                      VIEW DETAILS
                    </button>
                  </div>
                  <div className="product-bottom">
                    <div className={`product-prices ${hasDiscount ? "has-discount" : ""}`}>
                      {hasDiscount && (
                        <del className="product-original-price">
                          {formatPrice(originalPrice)}
                        </del>
                      )}
                      <strong>{formatPrice(offerPrice)}</strong>
                    </div>
                    {/* <button
                      type="button"
                      className={`add-to-cart-btn ${inStock ? "" : "out-of-stock"}`}
                      aria-label={
                        inStock
                          ? `Add ${product.name} to cart`
                          : `${product.name} is out of stock`
                      }
                      disabled={!inStock}
                      onClick={() => addFeaturedGemToCart(product)}
                    >
                      <FaShoppingBag />
                      <span>{inStock ? "ADD TO CART" : "OUT OF STOCK"}</span>
                    </button> */}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="home-featured-jewellery-section">
        <div className="gem-section-heading">
          <span>CEYLON ROYAL COLLECTION</span>
          <h2>Featured <strong>Jewellery</strong></h2>
          <p>Discover a selected necklace, ring, bracelet and pair of earrings.</p>
        </div>

        <div className="gem-product-grid home-shop-featured-grid">
          {featuredJewellery.map((item) => {
            const offerItem = withActiveProductOffer(item);
            const inStock = item.stockQuantity > 0;
            const originalPrice = Number(offerItem.basePriceUSD ?? offerItem.price);
            const discountRate = Number(offerItem.discountRate);
            const hasDiscount = discountRate > 0 && discountRate <= 100;
            const offerEndDate = hasDiscount
              ? formatProductOfferEndDate(offerItem)
              : "";
            const offerPrice = hasDiscount
              ? Math.round(originalPrice * (1 - discountRate / 100))
              : originalPrice;

            return (
            <article className="gem-product-card" key={item.id}>
              <div className="product-image-box">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = "/logo.png";
                  }}
                />
                <span className="product-treatment">{item.treatment}</span>
                {hasDiscount ? (
                  <span className="product-discount-label">
                    {discountRate}% OFF
                  </span>
                ) : offerItem.discountLabel?.trim() ? (
                  <span className="product-discount-label">{offerItem.discountLabel}</span>
                ) : null}
                <button
                  type="button"
                  className={`product-wishlist ${
                    wishlist.some(
                      (wishlistItem) =>
                        getCollectionItemKey(wishlistItem) === getCollectionItemKey(item)
                    )
                      ? "liked"
                      : ""
                  }`}
                  aria-label={`${
                    wishlist.some(
                      (wishlistItem) =>
                        getCollectionItemKey(wishlistItem) === getCollectionItemKey(item)
                    )
                      ? "Remove from"
                      : "Add to"
                  } wishlist: ${item.name}`}
                  onClick={() => toggleFeaturedWishlist(item)}
                >
                  <FaHeart />
                </button>
              </div>

              <div className="product-info">
                <span className="product-category">{item.category}</span>
                <h3>
                  <a
                    className="product-name-link"
                    href={`/jewellery?product=${item.id}`}
                  >
                    {item.name}
                  </a>
                </h3>
                <div className="product-details">
                  <span>{item.color}</span>
                  <span>{item.shape}</span>
                </div>
                <div className="product-card-actions">
                  <button
                    type="button"
                    className={`product-stock-status ${inStock ? "in-stock" : "out-of-stock"}`}
                    disabled
                    aria-label={`${item.name} ${inStock ? "available" : "out of stock"}`}
                  >
                    {inStock ? "AVAILABLE" : "OUT OF STOCK"}
                  </button>
                  <button
                    type="button"
                    className="product-view-details"
                    onClick={() => window.location.assign(`/jewellery?product=${item.id}`)}
                  >
                    VIEW DETAILS
                  </button>
                </div>
                <div className="product-bottom">
                  <div className={`product-prices ${hasDiscount ? "has-discount" : ""}`}>
                    {hasDiscount && (
                      <del className="product-original-price">
                        {formatPrice(originalPrice)}
                      </del>
                    )}
                    <strong>{formatPrice(offerPrice)}</strong>
                    {offerEndDate && (
                      <span className="product-offer-end-date">
                        Offer ends {offerEndDate}
                      </span>
                    )}
                  </div>
                  {/* <button
                    type="button"
                    className={`add-to-cart-btn ${inStock ? "" : "out-of-stock"}`}
                    aria-label={inStock ? `Add ${item.name} to cart` : `${item.name} is out of stock`}
                    disabled={!inStock}
                    onClick={() => addFeaturedJewelleryToCart(item)}
                  >
                    <FaShoppingBag />
                    <span>ADD TO CART</span>
                  </button> */}
                </div>
              </div>
            </article>
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


        {/* <div className="heritage-content-below">

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

        </div> */}

      </section>


      {/* =====================================================
          CUSTOMER REVIEWS
      ====================================================== */}

      <section
        className="reviews-section"
        id="reviews"
      >

        <div className="reviews-container">
          {/* Decorative Gem Facet Watermarks */}
          <div className="reviews-watermark reviews-watermark-left" aria-hidden="true">
            <svg viewBox="0 0 200 240" fill="none" stroke="currentColor" strokeWidth="1.2">
              <polygon points="100,20 180,70 150,210 50,210 20,70" />
              <line x1="100" y1="20" x2="60" y2="110" />
              <line x1="100" y1="20" x2="140" y2="110" />
              <line x1="20" y1="70" x2="60" y2="110" />
              <line x1="180" y1="70" x2="140" y2="110" />
              <line x1="60" y1="110" x2="140" y2="110" />
              <line x1="60" y1="110" x2="50" y2="210" />
              <line x1="140" y1="110" x2="150" y2="210" />
              <line x1="100" y1="20" x2="100" y2="210" />
            </svg>
          </div>
          <div className="reviews-watermark reviews-watermark-right" aria-hidden="true">
            <svg viewBox="0 0 200 240" fill="none" stroke="currentColor" strokeWidth="1.2">
              <polygon points="100,20 180,70 150,210 50,210 20,70" />
              <line x1="100" y1="20" x2="60" y2="110" />
              <line x1="100" y1="20" x2="140" y2="110" />
              <line x1="20" y1="70" x2="60" y2="110" />
              <line x1="180" y1="70" x2="140" y2="110" />
              <line x1="60" y1="110" x2="140" y2="110" />
              <line x1="60" y1="110" x2="50" y2="210" />
              <line x1="140" y1="110" x2="150" y2="210" />
              <line x1="100" y1="20" x2="100" y2="210" />
            </svg>
          </div>

          <div className="reviews-header">

            <div className="reviews-eyebrow">
              <span className="reviews-eyebrow-line" />
              <span className="reviews-eyebrow-text">CLIENT TESTIMONIALS</span>
              <span className="reviews-eyebrow-line" />
            </div>

            <h2 className="reviews-main-title">
              TRUSTED BY GEM COLLECTORS
            </h2>

            <div className="reviews-gem-divider">
              <span className="divider-line" />
              <svg className="gem-outline-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 3h12l4 7-10 11L2 10l4-7z" />
                <path d="M2 10h20" />
                <path d="M6 3l4 7 2 11 2-11 4-7" />
              </svg>
              <span className="divider-line" />
            </div>

            <p className="reviews-description">
              Discover why collectors and jewelry lovers around the world choose us for authentic gemstones and exceptional service.
            </p>

          </div>

          <div
            className="reviews-carousel-wrapper"
            onTouchStart={handleReviewTouchStart}
            onTouchEnd={handleReviewTouchEnd}
          >
            {reviewsLoading && <p role="status">Loading customer reviews...</p>}
            {reviewsError && <p role="alert">{reviewsError}</p>}
            {!reviewsLoading && !reviewsError && displayReviews.length === 0 && (
              <p>No approved customer reviews yet.</p>
            )}
            <div className="reviews-track-viewport">
              <div
                className="reviews-track"
                style={{
                  transform: `translateX(-${activeReviewSlideIndex * (100 / cardsPerView)}%)`
                }}
              >
                {displayReviews.map((review, idx) => (
                  <div
                    className="review-card-slide"
                    key={`${review.id}-${idx}`}
                    style={{ flex: `0 0 ${100 / cardsPerView}%` }}
                  >
                    <div className="review-card-inner">
                      <div className="review-card-stars">
                        {[...Array(review.rating || 5)].map((_, i) => (
                          <FaStar key={i} className="review-star-icon" />
                        ))}
                      </div>

                      <div className="review-card-quote">
                        <span className="quote-mark-open">“</span>
                        <p className="review-card-text">
                          "{review.comment.replace(/^"|"$/g, "")}"
                        </p>
                        <span className="quote-mark-close">”</span>
                      </div>

                      <div className="review-card-gem-divider">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#d4af37" strokeWidth="1.5">
                          <path d="M6 3h12l4 7-10 11L2 10l4-7z" />
                          <path d="M2 10h20" />
                          <path d="M6 3l4 7 2 11 2-11 4-7" />
                        </svg>
                      </div>

                      <div className="review-card-author">
                        <div className="review-author-avatar">
                          {review.avatar ? (
                            <img
                              src={review.avatar}
                              alt={review.name}
                              className="review-avatar-img"
                            />
                          ) : (
                            <span className="review-initials">
                              {getReviewInitials(review)}
                            </span>
                          )}
                        </div>
                        <div className="review-author-info">
                          <h4 className="review-author-name">
                            {review.name.toUpperCase()}
                          </h4>
                          <div className="review-author-loc">
                            <span>{review.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {maxReviewIndex > 0 && (
              <div className="reviews-dots">
                {[...Array(maxReviewIndex + 1)].map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`reviews-dot ${activeReviewSlideIndex === idx ? "active" : ""}`}
                    onClick={() => setReviewSlideIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
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
              {activeDrawer === "cart" && customerCartLoading && (
                <p role="status">Loading your saved cart...</p>
              )}
              {activeDrawer === "cart" && customerCartError && (
                <p role="alert">{customerCartError}</p>
              )}

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

                      <ProductOfferPrice item={gem} currency={currency} />

                      <small>Qty {Number(gem.quantity) || 1}</small>

                    </div>


                    <button
                      type="button"
                      aria-label={`Remove ${gem.name}`}
                      disabled={Boolean(gem.cartId && deletingCartIds.includes(gem.cartId))}
                      onClick={() => {

                        if (
                          activeDrawer ===
                          "cart"
                        ) {

                          void removeCartItem(gem);

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
              onAddWishlistToCart={addWishlistItemsToCart}
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

            <BrandLogo
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


            <h3>
              Ceylon Royal Gemstones
            </h3>


            <p>
              Contact our team for help with gemstone selection, sourcing, certification, or a purchase.
            </p>


            {/* FORM */}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const values = new FormData(e.currentTarget);
                const message = [
                  "Gemstone inquiry from the Ceylon Royal Gemstones website",
                  `Name: ${values.get("name")}`,
                  `Email: ${values.get("email")}`,
                  `Phone: ${values.get("phone")}`,
                  `Inquiry: ${values.get("message")}`
                ].join("\n");

                window.open(
                  `https://wa.me/94712345678?text=${encodeURIComponent(message)}`,
                  "_blank",
                  "noopener,noreferrer"
                );
                setSelectedGem(null);
              }}
            >


              <input
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your Full Name"
                required
              />


              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email Address"
                required
              />


              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="WhatsApp / Phone Number"
                required
              />


              <textarea
                name="message"
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

              <BrandLogo
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
              Our Story
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
            Copyright © 2026 Powered by NETIT Technology
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