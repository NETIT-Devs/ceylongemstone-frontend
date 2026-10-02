import React, { useEffect, useMemo, useState } from "react";
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
  FaWhatsapp,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebookF
} from "react-icons/fa";

import "./Gemstones.css";
import "./About.css";
import CollectionDrawerActions from "../components/CollectionDrawerActions.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import {
  getCollectionItemKey,
  normalizeCollectionItem,
  useSharedCollection
} from "../useSharedCollection.js";

export const products = [
  {
    id: 1,
    productKey: "royal-blue-sapphire",
    certificateNumber: "CRG-1001",
    name: "Royal Blue Sapphire",
    category: "Blue Sapphire",
    color: "Royal Blue",
    carat: 4.52,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Heated",
    price: 12500,
    image: "/blueGem.jpg",
    galleryViews: [
      { label: "Front", url: "/blueGem.jpg" },
      { label: "Right", url: "/blueGemRight.jpg" }
    ],
    videoUrl: "/vedio%20blue%20gem.mp4"
  },
  {
    id: 2,
    certificateNumber: "CRG-1002",
    name: "Ceylon Blue Sapphire",
    category: "Blue Sapphire",
    color: "Blue",
    carat: 3.25,
    shape: "Cushion",
    cut: "Mixed Cut",
    treatment: "Untreated",
    price: 9800,
    image: "/blueGem1.jpg",
    galleryViews: [
      { label: "Front", url: "/blueGem2Front.jpg" },
      { label: "Back", url: "/blueGem2Back.jpg" },
      { label: "Right", url: "/blueGem2Right.jpg" },
      { label: "Left", url: "/blueGem2Left.jpg" }
    ],
    videoUrl: "/bluev2.mp4"
  },
  {
    id: 3,
    productKey: "royal-ceylon-sapphire",
    certificateNumber: "CRG-1003",
    name: "Royal Ceylon Sapphire",
    category: "Blue Sapphire",
    color: "Cornflower Blue",
    carat: 5.10,
    shape: "Oval",
    cut: "Brilliant Cut",
    treatment: "Untreated",
    price: 16500,
    image: "/sapphire2.jpg",
    certImage: "/sapphire2Cetif.jpg",
    certification: "GIA / GRS",
    galleryViews: [
      { label: "Front", url: "/sapphire2Front.jpg" },
      { label: "Back", url: "/sapphire2Back22.jpg" },
      { label: "Right", url: "/sapphire2Right.jpg" },
      { label: "Left", url: "/sapphire2Left.jpg" }          
    ],
    videoUrl: "/blue3V.mp4"
  },

  {
    id: 4,
    productKey: "ceylon-padparadscha",
    certificateNumber: "CRG-1004",
    name: "Ceylon Padparadscha",
    category: "Padparadscha Sapphire",
    color: "Pink Orange",
    carat: 3.18,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Untreated",
    price: 18900,
    image: "/PADPARADSCHAgem2.jpg",
    galleryViews: [
      { label: "Front", url: "/PadparadschaFront.jpeg" },
      { label: "Back", url: "/PadparadschaBack.jpeg" },
      { label: "Right", url: "/PadparadschaRight.jpeg" },
      { label: "Left", url: "/PadparadschaLeft.jpeg" }
    ],
    videoUrl: "/pinckV4.mp4"
  },

  {
    id: 5,
    certificateNumber: "CRG-1005",
    name: "Ceylon Ruby",
    category: "Ruby",
    color: "Red",
    carat: 2.80,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Heated",
    price: 8500,
    image: "/Ruby.jpg",
    certImage: "/RubyCeti.jpg",
    certification: "Gemstone laboratory certificate",
    galleryViews: [
      { label: "Front", url: "/RubyFront.jpeg" },
      { label: "Back", url: "/RubyBack.jpeg" },
      { label: "Right", url: "/RubyRight.jpeg" },
      { label: "Left", url: "/RubyLeft.jpeg" }
    ]
  },

  {
    id: 6,
    certificateNumber: "CRG-1006",
    name: "Ceylon Star Sapphire",
    category: "Star Sapphire",
    color: "Blue",
    carat: 6.20,
    shape: "Cabochon",
    cut: "Cabochon",
    treatment: "Natural",
    price: 7200,
    image: "/StarSapphire.jpg",
    galleryViews: [
      { label: "Front", url: "/StarSapphire.jpg" },
      { label: "Back", url: "/StarBack.jpg" },
      { label: "Right", url: "/StarRight.jpg" },
      { label: "Left", url: "/StarLeft.jpg" }
    ]
  },

  {
    id: 7,
    certificateNumber: "CRG-1007",
    name: "Ceylon Cat's Eye",
    category: "Cat's Eye",
    color: "Golden",
    carat: 4.10,
    shape: "Oval",
    cut: "Cabochon",
    treatment: "Natural",
    price: 6900,
    image: "/Cat’sEye.jpg",
    galleryViews: [
      { label: "Front", url: "/Cat’sEyeFront.jpeg" },
      { label: "Back", url: "/Cat’sEyeBack.jpeg" },
      { label: "Right", url: "/Cat’sEyeRight.jpg" },
      { label: "Left", url: "/Cat’sEyeLeft.jpg" }
    ]
  },

  {
    id: 8,     
    productKey: "ceylon-alexandrite",
    certificateNumber: "CRG-1008",
    name: "Ceylon Alexandrite",
    category: "Alexandrite",
    color: "Green / Purple",
    carat: 2.05,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Untreated",
    price: 22000,
    image: "/Alexandrite1.jpg",
     galleryViews: [
      { label: "Front", url: "/PadparadschaFront.jpg" },
      { label: "Back", url: "/Alexandrite2Back.jpg" },
      { label: "Right", url: "/Alexandrite2Right.jpg" },
      { label: "Left", url: "/Alexandrite2Back.jpg" }
    ],
    videoUrl: "/pinckV4.mp4" 
  },

    {
    id: 9,
    productKey: "ceylon-alexandrite-2",
    certificateNumber: "CRG-1009",
    name: "Ceylon Alexandrite",
    category: "Alexandrite",
    color: "Green / Purple",
    carat: 2.05,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Untreated",
    price: 22000,
    image: "/ALEXANDRITEgem1.jpg",
    certImage: "/ALEXANDRITEgem1Ceti.jpg",
    certification: "Gemstone laboratory certificate",
    galleryViews: [
      { label: "Front", url: "/ALEXANDRITEgem1.jpg" },
      { label: "Back", url: "/Alexandrite2Back.jpg" },
      { label: "Right", url: "/Alexandrite2Right.jpg" },
      { label: "Left", url: "/Alexandrite2Left.jpg" }
    ]
  },
  {
    id: 10,
    productKey: "golden-yellow-sapphire",
    certificateNumber: "CRG-1010",
    name: "Golden Yellow Sapphire",
    category: "Yellow Sapphire",
    color: "Golden",
    carat: 5.10,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Untreated",
    price: 14200,
    image: "/yellowGem.jpg",
    galleryViews: [
      { label: "Front", url: "/YellowSFront.jpeg" },
      { label: "Back", url: "/YellowSBack.jpeg" },
      { label: "Right", url: "/YellowSRight.jpeg" },
      { label: "Left", url: "/YellowSLeft.jpeg" }
    ]
  },
  {
    id: 11,
    productKey: "ceylon-green-gemstone",
    certificateNumber: "CRG-1011",
    name: "Ceylon Green Gemstone",
    category: "Green Gemstone",
    color: "Green",
    carat: 2.05,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Natural",
    price: 22000,
    image: "/ALEXANDRITEgem.jpg",
    galleryViews: [
      { label: "Front", url: "/ALEXANDRITEgem.jpg" },
      { label: "Left", url: "/GreenBack.jpg" },
      { label: "Right", url: "/GreenRight.jpg" },
      { label: "Left", url: "/GreenLeft.jpg" },
    ],
    videoUrl: "/greenV11.mp4"            
  }
];

const categories = [
  "All Gemstones",
  "Blue Sapphire",
  "Yellow Sapphire",
  "Green Gemstone",
  "Padparadscha Sapphire",
  "Ruby",
  "Star Sapphire",
  "Cat's Eye",
  "Alexandrite"
];

const maxCaratValue = Math.ceil(Math.max(...products.map((product) => product.carat)));
const maxPriceValue = Math.ceil(Math.max(...products.map((product) => product.price)) / 5000) * 5000;

const colors = [
  "All Colors",
  "Blue",
  "Royal Blue",
  "Cornflower Blue",
  "Pink Orange",
  "Red",
  "Golden",
  "Green",
  "Green / Purple"
];

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

const shapes = [
  "All Shapes",
  "Oval",
  "Cushion",
  "Cabochon"
];

const cuts = [
  "All Cuts",
  "Mixed Cut",
  "Brilliant Cut",
  "Cabochon"
];

const treatments = [
  "All Treatments",
  "Untreated",
  "Heated",
  "Natural"
];

function Gemstones() {
  const [selectedCategory, setSelectedCategory] =
    useState("All Gemstones");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedColor, setSelectedColor] =
    useState("All Colors");

  const [minCarat, setMinCarat] = useState(0);
  const [maxCarat, setMaxCarat] = useState(maxCaratValue);
  const [minRating, setMinRating] = useState("");

  const [selectedShape, setSelectedShape] =
    useState("All Shapes");

  const [selectedCut, setSelectedCut] =
    useState("All Cuts");

  const [selectedTreatment, setSelectedTreatment] =
    useState("All Treatments");

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(maxPriceValue);

  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [cardQuantities, setCardQuantities] = useState({});

  const [activeDrawer, setActiveDrawer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inquiryProduct, setInquiryProduct] = useState(null);

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
    return products.filter((product) => {
      const categoryMatch =
        selectedCategory === "All Gemstones" ||
        product.category === selectedCategory;

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

      const ratingMatch =
        minRating === "" ||
        (Number.isFinite(product.rating) && product.rating >= Number(minRating));

      const shapeMatch =
        selectedShape === "All Shapes" ||
        product.shape === selectedShape;

      const cutMatch =
        selectedCut === "All Cuts" ||
        product.cut === selectedCut;

      const treatmentMatch =
        selectedTreatment === "All Treatments" ||
        product.treatment === selectedTreatment;

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
        ratingMatch &&
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
    minRating,
    selectedShape,
    selectedCut,
    selectedTreatment,
    minPrice,
    maxPrice
  ]);

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
  };

  const addToCart = (product, quantity = 1) => {
    const productKey = getCollectionItemKey(product);

    setCart((current) => {
      const exists = current.some(
        (item) => getCollectionItemKey(item) === productKey
      );

      if (exists) {
        return current.map((item) =>
          getCollectionItemKey(item) === productKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...current,
        normalizeCollectionItem({ ...product, quantity })
      ];
    });
    setActiveDrawer("cart");
  };

  const changeCardQuantity = (id, amount) => {
    setCardQuantities((current) => ({
      ...current,
      [id]: Math.max(1, (current[id] ?? 1) + amount)
    }));
  };

  const changeQuantity = (setItems, productKey, amount) => {
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
    setSelectedCategory("All Gemstones");
    setSearchTerm("");
    setSelectedColor("All Colors");
    setMinCarat(0);
    setMaxCarat(maxCaratValue);
    setMinRating("");
    setSelectedShape("All Shapes");
    setSelectedCut("All Cuts");
    setSelectedTreatment("All Treatments");
    setMinPrice(0);
    setMaxPrice(maxPriceValue);
  };

  return (
    <div className="gemstones-page">

      {/* ================= NAVBAR ================= */}

      <nav className="about-navbar">

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

        <div className="about-nav-links">
          <a href="/">Home</a>
          <a href="/gemstones" className="active">
            Gemstones
          </a>
          <a href="/About">Heritage</a>
          <a href="/trust">Certification</a>
          <a href="/reviews">Reviews</a>
          <a href="/contact">Contact</a>
          <a href="/blog">Blog</a>
          <a href="/login">Login</a>
          <InternationalNavEntry />
        </div>

        <div className="about-nav-actions">

          <InternationalNavEntry mobile />

          <button
            className="about-nav-icon"
            title="Search"
            aria-label="Search gemstones"
            onClick={() => {
              const query = prompt("Search gemstones:");
              if (query) {
                window.location.href = `/?search=${encodeURIComponent(query)}`;
              }
            }}
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

        </div>
      </nav>

      {/* ================= HERO ================= */}

      <section className="gem-hero">

        <div className="gem-hero-overlay"></div>

        <div className="gem-hero-content">

          <div className="gem-hero-logo">
            <img
              src="/logo.png"
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
                  setSelectedCategory(category)
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

      <section className="gem-collection-section">

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
          </div>

          <button
            className="clear-filter-btn"
            onClick={clearFilters}
          >
            CLEAR FILTERS
          </button>

        </div>

        {/* SEARCH */}

        <div className="gem-search-box">

          <FaSearch />

          <input
            type="text"
            placeholder="Search gemstones..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
            >
              <FaTimes />
            </button>
          )}

        </div>

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
              <label>CARAT RANGE</label>
              <div className="range-value-row">
                <span>{minCarat.toFixed(1)} ct</span>
                <span>{maxCarat.toFixed(1)} ct</span>
              </div>
              <div
                className="range-slider"
                style={{
                  "--range-start": `${(minCarat / maxCaratValue) * 100}%`,
                  "--range-end": `${(maxCarat / maxCaratValue) * 100}%`
                }}
              >
                <input
                  type="range"
                  min="0"
                  max={maxCaratValue}
                  step="0.1"
                  aria-label="Minimum carat weight"
                  value={minCarat}
                  onChange={(e) => setMinCarat(Math.min(Number(e.target.value), maxCarat))}
                />
                <input
                  type="range"
                  min="0"
                  max={maxCaratValue}
                  step="0.1"
                  aria-label="Maximum carat weight"
                  value={maxCarat}
                  onChange={(e) => setMaxCarat(Math.max(Number(e.target.value), minCarat))}
                />
              </div>
            </div>

            <div className="filter-group filter-group-box">
              <label htmlFor="gem-rating-filter">RATING</label>
              <select
                id="gem-rating-filter"
                value={minRating}
                disabled={!products.some((product) => Number.isFinite(product.rating))}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="">All ratings</option>
                <option value="4">4 stars &amp; up</option>
                <option value="3">3 stars &amp; up</option>
                <option value="2">2 stars &amp; up</option>
              </select>
              <FaChevronDown />
              {!products.some((product) => Number.isFinite(product.rating)) && (
                <small className="filter-unavailable-note">Ratings not available</small>
              )}
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
                  setSelectedTreatment(e.target.value)
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
                  "--range-start": `${(minPrice / maxPriceValue) * 100}%`,
                  "--range-end": `${(maxPrice / maxPriceValue) * 100}%`
                }}
              >
                <input
                  type="range"
                  min="0"
                  max={maxPriceValue}
                  step="500"
                  aria-label="Minimum price in USD"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                />
                <input
                  type="range"
                  min="0"
                  max={maxPriceValue}
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

              <div className="gem-product-grid">

                {filteredProducts.map((product) => {

                  const liked = wishlist.some(
                    (item) =>
                      getCollectionItemKey(item) ===
                      getCollectionItemKey(product)
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
                          onError={(e) => {
                            e.currentTarget.src =
                              "/logo.png";
                          }}
                        />

                        <span className="product-treatment">
                          {product.treatment}
                        </span>

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
                                `/gemstones/${product.id}`
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
                          {product.name}
                        </h3>

                        <div className="product-details">

                          <span>
                            {product.carat} Ct
                          </span>

                          <span>
                            {product.shape}
                          </span>

                          <span>
                            {product.cut}
                          </span>

                        </div>

                        <div className="product-bottom">

                          <strong>
                            $
                            {(
                              product.price *
                              (cardQuantities[product.id] ?? 1)
                            ).toLocaleString()}
                          </strong>

                          <div
                            className="card-quantity-control"
                            aria-label={`Quantity for ${product.name}`}
                          >
                            <button
                              type="button"
                              aria-label={`Decrease ${product.name} quantity`}
                              onClick={() =>
                                changeCardQuantity(product.id, -1)
                              }
                            >
                              −
                            </button>
                            <span aria-live="polite">
                              {cardQuantities[product.id] ?? 1}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase ${product.name} quantity`}
                              onClick={() =>
                                changeCardQuantity(product.id, 1)
                              }
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className="add-to-cart-btn"
                            aria-label={`Add ${product.name} to cart`}
                            onClick={() =>
                              addToCart(
                                product,
                                cardQuantities[product.id] ?? 1
                              )
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
            <a href="/gemstones">Gemstones</a>
            <a href="/About">Our Heritage</a>
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
          <p>© 2026 Ceylon Royal Gemstones. All Rights Reserved.</p>
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
                        {String(item.carat).replace(/\s*ct$/i, "")} Ct
                      </p>

                      <strong>
                        ${(item.price * item.quantity).toLocaleString()}
                      </strong>

                      <div className="gem-quantity-control">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() =>
                            changeQuantity(
                              activeDrawer === "wishlist"
                                ? setWishlist
                                : setCart,
                              getCollectionItemKey(item),
                              -1
                            )
                          }
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() =>
                            changeQuantity(
                              activeDrawer === "wishlist"
                                ? setWishlist
                                : setCart,
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

            <img
              src="/logo.png"
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
                $
                {selectedProduct.price.toLocaleString()}
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