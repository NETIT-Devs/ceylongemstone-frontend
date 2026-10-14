import { useEffect, useState } from "react";
import ShopNavDropdown from "../components/ShopNavDropdown.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import {
  FaGem,
  FaShoppingBag,
  FaUsers,
  FaChartLine,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaShieldAlt,
  FaSignOutAlt,
  FaHeart,
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebookF,
  FaFileInvoice,
  FaCreditCard,
  FaStar,
  FaTimes,
  FaCopy,
  FaPrint,
  FaUser,
  FaExclamationTriangle,
  FaUpload
} from "react-icons/fa";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import CollectionDrawerPanel from "../components/CollectionDrawerPanel.jsx";
import SiteInquiryModal from "../components/SiteInquiryModal.jsx";
import { products } from "./Gemstones.jsx";
import { products as jewelleryProducts } from "./Juwellery.jsx";
import {
  getCollectionItemKey,
  useSharedCollection
} from "../useSharedCollection.js";
import {
  LOW_STOCK_THRESHOLD,
  useGemInventory
} from "../useGemInventory.js";
import { useGemProductOverrides } from "../useGemProductOverrides.js";
import { useGemSubmissions } from "../useGemSubmissions.js";
import { useJewelleryProductOverrides } from "../useJewelleryProductOverrides.js";
import { useJewellerySubmissions } from "../useJewellerySubmissions.js";
import { prepareProductImage } from "../imageUpload.js";
import { useHomeHeroSlides, useManagedBlogPosts } from "../useSiteContent.js";
import { useCustomerReviews } from "../useCustomerReviews.js";
import { TREATMENT_OPTIONS } from "../treatments.js";
import { formatProductOfferEndDate, withActiveProductOffer } from "../productOffers.js";
import {
  endAdminSession,
  hashAdminPassword,
  readAdminAccounts,
  readAdminSession,
  writeAdminAccounts
} from "../adminAccess.js";
import { API_BASE_URL, apiGet, apiPut, apiDelete, apiRequest, resolveMediaUrl } from "../services/api.js";
import "./AdminDashboard.css";
import "./About.css";
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";

const initialAdminOrders = [
  {
    id: "CRG-94821",
    customerName: "Lord Arthur Sterling",
    customerEmail: "arthur.sterling@londoncollectors.co.uk",
    date: "2026-09-28",
    status: "DISPATCHED",
    paymentStatus: "PAID ($12,500)",
    gemName: "ROYAL BLUE SAPPHIRE",
    carat: "4.52 Ct",
    certNo: "GIC-2026-8891",
    shippingAddress: "Mayfair, London, United Kingdom",
    tracking: "FEX-9920184712-LK"
  },
  {
    id: "CRG-88231",
    customerName: "Countess Elena Rostova",
    customerEmail: "elena.rostova@genevagems.ch",
    date: "2026-09-14",
    status: "DELIVERED",
    paymentStatus: "PAID ($18,900)",
    gemName: "CEYLON PADPARADSCHA SAPPHIRE",
    carat: "3.18 Ct",
    certNo: "GRS-2026-7734",
    shippingAddress: "Rue du Rhône, Geneva, Switzerland",
    tracking: "FEX-8817290123-LK"
  },
  {
    id: "CRG-77102",
    customerName: "Sheikh Al-Mansoor",
    customerEmail: "almansoor@dubairoyal.ae",
    date: "2026-09-30",
    status: "PROCESSING",
    paymentStatus: "PENDING ($22,000)",
    gemName: "CEYLON GREEN GEMSTONE",
    carat: "2.05 Ct",
    certNo: "GIC-2026-9011",
    shippingAddress: "Downtown Dubai, UAE",
    tracking: "Pending Vault Vaulting"
  }
];

const initialAdminPayments = [
  {
    id: "PAY-2026-1042",
    orderId: "CRG-94821",
    customerName: "Lord Arthur Sterling",
    date: "2026-09-28",
    method: "Visa ending 2048",
    amount: 12500,
    status: "SETTLED"
  },
  {
    id: "PAY-2026-1038",
    orderId: "CRG-88231",
    customerName: "Countess Elena Rostova",
    date: "2026-09-14",
    method: "International wire",
    amount: 18900,
    status: "SETTLED"
  },
  {
    id: "PAY-2026-1047",
    orderId: "CRG-77102",
    customerName: "Sheikh Al-Mansoor",
    date: "2026-09-30",
    method: "Bank transfer",
    amount: 22000,
    status: "PENDING"
  }
];

const readGemApiResponse = async (response, fallbackMessage) => {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(fallbackMessage);
  }

  if (!response.ok || data.success !== true) {
    throw new Error(data.message || `${fallbackMessage} (HTTP ${response.status})`);
  }

  return data;
};

const isGemstoneActive = (status) =>
  status === true || Number(status) === 1;

const AdminDashboard = ({ isSuperAdmin = false }) => {
  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("ORDERS");
  const [adminOrders, setAdminOrders] = useState(initialAdminOrders);
  const [backendGems, setBackendGems] = useState([]);
  const [backendCategories, setBackendCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [gemCategoryFilter, setGemCategoryFilter] = useState("all");
  const filteredBackendGems = backendGems.filter((gem) =>
    gemCategoryFilter === "all" || String(gem.category_id) === gemCategoryFilter
  );
  const [gemsLoading, setGemsLoading] = useState(false);
  const [gemstonesError, setGemstonesError] = useState("");
  const [certificatesByGemstone, setCertificatesByGemstone] = useState({});
  const [certificatesLoaded, setCertificatesLoaded] = useState(false);
  const [certificatesError, setCertificatesError] = useState("");
  const [gemSubmissions, setGemSubmissions] = useGemSubmissions();
  const [gemProductOverrides, setGemProductOverrides] = useGemProductOverrides();
  const [jewellerySubmissions, setJewellerySubmissions] = useJewellerySubmissions();
  const [jewelleryProductOverrides, setJewelleryProductOverrides] =
    useJewelleryProductOverrides();
  const [deletedGemIds, setDeletedGemIds] = useState([]);
  const gemsList = [
    ...products.map((gem) => ({
      ...gem,
      ...gemProductOverrides[String(gem.id)]
    })),
    ...backendGems
      .filter((gem) => Number(gem.status) !== 0)
      .map((gem) => ({
        ...gem,
        id: Number(gem.id),
        inventoryId: Number(gem.id),
        productKey: `inventory-gemstone-${gem.id}`,
        category: gem.category_name || "Gemstone",
        basePriceUSD: Number(gem.price),
        image: resolveMediaUrl(gem.main_image || gem.image),
        discountRate: gem.discountRate ?? gem.offer_rate,
        offerStartDate: gem.offerStartDate ?? gem.offer_start_date,
        offerEndDate: gem.offerEndDate ?? gem.offer_end_date,
      })),
    ...gemSubmissions.map((submission) => submission.gem)
  ].filter((gem) => gem.inventoryId || !deletedGemIds.includes(gem.id));
  const jewelleryList = [
    ...jewelleryProducts
      .map((item) => ({
        ...item,
        ...jewelleryProductOverrides[String(item.id)]
      }))
      .filter((item) => !item.deleted),
    ...jewellerySubmissions.map((submission) => submission.jewellery)
  ];
  const [inventory, setInventory] = useGemInventory(products);
  const [stockAdditions, setStockAdditions] = useState({});
  const [payments, setPayments] = useState(initialAdminPayments);
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [customerReviews, setCustomerReviews] = useCustomerReviews();
  const [adminAccounts, setAdminAccounts] = useState(readAdminAccounts);
  const [newAdminAccount, setNewAdminAccount] = useState({
    name: "",
    email: "",
    department: "Operations",
    phone: "",
    role: "admin",
    password: ""
  });
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [selectedAdminAccount, setSelectedAdminAccount] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [trackingCopied, setTrackingCopied] = useState(false);
  const [dialogState, setDialogState] = useState(null);

  const showCustomAlert = (message, title = "Ceylon Royal Gemstones", icon = "info") => {
    setDialogState({
      isOpen: true,
      title,
      message,
      type: "alert",
      icon
    });
  };

  const showCustomConfirm = (message, onConfirm, title = "Confirm Action", icon = "danger") => {
    setDialogState({
      isOpen: true,
      title,
      message,
      type: "confirm",
      icon,
      onConfirm: () => {
        setDialogState(null);
        onConfirm();
      }
    });
  };

  // New Gem Form State
  const [newGem, setNewGem] = useState({
    name: "",
    category_id: "",
    color: "",
    carat: "",
    length: "",
    width: "",
    height: "",
    clarity: "",
    cut: "",
    shape: "",
    origin: "Ratnapura, Sri Lanka",
    price: "",
    stock: "1",
    treatment_status: "Unheated",
    description: "",
    status: "available",
    tag: "CERTIFIED NATURAL",
    image: "/blueGem.jpg",
    galleryViews: [],
    videoUrl: "",
    discountRate: "",
    discountLabel: "",
    offerStartDate: "",
    offerEndDate: ""
  });
  const [editingGemId, setEditingGemId] = useState(null);
  const [newJewellery, setNewJewellery] = useState({
    name: "",
    category: "Necklaces",
    color: "",
    shape: "",
    price: "",
    image: "",
    discountRate: "",
    offerStartDate: "",
    offerEndDate: ""
  });
  const [editGem, setEditGem] = useState(null); // gem being edited
  const [gemSaving, setGemSaving] = useState(false);
  const [editCertificate, setEditCertificate] = useState(null);
  const [certificateSaving, setCertificateSaving] = useState(false);
  const [certificateDeleting, setCertificateDeleting] = useState(null);

  // helper – re-fetch gems list
  const refreshGems = async () => {
    setGemsLoading(true);
    setGemstonesError("");
    try {
      const response = await apiGet("/api/gemstones");
      const data = await readGemApiResponse(response, "Unable to load gemstones.");
      if (!Array.isArray(data.data)) {
        throw new Error("The gemstone service returned an invalid inventory.");
      }
      setBackendGems(data.data);
      return true;
    } catch (error) {
      setGemstonesError(error instanceof Error ? error.message : "Unable to load gemstones.");
      return false;
    } finally {
      setGemsLoading(false);
    }
  };

  const refreshCategories = async () => {
    setCategoriesError("");
    try {
      const response = await apiGet("/api/categories");
      const data = await readGemApiResponse(response, "Unable to load gemstone categories.");
      if (!Array.isArray(data.data)) {
        throw new Error("The category service returned invalid category data.");
      }
      setBackendCategories(data.data);
      return true;
    } catch (error) {
      setCategoriesError(error instanceof Error ? error.message : "Unable to load gemstone categories.");
      return false;
    }
  };

  const refreshLowStock = async () => {
    const response = await apiGet("/api/gemstones/low-stock");
    const data = await readGemApiResponse(response, "Unable to load low-stock gemstones.");
    if (!Array.isArray(data.data)) {
      throw new Error("The gemstone service returned invalid low-stock data.");
    }
    return true;
  };

  const refreshCertificates = async () => {
    setCertificatesError("");
    try {
      const response = await apiGet("/api/certificates");
      const data = await readGemApiResponse(response, "Unable to load gemstone certificates.");
      if (!Array.isArray(data.data)) {
        throw new Error("The certificate service returned invalid certificate data.");
      }
      const certificates = {};
      data.data.forEach((certificate) => {
        if (certificate.gemstone_id == null) return;
        const gemstoneId = String(certificate.gemstone_id);
        if (!certificates[gemstoneId]) {
          certificates[gemstoneId] = certificate;
        }
      });
      setCertificatesByGemstone(certificates);
      setCertificatesLoaded(true);
      return true;
    } catch (error) {
      setCertificatesError(error instanceof Error ? error.message : "Unable to load gemstone certificates.");
      return false;
    }
  };

  useEffect(() => {
    Promise.resolve().then(() =>
      Promise.all([refreshGems(), refreshCategories(), refreshCertificates()])
    );
  }, []);

  const [editingJewelleryId, setEditingJewelleryId] = useState(null);
  const [managedHeroSlides, setManagedHeroSlides] = useHomeHeroSlides();
  const [managedBlogPosts, setManagedBlogPosts] = useManagedBlogPosts();
  const [newHeroSlide, setNewHeroSlide] = useState({ alt: "", image: "" });
  const [newBlogPost, setNewBlogPost] = useState({
    title: "",
    category: "Gemstone Guide",
    excerpt: "",
    content: "",
    image: ""
  });

  const handleProductImageSelection = async (event, setForm) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const image = await prepareProductImage(file);
      setForm((current) => ({ ...current, image }));
    } catch (error) {
      showCustomAlert(
        error instanceof Error ? error.message : "The selected image could not be processed.",
        "Image Upload Error",
        "warning"
      );
    } finally {
      input.value = "";
    }
  };

  const handleAddHeroSlide = (event) => {
    event.preventDefault();
    if (!newHeroSlide.alt.trim() || !newHeroSlide.image) {
      showCustomAlert("Add a slide title and choose an image.", "Complete the Hero Slide", "warning");
      return;
    }

    const slide = {
      id: `admin-hero-${Date.now()}`,
      alt: newHeroSlide.alt.trim(),
      image: newHeroSlide.image
    };
    setManagedHeroSlides((current) => [...current, slide]);
    setNewHeroSlide({ alt: "", image: "" });
    showCustomAlert("The new homepage hero slide has been published.", "Hero Slide Published", "success");
  };

  const handleAddBlogPost = (event) => {
    event.preventDefault();
    const paragraphs = newBlogPost.content
      .split(/\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    if (!newBlogPost.title.trim() || !newBlogPost.excerpt.trim() ||
      paragraphs.length === 0 || !newBlogPost.image) {
      showCustomAlert(
        "Complete the title, summary, article text, and image before publishing.",
        "Complete the Blog Post",
        "warning"
      );
      return;
    }

    const post = {
      id: `admin-blog-${Date.now()}`,
      title: newBlogPost.title.trim(),
      category: newBlogPost.category,
      date: new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      readTime: `${Math.max(1, Math.ceil(paragraphs.join(" ").split(/\s+/).length / 200))} min read`,
      image: newBlogPost.image,
      excerpt: newBlogPost.excerpt.trim(),
      content: paragraphs
    };
    setManagedBlogPosts((current) => [post, ...current]);
    setNewBlogPost({
      title: "",
      category: "Gemstone Guide",
      excerpt: "",
      content: "",
      image: ""
    });
    showCustomAlert("The article has been published on the Blog page.", "Blog Post Published", "success");
  };

  const handleRemoveSiteContent = (kind, id) => {
    const isHeroSlide = kind === "hero slide";
    showCustomConfirm(
      `Remove this ${kind} from the website?`,
      () => {
        if (isHeroSlide) {
          setManagedHeroSlides((current) => current.filter((item) => item.id !== id));
        } else {
          setManagedBlogPosts((current) => current.filter((item) => item.id !== id));
        }
      },
      `Remove ${isHeroSlide ? "Hero Slide" : "Blog Post"}`,
      "danger"
    );
  };

  const handleStatusChange = (orderId, newStatus) => {
    setAdminOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handlePaymentStatusChange = (paymentId, newStatus) => {
    const payment = payments.find((item) => item.id === paymentId);
    if (!payment) return;

    setPayments((prev) =>
      prev.map((item) => item.id === paymentId ? { ...item, status: newStatus } : item)
    );
    setAdminOrders((prev) =>
      prev.map((order) => order.id === payment.orderId
        ? { ...order, paymentStatus: `${newStatus === "SETTLED" ? "PAID" : newStatus} ($${payment.amount.toLocaleString()})` }
        : order
      )
    );
  };

  const handleAddAdminAccount = async (event) => {
    event.preventDefault();
    if (!isSuperAdmin) {
      showCustomAlert("Only Super Administrators can create admin accounts.", "Access Restricted", "warning");
      return;
    }
    const email = newAdminAccount.email.trim().toLowerCase();
    if (adminAccounts.some((account) => account.email.toLowerCase() === email)) {
      showCustomAlert("An administrative account with this email address already exists.", "Validation Error", "warning");
      return;
    }
    if (newAdminAccount.password.length < 6) {
      showCustomAlert("Please use a secure password with at least 6 characters.", "Password Too Short", "warning");
      return;
    }

    const account = {
      id: `admin-${window.crypto.randomUUID()}`,
      name: newAdminAccount.name.trim(),
      email,
      department: newAdminAccount.department || "Operations",
      phone: newAdminAccount.phone.trim(),
      role: newAdminAccount.role || "admin",
      status: "active",
      passwordHash: await hashAdminPassword(newAdminAccount.password),
      createdAt: new Date().toISOString()
    };
    const updatedAccounts = [...adminAccounts, account];
    writeAdminAccounts(updatedAccounts);
    setAdminAccounts(updatedAccounts);
    setNewAdminAccount({ name: "", email: "", department: "Operations", phone: "", role: "admin", password: "" });
    setIsAdminFormOpen(false);
    showCustomAlert(`Administrator account for ${account.name} has been successfully created.`, "Account Created", "success");
  };

  const handleAdminAccountStatus = (accountId, status) => {
    if (!isSuperAdmin) {
      showCustomAlert("Only Super Administrators can modify admin accounts.", "Access Restricted", "warning");
      return;
    }
    if (accountId === currentAdmin?.accountId) {
      showCustomAlert("You cannot suspend your own active administrative session.", "Action Denied", "warning");
      return;
    }
    const updatedAccounts = adminAccounts.map((account) =>
      account.id === accountId ? { ...account, status } : account
    );
    writeAdminAccounts(updatedAccounts);
    setAdminAccounts(updatedAccounts);
  };

  const handleDeleteAdminAccount = (account) => {
    if (!isSuperAdmin) {
      showCustomAlert("Only Super Administrators can remove admin accounts.", "Access Restricted", "warning");
      return;
    }
    if (account.id === currentAdmin?.accountId) {
      showCustomAlert("You cannot remove your own active administrative account.", "Action Denied", "warning");
      return;
    }
    showCustomConfirm(
      `Are you sure you want to revoke and permanently remove the admin account for ${account.name} (${account.email})? This action cannot be undone.`,
      () => {
        const updatedAccounts = adminAccounts.filter((item) => item.id !== account.id);
        writeAdminAccounts(updatedAccounts);
        setAdminAccounts(updatedAccounts);
        if (selectedAdminAccount?.id === account.id) {
          setSelectedAdminAccount(null);
        }
      },
      "Remove Admin Account",
      "danger"
    );
  };

  const handleDeleteReview = (review) => {
    showCustomConfirm(
      `Are you sure you want to delete the published review submitted by ${review.name}?`,
      () => {
        setCustomerReviews((prev) => prev.filter((item) => item.id !== review.id));
      },
      "Delete Customer Review",
      "danger"
    );
  };

  const resetGemForm = () => {
    setNewGem({
      name: "",
      carat: "",
      origin: "Ratnapura, Sri Lanka",
      price: "",
      tag: "CERTIFIED NATURAL",
      image: "/blueGem.jpg",
      galleryViews: [],
      videoUrl: "",
      discountRate: "",
      discountLabel: "",
      offerStartDate: "",
      offerEndDate: ""
    });
    setEditingGemId(null);
  };

  const handleEditGem = (gem) => {
    setEditingGemId(gem.id);
    setNewGem({
      name: gem.name,
      carat: gem.carat ? String(gem.carat) : "",
      origin: gem.origin || "Ratnapura, Sri Lanka",
      price: String(gem.basePriceUSD ?? gem.price ?? ""),
      tag: gem.tag || "CERTIFIED NATURAL",
      image: gem.image || "/blueGem.jpg",
      galleryViews: Array.isArray(gem.galleryViews) ? gem.galleryViews : [],
      videoUrl: gem.videoUrl || "",
      discountRate: gem.discountRate != null ? String(gem.discountRate) : "",
      discountLabel: gem.discountLabel || "",
      offerStartDate: gem.offerStartDate || "",
      offerEndDate: gem.offerEndDate || ""
    });
    setActiveTab("GEMS");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddGem = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!newGem.name.trim() || !newGem.category_id) {
      showCustomAlert("Gemstone name and category are required.", "Validation Error", "warning");
      return;
    }
    const numericValues = [
      newGem.carat,
      newGem.length,
      newGem.width,
      newGem.height,
      newGem.price,
      newGem.stock
    ].filter((value) => value !== "" && value != null);
    if (
      !newGem.price ||
      Number(newGem.price) <= 0 ||
      numericValues.some((value) => !Number.isFinite(Number(value)) || Number(value) < 0) ||
      !Number.isInteger(Number(newGem.stock || 0))
    ) {
      showCustomAlert(
        "Enter a valid non-negative price, carat, dimensions, and whole-number stock quantity.",
        "Invalid Gemstone Details",
        "warning"
      );
      return;
    }
    if (newGem.discountRate && (!newGem.offerStartDate || !newGem.offerEndDate)) {
      showCustomAlert("Choose both offer start and end dates.", "Offer Dates Required", "warning");
      return;
    }
    if (
      newGem.discountRate &&
      (
        !Number.isFinite(Number(newGem.discountRate)) ||
        Number(newGem.discountRate) < 1 ||
        Number(newGem.discountRate) > 100
      )
    ) {
      showCustomAlert("Offer rate must be between 1 and 100.", "Invalid Offer Rate", "warning");
      return;
    }
    if (
      newGem.discountRate &&
      newGem.offerStartDate > newGem.offerEndDate
    ) {
      showCustomAlert("Offer end date must be on or after the start date.", "Invalid Offer Dates", "warning");
      return;
    }
    setGemSaving(true);
    try {
      const payload = {
        name: newGem.name.trim().toUpperCase(),
        category_id: Number(newGem.category_id),
        color: newGem.color || null,
        carat: newGem.carat ? Number(newGem.carat) : null,
        length: newGem.length ? Number(newGem.length) : null,
        width: newGem.width ? Number(newGem.width) : null,
        height: newGem.height ? Number(newGem.height) : null,
        clarity: newGem.clarity || null,
        cut: newGem.cut || null,
        shape: newGem.shape || null,
        origin: newGem.origin || null,
        treatment_status: newGem.treatment_status || null,
        price: Number(newGem.price),
        stock: Number(newGem.stock || 1),
        description: newGem.description || null,
        status: newGem.status || "available",
        offer_rate: newGem.discountRate ? Number(newGem.discountRate) : null,
        offer_start_date: newGem.offerStartDate || null,
        offer_end_date: newGem.offerEndDate || null
      };
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value == null ? "" : String(value));
      });
      [
        "mainImage",
        "backViewImage",
        "rightViewImage",
        "leftViewImage",
        "additional_view_1",
        "additional_view_2",
        "videoClip"
      ]
        .forEach((fieldName) => {
          const file = form.elements.namedItem(fieldName)?.files?.[0];
          if (file) formData.append(fieldName, file);
        });

      const res = await apiRequest("/api/gemstones", {
        method: "POST",
        body: formData,
      });
      await readGemApiResponse(res, "Failed to add gemstone.");
      showCustomAlert(`Gemstone "${payload.name}" added successfully!`, "Gemstone Added", "success");
      form.reset();
      setNewGem({
        name: "",
        category_id: "",
        color: "",
        carat: "",
        length: "",
        width: "",
        height: "",
        origin: "Ratnapura, Sri Lanka",
        price: "",
        stock: "1",
        clarity: "",
        cut: "",
        shape: "",
        treatment_status: "Unheated",
        description: "",
        status: "available",
        tag: "CERTIFIED NATURAL",
        image: "/blueGem.jpg",
        galleryViews: [],
        videoUrl: "",
        discountRate: "",
        discountLabel: "",
        offerStartDate: "",
        offerEndDate: ""
      });
      await refreshGems();
    } catch (error) {
      showCustomAlert(error.message || "Failed to add gemstone.", "Error", "danger");
    } finally {
      setGemSaving(false);
    }
  };

  const handleEditGemSave = async (e) => {
    e.preventDefault();
    if (!editGem) return;
    if (!editGem.name.trim() || !editGem.category_id) {
      showCustomAlert("Gemstone name and category are required.", "Validation Error", "warning");
      return;
    }
    if (!hasValidGemNumbers(editGem)) {
      return;
    }

    const normalizedPrice = Number(newGem.price);
    const normalizedDiscountRate = Number(newGem.discountRate);
    if (
      !Number.isFinite(normalizedPrice) ||
      normalizedPrice <= 0 ||
      (newGem.discountRate &&
        (!Number.isFinite(normalizedDiscountRate) ||
          normalizedDiscountRate < 1 ||
          normalizedDiscountRate > 100))
    ) {
      showCustomAlert("Enter a valid price and an offer rate between 1 and 100.", "Invalid Gemstone Details", "warning");
      return;
    }

    const gemId = editingGemId ?? Date.now();
    const existingProduct = products.find((gem) => gem.id === editingGemId);
    const existingSubmission = gemSubmissions.find(
      (submission) => submission.gem.id === editingGemId
    );
    const createdGem = {
      id: gemId,
      detailId: gemId,
      productKey: `${newGem.name.toLowerCase().replace(/\s+/g, "-")}-${gemId}`,
      name: newGem.name.toUpperCase(),
      category: existingProduct?.category ?? existingSubmission?.gem.category ?? "Other Gemstone",
      origin: newGem.origin,
      carat: newGem.carat ? Number.parseFloat(newGem.carat) : 3,
      basePriceUSD: normalizedPrice,
      price: normalizedPrice,
      image: newGem.image || "/blueGem.jpg",
      galleryViews: newGem.galleryViews.filter((view) => view.url),
      videoUrl: newGem.videoUrl || "",
      tag: newGem.tag || "CERTIFIED NATURAL",
      discountRate: newGem.discountRate ? normalizedDiscountRate : null,
      discountLabel: newGem.discountLabel.trim(),
      offerStartDate: newGem.discountRate ? newGem.offerStartDate : "",
      offerEndDate: newGem.discountRate ? newGem.offerEndDate : ""
    };

    if (editingGemId) {
      setGemSubmissions((current) =>
        current.map((submission) =>
          submission.gem.id === editingGemId
            ? { ...submission, gem: createdGem }
            : submission
        )
      );
      if (existingProduct) {
        Object.assign(existingProduct, createdGem);
        setGemProductOverrides((current) => ({
          ...current,
          [String(editingGemId)]: createdGem
        }));
      }
      showCustomAlert(`"${createdGem.name}" has been updated successfully.`, "Gemstone Updated", "success");
    } else {
      setGemSubmissions((current) => [
        ...current,
        {
          id: gemId,
          gem: createdGem,
          status: "pending",
          submittedAt: new Date().toISOString()
        }
      ]);
      showCustomAlert(
        `"${createdGem.name}" has been submitted for Super Admin approval.`,
        "Gemstone Submitted",
        "success"
      );
    }

    setInventory((current) => ({
      ...current,
      [getCollectionItemKey(createdGem)]: current[getCollectionItemKey(createdGem)] ?? 1
    }));
    resetGemForm();
  };

  const handleGemApproval = (submissionId, status) => {
    setGemSubmissions((current) =>
      current.map((submission) =>
        submission.id === submissionId
          ? { ...submission, status, reviewedAt: new Date().toISOString() }
          : submission
      )
    );
  };

  const resetJewelleryForm = () => {
    setNewJewellery({
      name: "",
      category: "Necklaces",
      color: "",
      shape: "",
      price: "",
      image: "",
      discountRate: "",
      offerStartDate: "",
      offerEndDate: ""
    });
    setEditingJewelleryId(null);
  };

  const handleEditJewellery = (item) => {
    setEditingJewelleryId(item.id);
    setNewJewellery({
      name: item.name || "",
      category: item.category || "Necklaces",
      color: item.color || "",
      shape: item.shape || "",
      price: String(item.basePriceUSD ?? item.price ?? ""),
      image: item.image || "",
      discountRate: item.discountRate != null ? String(item.discountRate) : "",
      offerStartDate: item.offerStartDate || "",
      offerEndDate: item.offerEndDate || ""
    });
    setActiveTab("JEWELLERY");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveJewellery = (event) => {
    event.preventDefault();
    if (!newJewellery.name.trim() || !newJewellery.price) return;
    if (!newJewellery.image) {
      showCustomAlert("Choose an image for this jewellery item.", "Image Required", "warning");
      return;
    }
    if (newJewellery.discountRate && (!newJewellery.offerStartDate || !newJewellery.offerEndDate)) {
      showCustomAlert("Choose both offer start and end dates.", "Offer Dates Required", "warning");
      return;
    }
    if (
      newJewellery.discountRate &&
      newJewellery.offerStartDate > newJewellery.offerEndDate
    ) {
      showCustomAlert("Offer end date must be on or after the start date.", "Invalid Offer Dates", "warning");
      return;
    }

    const normalizedPrice = Number(newJewellery.price);
    const normalizedRate = Number(newJewellery.discountRate);
    if (
      !Number.isFinite(normalizedPrice) ||
      normalizedPrice <= 0 ||
      (newJewellery.discountRate &&
        (!Number.isFinite(normalizedRate) || normalizedRate < 1 || normalizedRate > 100))
    ) {
      showCustomAlert("Enter a valid price and an offer rate between 1 and 100.", "Invalid Jewellery Details", "warning");
      return;
    }

    const existingBaseProduct = jewelleryProducts.find(
      (item) => item.id === editingJewelleryId
    );
    const existingSubmission = jewellerySubmissions.find(
      (submission) => submission.jewellery.id === editingJewelleryId
    );
    const itemId = editingJewelleryId ?? Date.now();
    const savedItem = {
      id: itemId,
      productKey:
        existingBaseProduct?.productKey ||
        existingSubmission?.jewellery.productKey ||
        `${newJewellery.name.trim().toLowerCase().replace(/\s+/g, "-")}-${itemId}`,
      name: newJewellery.name.trim(),
      category: newJewellery.category,
      color: newJewellery.color.trim(),
      shape: newJewellery.shape.trim() || `${newJewellery.category.slice(0, -1)} style`,
      cut: "Handcrafted",
      treatment: "Handcrafted",
      price: normalizedPrice,
      basePriceUSD: normalizedPrice,
      image: newJewellery.image.trim(),
      discountRate: newJewellery.discountRate ? normalizedRate : null,
      discountLabel: "",
      offerStartDate: newJewellery.discountRate ? newJewellery.offerStartDate : "",
      offerEndDate: newJewellery.discountRate ? newJewellery.offerEndDate : ""
    };

    if (editingJewelleryId !== null) {
      if (existingSubmission) {
        setJewellerySubmissions((current) =>
          current.map((submission) =>
            submission.id === existingSubmission.id
              ? { ...submission, jewellery: savedItem }
              : submission
          )
        );
      } else {
        setJewelleryProductOverrides((current) => ({
          ...current,
          [String(itemId)]: savedItem
        }));
      }
      showCustomAlert(`"${savedItem.name}" has been updated successfully.`, "Jewellery Updated", "success");
    } else {
      setJewellerySubmissions((current) => [
        ...current,
        {
          id: itemId,
          jewellery: savedItem,
          status: "pending",
          submittedAt: new Date().toISOString()
        }
      ]);
      showCustomAlert(
        `"${savedItem.name}" has been submitted for Super Admin approval.`,
        "Jewellery Submitted",
        "success"
      );
    }
    resetJewelleryForm();
  };

  const handleJewelleryApproval = (submissionId, status) => {
    setJewellerySubmissions((current) =>
      current.map((submission) =>
        submission.id === submissionId
          ? { ...submission, status, reviewedAt: new Date().toISOString() }
          : submission
      )
    );
  };

  const handleDeleteCertificate = (certificate, gemstoneName) => {
    showCustomConfirm(
      `Permanently delete the certificate for "${gemstoneName}"? This will also remove its uploaded file when it is stored on this server.`,
      async () => {
        setCertificateDeleting(certificate.id);
        try {
          const response = await apiDelete(`/api/certificates/${certificate.id}`);
          await readGemApiResponse(response, "Failed to delete gemstone certificate.");
          setCertificatesByGemstone((previous) => {
            const gemstoneId = String(certificate.gemstone_id);
            if (previous[gemstoneId]?.id !== certificate.id) {
              return previous;
            }
            const updated = { ...previous };
            delete updated[gemstoneId];
            return updated;
          });
          showCustomAlert("Certificate removed successfully.", "Certificate Deleted", "success");
        } catch (error) {
          showCustomAlert(error.message || "Failed to delete gemstone certificate.", "Error", "danger");
        } finally {
          setCertificateDeleting(null);
        }
      },
      "Delete Certificate",
      "danger"
    );
  };

  const handleDeleteJewellery = (itemId) => {
    showCustomConfirm(
      "Remove this jewellery item from the active shop collection?",
      () => {
        const isBaseProduct = jewelleryProducts.some((item) => item.id === itemId);
        if (isBaseProduct) {
          setJewelleryProductOverrides((current) => ({
            ...current,
            [String(itemId)]: {
              ...current[String(itemId)],
              deleted: true
            }
          }));
        } else {
          setJewellerySubmissions((current) =>
            current.filter((submission) => submission.jewellery.id !== itemId)
          );
        }
      },
      "Remove Jewellery",
      "danger"
    );
  };

  const handleRestockGem = (productKey) => {
    const quantity = Number(stockAdditions[productKey]);
    if (!Number.isSafeInteger(quantity) || quantity < 1) return;

    setInventory((current) => ({
      ...current,
      [productKey]: (current[productKey] ?? 0) + quantity
    }));
    setStockAdditions((current) => ({ ...current, [productKey]: 1 }));
  };

  const handleDeleteGem = (gemId) => {
    showCustomConfirm(
      "Are you sure you want to remove this certified gemstone from active inventory?",
      () => {
        setDeletedGemIds((current) => [...current, gemId]);
        setGemSubmissions((current) =>
          current.filter((submission) => submission.gem.id !== gemId)
        );
      },
      "Remove Gemstone",
      "danger"
    );
  };

  const handleAdminLogout = () => {
    endAdminSession();
    window.location.href = "/";
  };

  const wishlistCount = wishlist.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const settledRevenue = payments
    .filter((payment) => payment.status === "SETTLED")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = payments.filter((payment) => payment.status === "PENDING");
  const filteredPayments = payments.filter((payment) =>
    paymentFilter === "ALL" || payment.status === paymentFilter
  );
  const lowStockCount = gemsList.filter((gem) =>
    (inventory[getCollectionItemKey(gem)] ?? 0) <= LOW_STOCK_THRESHOLD
  ).length;
  const pendingGemApprovals = gemSubmissions.filter(
    (submission) => submission.status === "pending"
  );
  const pendingJewelleryApprovals = jewellerySubmissions.filter(
    (submission) => submission.status === "pending"
  );
  const currentAdmin = readAdminSession() || (isSuperAdmin ? {
    accountId: "admin-super-root",
    name: "Super Administrator",
    email: "superadmin@ceylonroyalgemstones.com",
    role: "super-admin"
  } : {
    accountId: "admin-operations-01",
    name: "Operations Admin",
    email: "admin@ceylonroyalgemstones.com",
    role: "admin"
  });

  return (
    <div className={`admin-page${isSuperAdmin ? " super-admin-page" : ""}`}>
      {/* NAVBAR */}
      <nav className="about-navbar admin-navbar">
        <a href="/" className="about-navbar-logo">
          <BrandLogo
            alt="Ceylon Royal Gemstones"
            className="navbar-logo-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://cdn-icons-png.flaticon.com/512/3063/3063822.png";
            }}
          />
          <div className="about-logo-text">
            <span>CEYLON</span>
            <small>ROYAL GEMSTONES</small>
          </div>
        </a>

        <MobileSiteMenu />
        <div className="about-nav-links">
          <a href="/">Home</a>
          <ShopNavDropdown />
          <a href="/About">Our Story</a>
          <a href="/trust">Certification</a>
          <a href="/reviews">Reviews</a>
          <a href="/contact">Contact</a>
          <a href="/blog">Blog</a>
          {isSuperAdmin && <a href="/admin">Admin Portal</a>}
          <InternationalNavEntry />
        </div>

        <div className="about-nav-actions">
          <InternationalNavEntry mobile />
          <button
            type="button"
            className="about-nav-icon"
            title="Wishlist"
            onClick={() => setActiveDrawer("wishlist")}
          >
            <FaHeart />
            {wishlistCount > 0 && <span className="about-badge">{wishlistCount}</span>}
          </button>
          <button
            type="button"
            className="about-nav-icon"
            title="Shopping Cart"
            onClick={() => setActiveDrawer("cart")}
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

      {/* ADMIN BODY */}
      <main className="admin-main">
        <div className="admin-container">
          {/* HEADER METRICS BANNER */}
          <section className="admin-hero-banner">
            <div className="admin-banner-text">
              <span className="admin-badge-tag">{isSuperAdmin ? "SUPER ADMIN CONTROL DESK" : "ADMIN MANAGEMENT PORTAL"}</span>
              <h1>{isSuperAdmin ? "Ceylon Royal Gemstones Operations" : "Ceylon Royal Gemstones Admin"}</h1>
              <p>{isSuperAdmin
                ? "Oversee orders, payments, inventory, fulfilment, and daily operations from one workspace."
                : "Manage customer orders, shipment tracking, and gemstone inventory."}</p>
            </div>
            <div className="admin-banner-actions">
              {isSuperAdmin && (
                <>
                  <button
                    type="button"
                    className="admin-banner-btn gold"
                    onClick={() => {
                      setActiveTab("ACCOUNTS");
                      setIsAdminFormOpen(true);
                    }}
                  >
                    <FaPlus /> Add Admin
                  </button>
                  <button
                    type="button"
                    className="admin-banner-btn outline"
                    onClick={() => setActiveTab("ACCOUNTS")}
                  >
                    <FaUsers /> View Admins ({adminAccounts.length})
                  </button>
                </>
              )}
              <button type="button" className="admin-logout-btn" onClick={handleAdminLogout}>
                <FaSignOutAlt /> Sign Out {isSuperAdmin ? "Super Admin" : "Admin"}
              </button>
            </div>
          </section>

          {/* STATS OVERVIEW CARDS */}
          <div className={`admin-stats-grid ${isSuperAdmin ? "admin-stats-5cols" : ""}`}>
            <div className="admin-stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("ORDERS")}>
              <div className="stat-icon gold"><FaShoppingBag /></div>
              <div>
                <span>Total Orders</span>
                <strong>{adminOrders.length} Orders</strong>
              </div>
            </div>
            <div className="admin-stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("GEMS")}>
              <div className="stat-icon green"><FaGem /></div>
              <div>
                <span>Active Inventory</span>
                <strong>{gemsList.length} Gemstones</strong>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon blue"><FaTruck /></div>
              <div>
                <span>Shipments in Transit</span>
                <strong>{adminOrders.filter(o => o.status === "DISPATCHED").length} Dispatched</strong>
              </div>
            </div>
            {isSuperAdmin ? (
              <div className="admin-stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("PAYMENTS")}>
                <div className="stat-icon amber"><FaChartLine /></div>
                <div>
                  <span>Settled Revenue</span>
                  <strong>${settledRevenue.toLocaleString()} USD</strong>
                </div>
              </div>
            ) : (
              <div className="admin-stat-card">
                <div className="stat-icon amber"><FaClock /></div>
                <div>
                  <span>Orders in Processing</span>
                  <strong>{adminOrders.filter((order) => order.status === "PROCESSING").length} Orders</strong>
                </div>
              </div>
            )}
            {isSuperAdmin && (
              <div className="admin-stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("ACCOUNTS")}>
                <div className="stat-icon purple"><FaUsers /></div>
                <div>
                  <span>Admin Accounts</span>
                  <strong>{adminAccounts.length} Admins</strong>
                </div>
              </div>
            )}
          </div>

          {/* TAB NAVIGATION BUTTONS */}
          <div className="admin-tabs">
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "ORDERS" ? "active" : ""}`}
              aria-pressed={activeTab === "ORDERS"}
              onClick={() => setActiveTab("ORDERS")}
            >
              <FaShoppingBag /> Orders Management ({adminOrders.length})
            </button>
            {isSuperAdmin && <button
              type="button"
              className={`admin-tab-btn ${activeTab === "PAYMENTS" ? "active" : ""}`}
              aria-pressed={activeTab === "PAYMENTS"}
              onClick={() => setActiveTab("PAYMENTS")}
            >
              <FaCreditCard /> Payments ({payments.length})
            </button>}
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "REVIEWS" ? "active" : ""}`}
              aria-pressed={activeTab === "REVIEWS"}
              onClick={() => setActiveTab("REVIEWS")}
            >
              <FaStar /> Customer Reviews ({customerReviews.length})
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === "ACCOUNTS" ? "active" : ""}`}
                aria-pressed={activeTab === "ACCOUNTS"}
                onClick={() => setActiveTab("ACCOUNTS")}
              >
                <FaUsers /> Admin Accounts ({adminAccounts.length})
              </button>
            )}
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "GEMS" ? "active" : ""}`}
              aria-pressed={activeTab === "GEMS"}
              onClick={() => setActiveTab("GEMS")}
            >
              <FaGem /> Gems Management ({gemsList.length})
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "JEWELLERY" ? "active" : ""}`}
              aria-pressed={activeTab === "JEWELLERY"}
              onClick={() => setActiveTab("JEWELLERY")}
            >
              <FaGem /> Jewellery Management ({jewelleryList.length})
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "HERO_SLIDES" ? "active" : ""}`}
              aria-pressed={activeTab === "HERO_SLIDES"}
              onClick={() => setActiveTab("HERO_SLIDES")}
            >
              <FaUpload /> Home Hero Slides ({managedHeroSlides.length})
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "BLOG" ? "active" : ""}`}
              aria-pressed={activeTab === "BLOG"}
              onClick={() => setActiveTab("BLOG")}
            >
              <FaFileInvoice /> Blog Management ({managedBlogPosts.length})
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === "GEM_APPROVAL" ? "active" : ""}`}
                aria-pressed={activeTab === "GEM_APPROVAL"}
                onClick={() => setActiveTab("GEM_APPROVAL")}
              >
                <FaCheckCircle /> Gem Approval ({pendingGemApprovals.length})
              </button>
            )}
            {isSuperAdmin && (
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === "JEWELLERY_APPROVAL" ? "active" : ""}`}
                aria-pressed={activeTab === "JEWELLERY_APPROVAL"}
                onClick={() => setActiveTab("JEWELLERY_APPROVAL")}
              >
                <FaCheckCircle /> Jewellery Approval ({pendingJewelleryApprovals.length})
              </button>
            )}
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "STOCK" ? "active" : ""}`}
              aria-pressed={activeTab === "STOCK"}
              onClick={() => setActiveTab("STOCK")}
            >
              <FaExclamationTriangle /> Stock Alert ({lowStockCount})
            </button>
          </div>

          {/* TAB 1: ORDERS MANAGEMENT */}
          {activeTab === "ORDERS" && (
            <section className="admin-section">
              <h2><FaShoppingBag /> Customer Orders &amp; Shipment Tracking</h2>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Gemstone</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Update Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong className="order-code">{order.id}</strong>
                          <div className="order-date">{order.date}</div>
                        </td>
                        <td>
                          <strong>{order.customerName}</strong>
                          <div className="table-subtext">{order.customerEmail}</div>
                          <div className="table-subtext"><FaMapMarkerAlt /> {order.shippingAddress}</div>
                        </td>
                        <td>
                          <strong>{order.gemName}</strong>
                          <div className="table-subtext">{order.carat} • Cert: {order.certNo}</div>
                        </td>
                        <td>
                          <strong className="gold-text">{order.paymentStatus}</strong>
                        </td>
                        <td>
                          <span className={`status-pill status-${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="admin-status-select"
                          >
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="DISPATCHED">DISPATCHED</option>
                            <option value="DELIVERED">DELIVERED</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-action-btn"
                            title="View Invoice & Tracking Details"
                            onClick={() => setSelectedOrderDetails(order)}
                          >
                            <FaFileInvoice /> Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {isSuperAdmin && activeTab === "PAYMENTS" && (
            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <h2><FaCreditCard /> Payments &amp; Reconciliation</h2>
                  <p>Review transaction records and keep order payment status in sync.</p>
                </div>
                <span className="admin-live-note">DEMO LEDGER · NOT CONNECTED TO A PAYMENT GATEWAY</span>
              </div>

              <div className="payment-overview">
                <div><span>Settled volume</span><strong>${settledRevenue.toLocaleString()} USD</strong></div>
                <div><span>Awaiting settlement</span><strong>${pendingPayments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()} USD</strong></div>
                <div><span>Transactions</span><strong>{payments.length}</strong></div>
              </div>

              <div className="admin-table-toolbar">
                <label htmlFor="payment-status-filter">Transaction status</label>
                <select
                  id="payment-status-filter"
                  value={paymentFilter}
                  onChange={(event) => setPaymentFilter(event.target.value)}
                >
                  <option value="ALL">All transactions</option>
                  <option value="SETTLED">Settled</option>
                  <option value="PENDING">Pending</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
                <span>{filteredPayments.length} records</span>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table payment-table">
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Customer / Order</th>
                      <th>Payment method</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Update status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td><strong className="order-code">{payment.id}</strong><div className="order-date">{payment.date}</div></td>
                        <td><strong>{payment.customerName}</strong><div className="table-subtext">Order {payment.orderId}</div></td>
                        <td>{payment.method}</td>
                        <td><strong className="gold-text">${payment.amount.toLocaleString()} USD</strong></td>
                        <td><span className={`payment-status status-${payment.status.toLowerCase()}`}>{payment.status}</span></td>
                        <td>
                          <select
                            aria-label={`Update payment ${payment.id}`}
                            className="admin-status-select"
                            value={payment.status}
                            onChange={(event) => handlePaymentStatusChange(payment.id, event.target.value)}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="SETTLED">SETTLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {filteredPayments.length === 0 && (
                      <tr><td className="admin-empty-state" colSpan="6">No transactions match this filter.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "REVIEWS" && (
            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <h2><FaStar /> Customer Reviews</h2>
                  <p>Review published customer feedback and remove content that should no longer appear publicly.</p>
                </div>
                <span className="admin-live-note">{customerReviews.length} PUBLISHED REVIEWS</span>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table review-admin-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Rating</th>
                      <th>Review</th>
                      <th>Location</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerReviews.map((review) => (
                      <tr key={review.id}>
                        <td>
                          <strong>{review.name}</strong>
                          <div className="table-subtext">{review.email || "Public testimonial"}</div>
                        </td>
                        <td>
                          <span className="review-admin-rating" aria-label={`${review.rating} out of 5 stars`}>
                            {[...Array(review.rating)].map((_, index) => <FaStar key={index} />)}
                            <strong>{review.rating}/5</strong>
                          </span>
                        </td>
                        <td><p className="review-admin-comment">{review.comment}</p></td>
                        <td>{review.location || "Not provided"}</td>
                        <td>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Published"}</td>
                        <td>
                          <button
                            type="button"
                            className="review-delete-btn"
                            aria-label={`Delete review by ${review.name}`}
                            onClick={() => handleDeleteReview(review)}
                          >
                            <FaTrash /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {customerReviews.length === 0 && (
                      <tr><td className="admin-empty-state" colSpan="6">There are no published customer reviews.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {isSuperAdmin && activeTab === "ACCOUNTS" && (
            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <h2><FaUsers /> Admin Account Management</h2>
                  <p>Add new admins, review account details, suspend access, or remove Admin accounts.</p>
                </div>
                <span className="admin-live-note">LOCAL DEMO · SAME BROWSER ONLY</span>
              </div>

              <div className="super-admin-profile">
                <span className="super-admin-profile-icon"><FaShieldAlt /></span>
                <div><span>Current Session</span><strong>{currentAdmin?.name || "Active Admin"}</strong></div>
                <div><span>Email</span><strong>{currentAdmin?.email || "Not available"}</strong></div>
                <div><span>Role</span><strong>{(currentAdmin?.role || "admin").toUpperCase()}</strong></div>
              </div>

              <div className="admin-account-toolbar">
                <span>{adminAccounts.length} Admin accounts in total</span>
                <button type="button" className="admin-account-add-btn" onClick={() => setIsAdminFormOpen(true)}>
                  <FaPlus /> Add New Admin
                </button>
              </div>

              {isAdminFormOpen && (
                <div className="admin-modal-backdrop" onClick={() => setIsAdminFormOpen(false)}>
                  <section className="admin-account-modal" role="dialog" aria-modal="true" aria-labelledby="create-admin-title" onClick={(event) => event.stopPropagation()}>
                    <div className="admin-account-modal-heading">
                      <div><span>ADMIN MANAGEMENT</span><h3 id="create-admin-title">Add New Admin Account</h3></div>
                      <button type="button" className="admin-modal-close" aria-label="Close add Admin dialog" onClick={() => setIsAdminFormOpen(false)}><FaTimes /></button>
                    </div>
                    <form className="admin-account-form" onSubmit={handleAddAdminAccount}>
                      <label><span>Admin name</span><input autoComplete="name" value={newAdminAccount.name} onChange={(event) => setNewAdminAccount((prev) => ({ ...prev, name: event.target.value }))} placeholder="e.g. Kasun Perera" required /></label>
                      <label><span>Email address</span><input type="email" autoComplete="email" value={newAdminAccount.email} onChange={(event) => setNewAdminAccount((prev) => ({ ...prev, email: event.target.value }))} placeholder="e.g. kasun@ceylonroyalgemstones.com" required /></label>
                      <label>
                        <span>Role</span>
                        <select value={newAdminAccount.role || "admin"} onChange={(event) => setNewAdminAccount((prev) => ({ ...prev, role: event.target.value }))}>
                          <option value="admin">Admin</option>
                          <option value="super-admin">Super Admin</option>
                        </select>
                      </label>
                      <label>
                        <span>Department</span>
                        <select value={newAdminAccount.department} onChange={(event) => setNewAdminAccount((prev) => ({ ...prev, department: event.target.value }))}>
                          <option>Operations</option>
                          <option>Finance</option>
                          <option>Certification</option>
                          <option>Fulfilment</option>
                          <option>Inventory</option>
                          <option>Customer Support</option>
                        </select>
                      </label>
                      <label><span>Phone number</span><input type="tel" autoComplete="tel" value={newAdminAccount.phone} onChange={(event) => setNewAdminAccount((prev) => ({ ...prev, phone: event.target.value }))} placeholder="e.g. +94 71 234 5678" /></label>
                      <label className="admin-account-password-field"><span>Temporary password</span><input type="password" autoComplete="new-password" minLength={6} value={newAdminAccount.password} onChange={(event) => setNewAdminAccount((prev) => ({ ...prev, password: event.target.value }))} placeholder="Min 6 characters" required /></label>
                      <p className="admin-account-form-note">At least 6 characters. The password is hashed before it is stored.</p>
                      <div className="admin-account-modal-actions">
                        <button type="button" className="admin-modal-cancel" onClick={() => setIsAdminFormOpen(false)}>Cancel</button>
                        <button type="submit" className="admin-account-add-btn"><FaPlus /> Save Admin</button>
                      </div>
                    </form>
                  </section>
                </div>
              )}

              <div className="admin-table-wrapper">
                <table className="admin-table accounts-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Phone</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                  <tbody>
                    {adminAccounts.map((account) => (
                      <tr key={account.id}>
                        <td><strong>{account.name}</strong></td>
                        <td>{account.email}</td>
                        <td>{account.department || "Operations"}</td>
                        <td>{account.phone || "Not provided"}</td>
                        <td>
                          <span className={`admin-role-pill ${account.role === "super-admin" ? "super-admin-pill" : ""}`}>
                            {account.role === "super-admin" ? "SUPER ADMIN" : "ADMIN"}
                          </span>
                        </td>
                        <td><span className={`account-status status-${account.status}`}>{account.status.toUpperCase()}</span></td>
                        <td>{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "Active"}</td>
                        <td className="account-actions">
                          <button type="button" className="view-admin-btn" title="View details" onClick={() => setSelectedAdminAccount(account)}>
                            <FaUsers /> View Details
                          </button>
                          <button type="button" onClick={() => handleAdminAccountStatus(account.id, account.status === "active" ? "inactive" : "active")}>
                            {account.status === "active" ? "Suspend" : "Activate"}
                          </button>
                          <button type="button" className="remove-admin-btn" title="Remove admin" onClick={() => handleDeleteAdminAccount(account)}>
                            <FaTrash /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {adminAccounts.length === 0 && (
                      <tr><td className="admin-empty-state" colSpan="8">No Admin accounts yet. Add an account above.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedAdminAccount && (
                <div className="admin-modal-backdrop" onClick={() => setSelectedAdminAccount(null)}>
                  <section className="admin-account-modal admin-account-details-modal" role="dialog" aria-modal="true" aria-labelledby="admin-details-title" onClick={(event) => event.stopPropagation()}>
                    <div className="admin-account-modal-heading">
                      <div><span>ADMIN ACCOUNT DETAILS</span><h3 id="admin-details-title">{selectedAdminAccount.name}</h3></div>
                      <button type="button" className="admin-modal-close" aria-label="Close Admin details" onClick={() => setSelectedAdminAccount(null)}><FaTimes /></button>
                    </div>
                    <dl className="admin-account-details">
                      <div><dt>Full Name</dt><dd>{selectedAdminAccount.name}</dd></div>
                      <div><dt>Email Address</dt><dd>{selectedAdminAccount.email}</dd></div>
                      <div><dt>Administrative Role</dt><dd><strong style={{ color: selectedAdminAccount.role === "super-admin" ? "#b58c36" : "#041d1a" }}>{selectedAdminAccount.role === "super-admin" ? "Super Admin" : "Admin"}</strong></dd></div>
                      <div><dt>Department</dt><dd>{selectedAdminAccount.department || "Operations"}</dd></div>
                      <div><dt>Phone Contact</dt><dd>{selectedAdminAccount.phone || "Not provided"}</dd></div>
                      <div><dt>Account Status</dt><dd><span className={`account-status status-${selectedAdminAccount.status}`}>{selectedAdminAccount.status.toUpperCase()}</span></dd></div>
                      <div><dt>Date Created</dt><dd>{selectedAdminAccount.createdAt ? new Date(selectedAdminAccount.createdAt).toLocaleString() : "System Default"}</dd></div>
                      <div><dt>Account Identifier</dt><dd><code style={{ fontSize: "11px", color: "#6a7b77" }}>{selectedAdminAccount.id}</code></dd></div>
                    </dl>
                    <div className="admin-account-modal-actions">
                      <button type="button" className="admin-modal-cancel" onClick={() => setSelectedAdminAccount(null)}>Close</button>
                      <button type="button" className="remove-admin-btn" onClick={() => handleDeleteAdminAccount(selectedAdminAccount)}>
                        <FaTrash /> Remove Admin
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </section>
          )}

          {activeTab === "STOCK" && (
            <section className="admin-section">
              <div className="admin-section-heading stock-alert-heading">
                <div>
                  <h2><FaExclamationTriangle /> Stock Alerts</h2>
                  <p>Review current quantities. Items with {LOW_STOCK_THRESHOLD} or fewer units are marked low stock.</p>
                </div>
                <span className="admin-live-note">{lowStockCount} LOW STOCK ITEMS</span>
              </div>

              <div className="stock-alert-list">
                {gemsList.map((gem) => {
                  const productKey = getCollectionItemKey(gem);
                  const quantity = inventory[productKey] ?? 0;
                  const stockStatus = quantity === 0
                    ? "out"
                    : quantity <= LOW_STOCK_THRESHOLD
                      ? "low"
                      : "available";

                  return (
                    <article className="stock-alert-row" key={productKey}>
                      <img src={resolveMediaUrl(gem.image)} alt="" />
                      <div className="stock-alert-gem">
                        <strong>{gem.name}</strong>
                        <span>{gem.productKey || gem.certificateNumber || `Gem #${gem.id}`}</span>
                      </div>
                      <span className={`stock-alert-status ${stockStatus}`}>
                        {stockStatus === "out" ? "OUT OF STOCK" : stockStatus === "low" ? "LOW STOCK" : "IN STOCK"}
                      </span>
                      <strong className="stock-alert-quantity">{quantity} available</strong>
                      <form
                        className="stock-restock-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleRestockGem(productKey);
                        }}
                      >
                        <label className="sr-only" htmlFor={`restock-${productKey}`}>
                          Quantity to add for {gem.name}
                        </label>
                        <input
                          id={`restock-${productKey}`}
                          type="number"
                          min="1"
                          step="1"
                          value={stockAdditions[productKey] ?? 1}
                          onChange={(event) => setStockAdditions((current) => ({
                            ...current,
                            [productKey]: event.target.value
                          }))}
                        />
                        <button type="submit"><FaPlus /> Add stock</button>
                      </form>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {isSuperAdmin && activeTab === "GEM_APPROVAL" && (
            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <h2><FaCheckCircle /> Gem Approval</h2>
                  <p>Review gemstones submitted by Admins before they appear in the shop.</p>
                </div>
                <span className="admin-live-note">
                  {pendingGemApprovals.length} PENDING APPROVALS
                </span>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table gem-approval-table">
                  <thead>
                    <tr>
                      <th>Gemstone</th>
                      <th>Details</th>
                      <th>Price</th>
                      <th>Submitted</th>
                      <th>Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingGemApprovals.map((submission) => (
                      <tr key={submission.id}>
                        <td>
                          <strong>{submission.gem.name}</strong>
                          <div className="table-subtext">
                            {submission.gem.category || "Other Gemstone"}
                          </div>
                        </td>
                        <td>
                          {submission.gem.carat} Ct
                          <div className="table-subtext">{submission.gem.origin}</div>
                        </td>
                        <td>
                          <strong className="gold-text">
                            ${Number(submission.gem.price || 0).toLocaleString()} USD
                          </strong>
                        </td>
                        <td>
                          {submission.submittedAt
                            ? new Date(submission.submittedAt).toLocaleDateString()
                            : "Just now"}
                        </td>
                        <td>
                          <div className="gem-approval-actions">
                            <button
                              type="button"
                              className="gem-approval-approve"
                              onClick={() => handleGemApproval(submission.id, "approved")}
                            >
                              <FaCheckCircle /> Approve
                            </button>
                            <button
                              type="button"
                              className="gem-approval-reject"
                              onClick={() => handleGemApproval(submission.id, "rejected")}
                            >
                              <FaTimes /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingGemApprovals.length === 0 && (
                      <tr>
                        <td className="admin-empty-state" colSpan="5">
                          There are no gemstones waiting for approval.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {isSuperAdmin && activeTab === "JEWELLERY_APPROVAL" && (
            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <h2><FaCheckCircle /> Jewellery Approval</h2>
                  <p>Review jewellery items submitted by Admins before they appear in the shop.</p>
                </div>
                <span className="admin-live-note">
                  {pendingJewelleryApprovals.length} PENDING APPROVALS
                </span>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table gem-approval-table">
                  <thead>
                    <tr>
                      <th>Jewellery</th>
                      <th>Type &amp; Color</th>
                      <th>Price</th>
                      <th>Submitted</th>
                      <th>Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingJewelleryApprovals.map((submission) => (
                      <tr key={submission.id}>
                        <td>
                          <strong>{submission.jewellery.name}</strong>
                          <div className="table-subtext">
                            {submission.jewellery.shape}
                          </div>
                        </td>
                        <td>
                          {submission.jewellery.category}
                          <div className="table-subtext">{submission.jewellery.color}</div>
                        </td>
                        <td>
                          <strong className="gold-text">
                            ${Number(submission.jewellery.price || 0).toLocaleString()} USD
                          </strong>
                        </td>
                        <td>
                          {submission.submittedAt
                            ? new Date(submission.submittedAt).toLocaleDateString()
                            : "Just now"}
                        </td>
                        <td>
                          <div className="gem-approval-actions">
                            <button
                              type="button"
                              className="gem-approval-approve"
                              onClick={() => handleJewelleryApproval(submission.id, "approved")}
                            >
                              <FaCheckCircle /> Approve
                            </button>
                            <button
                              type="button"
                              className="gem-approval-reject"
                              onClick={() => handleJewelleryApproval(submission.id, "rejected")}
                            >
                              <FaTimes /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingJewelleryApprovals.length === 0 && (
                      <tr>
                        <td className="admin-empty-state" colSpan="5">
                          There are no jewellery items waiting for approval.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 2: GEMS MANAGEMENT */}
          {activeTab === "GEMS" && (
            <section className="admin-section">
              {/* ADD NEW GEM FORM */}
              <div className="add-gem-card">
                <h2><FaPlus /> Add New Gemstone to Inventory</h2>
                {categoriesError && (
                  <p className="gem-category-error" role="alert">
                    {categoriesError}{" "}
                    <button type="button" className="admin-action-btn" onClick={refreshCategories}>
                      Retry
                    </button>
                  </p>
                )}
                <form onSubmit={handleAddGem} className="add-gem-form gemstone-form">
                  <div className="gem-form-row">
                    <div className="form-group">
                      <label htmlFor="new-gem-name">Gemstone Name *</label>
                      <input
                        id="new-gem-name"
                        type="text"
                        placeholder="e.g. CEYLON RUBY / PINK SAPPHIRE"
                        value={newGem.name}
                        onChange={(event) => setNewGem({ ...newGem, name: event.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-gem-category">Gemstone Category *</label>
                      <select
                        id="new-gem-category"
                        value={newGem.category_id}
                        onChange={(event) => setNewGem({ ...newGem, category_id: event.target.value })}
                        required
                      >
                        <option value="">Select a database category</option>
                        {backendCategories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-gem-color">Color</label>
                      <input
                        id="new-gem-color"
                        type="text"
                        value={newGem.color}
                        onChange={(event) => setNewGem({ ...newGem, color: event.target.value })}
                      />
                    </div>
                  </div>
                  <div className="gem-form-row">
                    <div className="form-group">
                      <label htmlFor="new-gem-carat">Carat Weight</label>
                      <input
                        id="new-gem-carat"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 3.45"
                        value={newGem.carat}
                        onChange={(event) => setNewGem({ ...newGem, carat: event.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <span className="admin-form-label">Dimensions (L x W x H)</span>
                      <div className="gem-dimension-fields">
                        {[
                          { key: "length", label: "Length" },
                          { key: "width", label: "Width" },
                          { key: "height", label: "Height" },
                        ].map(({ key, label }) => (
                          <input
                            key={key}
                            aria-label={`${label} in mm`}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder={label}
                            value={newGem[key]}
                            onChange={(event) => setNewGem({ ...newGem, [key]: event.target.value })}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-gem-clarity">Clarity</label>
                      <input
                        id="new-gem-clarity"
                        type="text"
                        value={newGem.clarity}
                        onChange={(event) => setNewGem({ ...newGem, clarity: event.target.value })}
                      />
                    </div>
                  </div>
                  <div className="gem-form-row">
                    <div className="form-group">
                      <label htmlFor="new-gem-cut">Cut</label>
                      <input
                        id="new-gem-cut"
                        type="text"
                        placeholder="e.g. Mixed Cut"
                        value={newGem.cut}
                        onChange={(event) => setNewGem({ ...newGem, cut: event.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-gem-shape">Shape</label>
                      <input
                        id="new-gem-shape"
                        type="text"
                        value={newGem.shape}
                        onChange={(event) => setNewGem({ ...newGem, shape: event.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-gem-origin">Origin</label>
                      <input
                        id="new-gem-origin"
                        type="text"
                        placeholder="e.g. Ratnapura, Sri Lanka"
                        value={newGem.origin}
                        onChange={(event) => setNewGem({ ...newGem, origin: event.target.value })}
                      />
                    </div>
                  </div>
                  <div className="gem-form-row">
                    <div className="form-group">
                      <label htmlFor="new-gem-treatment">Treatment Status</label>
                      <select
                        id="new-gem-treatment"
                        value={newGem.treatment_status}
                        onChange={(event) => setNewGem({ ...newGem, treatment_status: event.target.value })}
                      >
                        {TREATMENT_OPTIONS.map((treatment) => (
                          <option key={treatment}>{treatment}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-gem-price">Price (USD $) *</label>
                      <input
                        id="new-gem-price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 15000"
                        value={newGem.price}
                        onChange={(event) => setNewGem({ ...newGem, price: event.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-gem-stock">Stock Quantity</label>
                      <input
                        id="new-gem-stock"
                        type="number"
                        min="0"
                        step="1"
                        value={newGem.stock}
                        onChange={(event) => setNewGem({ ...newGem, stock: event.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group gem-description-field">
                    <label htmlFor="new-gem-description">Description</label>
                    <textarea
                      id="new-gem-description"
                      placeholder="Brief description of this gemstone..."
                      rows={3}
                      value={newGem.description}
                      onChange={(event) => setNewGem({ ...newGem, description: event.target.value })}
                    />
                  </div>
                  <section className="gem-media-section">
                    <div>
                      <h3 className="gem-detail-upload-heading">Gemstone Gallery & Uploads</h3>
                      <p className="admin-image-help">Upload the main image, four views, and one inspection clip.</p>
                    </div>
                    <div className="gem-media-grid">
                      {[
                        { name: "mainImage", label: "Main Gemstone Image", accept: "image/jpeg,image/png,image/webp" },
                        { name: "backViewImage", label: "Back View", accept: "image/jpeg,image/png,image/webp" },
                        { name: "rightViewImage", label: "Right View", accept: "image/jpeg,image/png,image/webp" },
                        { name: "leftViewImage", label: "Left View", accept: "image/jpeg,image/png,image/webp" },
                        { name: "additional_view_1", label: "Additional View 1", accept: "image/jpeg,image/png,image/webp" },
                        { name: "additional_view_2", label: "Additional View 2", accept: "image/jpeg,image/png,image/webp" },
                        { name: "videoClip", label: "Inspection Video Clip", accept: "video/mp4,video/webm,video/quicktime" },
                      ].map(({ name, label, accept }) => (
                        <div className="form-group" key={name}>
                          <label htmlFor={`gem-${name}`}>{label}</label>
                          <input
                            id={`gem-${name}`}
                            name={name}
                            type="file"
                            accept={accept}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="gem-offer-section">
                    <div className="form-group">
                      <label>Offer Rate (%) (optional)</label>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={newGem.discountRate}
                        onChange={(e) => setNewGem({ ...newGem, discountRate: e.target.value })}
                        min="1"
                        max="100"
                        step="1"
                      />
                    </div>
                    <div className="offer-date-row">
                      <div className="form-group">
                        <label htmlFor="gem-offer-start-date">Offer Start Date</label>
                        <input
                          id="gem-offer-start-date"
                          type="date"
                          value={newGem.offerStartDate}
                          onChange={(e) => setNewGem({ ...newGem, offerStartDate: e.target.value })}
                          required={Boolean(newGem.discountRate)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="gem-offer-end-date">Offer End Date</label>
                        <input
                          id="gem-offer-end-date"
                          type="date"
                          value={newGem.offerEndDate}
                          onChange={(e) => setNewGem({ ...newGem, offerEndDate: e.target.value })}
                          min={newGem.offerStartDate || undefined}
                          required={Boolean(newGem.discountRate)}
                        />
                      </div>
                    </div>
                  </section>
                  <div className="add-gem-form-actions gem-submit-actions">
                    <button type="submit" className="add-gem-submit-btn gem-submit-btn" disabled={gemSaving}>
                      {gemSaving
                        ? "Saving…"
                        : <><FaPlus /> ADD GEMSTONE TO INVENTORY</>}
                    </button>
                  </div>
                </form>
              </div>

              <div className="gem-management-toolbar">
                <label htmlFor="gem-category-filter">Filter inventory and certificates by category</label>
                <select
                  id="gem-category-filter"
                  value={gemCategoryFilter}
                  onChange={(event) => setGemCategoryFilter(event.target.value)}
                >
                  <option value="all">All categories</option>
                  {backendCategories.map((category) => (
                    <option key={category.id} value={String(category.id)}>{category.name}</option>
                  ))}
                </select>
                <span>{filteredBackendGems.length} of {backendGems.length} database gemstones</span>
              </div>

              <section className="admin-section gem-database-section">
                <div className="admin-section-heading">
                  <div>
                    <h2><FaGem /> Live Gemstone Inventory</h2>
                    <p>Gemstone records and category names are loaded from the MySQL database.</p>
                  </div>
                  {gemsLoading && <span className="admin-live-note">LOADING…</span>}
                </div>
                {gemstonesError ? (
                  <p className="admin-empty-state" role="alert">
                    {gemstonesError}{" "}
                    <button type="button" className="admin-action-btn" onClick={refreshGems}>Retry</button>
                  </p>
                ) : gemsLoading ? (
                  <p className="admin-empty-state">Loading gemstone inventory…</p>
                ) : filteredBackendGems.length === 0 ? (
                  <p className="admin-empty-state">
                    {backendGems.length === 0
                      ? "No gemstones are currently stored in the database."
                      : "No gemstones found in this category."}
                  </p>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table gem-management-table">
                      <thead>
                        <tr>
                          <th>Gemstone</th>
                          <th>Category</th>
                          <th>Carat</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBackendGems.map((gem) => (
                          <tr key={gem.id}>
                            <td>
                              <strong>{gem.name}</strong>
                              {gem.gemstone_id && <div className="table-subtext">{gem.gemstone_id}</div>}
                            </td>
                            <td><span className="gem-category-pill">{gem.category_name || "Uncategorized"}</span></td>
                            <td>{gem.carat ? `${gem.carat} ct` : "—"}</td>
                            <td className="gold-text">
                              {gem.price == null ? "—" : `$${Number(gem.price).toLocaleString()}`}
                            </td>
                            <td>{Number(gem.stock ?? 0)}</td>
                            <td>
                              <span className={`gem-database-status ${isGemstoneActive(gem.status) ? "active" : "inactive"}`}>
                                {isGemstoneActive(gem.status) ? "Available" : "Inactive"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="admin-section" style={{ marginTop: "2rem" }}>
                <div className="admin-section-heading">
                  <div>
                    <h2><FaFileInvoice /> Gemstone Certificate Management</h2>
                    <p>Add, review, and update certificates for gemstones in your inventory.</p>
                  </div>
                </div>
                {gemstonesError && (
                  <p className="admin-empty-state" role="alert" style={{ padding: "1rem" }}>
                    {gemstonesError}{" "}
                    <button type="button" className="admin-action-btn" onClick={refreshGems}>Retry</button>
                  </p>
                )}
                {certificatesError ? (
                  <p className="admin-empty-state" role="alert" style={{ padding: "1rem" }}>
                    {certificatesError}{" "}
                    <button type="button" className="admin-action-btn" onClick={refreshCertificates}>Retry</button>
                  </p>
                ) : !certificatesLoaded ? (
                  <p className="admin-empty-state" style={{ padding: "1rem", textAlign: "center" }}>
                    Loading gemstone certificates…
                  </p>
                ) : filteredBackendGems.length === 0 ? (
                  <p className="admin-empty-state" style={{ padding: "1rem", textAlign: "center" }}>
                    No gemstones in this category are available for certificate management.
                  </p>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table gem-management-table">
                      <thead>
                        <tr>
                          <th>Gemstone</th>
                          <th>Category</th>
                          <th>Certificate Number</th>
                          <th>Laboratory</th>
                          <th>Verification</th>
                          <th>Certificate File</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBackendGems.map((gem) => {
                          const certificate = certificatesByGemstone[String(gem.id)];
                          return (
                            <tr key={gem.id}>
                              <td><strong>{gem.name}</strong></td>
                              <td><span className="gem-category-pill">{gem.category_name || "Uncategorized"}</span></td>
                              <td>{certificate?.certificate_number || "Not added"}</td>
                              <td>{certificate?.laboratory || "—"}</td>
                              <td>{certificate?.verification_status || "—"}</td>
                              <td>
                                {certificate?.certificate_url ? (
                                  <a
                                    href={/^https?:\/\//i.test(certificate.certificate_url)
                                      ? certificate.certificate_url
                                      : `${API_BASE_URL}${certificate.certificate_url}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    View file
                                  </a>
                                ) : "—"}
                              </td>
                              <td>
                                <div className="certificate-actions">
                                  <button
                                    type="button"
                                    className="admin-action-btn"
                                    onClick={() => setEditCertificate({
                                      id: certificate?.id || null,
                                      gemstone_id: gem.id,
                                      gemstone_name: gem.name,
                                      certificate_number: certificate?.certificate_number || "",
                                      laboratory: certificate?.laboratory || "",
                                      certificate_url: certificate?.certificate_url || "",
                                      certificate_file: null,
                                      verification_status: String(certificate?.verification_status || "pending").toLowerCase(),
                                      issue_date: certificate?.issue_date
                                        ? String(certificate.issue_date).slice(0, 10)
                                        : ""
                                    })}
                                  >
                                    <FaFileInvoice /> {certificate ? "Edit Certificate" : "Add Certificate"}
                                  </button>
                                  {certificate && (
                                    <button
                                      type="button"
                                      className="certificate-delete-btn"
                                      aria-label={`Delete certificate for ${gem.name}`}
                                      disabled={certificateDeleting === certificate.id}
                                      onClick={() => handleDeleteCertificate(certificate, gem.name)}
                                    >
                                      <FaTrash /> {certificateDeleting === certificate.id ? "Deleting…" : "Delete"}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* STOREFRONT GEMSTONE COLLECTION */}
              <div className="admin-section-heading" style={{ marginTop: "2rem" }}>
                <div>
                  <h2><FaGem /> Storefront Gemstone Collection ({gemsList.length})</h2>
                  <p>Manage gemstone product cards currently displayed in the storefront.</p>
                </div>
              </div>

              <div className="admin-gems-grid">
                {gemsList.map((gem) => {
                  const reviewStatus = gemSubmissions.find(
                    (submission) => submission.gem.id === gem.id
                  )?.status;
                  const offerProduct = withActiveProductOffer(gem);
                  const originalPrice = Number(offerProduct.basePriceUSD ?? offerProduct.price ?? 0);
                  const discountRate = Number(offerProduct.discountRate);
                  const hasDiscount = discountRate > 0 && discountRate <= 100;
                  const offerPrice = hasDiscount
                    ? Math.round(originalPrice * (1 - discountRate / 100))
                    : originalPrice;
                  const offerEndDate = hasDiscount
                    ? formatProductOfferEndDate(offerProduct)
                    : "";

                  return (
                    <div className="admin-gem-card" key={gem.id}>
                    <img
                      src={resolveMediaUrl(gem.image)}
                      alt={gem.name}
                    />
                    <div className="admin-gem-body">
                      <span className="gem-tag">{gem.tag || "NATURAL CEYLON"}</span>
                      {reviewStatus && (
                        <span className={`gem-review-status status-${reviewStatus}`}>
                          {reviewStatus}
                        </span>
                      )}
                      <h3>{gem.name}</h3>
                      <p>{gem.carat ? `${gem.carat} Ct` : "3.50 Ct"} • {gem.origin}</p>
                      <div className={`admin-gem-prices ${hasDiscount ? "has-discount" : ""}`}>
                        {hasDiscount && (
                          <del className="product-original-price">
                            ${originalPrice.toLocaleString()} USD
                          </del>
                        )}
                        <strong className="gem-price">
                          ${offerPrice.toLocaleString()} USD
                        </strong>
                        {offerEndDate && (
                          <small className="admin-gem-offer-end-date">Offer ends {offerEndDate}</small>
                        )}
                      </div>
                      {hasDiscount && (
                        <span className="admin-gem-discount-rate">
                          OFFER RATE: {discountRate}% OFF
                        </span>
                      )}
                      <div className="admin-gem-actions">
                        <button
                          type="button"
                          className="admin-action-btn"
                          style={{ marginRight: "6px" }}
                          disabled={!certificatesLoaded}
                          onClick={() => {
                            const certificate = certificatesByGemstone[String(gem.id)];
                            setEditCertificate({
                              id: certificate?.id || null,
                              gemstone_id: gem.id,
                              gemstone_name: gem.name,
                              certificate_number: certificate?.certificate_number || "",
                              laboratory: certificate?.laboratory || "",
                              certificate_url: certificate?.certificate_url || "",
                              certificate_file: null,
                              verification_status: String(certificate?.verification_status || "pending").toLowerCase(),
                              issue_date: certificate?.issue_date
                                ? String(certificate.issue_date).slice(0, 10)
                                : ""
                            });
                          }}
                        >
                          <FaFileInvoice /> {certificatesLoaded
                            ? certificatesByGemstone[String(gem.id)] ? "Edit Certificate" : "Add Certificate"
                            : "Loading Certificate…"}
                        </button>
                        {!gem.inventoryId && (
                          <>
                            <button
                              type="button"
                              className="admin-action-btn gem-edit-btn"
                              onClick={() => handleEditGem(gem)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="gem-delete-btn"
                              onClick={() => handleDeleteGem(gem.id)}
                            >
                              <FaTrash /> Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === "JEWELLERY" && (
            <section className="admin-section">
              <div className="add-gem-card">
                <h2><FaPlus /> {editingJewelleryId ? "Edit Jewellery Item" : "Add Jewellery to Collection"}</h2>
                <p>
                  New items are sent to Super Admin for approval. Updates to existing items are saved immediately.
                </p>
                <form onSubmit={handleSaveJewellery} className="add-gem-form">
                  <div className="form-group">
                    <label>Jewellery Name</label>
                    <input
                      type="text"
                      value={newJewellery.name}
                      onChange={(event) => setNewJewellery({ ...newJewellery, name: event.target.value })}
                      placeholder="e.g. Blue Gem Necklace"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="jewellery-category">Category</label>
                    <select
                      id="jewellery-category"
                      value={newJewellery.category}
                      onChange={(event) => setNewJewellery({ ...newJewellery, category: event.target.value })}
                    >
                      <option value="Necklaces">Necklaces</option>
                      <option value="Bracelets">Bracelets</option>
                      <option value="Rings">Rings</option>
                      <option value="Earrings">Earrings</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Gemstone Color</label>
                    <input
                      type="text"
                      value={newJewellery.color}
                      onChange={(event) => setNewJewellery({ ...newJewellery, color: event.target.value })}
                      placeholder="e.g. Blue"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Design / Style</label>
                    <input
                      type="text"
                      value={newJewellery.shape}
                      onChange={(event) => setNewJewellery({ ...newJewellery, shape: event.target.value })}
                      placeholder="e.g. Gemstone Pendant Necklace"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (USD $)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={newJewellery.price}
                      onChange={(event) => setNewJewellery({ ...newJewellery, price: event.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <span className="admin-form-label">Jewellery Image</span>
                    <label className="admin-image-picker" htmlFor="jewellery-image-file">
                      <input
                        id="jewellery-image-file"
                        className="admin-image-picker-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => handleProductImageSelection(event, setNewJewellery)}
                      />
                      <span className="admin-image-picker-icon"><FaUpload /></span>
                      <span className="admin-image-picker-copy">
                        <strong>{newJewellery.image ? "Choose a different image" : "Choose an image"}</strong>
                        <small>Browse files on this device</small>
                      </span>
                      <span className="admin-image-picker-action">Browse files</span>
                    </label>
                    <span className="admin-image-help">JPEG, PNG, or WebP · up to 10 MB · works on desktop, tablet, and mobile.</span>
                  </div>
                  <div className="form-group">
                    <label>Offer Rate (%) (optional)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value={newJewellery.discountRate}
                      onChange={(event) => setNewJewellery({ ...newJewellery, discountRate: event.target.value })}
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="jewellery-offer-start-date">Offer Start Date</label>
                    <input
                      id="jewellery-offer-start-date"
                      type="date"
                      value={newJewellery.offerStartDate}
                      onChange={(event) => setNewJewellery({ ...newJewellery, offerStartDate: event.target.value })}
                      required={Boolean(newJewellery.discountRate)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="jewellery-offer-end-date">Offer End Date</label>
                    <input
                      id="jewellery-offer-end-date"
                      type="date"
                      value={newJewellery.offerEndDate}
                      onChange={(event) => setNewJewellery({ ...newJewellery, offerEndDate: event.target.value })}
                      min={newJewellery.offerStartDate || undefined}
                      required={Boolean(newJewellery.discountRate)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" min="0" step="1" value={editGem.stock} onChange={(e) => setEditGem({ ...editGem, stock: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Origin</label>
                    <input value={editGem.origin} onChange={(e) => setEditGem({ ...editGem, origin: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Shape</label>
                    <input value={editGem.shape} onChange={(e) => setEditGem({ ...editGem, shape: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Clarity</label>
                    <input value={editGem.clarity} onChange={(e) => setEditGem({ ...editGem, clarity: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Cut</label>
                    <input value={editGem.cut} onChange={(e) => setEditGem({ ...editGem, cut: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Treatment</label>
                    <select value={editGem.treatment_status} onChange={(e) => setEditGem({ ...editGem, treatment_status: e.target.value })}>
                      {TREATMENT_OPTIONS.map((treatment) => (
                        <option key={treatment}>{treatment}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={editGem.status} onChange={(e) => setEditGem({ ...editGem, status: e.target.value })}>
                      <option value="available">Available (Active)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Description</label>
                    <textarea
                      rows={3}
                      value={editGem.description}
                      onChange={(e) => setEditGem({ ...editGem, description: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #d4b96a", resize: "vertical" }}
                    />
                  </div>
                  <div className="add-gem-form-actions">
                    <button type="submit" className="add-gem-submit-btn">
                      <FaPlus /> {editingJewelleryId ? "UPDATE JEWELLERY" : "SUBMIT JEWELLERY"}
                    </button>
                    {editingJewelleryId !== null && (
                      <button type="button" className="add-gem-cancel-btn" onClick={resetJewelleryForm}>
                        <FaTimes /> Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <h2><FaGem /> Jewellery Collection ({jewelleryList.length})</h2>
              <div className="admin-gems-grid">
                {jewelleryList.map((item) => {
                  const reviewStatus = jewellerySubmissions.find(
                    (submission) => submission.jewellery.id === item.id
                  )?.status;
                  return (
                    <article className="admin-gem-card" key={item.id}>
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "/logo.png";
                        }}
                      />
                      <div className="admin-gem-body">
                        <span className="gem-tag">{item.category}</span>
                        {reviewStatus && (
                          <span className={`gem-review-status status-${reviewStatus}`}>
                            {reviewStatus}
                          </span>
                        )}
                        <h3>{item.name}</h3>
                        <p>{item.color} • {item.shape}</p>
                        <strong className="gem-price">
                          ${Number(item.basePriceUSD ?? item.price ?? 0).toLocaleString()} USD
                        </strong>
                        {Number(item.discountRate) > 0 && (
                          <span className="admin-gem-discount-rate">
                            OFFER: {Number(item.discountRate)}% OFF
                            {item.offerStartDate && item.offerEndDate
                              ? ` · ${item.offerStartDate} to ${item.offerEndDate}`
                              : ""}
                          </span>
                        )}
                        <div className="admin-gem-actions">
                          <button
                            type="button"
                            className="gem-edit-btn"
                            onClick={() => handleEditJewellery(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="gem-delete-btn"
                            onClick={() => handleDeleteJewellery(item.id)}
                          >
                            <FaTrash /> Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
                {jewelleryList.length === 0 && (
                  <p className="admin-empty-state">No jewellery items are in the collection.</p>
                )}
              </div>
            </section>
          )}

          {activeTab === "HERO_SLIDES" && (
            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <h2><FaUpload /> Homepage Hero Slides</h2>
                  <p>Upload an image and title to add it to the homepage hero slideshow.</p>
                </div>
                <span className="admin-live-note">{managedHeroSlides.length} UPLOADED SLIDES</span>
              </div>
              <div className="add-gem-card">
                <form className="add-gem-form" onSubmit={handleAddHeroSlide}>
                  <div className="form-group">
                    <label htmlFor="hero-slide-title">Slide title / image description</label>
                    <input
                      id="hero-slide-title"
                      value={newHeroSlide.alt}
                      onChange={(event) => setNewHeroSlide((current) => ({
                        ...current,
                        alt: event.target.value
                      }))}
                      placeholder="e.g. Rare Ceylon Blue Sapphire"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <span className="admin-form-label">Hero slide image</span>
                    <label className="admin-image-picker" htmlFor="hero-slide-image">
                      <input
                        id="hero-slide-image"
                        className="admin-image-picker-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => handleProductImageSelection(event, setNewHeroSlide)}
                      />
                      <span className="admin-image-picker-icon"><FaUpload /></span>
                      <span className="admin-image-picker-copy">
                        <strong>{newHeroSlide.image ? "Image selected" : "Choose a slide image"}</strong>
                        <small>Browse files on this device</small>
                      </span>
                      <span className="admin-image-picker-action">Browse files</span>
                    </label>
                    <span className="admin-image-help">JPEG, PNG, or WebP · up to 10 MB.</span>
                  </div>
                  <div className="add-gem-form-actions">
                    <button type="submit" className="add-gem-submit-btn">
                      <FaUpload /> PUBLISH HERO SLIDE
                    </button>
                  </div>
                </form>
              </div>
              <div className="site-content-list">
                {managedHeroSlides.map((slide) => (
                  <article className="site-content-row" key={slide.id}>
                    <div className="site-content-row-info">
                      <strong>{slide.alt}</strong>
                      <span>Homepage hero slide</span>
                    </div>
                    <button
                      type="button"
                      className="gem-delete-btn"
                      onClick={() => handleRemoveSiteContent("hero slide", slide.id)}
                    >
                      <FaTrash /> Remove
                    </button>
                  </article>
                ))}
                {managedHeroSlides.length === 0 && (
                  <p className="admin-empty-state">No additional hero slides have been uploaded.</p>
                )}
              </div>
            </section>
          )}

          {activeTab === "BLOG" && (
            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <h2><FaFileInvoice /> Blog Management</h2>
                  <p>Write and publish an article with a cover image to the public Blog page.</p>
                </div>
                <span className="admin-live-note">{managedBlogPosts.length} PUBLISHED ARTICLES</span>
              </div>
              <div className="add-gem-card">
                <form className="add-gem-form" onSubmit={handleAddBlogPost}>
                  <div className="form-group">
                    <label htmlFor="blog-post-title">Article title</label>
                    <input
                      id="blog-post-title"
                      value={newBlogPost.title}
                      onChange={(event) => setNewBlogPost((current) => ({
                        ...current,
                        title: event.target.value
                      }))}
                      placeholder="Enter an article title"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="blog-post-category">Category</label>
                    <select
                      id="blog-post-category"
                      value={newBlogPost.category}
                      onChange={(event) => setNewBlogPost((current) => ({
                        ...current,
                        category: event.target.value
                      }))}
                    >
                      <option>Gemstone Guide</option>
                      <option>Gemstone Article</option>
                      <option>Jewellery</option>
                      <option>Company News</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <span className="admin-form-label">Article cover image</span>
                    <label className="admin-image-picker" htmlFor="blog-post-image">
                      <input
                        id="blog-post-image"
                        className="admin-image-picker-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => handleProductImageSelection(event, setNewBlogPost)}
                      />
                      <span className="admin-image-picker-icon"><FaUpload /></span>
                      <span className="admin-image-picker-copy">
                        <strong>{newBlogPost.image ? "Image selected" : "Choose a cover image"}</strong>
                        <small>Browse files on this device</small>
                      </span>
                      <span className="admin-image-picker-action">Browse files</span>
                    </label>
                    <span className="admin-image-help">JPEG, PNG, or WebP · up to 10 MB.</span>
                  </div>
                  <div className="form-group site-content-wide-field">
                    <label htmlFor="blog-post-excerpt">Short summary</label>
                    <textarea
                      id="blog-post-excerpt"
                      value={newBlogPost.excerpt}
                      onChange={(event) => setNewBlogPost((current) => ({
                        ...current,
                        excerpt: event.target.value
                      }))}
                      rows="3"
                      placeholder="A short introduction shown on the Blog page"
                      required
                    />
                  </div>
                  <div className="form-group site-content-wide-field">
                    <label htmlFor="blog-post-content">Article content</label>
                    <textarea
                      id="blog-post-content"
                      value={newBlogPost.content}
                      onChange={(event) => setNewBlogPost((current) => ({
                        ...current,
                        content: event.target.value
                      }))}
                      rows="8"
                      placeholder="Write the article here. Separate paragraphs with a blank line."
                      required
                    />
                  </div>
                  <div className="add-gem-form-actions">
                    <button type="submit" className="add-gem-submit-btn">
                      <FaPlus /> PUBLISH BLOG POST
                    </button>
                  </div>
                </form>
              </div>
              <div className="site-content-list">
                {managedBlogPosts.map((post) => (
                  <article className="site-content-row" key={post.id}>
                    <div className="site-content-row-info">
                      <strong>{post.title}</strong>
                      <span>{post.category} · {post.date}</span>
                    </div>
                    <button
                      type="button"
                      className="gem-delete-btn"
                      onClick={() => handleRemoveSiteContent("blog post", post.id)}
                    >
                      <FaTrash /> Remove
                    </button>
                  </article>
                ))}
                {managedBlogPosts.length === 0 && (
                  <p className="admin-empty-state">No blog posts have been added through dashboard management.</p>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="about-footer">
        <div className="about-footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <BrandLogo alt="Ceylon Royal Gemstones" />
              <div><strong>CEYLON</strong><small>ROYAL GEMSTONES</small></div>
            </div>
            <p>Discover the timeless beauty of authentic Sri Lankan gemstones, carefully sourced, crafted and presented with royal elegance.</p>
          </div>
          <div>
            <h4>EXPLORE</h4>
            <a href="/">Home</a>
            <a href="/gemstones">Shop</a>
            <a href="/About">Our Story</a>
            <a href="/trust">Trust &amp; Certification</a>
            <a href="/reviews">Reviews</a>
            <a href="/contact">Contact</a>
            <a href="/blog">Blog</a>
            {isSuperAdmin && <a href="/admin">Admin Portal</a>}
          </div>
          <div>
            <h4>CONTACT</h4>
            <a href="tel:+94712345678"><FaPhoneAlt /> +94 71 234 5678</a>
            <a href="mailto:info@ceylonroyalgemstones.com"><FaEnvelope /> info@ceylonroyalgemstones.com</a>
            <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" className="footer-whatsapp"><FaWhatsapp /> WhatsApp</a>
            <a href="#"><FaMapMarkerAlt /> Ratnapura, Sri Lanka</a>
          </div>
          <div>
            <h4>FOLLOW US</h4>
            <p>Follow our journey and discover the world of Ceylon gemstones.</p>
            <div className="footer-social-icons">
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" className="footer-whatsapp-icon" aria-label="WhatsApp"><FaWhatsapp /></a>
            </div>
          </div>
        </div>
        <div className="about-footer-bottom">
          <p>Copyright © 2026 Powered by NETIT Technology</p>
          <span>NATURAL • AUTHENTIC • CEYLON</span>
        </div>
      </footer>

      {/* DRAWERS & MODALS */}
      <CollectionDrawerPanel
        activeDrawer={activeDrawer}
        setActiveDrawer={setActiveDrawer}
        wishlist={wishlist}
        setWishlist={setWishlist}
        cart={cart}
        setCart={setCart}
      />

      {isInquiryOpen && (
        <SiteInquiryModal source={isSuperAdmin ? "Super Admin Portal" : "Admin Portal"} onClose={() => setIsInquiryOpen(false)} />
      )}

      {/* LUXURY ORDER INVOICE & TRACKING DOSSIER MODAL */}
      {selectedOrderDetails && (
        <div className="royal-modal-backdrop" onClick={() => setSelectedOrderDetails(null)}>
          <div
            className="order-invoice-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-invoice-header">
              <div className="order-invoice-header-brand">
                <BrandLogo alt="Ceylon Royal Gemstones" />
                <div className="order-invoice-header-titles">
                  <span>DISPATCH &amp; SHIPMENT DOSSIER</span>
                  <h3 id="invoice-title">Ceylon Royal Gemstones</h3>
                </div>
              </div>
              <button
                type="button"
                className="order-invoice-close"
                aria-label="Close invoice dialog"
                onClick={() => setSelectedOrderDetails(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="order-invoice-body">
              <div className="invoice-badge-row">
                <div className="invoice-order-ref">
                  <FaFileInvoice style={{ color: "#c9a24b" }} />
                  <span>Order Ref: {selectedOrderDetails.id}</span>
                </div>
                <span className={`invoice-status-tag status-${selectedOrderDetails.status.toLowerCase()}`}>
                  ● {selectedOrderDetails.status}
                </span>
              </div>

              {/* COURIER & LIVE TRACKING BANNER */}
              <div className="invoice-tracking-banner">
                <div className="invoice-tracking-title">
                  <span><FaTruck /> International Priority Air Courier</span>
                  <span className="invoice-tracking-carrier">FedEx Express</span>
                </div>
                <div className="invoice-tracking-code-wrap">
                  <div>
                    <small style={{ display: "block", color: "#7a5f18", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Air Waybill Tracking Number</small>
                    <span className="invoice-tracking-code">{selectedOrderDetails.tracking}</span>
                  </div>
                  <button
                    type="button"
                    className="invoice-copy-btn"
                    onClick={() => {
                      if (navigator?.clipboard?.writeText) {
                        navigator.clipboard.writeText(selectedOrderDetails.tracking);
                      }
                      setTrackingCopied(true);
                      setTimeout(() => setTrackingCopied(false), 2000);
                    }}
                  >
                    <FaCopy /> {trackingCopied ? "Copied! ✓" : "Copy Code"}
                  </button>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="invoice-grid">
                <div className="invoice-box">
                  <span className="invoice-box-label"><FaUsers /> Customer &amp; Recipient</span>
                  <strong>{selectedOrderDetails.customerName}</strong>
                  <p>{selectedOrderDetails.customerEmail}</p>
                  <p style={{ marginTop: "4px" }}><FaMapMarkerAlt style={{ color: "#b58c36", marginRight: "4px" }} />{selectedOrderDetails.shippingAddress}</p>
                </div>

                <div className="invoice-box">
                  <span className="invoice-box-label"><FaGem /> Certified Gemstone Specimen</span>
                  <strong>{selectedOrderDetails.gemName}</strong>
                  <p>Weight: <strong>{selectedOrderDetails.carat}</strong></p>
                  <p>Lab Cert: <strong style={{ color: "#b58c36" }}>{selectedOrderDetails.certNo}</strong></p>
                </div>

                <div className="invoice-box">
                  <span className="invoice-box-label"><FaCreditCard /> Financial Settlement</span>
                  <strong style={{ color: "#0d5c3a" }}>{selectedOrderDetails.paymentStatus}</strong>
                  <p>Order Placed: {selectedOrderDetails.date}</p>
                  <p>Verified Escrow Settlement</p>
                </div>

                <div className="invoice-box">
                  <span className="invoice-box-label"><FaShieldAlt /> Authenticity Guarantee</span>
                  <strong>100% Genuine Ceylon Gem</strong>
                  <p>Origin: Ratnapura, Sri Lanka</p>
                  <p>Royal Heritage Seal Applied</p>
                </div>
              </div>
            </div>

            <div className="order-invoice-footer">
              <button
                type="button"
                className="invoice-footer-btn outline"
                onClick={() => window.print()}
              >
                <FaPrint /> Print Invoice Slip
              </button>
              <button
                type="button"
                className="invoice-footer-btn gold"
                onClick={() => setSelectedOrderDetails(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTRACTIVE ROYAL DIALOG MODAL (REPLACES BROWSER ALERTS & CONFIRMS) */}
      {dialogState && (
        <div className="royal-modal-backdrop" onClick={() => dialogState.type === "alert" && setDialogState(null)}>
          <div
            className="royal-dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`royal-dialog-icon ${dialogState.icon || "info"}`}>
              {dialogState.icon === "success" && <FaCheckCircle />}
              {dialogState.icon === "danger" && <FaTrash />}
              {dialogState.icon === "warning" && <FaExclamationTriangle />}
              {(!dialogState.icon || dialogState.icon === "info") && <FaShieldAlt />}
            </div>

            <h3 id="dialog-title">{dialogState.title}</h3>
            <p>{dialogState.message}</p>

            <div className="royal-dialog-actions">
              {dialogState.type === "confirm" && (
                <button
                  type="button"
                  className="royal-dialog-btn cancel"
                  onClick={() => setDialogState(null)}
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                className={`royal-dialog-btn ${dialogState.icon === "danger" ? "confirm-danger" : "confirm-gold"}`}
                onClick={() => {
                  if (dialogState.type === "confirm" && dialogState.onConfirm) {
                    dialogState.onConfirm();
                  } else {
                    setDialogState(null);
                  }
                }}
              >
                {dialogState.type === "confirm" ? "Proceed" : "Understood"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
