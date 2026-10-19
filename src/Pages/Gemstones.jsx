import { useEffect, useMemo, useRef, useState } from "react";
import ShopNavDropdown from "../components/ShopNavDropdown.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import {
  FaSearch,
  FaHeart,
  FaShoppingBag,
  FaTimes,
  FaTrash,
  FaGem,
  FaShieldAlt,
  FaShippingFast,
  FaLock,
  FaChevronDown,
  FaUser,
  FaWhatsapp,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebookF,
  FaArrowLeft
} from "react-icons/fa";

import "./Gemstones.css";
import "./About.css";
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";
import CollectionDrawerActions from "../components/CollectionDrawerActions.jsx";
import ProductOfferPrice from "../components/ProductOfferPrice.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import {
  getCollectionItemKey,
  normalizeCollectionItem,
  useSharedCollection
} from "../useSharedCollection.js";
import { currencyRates, formatCurrencyPrice, getCurrentCurrency } from "../currency.js";
import { useGemInventory } from "../useGemInventory.js";
import { apiGet, resolveMediaUrl } from "../services/api.js";
import { persistCustomerCartItem, useCustomerCart } from "../services/customerCart.js";
import { normalizeTreatment } from "../treatments.js";
import { formatProductOfferEndDate, withActiveProductOffer } from "../productOffers.js";

// eslint-disable-next-line react-refresh/only-export-components
export const products = [];

const matchesGemstoneCategory = (product, selectedCategory) => {
  if (selectedCategory === "All Gemstones") return true;

  const normalize = (value) =>
    String(value ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const fields = [
    product.category,
    product.category_name,
    product.name,
    product.color,
    product.sub_category,
    product.subcategory,
    product.subCategory,
    product.sub_category_name,
    product.subcategory_name,
    product.gemstone_type
  ].map(normalize);
  const contains = (...terms) =>
    fields.some((field) => terms.some((term) => field.includes(term)));
  const selected = normalize(selectedCategory);

  switch (selected) {
    case "blue sapphire":
      return contains("blue sapphire") || (contains("sapphire") && contains("blue"));
    case "yellow sapphire":
      return (
        contains("yellow sapphire") ||
        (contains("sapphire") && contains("yellow", "golden"))
      );
    case "green gemstone":
      return contains("green gemstone", "emerald", "green");
    case "padparadscha sapphire":
      return (
        contains("padparadscha") ||
        (contains("sapphire") && contains("pink", "orange", "salmon"))
      );
    case "ruby":
      return contains("ruby");
    case "star sapphire":
      return contains("star sapphire") || (contains("sapphire") && contains("star"));
    case "cat s eye":
      return contains("cat s eye", "cat eye", "chrysoberyl");
    case "alexandrite":
      return contains("alexandrite");
    default:
      return fields.includes(selected);
  }
};

const PRODUCTS_PER_PAGE = 15;

const colorSwatches = {
  "All Colors": "#ffffff",
  Blue: "#3478c8",
  "Royal Blue": "#2447a8",
  "Cornflower Blue": "#6495ed",
  "Pink Orange": "#e58c79",
  Red: "#c83c45",
  Golden: "#d3a52d",
  Green: "#39845b",
  "Green / Purple": "linear-gradient(135deg, #43875d 0 50%, #8c5aa5 50% 100%)"
};

function Gemstones() {
  const [currency, setCurrency] = useState(getCurrentCurrency);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef(null);
  const [backendGemstones, setBackendGemstones] = useState([]);
  const [backendGemstonesLoading, setBackendGemstonesLoading] = useState(true);
  const [backendGemstonesError, setBackendGemstonesError] = useState("");
  const [selectedTreatment, setSelectedTreatment] = useState("All Treatments");

  useEffect(() => {
    let isCurrent = true;
    apiGet("/api/gemstones")
      .then(async (response) => {
        let result;
        try {
          result = await response.json();
        } catch {
          throw new Error("The gemstone inventory returned an invalid response.");
        }
        if (!response.ok || result.success !== true || !Array.isArray(result.data)) {
          throw new Error(result.message || "Unable to load gemstones from inventory.");
        }

        const inventoryProducts = result.data
          .filter((gemstone) =>
            Number(gemstone.status) !== 0 &&
            (!gemstone.approval_status || gemstone.approval_status === "approved")
          )
          .map((gemstone) => {
            const galleryViews = (gemstone.galleryViews || []).map((view) => ({
              ...view,
              url: resolveMediaUrl(view.url),
            }));
            const image = resolveMediaUrl(
              gemstone.main_image || gemstone.image || galleryViews[0]?.url || ""
            );
            return {
              ...gemstone,
              id: Number(gemstone.id),
              inventoryId: Number(gemstone.id),
              productKey: `inventory-gemstone-${gemstone.id}`,
              category: gemstone.category_name || "Gemstone",
              treatment: normalizeTreatment(gemstone.treatment_status),
              stockQuantity: Number.isSafeInteger(Number(gemstone.stock))
                ? Math.max(0, Number(gemstone.stock))
                : 0,
              price: Number(gemstone.price) || 0,
              image,
              galleryViews,
              videoUrl: resolveMediaUrl(gemstone.videoUrl || gemstone.video_url),
            };
          });

        if (isCurrent) {
          setBackendGemstones(inventoryProducts);
          setBackendGemstonesError("");
        }
      })
      .catch((error) => {
        console.error("Unable to load gemstones from inventory:", error);
        if (isCurrent) {
          setBackendGemstonesError(error.message || "Unable to load inventory gemstones.");
        }
      })
      .finally(() => {
        if (isCurrent) setBackendGemstonesLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const shopProducts = backendGemstones;
  const categories = useMemo(
    () => [
      "All Gemstones",
      ...new Set(shopProducts.map((product) => product.category).filter(Boolean))
    ],
    [shopProducts]
  );
  const colors = useMemo(
    () => [
      "All Colors",
      ...new Set(shopProducts.map((product) => product.color).filter(Boolean))
    ],
    [shopProducts]
  );
  const shapes = useMemo(
    () => [
      "All Shapes",
      ...new Set(shopProducts.map((product) => product.shape).filter(Boolean))
    ],
    [shopProducts]
  );
  const cuts = useMemo(
    () => [
      "All Cuts",
      ...new Set(shopProducts.map((product) => product.cut).filter(Boolean))
    ],
    [shopProducts]
  );
  const treatments = useMemo(
    () => [
      "All Treatments",
      ...new Set(shopProducts.map((product) => product.treatment).filter(Boolean))
    ],
    [shopProducts]
  );
  const shopMaxCaratValue = Math.max(
    1,
    ...shopProducts.map((product) => Number(product.carat) || 0)
  );
  const shopMaxPriceValue = Math.ceil(
    Math.max(5000, ...shopProducts.map((product) => Number(product.price) || 0)) / 5000
  ) * 5000;

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

  const [selectedCategory, setSelectedCategory] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      if (cat) return cat;
    } catch { /* URL parsing unsupported */ }
    return "All Gemstones";
  });
  const [pageSelection, setPageSelection] = useState({ filterKey: "", page: 1 });

  const [searchTerm, setSearchTerm] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("search") || "";
    } catch {
      return "";
    }
  });
  const [isSearchOpen, setIsSearchOpen] = useState(() => Boolean(
    new URLSearchParams(window.location.search).get("search")?.trim()
  ));
  const searchInputRef = useRef(null);

  const [selectedColor, setSelectedColor] =
    useState("All Colors");

  const [minCarat, setMinCarat] = useState(0);
  const [userMaxCarat, setUserMaxCarat] = useState(null);

  const [selectedShape, setSelectedShape] =
    useState("All Shapes");

  const [selectedCut, setSelectedCut] =
    useState("All Cuts");

  const [minPrice, setMinPrice] = useState(0);
  const [userMaxPrice, setUserMaxPrice] = useState(null);

  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [inventory] = useGemInventory(shopProducts);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const {
    isLoading: customerCartLoading,
    error: customerCartError,
    deletingCartIds,
    removeCartItem
  } = useCustomerCart(activeDrawer === "cart", setCart);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inquiryProduct, setInquiryProduct] = useState(null);

  const maxCarat = userMaxCarat !== null ? userMaxCarat : shopMaxCaratValue;
  const maxPrice = userMaxPrice !== null ? userMaxPrice : shopMaxPriceValue;
  const setMaxCarat = setUserMaxCarat;
  const setMaxPrice = setUserMaxPrice;

  useEffect(() => {
    if (isSearchOpen) {
      document.getElementById("shop-gem-search")?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      searchInputRef.current?.focus({ preventScroll: true });
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setCurrencyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    try {
      const url = new URL(window.location.href);
      if (cat === "All Gemstones") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", cat);
      }
      window.history.pushState({}, "", url.toString());
    } catch { /* ignored */ }
  };

  const handleBackToMainCategories = () => {
    window.location.assign("/#main-categories");
  };

  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get("category");
        if (cat) {
          setSelectedCategory(cat);
        } else {
          setSelectedCategory("All Gemstones");
        }
        setSearchTerm(params.get("search") || "");
      } catch { /* ignored */ }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const shouldScrollToCollection =
        params.get("category") || window.location.hash === "#collection";
      const collectionSection =
        document.getElementById("collection") || document.querySelector(".gem-category-section");

      if (shouldScrollToCollection && collectionSection) {
        setTimeout(() => {
          collectionSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch { /* ignored */ }
  }, []);

  useEffect(() => {
    const syncDrawerFromHash = () => {
      const requestedDrawer = window.location.hash.slice(1).toLowerCase();

      if (requestedDrawer === "cart" || requestedDrawer === "wishlist") {
        setActiveDrawer(requestedDrawer);
      } else {
        setActiveDrawer(null);
      }
    };

    syncDrawerFromHash();
    window.addEventListener("hashchange", syncDrawerFromHash);

    return () => {
      window.removeEventListener("hashchange", syncDrawerFromHash);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return shopProducts.filter((product) => {
      const categoryMatch = matchesGemstoneCategory(product, selectedCategory);

      const searchMatch =
        searchTerm.trim() === "" ||
        [
          product.name,
          product.category,
          product.color,
          product.shape,
          product.cut,
          product.treatment,
          product.carat,
          product.price
        ].some((value) =>
          String(value)
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase())
        );

      const colorMatch =
        selectedColor === "All Colors" ||
        product.color === selectedColor;

      const minCaratMatch =
        product.carat >= minCarat;

      const maxCaratMatch =
        product.carat <= maxCarat;

      const shapeMatch =
        selectedShape === "All Shapes" ||
        product.shape === selectedShape;

      const cutMatch =
        selectedCut === "All Cuts" ||
        product.cut === selectedCut;

      const treatmentMatch =
        selectedTreatment === "All Treatments" ||
        normalizeTreatment(product.treatment) === selectedTreatment;

      const minPriceMatch =
        product.price >= minPrice;

      const maxPriceMatch =
        product.price <= maxPrice;

      return (
        categoryMatch &&
        searchMatch &&
        colorMatch &&
        minCaratMatch &&
        maxCaratMatch &&
        shapeMatch &&
        cutMatch &&
        treatmentMatch &&
        minPriceMatch &&
        maxPriceMatch
      );
    });
  }, [
    selectedCategory,
    searchTerm,
    selectedColor,
    minCarat,
    maxCarat,
    selectedShape,
    selectedCut,
    selectedTreatment,
    minPrice,
    maxPrice,
    shopProducts
  ]);

  const pageCount = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const pageFilterKey = JSON.stringify([
    selectedCategory,
    searchTerm,
    selectedColor,
    minCarat,
    maxCarat,
    selectedShape,
    selectedCut,
    selectedTreatment,
    minPrice,
    maxPrice
  ]);
  const currentPage = Math.min(
    pageSelection.filterKey === pageFilterKey ? pageSelection.page : 1,
    Math.max(pageCount, 1)
  );
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const goToPage = (page) => {
    setPageSelection({
      filterKey: pageFilterKey,
      page: Math.min(Math.max(page, 1), Math.max(pageCount, 1))
    });
    document.getElementById("gem-product-results")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const toggleWishlist = (product) => {
    const productKey = getCollectionItemKey(product);

    setWishlist((current) => {
      const exists = current.some(
        (item) => getCollectionItemKey(item) === productKey
      );

      if (exists) {
        return current.filter(
          (item) => getCollectionItemKey(item) !== productKey
        );
      }

      return [
        ...current,
        normalizeCollectionItem({ ...product, quantity: 1 })
      ];
    });
    setActiveDrawer("wishlist");
  };

  const addToCart = async (product) => {
    const productKey = getCollectionItemKey(product);
    const stockQuantity = inventory[productKey] ?? 0;
    if (stockQuantity < 1) return;
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
      return;
    }

    const offerProduct = withActiveProductOffer(product);
    const originalPrice = Number(offerProduct.basePriceUSD ?? offerProduct.price);
    const discountRate = Number(offerProduct.discountRate);
    const discountedPrice = discountRate > 0 && discountRate <= 100
      ? Math.round(originalPrice * (1 - discountRate / 100))
      : originalPrice;
    const cartProduct = {
      ...offerProduct,
      price: discountedPrice,
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
    setActiveDrawer("cart");
  };

  const wishlistCount = wishlist.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const removeWishlist = (productKey) => {
    setWishlist((current) =>
      current.filter((item) => getCollectionItemKey(item) !== productKey)
    );
  };

  const removeCart = (productKey) => {
    const item = cart.find((entry) => getCollectionItemKey(entry) === productKey);
    if (item) void removeCartItem(item);
  };

  const clearFilters = () => {
    setSelectedCategory("All Gemstones");
    setSearchTerm("");
    setSelectedColor("All Colors");
    setMinCarat(0);
    setMaxCarat(shopMaxCaratValue);
    setSelectedShape("All Shapes");
    setSelectedCut("All Cuts");
    handleTreatmentChange("All Treatments");
    setMinPrice(0);
    setMaxPrice(shopMaxPriceValue);
  };

  const handleTreatmentChange = (treatment) => {
    setSelectedTreatment(treatment);
  };

  return (
    <div className="gemstones-page">

      {/* ================= NAVBAR ================= */}

      <nav className="about-navbar">

        <a href="/" className="about-navbar-logo">
          <BrandLogo
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

        <MobileSiteMenu onInquire={() => setInquiryProduct(shopProducts[0] || null)} />
        <div className="about-nav-links">
          <a href="/">Home</a>
          <ShopNavDropdown current="gems" />
          <a href="/About">Our Story</a>
          <a href="/trust">Certification</a>
          <a href="/reviews">Reviews</a>
          <a href="/contact">Contact</a>
          <a href="/blog">Blog</a>
          {showMyOrdersLink && <a href="/my-orders">My Orders</a>}
          <InternationalNavEntry />
        </div>

        <div className="about-nav-actions">

          <div className="currency-selector" ref={currencyRef}>
            <button
              type="button"
              className="currency-current"
              aria-label="Select currency"
              aria-expanded={currencyOpen}
              onClick={() => setCurrencyOpen((open) => !open)}
            >
              <img
                src={(currencyRates[currency] || currencyRates.USD).flag}
                alt={`${currency} flag`}
                className="currency-flag"
              />
              <span className="home-currency-current-code">{currency}</span>
              <span className="currency-symbol">{currencyRates[currency].symbol.trim()}</span>
              <span className="currency-chevron">▾</span>
            </button>

            {currencyOpen && (
              <div className="currency-dropdown">
                {Object.entries(currencyRates).map(([code, option]) => (
                  <button
                    type="button"
                    key={code}
                    className={`currency-option ${currency === code ? "selected" : ""}`}
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

          <button
            type="button"
            className="about-nav-icon"
            title="Search"
            aria-label={isSearchOpen ? "Close gemstone search" : "Open gemstone search"}
            aria-expanded={isSearchOpen}
            aria-controls="shop-gem-search"
            onClick={() => setIsSearchOpen((open) => !open)}
          >
            <FaSearch />
          </button>

          <button
            className="about-nav-icon"
            title="Wishlist"
            onClick={() => setActiveDrawer("wishlist")}
          >
            <FaHeart />

            {wishlistCount > 0 && (
              <span className="about-badge">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            className="about-nav-icon"
            title="Shopping Cart"
            onClick={() => setActiveDrawer("cart")}
          >
            <FaShoppingBag />

            {cartCount > 0 && (
              <span className="about-badge">
                {cartCount}
              </span>
            )}
          </button>

          <button
            className="about-inquire-btn"
            onClick={() => setInquiryProduct(shopProducts[0] || null)}
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

      {/* ================= HERO ================= */}

      <section className="gem-hero">

        <div className="gem-hero-overlay"></div>

        <div className="gem-hero-content">

          <div className="gem-hero-logo">
            <BrandLogo
              alt="Ceylon Royal Gemstones"
            />
          </div>

          <span>THE CEYLON COLLECTION</span>

          <h1>
            Discover Rare
            <strong>Ceylon Gemstones</strong>
          </h1>

          <p>
            Explore our curated collection of authentic
            Sri Lankan gemstones, selected for their
            exceptional colour, brilliance and natural beauty.
          </p>

          <div className="gem-hero-line"></div>

        </div>
      </section>

      {/* ================= CATEGORIES ================= */}

      <section className="gem-category-section">

        <div className="gem-section-heading">

          <span>EXPLORE OUR COLLECTION</span>

          <h2>
            Gemstone <strong>Categories</strong>
          </h2>

          <p>
            Discover exceptional gemstones from the
            finest gemstone regions of Sri Lanka.
          </p>

        </div>

        <div className="gem-category-grid">

          {categories.map((category) => {

            const isActive =
              selectedCategory === category;

            return (
              <button
                key={category}
                className={`gem-category-card ${
                  isActive ? "selected" : ""
                }`}
                onClick={() =>
                  handleSelectCategory(category)
                }
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

      {/* ================= COLLECTION ================= */}

      <section id="collection" className="gem-collection-section">

        <div className="gem-collection-heading">

          <div>
            <span>AUTHENTIC CEYLON GEMSTONES</span>

            <h2>
              {selectedCategory === "All Gemstones"
                ? "Our Gemstone Collection"
                : selectedCategory}
            </h2>

            <p>
              {filteredProducts.length} gemstone
              {filteredProducts.length !== 1 ? "s" : ""}
              {" "}available
            </p>
            {backendGemstonesError && (
              <p role="status" className="admin-empty-state">
                Inventory gemstones could not be loaded: {backendGemstonesError}
              </p>
            )}
          </div>

          <div className="gem-collection-heading-actions">
            {selectedCategory !== "All Gemstones" && (
              <button
                type="button"
                className="back-to-main-categories-btn"
                onClick={handleBackToMainCategories}
              >
                <FaArrowLeft />
                <span>BACK TO MAIN CATEGORIES</span>
              </button>
            )}

            <button
              className="clear-filter-btn"
              onClick={clearFilters}
            >
              CLEAR FILTERS
            </button>
          </div>

        </div>

        {/* SEARCH */}

        {isSearchOpen && (
          <div className="gem-search-box" id="shop-gem-search" role="search">
            <div className="gem-search-heading">
              <span className="gem-search-heading-icon"><FaSearch /></span>
              <div>
                <strong>Find your gemstone</strong>
                <span>Search by name, color, cut or category</span>
              </div>
            </div>
            <div className="gem-search-input-wrap">
              <FaSearch aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                aria-label="Search gemstones"
                placeholder="Try “Blue Sapphire” or “Ruby”"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="gem-search-clear"
                  onClick={() => {
                    setSearchTerm("");
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear gemstone search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button
              type="button"
              className="gem-search-close"
              onClick={() => setIsSearchOpen(false)}
            >
              Close
            </button>
          </div>
        )}

        <div className="gem-products-layout">

          {/* ================= FILTER SIDEBAR ================= */}

          <aside className="gem-filter-sidebar">

            <div className="filter-title">
              <h3>FILTER COLLECTION</h3>
              <FaGem />
            </div>

            <div className="filter-group">

              <label>GEM TYPE</label>

              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
              >
                {categories.map((item) => (
                  <option key={item}>
                    {item}
                  </option>
                ))}
              </select>

              <FaChevronDown />
            </div>

            <div className="filter-group filter-group-box">

              <label>COLOR</label>
              <div className="color-swatch-grid" role="group" aria-label="Filter gemstones by color">
                {colors.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`color-swatch-option ${selectedColor === item ? "selected" : ""}`}
                    aria-label={item}
                    aria-pressed={selectedColor === item}
                    title={item}
                    onClick={() => setSelectedColor(item)}
                  >
                    <span
                      className={`color-swatch ${item === "All Colors" ? "all-colors-swatch" : ""}`}
                      style={{ background: colorSwatches[item] || "#b8a27a" }}
                    >
                      {item === "All Colors" ? "All" : ""}
                    </span>
                    <small>{item === "All Colors" ? "All" : item}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group filter-group-box">
              <label>CARAT RANGE</label>
              <div className="range-value-row">
                <span>{minCarat.toFixed(1)} ct</span>
                <span>{maxCarat.toFixed(1)} ct</span>
              </div>
              <div
                className="range-slider"
                style={{
                  "--range-start": `${(minCarat / shopMaxCaratValue) * 100}%`,
                  "--range-end": `${(maxCarat / shopMaxCaratValue) * 100}%`
                }}
              >
                <input
                  type="range"
                  min="0"
                  max={shopMaxCaratValue}
                  step="0.1"
                  aria-label="Minimum carat weight"
                  value={minCarat}
                  onChange={(e) => setMinCarat(Math.min(Number(e.target.value), maxCarat))}
                />
                <input
                  type="range"
                  min="0"
                  max={shopMaxCaratValue}
                  step="0.1"
                  aria-label="Maximum carat weight"
                  value={maxCarat}
                  onChange={(e) => setMaxCarat(Math.max(Number(e.target.value), minCarat))}
                />
              </div>
            </div>

            <div className="filter-group">

              <label>SHAPE</label>

              <select
                value={selectedShape}
                onChange={(e) =>
                  setSelectedShape(e.target.value)
                }
              >
                {shapes.map((item) => (
                  <option key={item}>
                    {item}
                  </option>
                ))}
              </select>

              <FaChevronDown />
            </div>

            <div className="filter-group">

              <label>CUT</label>

              <select
                value={selectedCut}
                onChange={(e) =>
                  setSelectedCut(e.target.value)
                }
              >
                {cuts.map((item) => (
                  <option key={item}>
                    {item}
                  </option>
                ))}
              </select>

              <FaChevronDown />
            </div>

            <div className="filter-group">

              <label>TREATMENT</label>

              <select
                value={selectedTreatment}
                onChange={(e) =>
                  handleTreatmentChange(e.target.value)
                }
              >
                {treatments.map((item) => (
                  <option key={item}>
                    {item}
                  </option>
                ))}
              </select>

              <FaChevronDown />
            </div>

            <div className="filter-group filter-group-box">

              <label>PRICE RANGE (USD)</label>
              <div className="range-value-row">
                <span>${minPrice.toLocaleString()}</span>
                <span>${maxPrice.toLocaleString()}</span>
              </div>
              <div
                className="range-slider"
                style={{
                  "--range-start": `${(minPrice / shopMaxPriceValue) * 100}%`,
                  "--range-end": `${(maxPrice / shopMaxPriceValue) * 100}%`
                }}
              >
                <input
                  type="range"
                  min="0"
                  max={shopMaxPriceValue}
                  step="500"
                  aria-label="Minimum price in USD"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                />
                <input
                  type="range"
                  min="0"
                  max={shopMaxPriceValue}
                  step="500"
                  aria-label="Maximum price in USD"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
                />
              </div>
            </div>

            <button
              type="button"
              className="sidebar-apply-btn"
              onClick={() => document.getElementById("gem-product-results")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              APPLY FILTERS
            </button>

            <button
              type="button"
              className="sidebar-clear-btn"
              onClick={clearFilters}
            >
              RESET FILTERS
            </button>

          </aside>

          {/* ================= PRODUCTS ================= */}

          <div className="gem-product-area" id="gem-product-results">

            {backendGemstonesLoading ? (
              <div className="no-products" role="status" aria-live="polite">
                <FaGem />
                <h3>Loading Gemstones</h3>
                <p>Fetching the latest gemstone inventory.</p>
              </div>
            ) : filteredProducts.length > 0 ? (

              <>
              <div className="gem-product-grid">

                {paginatedProducts.map((product) => {

                  const productKey = getCollectionItemKey(product);
                  const stockQuantity = inventory[productKey] ?? 0;
                  const inStock = stockQuantity > 0;
                  const offerProduct = withActiveProductOffer(product);
                  const originalPrice = Number(offerProduct.basePriceUSD ?? offerProduct.price);
                  const discountRate = Number(offerProduct.discountRate);
                  const hasDiscount = discountRate > 0 && discountRate <= 100;
                  const offerEndDate = hasDiscount
                    ? formatProductOfferEndDate(offerProduct)
                    : "";
                  const offerPrice = hasDiscount
                    ? Math.round(originalPrice * (1 - discountRate / 100))
                    : originalPrice;
                  const liked = wishlist.some(
                    (item) =>
                      getCollectionItemKey(item) ===
                      productKey
                  );

                  return (
                    <article
                      className="gem-product-card"
                      key={product.productKey || product.id}
                    >

                      <div className="product-image-box">

                        <img
                          src={resolveMediaUrl(product.image)}
                          alt={product.name}
                        />

                        <span className="product-treatment">
                          {product.treatment}
                        </span>

                        {Number(offerProduct.discountRate) > 0 ? (
                          <span className="product-discount-label">
                            {Number(offerProduct.discountRate)}% OFF
                          </span>
                        ) : offerProduct.discountLabel?.trim() ? (
                          <span className="product-discount-label">
                            {offerProduct.discountLabel}
                          </span>
                        ) : null}

                        <button
                          type="button"
                          className={`product-wishlist ${
                            liked ? "liked" : ""
                          }`}
                          aria-label={`${liked ? "Remove from" : "Add to"} wishlist: ${product.name}`}
                          onClick={() =>
                            toggleWishlist(product)
                          }
                        >
                          <FaHeart />
                        </button>

                        <div className="product-overlay">

                          <button
                            onClick={() =>
                              window.location.assign(
                                product.inventoryId
                                  ? `/gemstones/inventory/${product.inventoryId}`
                                  : `/gemstones/${product.id}`
                              )
                            }
                          >
                            VIEW DETAILS
                          </button>

                      </div>
                    </div>

                      <div className="product-info">

                        <span className="product-category">
                          {product.category}
                        </span>

                        <h3>
                          <a
                            className="product-name-link"
                            href={product.inventoryId
                              ? `/gemstones/inventory/${product.inventoryId}`
                              : `/gemstones/${product.id}`}
                          >
                          {product.name}
                          </a>
                        </h3>

                        <div className="product-details">

                          <span className="product-carat">
                            {product.carat} Ct
                          </span>

                          <span>
                            {product.shape}
                          </span>

                          <span>
                            {product.cut}
                          </span>

                        </div>

                        <div className="product-card-actions">
                          <button
                            type="button"
                            className={`product-stock-status ${
                              inStock ? "in-stock" : "out-of-stock"
                            }`}
                            disabled
                            aria-label={`${product.name} ${
                              inStock ? "available" : "out of stock"
                            }`}
                          >
                            {inStock ? "AVAILABLE" : "OUT OF STOCK"}
                          </button>
                          <button
                            type="button"
                            className="product-view-details"
                            onClick={() =>
                              window.location.assign(
                                product.inventoryId
                                  ? `/gemstones/inventory/${product.inventoryId}`
                                  : `/gemstones/${product.id}`
                              )
                            }
                          >
                            VIEW DETAILS
                          </button>
                        </div>

                        <div className="product-bottom">

                          <div className={`product-prices ${hasDiscount ? "has-discount" : ""}`}>
                            {hasDiscount && (
                              <del className="product-original-price">
                                {formatCurrencyPrice(originalPrice, currency)}
                              </del>
                            )}
                            <strong>
                              {formatCurrencyPrice(offerPrice, currency)}
                            </strong>
                            {offerEndDate && (
                              <span className="product-offer-end-date">Offer ends {offerEndDate}</span>
                            )}
                          </div>

                          <button
                            type="button"
                            className={`add-to-cart-btn ${
                              inStock ? "" : "out-of-stock"
                            }`}
                            aria-label={
                              inStock
                                ? `Add ${product.name} to cart`
                                : `${product.name} is out of stock`
                            }
                            disabled={!inStock}
                            onClick={() =>
                              addToCart(product)
                            }
                          >
                            <FaShoppingBag />
                            <span>{inStock ? "ADD TO CART" : "OUT OF STOCK"}</span>
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>

              {pageCount > 1 && (
                <nav className="shop-pagination" aria-label="Gemstone pages">
                  <button
                    type="button"
                    className="shop-pagination-arrow"
                    aria-label="Previous page"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={`shop-pagination-page ${page === currentPage ? "active" : ""}`}
                      aria-label={`Page ${page}`}
                      aria-current={page === currentPage ? "page" : undefined}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="shop-pagination-arrow"
                    aria-label="Next page"
                    disabled={currentPage === pageCount}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    &gt;
                  </button>
                </nav>
              )}
              </>

            ) : (

              <div className="no-products">

                <FaGem />

                <h3>
                  No Gemstones Found
                </h3>

                <p>
                  Try changing your search or
                  filter options.
                </p>

                <button
                  onClick={clearFilters}
                >
                  VIEW ALL GEMSTONES
                </button>

              </div>

            )}

          </div>

        </div>

      </section>

      {/* ================= QUALITY SECTION ================= */}

      <section className="gem-quality-section">

        <div className="gem-quality-heading">

          <span>THE CEYLON ROYAL PROMISE</span>

          <h2>
            Excellence in Every
            <strong>Stone</strong>
          </h2>

        </div>

        <div className="gem-quality-grid">

          <div className="quality-card">
            <FaGem />
            <h3>Authentic Gemstones</h3>
            <p>
              Carefully selected Ceylon gemstones
              with exceptional natural beauty.
            </p>
          </div>

          <div className="quality-card">
            <FaShieldAlt />
            <h3>Trusted Quality</h3>
            <p>
              Quality-focused sourcing and detailed
              gemstone information.
            </p>
          </div>

          <div className="quality-card">
            <FaShippingFast />
            <h3>Global Delivery</h3>
            <p>
              Secure delivery options for customers
              around the world.
            </p>
          </div>

          <div className="quality-card">
            <FaLock />
            <h3>Secure Experience</h3>
            <p>
              A premium and secure online gemstone
              shopping experience.
            </p>
          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="about-footer">

        <div className="about-footer-grid">

          <div className="footer-brand">

            <div className="footer-logo">
              <BrandLogo
                alt="Ceylon Royal Gemstones"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://cdn-icons-png.flaticon.com/512/3063/3063822.png";
                }}
              />

              <div>
                <strong>CEYLON</strong>
                <small>ROYAL GEMSTONES</small>
              </div>
            </div>

            <p>
              Discover the timeless beauty of authentic
              Sri Lankan gemstones, carefully sourced,
              crafted and presented with royal elegance.
            </p>
          </div>

          <div>
            <h4>EXPLORE</h4>
            <a href="/">Home</a>
            <a href="/gemstones">Shop</a>
            <a href="/About">Our Story</a>
            <a href="/trust">Trust & Certification</a>
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
          <p>Copyright © 2026 Powered by NETIT Technology</p>
          <span>NATURAL • AUTHENTIC • CEYLON</span>
        </div>

      </footer>

      {/* ================= DRAWER ================= */}

      {activeDrawer && (

        <div
          className="gem-drawer-backdrop"
          onClick={() => setActiveDrawer(null)}
        >

          <div
            className="gem-drawer"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="gem-drawer-header">

              <h3>
                {activeDrawer === "wishlist"
                  ? "Wishlist"
                  : "Add to Cart"}
              </h3>

              <button
                type="button"
                aria-label="Close cart drawer"
                onClick={() => setActiveDrawer(null)}
              >
                <FaTimes />
              </button>

            </div>

            <div className="gem-drawer-body">
              {activeDrawer === "cart" && customerCartLoading && (
                <p role="status">Loading your saved cart...</p>
              )}
              {activeDrawer === "cart" && customerCartError && (
                <p role="alert">{customerCartError}</p>
              )}

              {(
                activeDrawer === "wishlist"
                  ? wishlist
                  : cart
              ).length === 0 ? (

                <div className="drawer-empty">
                  <FaGem />

                  <p>
                    Your{" "}
                    {activeDrawer === "wishlist"
                      ? "wishlist"
                      : "cart"}{" "}
                    is empty.
                  </p>
                </div>

              ) : (

                (
                  activeDrawer === "wishlist"
                    ? wishlist
                    : cart
                ).map((item) => (

                  <div
                    className="drawer-item"
                    key={getCollectionItemKey(item)}
                  >

                    <img
                      src={item.image}
                      alt={item.name}
                    />

                    <div className="gem-drawer-item-info">

                      <h4>{item.name}</h4>

                      <p>
                        {String(item.carat).replace(/\s*ct$/i, "")} Ct
                      </p>

                      <ProductOfferPrice item={item} currency={currency} />
                      <p className="drawer-item-quantity">Qty {Number(item.quantity) || 1}</p>

                    </div>

                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      disabled={Boolean(item.cartId && deletingCartIds.includes(item.cartId))}
                      onClick={() =>
                        activeDrawer === "wishlist"
                          ? removeWishlist(getCollectionItemKey(item))
                          : removeCart(getCollectionItemKey(item))
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

          </div>

        </div>
      )}

      {/* ================= INQUIRY FORM ================= */}

      {inquiryProduct && (
        <div
          className="about-modal-backdrop"
          onClick={() => setInquiryProduct(null)}
        >
          <div
            className="about-inquiry-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="about-modal-close"
              onClick={() => setInquiryProduct(null)}
              aria-label="Close inquiry form"
            >
              <FaTimes />
            </button>

            <BrandLogo
              alt="Ceylon Royal Gemstones"
              className="about-modal-logo"
            />

            <span>PRIVATE GEMSTONE INQUIRY</span>
            <h3>{inquiryProduct.name}</h3>
            <p>
              {inquiryProduct.category} • {inquiryProduct.carat} Ct
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                alert("Your inquiry has been sent successfully!");
                setInquiryProduct(null);
              }}
            >
              <input type="text" placeholder="Your Full Name" required />
              <input type="email" placeholder="Email Address" required />
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
              <button type="submit">SEND INQUIRY</button>
            </form>
          </div>
        </div>
      )}

      {/* ================= PRODUCT MODAL ================= */}

      {selectedProduct && (

        <div
          className="gem-modal-backdrop"
          onClick={() => setSelectedProduct(null)}
        >

          <div
            className="gem-product-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="gem-modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              <FaTimes />
            </button>

            <div className="modal-product-image">

              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
              />

            </div>

            <div className="modal-product-content">

              <span>
                {selectedProduct.category}
              </span>

              <h2>
                {selectedProduct.name}
              </h2>

              <p>
                A beautiful Ceylon gemstone selected
                for its exceptional character and
                natural beauty.
              </p>

              <div className="modal-specs">

                <div>
                  <small>CARAT</small>
                  <strong>
                    {selectedProduct.carat} Ct
                  </strong>
                </div>

                <div>
                  <small>COLOR</small>
                  <strong>
                    {selectedProduct.color}
                  </strong>
                </div>

                <div>
                  <small>SHAPE</small>
                  <strong>
                    {selectedProduct.shape}
                  </strong>
                </div>

                <div>
                  <small>TREATMENT</small>
                  <strong>
                    {selectedProduct.treatment}
                  </strong>
                </div>

              </div>

              <div className="modal-price">
                {formatCurrencyPrice(selectedProduct.price, currency)}
              </div>

              <button
                className="modal-inquire-btn"
                onClick={() => {
                  setInquiryProduct(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                INQUIRE ABOUT THIS GEM
              </button>

              <button
                className="modal-inquire-btn"
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                  setActiveDrawer("cart");
                }}
              >
                ADD TO COLLECTION
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Gemstones;