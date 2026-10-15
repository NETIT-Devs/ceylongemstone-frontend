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
import "./GemstoneDetail.css";
import "./About.css";
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";
import CollectionDrawerActions from "../components/CollectionDrawerActions.jsx";
import CollectionDrawerPanel from "../components/CollectionDrawerPanel.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import CustomerOrdersNavLink from "../components/CustomerOrdersNavLink.jsx";
import {
  getCollectionItemKey,
  normalizeCollectionItem,
  useSharedCollection
} from "../useSharedCollection.js";
import { currencyRates, formatCurrencyPrice, getCurrentCurrency } from "../currency.js";
import { hasAdminAccess } from "../adminAccess.js";
import { useJewelleryProductOverrides } from "../useJewelleryProductOverrides.js";
import { useJewellerySubmissions } from "../useJewellerySubmissions.js";
import { withActiveProductOffer } from "../productOffers.js";
import { apiGet, resolveMediaUrl } from "../services/api.js";

// eslint-disable-next-line react-refresh/only-export-components
export const products = [
  {
    id: 1,
    productKey: "ceylon-blue-gem-bracelet",
    name: "Blue Gem Bracelet",
    category: "Bracelets",
    color: "Blue",
    shape: "Gemstone Bracelet",
    cut: "Handcrafted",
    treatment: "Handcrafted",
    price: 12500,
    image: "/BlueBracelete.jpg",
  },
  {
    id: 2,
    productKey: "pink-gem-necklace",
    name: "Pink Gem Necklace",
    category: "Necklaces",
    color: "Pink",
    shape: "Pendant Necklace",
    cut: "Handcrafted",
    treatment: "Handcrafted",
    price: 9800,
    image: "/pinkNecklece.jpg",
  },
  {
    id: 3,
    productKey: "purple-gem-necklace",
    name: "Purple Gem Necklace",
    category: "Necklaces",
    color: "Purple",
    shape: "Pendant Necklace",
    cut: "Handcrafted",
    treatment: "Handcrafted",
    price: 16500,
    image: "/purpleNECKlece.jpg",
  },
  {
    id: 4,
    productKey: "blue-heart-pendant-necklace",
    name: "Blue Heart Pendant Necklace",
    category: "Necklaces",
    color: "Blue",
    shape: "Heart Pendant Necklace",
    cut: "Handcrafted",
    treatment: "Handcrafted",
    price: 14200,
    image: "/blueNecklece.jpg",
  },
  {
    id: 5,
    productKey: "purple-gemstone-ring",
    name: "Purple Gemstone Ring",
    category: "Rings",
    color: "Purple",
    shape: "Gemstone Ring",
    cut: "Handcrafted",
    treatment: "Handcrafted",
    price: 11800,
    image: "/purpleRing.jpg",
  },
  {
    id: 6,
    productKey: "ruby-gemstone-ring",
    name: "Red Gemstone Ring",
    category: "Rings",
    color: "Red",
    shape: "Gemstone Ring",
    cut: "Handcrafted",
    treatment: "Handcrafted",
    price: 8500,
    image: "/redRing.jpg",
  },
  {
    id: 7,
    productKey: "red-gem-necklace",
    name: "Red Gem Necklace",
    category: "Necklaces",
    color: "Red",
    shape: "Pendant Necklace",
    cut: "Handcrafted",
    treatment: "Handcrafted",
    price: 7200,
    image: "/redNecklece.jpg",
  },
  {
    id: 8,
    productKey: "blue-sapphire-ring",
    name: "Blue Sapphire Ring",
    category: "Rings",
    color: "Blue",
    shape: "Gemstone Ring",
    cut: "Handcrafted",
    treatment: "Handcrafted",
    price: 12500,
    image: "/blueRing.jpg",
  },
  {
    id: 9,
    productKey: "blue-sapphire-drop-earrings",
    name: "Blue Gem Drop Earrings",
    category: "Earrings",
    color: "Blue",
    shape: "Drop Earrings",
    cut: "Handcrafted",
    treatment: "Handcrafted",
    price: 6900,
    image: "/blueEaring.jpg",
  },
  {
    id: 10,
    productKey: "blue-gem-necklace",
    name: "Blue Gem Pendant Necklace",
    category: "Necklaces",
    color: "Blue",
    shape: "Pendant Necklace",
    cut: "Handcrafted",
    treatment: "Handcrafted",
    price: 8500,
    image: "/goldBluenecklece.jpg",
  },
  {
    id: 11,
    productKey: "green-gem-bracelet",
    name: "Green Gem Bracelet",
    category: "Bracelets",
    color: "Green",
    shape: "Gemstone Bracelet",
    cut: "Handcrafted",
    treatment: "Handcrafted",
    price: 9800,
    image: "/greenbracelet.jpg",
  },
];

// eslint-disable-next-line react-refresh/only-export-components
export const categories = [
  "All Jewellery",
  "Necklaces",
  "Bracelets",
  "Rings",
  "Earrings"
];

const maxPriceValue = Math.ceil(Math.max(...products.map((product) => product.price)) / 5000) * 5000;
const PRODUCTS_PER_PAGE = 15;

const colors = [
  "All Colors",
  "Blue",
  "Pink",
  "Purple",
  "Red",
  "Green"
];

const colorSwatches = {
  "All Colors": "#ffffff",
  Blue: "#3478c8",
  Pink: "#e58c79",
  Purple: "#8c5aa5",
  Red: "#c83c45",
  Green: "#39845b"
};

function Juwellery() {
  const [currency, setCurrency] = useState(getCurrentCurrency);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef(null);
  const [jewelleryProductOverrides] = useJewelleryProductOverrides();
  const [jewellerySubmissions] = useJewellerySubmissions();
  const [backendJewellery, setBackendJewellery] = useState([]);
  const [backendJewelleryLoading, setBackendJewelleryLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchJewellery = async () => {
      setBackendJewelleryLoading(true);
      try {
        const response = await apiGet("/api/jewellery");
        if (response.ok) {
          const result = await response.json();
          if (isMounted && Array.isArray(result?.data)) {
            setBackendJewellery(result.data);
          }
        }
      } catch (err) {
        console.warn("Unable to load jewellery from API:", err);
      } finally {
        if (isMounted) setBackendJewelleryLoading(false);
      }
    };
    fetchJewellery();
    return () => {
      isMounted = false;
    };
  }, []);

  const shopProducts = useMemo(
    () => [
      ...backendJewellery
        .filter((item) => item.status !== "inactive" && item.status !== "draft" && item.status !== "rejected")
        .map((item) => ({
          id: `db-${item.id}`,
          rawId: item.id,
          productKey: item.product_code || `jewellery-db-${item.id}`,
          product_code: item.product_code,
          name: item.product_name,
          category: item.jewellery_type || "Other",
          color: item.color || "Other",
          shape: item.gemstone_type ? `${item.gemstone_type} ${item.jewellery_type || ""}`.trim() : (item.jewellery_type || "Jewellery"),
          cut: Number(item.is_handcrafted) === 1 ? "Handcrafted" : "Precision Crafted",
          treatment: Number(item.is_handcrafted) === 1 ? "Handcrafted" : "Fine Jewellery",
          material: item.material || "18K Gold",
          gemstone_type: item.gemstone_type || "",
          description: item.description || "",
          price: Number(item.price) || 0,
          currency: item.currency || "USD",
          stock_quantity: item.stock_quantity ?? 1,
          is_handcrafted: Number(item.is_handcrafted) === 1,
          image: resolveMediaUrl(item.image_url) || "/BlueBracelete.jpg",
          status: item.status
        })),
      ...products
        .map((product) => ({
          ...product,
          ...jewelleryProductOverrides[String(product.id)]
        }))
        .filter((product) => !product.deleted),
      ...jewellerySubmissions
        .filter((submission) => submission.status === "approved")
        .map((submission) => submission.jewellery)
    ],
    [backendJewellery, jewelleryProductOverrides, jewellerySubmissions]
  );
  const shopMaxPriceValue = Math.ceil(
    Math.max(maxPriceValue, ...shopProducts.map((product) => Number(product.price) || 0)) /
      5000
  ) * 5000;

  const readMyOrdersLinkStatus = () => {
    try {
      const customer = JSON.parse(
        window.localStorage.getItem("ceylon-user") || "null"
      );
      return customer?.loggedIn === true && !hasAdminAccess("/admin");
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
      if (cat) {
        const found = categories.find(
          (c) => c.toLowerCase() === cat.toLowerCase().trim()
        );
        if (found) return found;
      }
    } catch { /* URL parsing unsupported */ }
    return "All Jewellery";
  });
  const [currentPage, setCurrentPage] = useState(1);

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

  const [minPrice, setMinPrice] = useState(0);
  const [userMaxPrice, setUserMaxPrice] = useState(null);

  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(() => {
    const productId = new URLSearchParams(window.location.search).get("product");
    return shopProducts.find((product) => String(product.id) === String(productId) || String(product.rawId) === String(productId)) || null;
  });
  const [inquiryProduct, setInquiryProduct] = useState(null);

  const maxPrice = userMaxPrice !== null ? userMaxPrice : shopMaxPriceValue;
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
    setSelectedProduct(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("product");
      if (cat === "All Jewellery") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", cat);
      }
      window.history.pushState({}, "", url.toString());
    } catch { /* ignored */ }
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    const url = new URL(window.location.href);
    url.searchParams.set("product", String(product.id));
    window.history.pushState({}, "", url.toString());
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("product");
    window.history.pushState({}, "", url.toString());
  };

  const handleBackToMainCategories = () => {
    handleSelectCategory("All Jewellery");
  };

  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get("category");
        if (cat) {
          const found = categories.find(
            (c) => c.toLowerCase() === cat.toLowerCase().trim()
          );
          if (found) setSelectedCategory(found);
        } else {
          setSelectedCategory("All Jewellery");
        }
        setSearchTerm(params.get("search") || "");
        const productId = Number(params.get("product"));
        setSelectedProduct(
          shopProducts.find((product) => product.id === productId) || null
        );
      } catch { /* ignored */ }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [shopProducts]);

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
      const categoryMatch =
        selectedCategory === "All Jewellery" ||
        product.category?.toLowerCase() === selectedCategory?.toLowerCase() ||
        String(product.category || "").toLowerCase().includes(selectedCategory.toLowerCase());

      const searchMatch =
        searchTerm.trim() === "" ||
        [
          product.name,
          product.category,
          product.color,
          product.shape,
          product.cut,
          product.treatment,
          product.price
        ].some((value) =>
          String(value)
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase())
        );

      const colorMatch =
        selectedColor === "All Colors" ||
        product.color?.toLowerCase() === selectedColor?.toLowerCase() ||
        String(product.color || "").toLowerCase().includes(selectedColor.toLowerCase());

      const minPriceMatch =
        product.price >= minPrice;

      const maxPriceMatch =
        product.price <= maxPrice;

      return (
        categoryMatch &&
        searchMatch &&
        colorMatch &&
        minPriceMatch &&
        maxPriceMatch
      );
    });
  }, [
    selectedCategory,
    searchTerm,
    selectedColor,
    minPrice,
    maxPrice,
    shopProducts
  ]);

  const pageCount = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, selectedColor, minPrice, maxPrice]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(pageCount, 1)));
  }, [pageCount]);

  const goToPage = (page) => {
    setCurrentPage(page);
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

  const addToCart = (product) => {
    const productKey = getCollectionItemKey(product);
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
      const exists = current.some(
        (item) => getCollectionItemKey(item) === productKey
      );

      if (exists) return current;

      return [
        ...current,
        normalizeCollectionItem({ ...cartProduct, quantity: 1 })
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
    setCart((current) =>
      current.filter((item) => getCollectionItemKey(item) !== productKey)
    );
  };

  const clearFilters = () => {
    setSelectedCategory("All Jewellery");
    setSearchTerm("");
    setSelectedColor("All Colors");
    setMinPrice(0);
    setMaxPrice(shopMaxPriceValue);
  };

  const [addedToCartProductKey, setAddedToCartProductKey] = useState(null);

  if (selectedProduct) {
    const offerProduct = withActiveProductOffer(selectedProduct);
    const selectedOriginalPrice = Number(
      offerProduct.basePriceUSD ?? offerProduct.price
    );
    const selectedDiscountRate = Number(offerProduct.discountRate);
    const selectedOfferPrice = selectedDiscountRate > 0
      ? Math.round(selectedOriginalPrice * (1 - selectedDiscountRate / 100))
      : selectedOriginalPrice;
    const isWishlisted = wishlist.some(
      (item) => getCollectionItemKey(item) === getCollectionItemKey(selectedProduct)
    );
    const addedToCart = addedToCartProductKey === getCollectionItemKey(selectedProduct);
    const inquiryMessage = `Hello, I'm interested in the ${selectedProduct.name} (Ref. CRJ-${selectedProduct.id}).`;

    return (
      <div className="luxury-detail-wrapper jewellery-detail-page">
        <header className="gem-detail-navbar about-navbar">
          <a href="/" className="gem-detail-brand about-navbar-logo">
            <BrandLogo alt="Ceylon Royal Gemstones" />
            <span className="about-logo-text">
              <strong>CEYLON</strong>
              <small>ROYAL GEMSTONES</small>
            </span>
          </a>
          <MobileSiteMenu />
          <nav className="gem-detail-nav-links about-nav-links" aria-label="Main navigation">
            <a href="/">Home</a>
            <ShopNavDropdown current="jewellery" />
            <a href="/About">Our Story</a>
            <a href="/trust">Certification</a>
            <a href="/reviews">Reviews</a>
            <a href="/contact">Contact</a>
            <CustomerOrdersNavLink />
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
              onClick={closeProductDetails}
            >
              BACK TO COLLECTION
            </button>
          </div>
        </header>

        <a
          href="/jewellery#collection"
          className="detail-back-collection"
          onClick={(event) => {
            event.preventDefault();
            closeProductDetails();
          }}
        >
          <FaArrowLeft aria-hidden="true" />
          <span>BACK TO COLLECTION</span>
        </a>

        <main>
          <div className="showcase-grid">
            <div className="media-stage">
              <div className="main-display-frame">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="display-media"
                />
              </div>
            </div>

            <section className="luxury-info" aria-labelledby="jewellery-detail-title">
              <div className="header-meta">
                <span className="sku-badge">REF. #CRJ-{selectedProduct.id}</span>
                <span className="product-stock-status in-stock">AVAILABLE</span>
              </div>

              <h1
                id="jewellery-detail-title"
                className="gem-heading"
                style={{ color: "#152923" }}
              >
                {selectedProduct.name}
              </h1>

              <div className="price-container">
                <div className="price-usd">
                  {formatCurrencyPrice(selectedOfferPrice, currency)}
                </div>
                {selectedDiscountRate > 0 && (
                  <del className="product-original-price">
                    {formatCurrencyPrice(selectedOriginalPrice, currency)}
                  </del>
                )}
              </div>

              <h2 className="gem-about-heading" style={{ color: "#152923" }}>
                ABOUT THIS JEWELLERY
              </h2>
              <p className="gem-narrative" style={{ color: "#65736d" }}>
                Crafted in a {selectedProduct.shape.toLowerCase()} style, this{" "}
                {selectedProduct.color.toLowerCase()} jewellery piece showcases
                its gemstone.
              </p>

              <div className="quick-specs-grid">
                <div className="spec-chip">
                  <span className="chip-label">TYPE</span>
                  <span className="chip-val" style={{ color: "#152923" }}>
                    {selectedProduct.category}
                  </span>
                </div>
                <div className="spec-chip">
                  <span className="chip-label">COLOR</span>
                  <span className="chip-val" style={{ color: "#152923" }}>
                    {selectedProduct.color}
                  </span>
                </div>
                <div className="spec-chip">
                  <span className="chip-label">DESIGN</span>
                  <span className="chip-val" style={{ color: "#152923" }}>
                    {selectedProduct.shape}
                  </span>
                </div>
                <div className="spec-chip">
                  <span className="chip-label">CRAFT</span>
                  <span className="chip-val" style={{ color: "#152923" }}>
                    {selectedProduct.treatment}
                  </span>
                </div>
              </div>

              <div className="cta-button-group">
                <button
                  type="button"
                  className="gold-btn"
                  onClick={addedToCart
                    ? () => setActiveDrawer('cart')
                    : () => {
                        addToCart(selectedProduct);
                        setAddedToCartProductKey(getCollectionItemKey(selectedProduct));
                      }}
                >
                  <FaShoppingBag /> {addedToCart ? 'VIEW CART' : 'ADD TO CART'}
                </button>
                <button
                  type="button"
                  className={`outline-btn ${isWishlisted ? "wishlisted" : ""}`}
                  aria-pressed={isWishlisted}
                  onClick={() => {
                    toggleWishlist(selectedProduct);
                  }}
                >
                  <FaHeart /> {isWishlisted ? "SAVED TO WISHLIST" : "ADD TO WISHLIST"}
                </button>
              </div>

              <a
                className="whatsapp-inquiry-btn"
                href={`https://wa.me/94712345678?text=${encodeURIComponent(inquiryMessage)}`}
                target="_blank"
                rel="noreferrer"
              >
                <FaWhatsapp aria-hidden="true" /> INQUIRE ABOUT THIS JEWELLERY
              </a>
            </section>
          </div>

          <section className="tabs-wrapper jewellery-detail-specifications">
            <div className="tab-navigation">
              <h2 className="tab-link active">JEWELLERY DETAILS</h2>
            </div>
            <div className="tab-body">
              <div className="specs-grid">
                <div className="spec-row">
                  <span className="spec-name">Jewellery Type</span>
                  <span className="spec-value">{selectedProduct.category}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Gemstone Color</span>
                  <span className="spec-value">{selectedProduct.color}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Design</span>
                  <span className="spec-value">{selectedProduct.shape}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Craft</span>
                  <span className="spec-value">{selectedProduct.treatment}</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        <CollectionDrawerPanel
          activeDrawer={activeDrawer}
          setActiveDrawer={setActiveDrawer}
          wishlist={wishlist}
          cart={cart}
          setWishlist={setWishlist}
          setCart={setCart}
        />
      </div>
    );
  }

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

        <MobileSiteMenu onInquire={() => setInquiryProduct(products[0])} />
        <div className="about-nav-links">
          <a href="/">Home</a>
          <ShopNavDropdown current="jewellery" />
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
            aria-label={isSearchOpen ? "Close jewellery search" : "Open jewellery search"}
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
            onClick={() => setInquiryProduct(products[0])}
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
            Discover Elegant
            <strong>Ceylon Jewellery</strong>
          </h1>

          <p>
            Explore our curated collection of authentic
            Ceylon jewellery, crafted with vibrant gemstones
            and timeless design.
          </p>

          <div className="gem-hero-line"></div>

        </div>
      </section>

      {/* ================= CATEGORIES ================= */}

      <section className="gem-category-section">

        <div className="gem-section-heading">

          <span>EXPLORE OUR COLLECTION</span>

          <h2>
            Jewellery <strong>Categories</strong>
          </h2>

          <p>
            Explore necklaces, bracelets, rings and earrings.
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
            <span>CEYLON ROYAL JEWELLERY</span>

            <h2>
              {selectedCategory === "All Jewellery"
                ? "Our Jewellery Collection"
                : selectedCategory}
            </h2>

            <p>
              {filteredProducts.length} jewellery item
              {filteredProducts.length !== 1 ? "s" : ""}
              {" "}available
            </p>
          </div>

          <div className="gem-collection-heading-actions">
            {selectedCategory !== "All Jewellery" && (
              <button
                type="button"
                className="back-to-main-categories-btn"
                onClick={handleBackToMainCategories}
              >
                <FaArrowLeft />
                <span>ALL JEWELLERY</span>
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
                <strong>Find your jewellery</strong>
                <span>Search by name, color or category</span>
              </div>
            </div>
            <div className="gem-search-input-wrap">
              <FaSearch aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                aria-label="Search jewellery"
                placeholder="Try “Sapphire Necklace” or “Ruby Ring”"
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
                  aria-label="Clear jewellery search"
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

              <label>JEWELLERY TYPE</label>

              <select
                value={selectedCategory}
                onChange={(e) => handleSelectCategory(e.target.value)}
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
              <div className="color-swatch-grid" role="group" aria-label="Filter jewellery by color">
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
                      style={{ background: colorSwatches[item] }}
                    >
                      {item === "All Colors" ? "All" : ""}
                    </span>
                    <small>{item === "All Colors" ? "All" : item}</small>
                  </button>
                ))}
              </div>
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

            {filteredProducts.length > 0 ? (

              <>
              <div className="gem-product-grid">

                {paginatedProducts.map((product) => {

                  const offerProduct = withActiveProductOffer(product);
                  const productKey = getCollectionItemKey(product);
                  const originalPrice = Number(offerProduct.basePriceUSD ?? offerProduct.price);
                  const discountRate = Number(offerProduct.discountRate);
                  const hasDiscount = discountRate > 0 && discountRate <= 100;
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
                      key={product.id}
                    >

                      <div className="product-image-box">

                        <img
                          src={product.image}
                          alt={product.name}
                          style={
                            product.productKey === "purple-gem-necklace"
                              ? { objectPosition: "center 78%" }
                              : undefined
                          }
                          onError={(e) => {
                            e.currentTarget.src =
                              "/logo.png";
                          }}
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

                      </div>

                      <div className="product-info">

                        <span className="product-category">
                          {product.category}
                        </span>

                        <h3>
                          <a
                            className="product-name-link"
                            href="#collection"
                            onClick={(event) => {
                              event.preventDefault();
                              openProductDetails(product);
                            }}
                          >
                            {product.name}
                          </a>
                        </h3>

                        <div className="product-details">
                          <span>
                            {product.color}
                          </span>

                          <span>
                            {product.shape}
                          </span>

                        </div>

                        <div className="product-card-actions">
                          <button
                            type="button"
                            className="product-stock-status in-stock"
                            disabled
                            aria-label={`${product.name} available`}
                          >
                            AVAILABLE
                          </button>
                          <button
                            type="button"
                            className="product-view-details"
                            onClick={() => openProductDetails(product)}
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
                          </div>

                          <button
                            type="button"
                            className="add-to-cart-btn"
                            aria-label={`Add ${product.name} to cart`}
                            onClick={() =>
                              addToCart(product)
                            }
                          >
                            <FaShoppingBag />
                            <span>ADD TO CART</span>
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>

              {pageCount > 1 && (
                <nav className="shop-pagination" aria-label="Jewellery pages">
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
                  No Jewellery Found
                </h3>

                <p>
                  Try changing your search or
                  filter options.
                </p>

                <button
                  onClick={clearFilters}
                >
                  VIEW ALL JEWELLERY
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
            <strong>Jewellery</strong>
          </h2>

        </div>

        <div className="gem-quality-grid">

          <div className="quality-card">
            <FaGem />
            <h3>Authentic Jewellery</h3>
            <p>
              Thoughtfully selected jewellery with
              exceptional Ceylon gemstones.
            </p>
          </div>

          <div className="quality-card">
            <FaShieldAlt />
            <h3>Trusted Quality</h3>
            <p>
              Quality-focused sourcing and detailed
              clear product information.
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
              A premium and secure online jewellery
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
              Discover the timeless beauty of Ceylon jewellery,
              carefully selected and presented with royal elegance.
            </p>
          </div>

          <div>
            <h4>EXPLORE</h4>
            <a href="/">Home</a>
            <a href="/jewellery">Shop</a>
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
              of Ceylon jewellery.
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
                        {item.category} • {item.color}
                      </p>

                      <strong>{formatCurrencyPrice(item.price, currency)}</strong>
                      <p className="drawer-item-quantity">Qty 1</p>

                    </div>

                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
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

            <span>PRIVATE JEWELLERY INQUIRY</span>
            <h3>{inquiryProduct.name}</h3>
            <p>
              {inquiryProduct.category} • {inquiryProduct.color}
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

    </div>
  );
}

export default Juwellery;