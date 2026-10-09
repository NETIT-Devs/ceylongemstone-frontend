import { useEffect, useMemo, useRef, useState } from "react";
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
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import {
  getCollectionItemKey,
  normalizeCollectionItem,
  useSharedCollection
} from "../useSharedCollection.js";
import { formatCurrencyPrice, getCurrentCurrency } from "../currency.js";
import { useGemInventory } from "../useGemInventory.js";
import { useGemSubmissions } from "../useGemSubmissions.js";

// eslint-disable-next-line react-refresh/only-export-components
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
      { label: "Back", url: "/blueGemBack.jpg" },
      { label: "Right", url: "/blueGemRight.jpg" },
      { label: "Left", url: "/blueGemLeft.jpg" }
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
      { label: "Front", url: "/blueGem1.jpg" },
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
    ],
    videoUrl: "/rubyVideo.mp4"
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
      { label: "Front", url: "/Alexandrite1.jpg" },
      { label: "Back", url: "/alexandrite1back.jpg" },
      { label: "Right", url: "/alexandrite1right.jpg" },
      { label: "Left", url: "/alexandrite1left.jpg" }
    ]
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
      { label: "Back", url: "/GreenBack.jpg" },
      { label: "Right", url: "/GreenRight.jpg" },
      { label: "Left", url: "/GreenLeft.jpg" }
    ],
    videoUrl: "/greenV11.mp4"            
  },

  // ── YELLOW SAPPHIRE ──────────────────────────────────────
  {
    id: 12,
    productKey: "yellow-gurugala-sapphire",
    certificateNumber: "CRG-1012",
    name: "Yellow Gurugala Sapphire",
    category: "Yellow Sapphire",
    origin: "Ratnapura, Sri Lanka",
    color: "Yellow",
    carat: 4.20,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Untreated",
    price: 11800,
    image: "/YellowGurugala.jpg",
    galleryViews: [
      { label: "Front", url: "/YellowGurugala.jpg" },
      { label: "Back", url: "/yellowgurugalaback.jpg" },
      { label: "Right", url: "/yellowgurugalaright.jpg" },
      { label: "Left", url: "/yellowgurugalaleft.jpg" }
    ]
  },
  {
    id: 13,
    productKey: "yellow-king-sapphire",
    certificateNumber: "CRG-1013",
    name: "Yellow King Sapphire",
    category: "Yellow Sapphire",
    origin: "Ratnapura, Sri Lanka",
    color: "Canary Yellow",
    carat: 5.80,
    shape: "Cushion",
    cut: "Brilliant Cut",
    treatment: "Untreated",
    price: 16500,
    image: "/Yellowking.jpg",
    galleryViews: [
      { label: "Front", url: "/Yellowking.jpg" },
      { label: "Back", url: "/yellowkingback.jpg" },
      { label: "Right", url: "/yellowkingright.jpg" },
      { label: "Left", url: "/yellowkingleft.jpg" }
    ]
  },
  {
    id: 14,
    productKey: "yellow-pushparaga-sapphire",
    certificateNumber: "CRG-1014",
    name: "Yellow Pushparaga Sapphire",
    category: "Yellow Sapphire",
    origin: "Ratnapura, Sri Lanka",
    color: "Golden Yellow",
    carat: 3.75,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Untreated",
    price: 9500,
    image: "/yellowPushparaga.jpg",
    galleryViews: [
      { label: "Front", url: "/yellowPushparaga.jpg" }
    ]
  },

  // ── STAR SAPPHIRE ─────────────────────────────────────────
  {
    id: 15,
    productKey: "ceylon-star-sapphire-1",
    certificateNumber: "CRG-1015",
    name: "Ceylon Star Sapphire I",
    category: "Star Sapphire",
    color: "Blue",
    carat: 7.40,
    shape: "Cabochon",
    cut: "Cabochon",
    treatment: "Natural",
    price: 8900,
    image: "/Star1.jpg",
    galleryViews: [
      { label: "Front", url: "/Star1.jpg" }
    ]
  },
  {
    id: 16,
    productKey: "ceylon-star-sapphire-3",
    certificateNumber: "CRG-1016",
    name: "Ceylon Star Sapphire III",
    category: "Star Sapphire",
    color: "Blue Grey",
    carat: 5.95,
    shape: "Cabochon",
    cut: "Cabochon",
    treatment: "Natural",
    price: 6800,
    image: "/Star3.jpg",
    galleryViews: [
      { label: "Front", url: "/Star3.jpg" }
    ]
  },
  {
    id: 17,
    productKey: "ceylon-star-sapphire-2",
    certificateNumber: "CRG-1017",
    name: "Ceylon Star Sapphire II",
    category: "Star Sapphire",
    color: "Powder Blue",
    carat: 8.10,
    shape: "Cabochon",
    cut: "Cabochon",
    treatment: "Natural",
    price: 11200,
    image: "/star2.jpg",
    galleryViews: [
      { label: "Front", url: "/star2.jpg" }
    ]
  },

  // ── RUBY ──────────────────────────────────────────────────
  {
    id: 18,
    productKey: "ceylon-ruby-1",
    certificateNumber: "CRG-1018",
    name: "Ceylon Ruby I",
    category: "Ruby",
    color: "Vivid Red",
    carat: 3.10,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Heated",
    price: 14500,
    image: "/Ruby1.jpg",
    galleryViews: [
      { label: "Front", url: "/Ruby1.jpg" }
    ]
  },
  {
    id: 19,
    productKey: "ceylon-ruby-2",
    certificateNumber: "CRG-1019",
    name: "Ceylon Ruby II",
    category: "Ruby",
    color: "Pigeon Blood Red",
    carat: 2.45,
    shape: "Cushion",
    cut: "Mixed Cut",
    treatment: "Untreated",
    price: 18000,
    image: "/Ruby2.jpg",
    galleryViews: [
      { label: "Front", url: "/Ruby2.jpg" }
    ]
  },
  {
    id: 20,
    productKey: "ceylon-ruby-3",
    certificateNumber: "CRG-1020",
    name: "Ceylon Ruby III",
    category: "Ruby",
    color: "Deep Red",
    carat: 1.85,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Heated",
    price: 9200,
    image: "/Ruby3.jpg",
    galleryViews: [
      { label: "Front", url: "/Ruby3.jpg" }
    ]
  },

  // ── PADPARADSCHA SAPPHIRE ─────────────────────────────────
  {
    id: 21,
    productKey: "ceylon-padparadscha-3",
    certificateNumber: "CRG-1021",
    name: "Ceylon Padparadscha III",
    category: "Padparadscha Sapphire",
    color: "Salmon Pink Orange",
    carat: 2.60,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Untreated",
    price: 21500,
    image: "/Padparadscha3.jpeg",
    galleryViews: [
      { label: "Front", url: "/Padparadscha3.jpeg" }
    ]
  },
  {
    id: 22,
    productKey: "ceylon-padparadscha-2",
    certificateNumber: "CRG-1022",
    name: "Ceylon Padparadscha II",
    category: "Padparadscha Sapphire",
    color: "Pink Orange",
    carat: 3.40,
    shape: "Cushion",
    cut: "Mixed Cut",
    treatment: "Untreated",
    price: 27000,
    image: "/Padparadscha2.jpeg",
    galleryViews: [
      { label: "Front", url: "/Padparadscha2.jpeg" },
      { label: "Back", url: "/padparadscha2back.jpg" },
      { label: "Right", url: "/padparadscha2right.jpg" },
      { label: "Left", url: "/padparadscha2left.jpg" }
    ]
  },
  {
    id: 23,
    productKey: "ceylon-padparadscha-1",
    certificateNumber: "CRG-1023",
    name: "Ceylon Padparadscha I",
    category: "Padparadscha Sapphire",
    color: "Pure Padparadscha",
    carat: 4.05,
    shape: "Oval",
    cut: "Brilliant Cut",
    treatment: "Untreated",
    price: 34000,
    image: "/Padparadscha1.jpeg",
    galleryViews: [
      { label: "Front", url: "/Padparadscha1.jpeg" }
    ]
  },

  // ── GREEN GEMSTONE ────────────────────────────────────────
  {
    id: 24,
    productKey: "ceylon-green-gem-2",
    certificateNumber: "CRG-1024",
    name: "Ceylon Green Gem II",
    category: "Green Gemstone",
    color: "Vivid Green",
    carat: 2.90,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Natural",
    price: 19500,
    image: "/greengem2.jpg",
    galleryViews: [
      { label: "Front", url: "/greengem2.jpg" }
    ]
  },
  {
    id: 25,
    productKey: "ceylon-green-gem-1",
    certificateNumber: "CRG-1025",
    name: "Ceylon Green Gem I",
    category: "Green Gemstone",
    color: "Deep Green",
    carat: 3.55,
    shape: "Cushion",
    cut: "Mixed Cut",
    treatment: "Natural",
    price: 24000,
    image: "/greengem1.jpg",
    galleryViews: [
      { label: "Front", url: "/greengem1.jpg" },
      { label: "Back", url: "/greengem1back.jpg" },
      { label: "Right", url: "/greengem1right.jpg" },
      { label: "Left", url: "/greengem1left.jpg" }
    ]
  },
  {
    id: 26,
    productKey: "ceylon-green-gem-3",
    certificateNumber: "CRG-1026",
    name: "Ceylon Green Gem III",
    category: "Green Gemstone",
    color: "Forest Green",
    carat: 1.75,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Natural",
    price: 14800,
    image: "/greengem3.jpg",
    galleryViews: [
      { label: "Front", url: "/greengem3.jpg" }
    ]
  },

  // ── CAT'S EYE ─────────────────────────────────────────────
  {
    id: 27,
    productKey: "ceylon-cats-eye-3",
    certificateNumber: "CRG-1027",
    name: "Ceylon Cat's Eye III",
    category: "Cat's Eye",
    color: "Honey Golden",
    carat: 5.20,
    shape: "Oval",
    cut: "Cabochon",
    treatment: "Natural",
    price: 9800,
    image: "/Cat’sEye3.jpg",
    galleryViews: [
      { label: "Front", url: "/Cat’sEye3.jpg" }
    ]
  },
  {
    id: 28,
    productKey: "ceylon-cats-eye-2",
    certificateNumber: "CRG-1028",
    name: "Ceylon Cat's Eye II",
    category: "Cat's Eye",
    color: "Greenish Gold",
    carat: 3.80,
    shape: "Oval",
    cut: "Cabochon",
    treatment: "Natural",
    price: 7500,
    image: "/Cat’sEye2.jpg",
    galleryViews: [
      { label: "Front", url: "/Cat’sEye2.jpg" }
    ]
  },
  {
    id: 29,
    productKey: "ceylon-cats-eye-1",
    certificateNumber: "CRG-1029",
    name: "Ceylon Cat's Eye I",
    category: "Cat's Eye",
    color: "Chrysoberyl Golden",
    carat: 6.40,
    shape: "Oval",
    cut: "Cabochon",
    treatment: "Natural",
    price: 13500,
    image: "/Cat’sEye1.jpg",
    galleryViews: [
      { label: "Front", url: "/Cat’sEye1.jpg" }
    ]
  },

  // ── BLUE SAPPHIRE ─────────────────────────────────────────
  {
    id: 30,
    productKey: "ceylon-blue-gem-5",
    certificateNumber: "CRG-1030",
    name: "Ceylon Blue Sapphire V",
    category: "Blue Sapphire",
    color: "Royal Blue",
    carat: 4.85,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Heated",
    price: 13800,
    image: "/bluegem5.jpg",
    galleryViews: [
      { label: "Front", url: "/bluegem5.jpg" },
      { label: "Back", url: "/bluegem5back.jpg" },
      { label: "Right", url: "/bluegem5Right.jpg" },
      { label: "Left", url: "/bluegem5left.jpg" }
    ],
    videoUrl: "/bluegem5V.mp4"
  },

  // ── ALEXANDRITE ───────────────────────────────────────────
  {
    id: 31,
    productKey: "ceylon-alexandrite-5",
    certificateNumber: "CRG-1031",
    name: "Ceylon Alexandrite V",
    category: "Alexandrite",
    color: "Green / Purple",
    carat: 1.45,
    shape: "Oval",
    cut: "Mixed Cut",
    treatment: "Untreated",
    price: 19800,
    image: "/Alexandrite5.jpg",
    galleryViews: [
      { label: "Front", url: "/Alexandrite5.jpg" },
      { label: "Back", url: "/alexandrite5back.jpg" },
      { label: "Right", url: "/alexandrite5right.jpg" },
      { label: "Left", url: "/alexandrite5left.jpg" }
    ]
  },
  {
    id: 32,
    productKey: "ceylon-alexandrite-3",
    certificateNumber: "CRG-1032",
    name: "Ceylon Alexandrite III",
    category: "Alexandrite",
    color: "Teal / Violet",
    carat: 2.30,
    shape: "Cushion",
    cut: "Mixed Cut",
    treatment: "Untreated",
    price: 28500,
    image: "/Alexandrite3.jpg",
    galleryViews: [
      { label: "Front", url: "/Alexandrite3.jpg" }
    ]
  }
];

// eslint-disable-next-line react-refresh/only-export-components
export const categories = [
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
  const [currency] = useState(getCurrentCurrency);
  const [gemSubmissions] = useGemSubmissions();
  const shopProducts = useMemo(
    () => [
      ...products,
      ...gemSubmissions
        .filter((submission) => submission.status === "approved")
        .map((submission) => submission.gem)
    ],
    [gemSubmissions]
  );
  const shopMaxCaratValue = Math.max(
    maxCaratValue,
    ...shopProducts.map((product) => Number(product.carat) || 0)
  );
  const shopMaxPriceValue = Math.ceil(
    Math.max(maxPriceValue, ...shopProducts.map((product) => Number(product.price) || 0)) /
      5000
  ) * 5000;

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
    return "All Gemstones";
  });

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

  const [selectedTreatment, setSelectedTreatment] =
    useState("All Treatments");

  const [minPrice, setMinPrice] = useState(0);
  const [userMaxPrice, setUserMaxPrice] = useState(null);

  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [inventory] = useGemInventory(shopProducts);
  const [activeDrawer, setActiveDrawer] = useState(null);
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
          const found = categories.find(
            (c) => c.toLowerCase() === cat.toLowerCase().trim()
          );
          if (found) setSelectedCategory(found);
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
    const stockQuantity = inventory[productKey] ?? 0;
    if (stockQuantity < 1) return;

    setCart((current) => {
      const exists = current.some(
        (item) => getCollectionItemKey(item) === productKey
      );

      if (exists) return current;

      return [
        ...current,
        normalizeCollectionItem({ ...product, quantity: 1 })
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
    setSelectedCategory("All Gemstones");
    setSearchTerm("");
    setSelectedColor("All Colors");
    setMinCarat(0);
    setMaxCarat(shopMaxCaratValue);
    setSelectedShape("All Shapes");
    setSelectedCut("All Cuts");
    setSelectedTreatment("All Treatments");
    setMinPrice(0);
    setMaxPrice(shopMaxPriceValue);
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

        <MobileSiteMenu onInquire={() => setInquiryProduct(products[0])} />
        <div className="about-nav-links">
          <a href="/">Home</a>
          <a href="/gemstones" className="active">
            Shop
          </a>
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

              <div className="gem-product-grid">

                {filteredProducts.map((product) => {

                  const productKey = getCollectionItemKey(product);
                  const stockQuantity = inventory[productKey] ?? 0;
                  const inStock = stockQuantity > 0;
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

                        <div className="product-bottom">

                          <strong>
                            {formatCurrencyPrice(product.price, currency)}
                          </strong>

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
            <a href="/gemstones">Shop</a>
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