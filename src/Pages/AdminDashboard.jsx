import { useEffect, useState } from "react";
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
  FaExclamationTriangle
} from "react-icons/fa";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import CollectionDrawerPanel from "../components/CollectionDrawerPanel.jsx";
import SiteInquiryModal from "../components/SiteInquiryModal.jsx";
import { useSharedCollection } from "../useSharedCollection.js";
import { useCustomerReviews } from "../useCustomerReviews.js";
import {
  endAdminSession,
  hashAdminPassword,
  readAdminAccounts,
  readAdminSession,
  writeAdminAccounts
} from "../adminAccess.js";
import { API_BASE_URL, apiGet, apiPost, apiPut, apiDelete, apiRequest } from "../services/api.js";
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

const buildGemstonePayload = (gem, nameTransform = (name) => name.trim()) => ({
  name: nameTransform(gem.name),
  category_id: Number(gem.category_id),
  color: gem.color.trim() || null,
  carat: gem.carat === "" ? null : Number(gem.carat),
  length: gem.length === "" ? null : Number(gem.length),
  width: gem.width === "" ? null : Number(gem.width),
  height: gem.height === "" ? null : Number(gem.height),
  origin: gem.origin.trim() || null,
  price: Number(gem.price),
  stock: Number(gem.stock),
  clarity: gem.clarity.trim() || null,
  cut: gem.cut.trim() || null,
  shape: gem.shape.trim() || null,
  treatment_status: gem.treatment_status.trim() || null,
  description: gem.description.trim() || null,
  status: gem.status
});

const hasValidGemNumbers = (gem) => {
  const optionalMeasurements = [gem.carat, gem.length, gem.width, gem.height];
  return (
    Number.isFinite(Number(gem.price)) &&
    Number(gem.price) > 0 &&
    Number.isSafeInteger(Number(gem.stock)) &&
    Number(gem.stock) >= 0 &&
    optionalMeasurements.every(
      (value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0)
    )
  );
};

const AdminDashboard = ({ isSuperAdmin = false }) => {
  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("ORDERS");
  const [adminOrders, setAdminOrders] = useState(initialAdminOrders);
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

  // ── Backend: Enquiries & Reviews ──────────────────────────────────────────
  const [backendEnquiries, setBackendEnquiries] = useState([]);
  const [backendReviews, setBackendReviews] = useState([]);

  // ── Backend: Gemstones & Categories ──────────────────────────────────────
  const [backendGems, setBackendGems] = useState([]);
  const [backendCategories, setBackendCategories] = useState([]);
  const [gemsLoading, setGemsLoading] = useState(false);
  const [lowStockGems, setLowStockGems] = useState([]);
  const [stockAdditions, setStockAdditions] = useState({});
  const [gemstonesError, setGemstonesError] = useState("");
  const [lowStockError, setLowStockError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");
  const [certificatesByGemstone, setCertificatesByGemstone] = useState({});
  const [certificatesLoaded, setCertificatesLoaded] = useState(false);
  const [certificatesError, setCertificatesError] = useState("");

  // ── Add / Edit gem form state ─────────────────────────────────────────────
  const [newGem, setNewGem] = useState({
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
    status: "available"
  });
  const [editGem, setEditGem] = useState(null); // gem being edited
  const [gemSaving, setGemSaving] = useState(false);
  const [editCertificate, setEditCertificate] = useState(null);
  const [certificateSaving, setCertificateSaving] = useState(false);

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
      setGemstonesError(error.message || "Unable to load gemstones.");
      return false;
    } finally {
      setGemsLoading(false);
    }
  };

  // helper – re-fetch low stock
  const refreshLowStock = async () => {
    setLowStockError("");
    try {
      const response = await apiGet("/api/gemstones/low-stock");
      const data = await readGemApiResponse(response, "Unable to load low-stock gemstones.");
      if (!Array.isArray(data.data)) {
        throw new Error("The gemstone service returned invalid low-stock data.");
      }
      setLowStockGems(data.data);
      return true;
    } catch (error) {
      setLowStockError(error.message || "Unable to load low-stock gemstones.");
      return false;
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
      setCategoriesError(error.message || "Unable to load gemstone categories.");
      return false;
    }
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
        const gemstoneId = String(certificate.gemstone_id);
        if (certificate.gemstone_id != null && !certificates[gemstoneId]) {
          certificates[gemstoneId] = certificate;
        }
      });
      setCertificatesByGemstone(certificates);
      setCertificatesLoaded(true);
      return true;
    } catch (error) {
      setCertificatesError(error.message || "Unable to load gemstone certificates.");
      return false;
    }
  };

  // ── Fetch all backend data on mount ──────────────────────────────────────
  useEffect(() => {
    // Orders
    apiGet("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped = data.data.map((o) => ({
            id: o.order_number || `ORD-${o.id}`,
            _backendId: o.id,
            customerName: o.customer_name || `User #${o.user_id}`,
            customerEmail: o.customer_email || "",
            date: o.created_at ? String(o.created_at).slice(0, 10) : "",
            status: o.order_status || "PENDING",
            paymentStatus: `${o.payment_status} ($${Number(o.total_amount || 0).toLocaleString()})`,
            gemName: o.gemstone_name || "Ceylon Gemstone",
            carat: o.carat || "",
            certNo: o.certificate_number || "Pending",
            shippingAddress: o.shipping_address || "",
            tracking: o.tracking_number || "Pending",
          }));
          setAdminOrders([...initialAdminOrders, ...mapped]);
        }
      })
      .catch(() => {});

    // Enquiries
    apiGet("/api/enquiries")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setBackendEnquiries(data.data);
      })
      .catch(() => {});

    // Reviews
    apiGet("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setBackendReviews(data.data);
          const mapped = data.data.map((r) => ({
            id: `backend-${r.id}`,
            _backendId: r.id,
            name: `Customer #${r.user_id}`,
            location: "Verified Purchase",
            rating: Number(r.rating),
            comment: r.comment,
            status: r.status,
            avatar: null,
          }));
          if (mapped.length > 0) {
            setCustomerReviews((prev) => [
              ...mapped,
              ...prev.filter((r) => !String(r.id).startsWith("backend-"))
            ]);
          }
        }
      })
      .catch(() => {});

    // Load the gem-management data after the effect has completed.
    Promise.resolve().then(() =>
      Promise.all([
        refreshGems(),
        refreshLowStock(),
        refreshCategories(),
        refreshCertificates()
      ])
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // (newGem state defined above near other backend state)

  const handleStatusChange = (orderId, newStatus) => {
    setAdminOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    // Also update in backend if this is a backend order
    const order = adminOrders.find((o) => o.id === orderId);
    if (order?._backendId) {
      apiPut(`/api/orders/${order._backendId}/status`, { order_status: newStatus })
        .catch(() => {}); // Silent fail - local state already updated
    }
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
        // Also delete from backend if this is a backend review
        if (review._backendId) {
          apiDelete(`/api/reviews/${review._backendId}`).catch(() => {});
        }
      },
      "Delete Customer Review",
      "danger"
    );
  };

  // ── Gems CRUD (backend) ───────────────────────────────────────────────────
  const handleAddGem = async (e) => {
    e.preventDefault();
    if (!newGem.name.trim() || !newGem.category_id) {
      showCustomAlert("Gemstone name and category are required.", "Validation Error", "warning");
      return;
    }
    if (!hasValidGemNumbers(newGem)) {
      showCustomAlert(
        "Enter a price greater than zero, a whole-number stock quantity of zero or more, and non-negative measurements.",
        "Validation Error",
        "warning"
      );
      return;
    }
    setGemSaving(true);
    try {
      const payload = buildGemstonePayload(newGem, (name) => name.trim().toUpperCase());
      const res = await apiPost("/api/gemstones", payload);
      await readGemApiResponse(res, "Failed to add gemstone.");
      showCustomAlert(`Gemstone "${payload.name}" added successfully!`, "Gemstone Added", "success");
      setNewGem({
        name: "", category_id: "", color: "", carat: "",
        length: "", width: "", height: "",
        origin: "Ratnapura, Sri Lanka", price: "", stock: "1",
        clarity: "", cut: "", shape: "", treatment_status: "Unheated",
        description: "", status: "available"
      });
      await Promise.all([refreshGems(), refreshLowStock()]);
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
      showCustomAlert(
        "Enter a price greater than zero, a whole-number stock quantity of zero or more, and non-negative measurements.",
        "Validation Error",
        "warning"
      );
      return;
    }
    setGemSaving(true);
    try {
      const payload = buildGemstonePayload(editGem);
      const res = await apiPut(`/api/gemstones/${editGem.id}`, payload);
      await readGemApiResponse(res, "Failed to update gemstone.");
      showCustomAlert("Gemstone updated successfully!", "Updated", "success");
      setEditGem(null);
      await Promise.all([refreshGems(), refreshLowStock()]);
    } catch (error) {
      showCustomAlert(error.message || "Failed to update gemstone.", "Error", "danger");
    } finally {
      setGemSaving(false);
    }
  };

  const handleRestockGem = async (gemId, quantity) => {
    const qty = Number(quantity);
    if (!Number.isSafeInteger(qty) || qty < 1) {
      showCustomAlert("Enter a whole-number restock quantity greater than zero.", "Validation Error", "warning");
      return;
    }
    const gem = backendGems.find((g) => g.id === gemId);
    if (!gem) {
      showCustomAlert("This gemstone is no longer in the inventory. Refresh the list and try again.", "Gemstone Not Found", "warning");
      return;
    }
    try {
      const res = await apiPut(`/api/gemstones/${gemId}`, { stock: Number(gem.stock || 0) + qty });
      await readGemApiResponse(res, "Failed to restock gemstone.");
      await Promise.all([refreshGems(), refreshLowStock()]);
      setStockAdditions((c) => ({ ...c, [gemId]: 1 }));
      showCustomAlert(`${gem.name} restocked successfully.`, "Stock Updated", "success");
    } catch (error) {
      showCustomAlert(error.message || "Failed to restock gemstone.", "Error", "danger");
    }
  };

  const handleCertificateSave = async (event) => {
    event.preventDefault();
    if (!editCertificate) return;

    const certificateNumber = editCertificate.certificate_number.trim();
    const laboratory = editCertificate.laboratory.trim();
    if (!certificateNumber || !laboratory) {
      showCustomAlert(
        "Certificate number and laboratory are required.",
        "Validation Error",
        "warning"
      );
      return;
    }

    setCertificateSaving(true);
    try {
      const payload = {
        certificate_number: certificateNumber,
        laboratory,
        certificate_url: editCertificate.certificate_url.trim() || null,
        verification_status: editCertificate.verification_status,
        issue_date: editCertificate.issue_date || null
      };
      const formData = new FormData();
      if (!editCertificate.id) {
        formData.append("gemstone_id", String(editCertificate.gemstone_id));
      }
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });
      if (editCertificate.certificate_file) {
        formData.append("certificate", editCertificate.certificate_file);
      }
      const response = editCertificate.id
        ? await apiRequest(`/api/certificates/${editCertificate.id}`, {
            method: "PUT",
            body: formData
          })
        : await apiRequest("/api/certificates", {
            method: "POST",
            body: formData
          });
      await readGemApiResponse(response, "Failed to save gemstone certificate.");
      setEditCertificate(null);
      showCustomAlert(
        `Certificate ${editCertificate.id ? "updated" : "added"} for ${editCertificate.gemstone_name}.`,
        "Certificate Saved",
        "success"
      );
      await refreshCertificates();
    } catch (error) {
      showCustomAlert(error.message || "Failed to save gemstone certificate.", "Error", "danger");
    } finally {
      setCertificateSaving(false);
    }
  };

  const handleDeleteGem = (gemId, gemName) => {
    showCustomConfirm(
      `Are you sure you want to permanently remove "${gemName || "this gemstone"}" from the database?`,
      async () => {
        try {
          const res = await apiDelete(`/api/gemstones/${gemId}`);
          await readGemApiResponse(res, "Failed to delete gemstone.");
          showCustomAlert("Gemstone removed successfully.", "Removed", "success");
          await Promise.all([refreshGems(), refreshLowStock()]);
        } catch (error) {
          showCustomAlert(error.message || "Failed to delete gemstone.", "Error", "danger");
        }
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
          <img
            src="/logo.png"
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
          <a href="/gemstones">Shop</a>
          <a href="/About">Heritage</a>
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
                <strong>{backendGems.filter((gem) => isGemstoneActive(gem.status)).length} Gemstones</strong>
              </div>
            </div>
            <div className="admin-stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("STOCK")}>
              <div className="stat-icon blue"><FaTruck /></div>
              <div>
                <span>Low Stock Alerts</span>
                <strong>{lowStockGems.length} Items</strong>
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
              <FaGem /> Gems Management ({backendGems.length})
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "STOCK" ? "active" : ""}`}
              aria-pressed={activeTab === "STOCK"}
              onClick={() => setActiveTab("STOCK")}
            >
              <FaExclamationTriangle /> Stock Alert ({lowStockGems.length})
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
                  <p>Gemstones with 3 or fewer units remaining are flagged here. You can restock directly from the backend.</p>
                </div>
                <span className="admin-live-note">{lowStockGems.length} LOW STOCK ITEMS</span>
              </div>

              <div className="stock-alert-list">
                {lowStockError && (
                  <p className="admin-empty-state" role="alert" style={{ padding: "1rem", textAlign: "center" }}>
                    {lowStockError}{" "}
                    <button type="button" className="admin-action-btn" onClick={refreshLowStock}>Retry</button>
                  </p>
                )}
                {!lowStockError && lowStockGems.length === 0 && (
                  <p className="admin-empty-state" style={{ padding: "2rem", textAlign: "center" }}>All gemstones are sufficiently stocked. ✓</p>
                )}
                {lowStockGems.map((gem) => {
                  const quantity = Number(gem.stock ?? 0);
                  const stockStatus = quantity === 0 ? "out" : "low";
                  return (
                    <article className="stock-alert-row" key={gem.id}>
                      <div className="stock-alert-gem">
                        <strong>{gem.name}</strong>
                        <span>{gem.gemstone_id} • {gem.category_name || "Uncategorized"}</span>
                      </div>
                      <span className={`stock-alert-status ${stockStatus}`}>
                        {stockStatus === "out" ? "OUT OF STOCK" : "LOW STOCK"}
                      </span>
                      <strong className="stock-alert-quantity">{quantity} available</strong>
                      <form
                        className="stock-restock-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleRestockGem(gem.id, stockAdditions[gem.id] ?? 1);
                        }}
                      >
                        <label className="sr-only" htmlFor={`restock-${gem.id}`}>
                          Quantity to add for {gem.name}
                        </label>
                        <input
                          id={`restock-${gem.id}`}
                          type="number"
                          min="1"
                          step="1"
                          value={stockAdditions[gem.id] ?? 1}
                          onChange={(event) => setStockAdditions((current) => ({
                            ...current,
                            [gem.id]: event.target.value
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

          {/* TAB: GEMS MANAGEMENT (backend) */}
          {activeTab === "GEMS" && (
            <section className="admin-section">
              {/* ADD NEW GEM FORM */}
              <div className="add-gem-card">
                <h2><FaPlus /> Add New Gemstone to Inventory</h2>
                {categoriesError && (
                  <p className="admin-empty-state" role="alert" style={{ padding: "1rem" }}>
                    {categoriesError}{" "}
                    <button type="button" className="admin-action-btn" onClick={refreshCategories}>Retry</button>
                  </p>
                )}
                <form onSubmit={handleAddGem} className="add-gem-form">
                  <div className="form-group">
                    <label>Gemstone Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. CEYLON BLUE SAPPHIRE"
                      value={newGem.name}
                      onChange={(e) => setNewGem({ ...newGem, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={newGem.category_id}
                      onChange={(e) => setNewGem({ ...newGem, category_id: e.target.value })}
                      required
                    >
                      <option value="">— Select Category —</option>
                      {backendCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Cornflower Blue"
                      value={newGem.color}
                      onChange={(e) => setNewGem({ ...newGem, color: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Carat Weight</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 3.45"
                      value={newGem.carat}
                      onChange={(e) => setNewGem({ ...newGem, carat: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Length (mm)</label>
                    <input type="number" min="0" step="0.01" value={newGem.length} onChange={(e) => setNewGem({ ...newGem, length: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Width (mm)</label>
                    <input type="number" min="0" step="0.01" value={newGem.width} onChange={(e) => setNewGem({ ...newGem, width: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Height (mm)</label>
                    <input type="number" min="0" step="0.01" value={newGem.height} onChange={(e) => setNewGem({ ...newGem, height: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Price (USD $) *</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="e.g. 15000"
                      value={newGem.price}
                      onChange={(e) => setNewGem({ ...newGem, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 1"
                      value={newGem.stock}
                      onChange={(e) => setNewGem({ ...newGem, stock: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Origin</label>
                    <input
                      type="text"
                      placeholder="e.g. Ratnapura, Sri Lanka"
                      value={newGem.origin}
                      onChange={(e) => setNewGem({ ...newGem, origin: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Shape</label>
                    <input
                      type="text"
                      placeholder="e.g. Oval, Round, Cushion"
                      value={newGem.shape}
                      onChange={(e) => setNewGem({ ...newGem, shape: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Clarity</label>
                    <input
                      type="text"
                      placeholder="e.g. Eye Clean"
                      value={newGem.clarity}
                      onChange={(e) => setNewGem({ ...newGem, clarity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cut</label>
                    <input
                      type="text"
                      placeholder="e.g. Mixed Cut"
                      value={newGem.cut}
                      onChange={(e) => setNewGem({ ...newGem, cut: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Treatment</label>
                    <select
                      value={newGem.treatment_status}
                      onChange={(e) => setNewGem({ ...newGem, treatment_status: e.target.value })}
                    >
                      <option>Unheated</option>
                      <option>Heated</option>
                      <option>No indication of heating</option>
                      <option>Beryllium treated</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Description</label>
                    <textarea
                      placeholder="Brief description of this gemstone..."
                      rows={3}
                      value={newGem.description}
                      onChange={(e) => setNewGem({ ...newGem, description: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #d4b96a", resize: "vertical" }}
                    />
                  </div>
                  <button type="submit" className="add-gem-submit-btn" disabled={gemSaving}>
                    {gemSaving ? "Saving…" : <><FaPlus /> ADD GEMSTONE TO INVENTORY</>}
                  </button>
                </form>
              </div>

              <section className="admin-section" style={{ marginTop: "2rem" }}>
                <div className="admin-section-heading">
                  <div>
                    <h2><FaFileInvoice /> Gemstone Certificate Management</h2>
                    <p>Add, review, and update certificates for gemstones in your inventory.</p>
                  </div>
                  <span className="admin-live-note">
                    {Object.keys(certificatesByGemstone).length} CERTIFICATES
                  </span>
                </div>
                {certificatesError ? (
                  <p className="admin-empty-state" role="alert" style={{ padding: "1rem", textAlign: "center" }}>
                    {certificatesError}{" "}
                    <button type="button" className="admin-action-btn" onClick={refreshCertificates}>
                      Retry certificate loading
                    </button>
                  </p>
                ) : !certificatesLoaded ? (
                  <p className="admin-empty-state" style={{ padding: "1rem", textAlign: "center" }}>
                    Loading gemstone certificates…
                  </p>
                ) : backendGems.length === 0 ? (
                  <p className="admin-empty-state" style={{ padding: "1rem", textAlign: "center" }}>
                    Add a gemstone to inventory before attaching its certificate.
                  </p>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Gemstone</th>
                          <th>Certificate Number</th>
                          <th>Laboratory</th>
                          <th>Verification</th>
                          <th>Certificate File</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backendGems.map((gem) => {
                          const certificate = certificatesByGemstone[String(gem.id)];
                          return (
                            <tr key={gem.id}>
                              <td><strong>{gem.name}</strong></td>
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
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* GEMS INVENTORY LIST */}
              <div className="admin-section-heading" style={{ marginTop: "2rem" }}>
                <div>
                  <h2><FaGem /> Live Gemstones Inventory ({backendGems.length})</h2>
                  <p>All gemstones are fetched live from the database. Click Edit to modify or Remove to delete.</p>
                </div>
                {gemsLoading && <span className="admin-live-note">LOADING…</span>}
                {!gemsLoading && <span className="admin-live-note">{backendGems.length} GEMS IN DB</span>}
              </div>
              {gemstonesError && (
                <p className="admin-empty-state" role="alert" style={{ padding: "1rem", textAlign: "center" }}>
                  {gemstonesError}{" "}
                  <button
                    type="button"
                    className="admin-action-btn"
                    onClick={() => {
                      refreshGems();
                      refreshLowStock();
                    }}
                  >
                    Retry
                  </button>
                </p>
              )}
              {certificatesError && (
                <p className="admin-empty-state" role="alert" style={{ padding: "1rem", textAlign: "center" }}>
                  {certificatesError}{" "}
                  <button type="button" className="admin-action-btn" onClick={refreshCertificates}>
                    Retry certificate loading
                  </button>
                </p>
              )}
              <div className="admin-gems-grid">
                {backendGems.map((gem) => (
                  <div className="admin-gem-card" key={gem.id}>
                    <div className="admin-gem-body" style={{ paddingTop: "1rem" }}>
                      <span className="gem-tag">{gem.category_name || "NATURAL CEYLON"}</span>
                      <span className={`gem-review-status status-${isGemstoneActive(gem.status) ? "approved" : "rejected"}`} style={{ marginLeft: "6px" }}>
                        {isGemstoneActive(gem.status) ? "ACTIVE" : "INACTIVE"}
                      </span>
                      <h3>{gem.name}</h3>
                      <p>{gem.carat ? `${gem.carat} Ct` : "—"} • {gem.origin || "Ceylon"}</p>
                      {gem.color && <p style={{ fontSize: "0.8rem", color: "#6a7b77" }}>Color: {gem.color} | Shape: {gem.shape || "—"}</p>}
                      <strong className="gem-price">${Number(gem.price || 0).toLocaleString()} USD</strong>
                      <p style={{ fontSize: "0.78rem", color: Number(gem.stock) <= 3 ? "#c0392b" : "#27ae60", fontWeight: "700" }}>
                        Stock: {gem.stock ?? 0} units {Number(gem.stock) <= 3 ? "⚠ LOW" : "✓"}
                      </p>
                      {certificatesByGemstone[String(gem.id)] && (
                        <p style={{ fontSize: "0.78rem", color: "#6a7b77" }}>
                          Certificate: {certificatesByGemstone[String(gem.id)].certificate_number}
                          {" · "}
                          {certificatesByGemstone[String(gem.id)].laboratory}
                        </p>
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
                        <button
                          type="button"
                          className="admin-action-btn"
                          style={{ marginRight: "6px" }}
                          onClick={() => setEditGem({
                            id: gem.id,
                            name: gem.name,
                            category_id: gem.category_id,
                            color: gem.color || "",
                            carat: gem.carat ?? "",
                            length: gem.length ?? "",
                            width: gem.width ?? "",
                            height: gem.height ?? "",
                            origin: gem.origin || "",
                            price: gem.price || "",
                            stock: gem.stock ?? 0,
                            clarity: gem.clarity || "",
                            cut: gem.cut || "",
                            shape: gem.shape || "",
                            treatment_status: gem.treatment_status || "Unheated",
                            description: gem.description || "",
                            status: isGemstoneActive(gem.status) ? "available" : "inactive"
                          })}
                        >
                          ✏ Edit
                        </button>
                        <button
                          type="button"
                          className="gem-delete-btn"
                          onClick={() => handleDeleteGem(gem.id, gem.name)}
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!gemsLoading && !gemstonesError && backendGems.length === 0 && (
                  <p className="admin-empty-state" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem" }}>
                    No gemstones found in the database. Add your first gem above.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* EDIT GEM MODAL */}
          {editGem && (
            <div className="admin-modal-backdrop" onClick={() => setEditGem(null)}>
              <section
                className="admin-account-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-gem-title"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "700px", width: "95vw" }}
              >
                <div className="admin-account-modal-heading">
                  <div><span>EDIT GEMSTONE</span><h3 id="edit-gem-title">{editGem.name}</h3></div>
                  <button type="button" className="admin-modal-close" aria-label="Close edit gem" onClick={() => setEditGem(null)}><FaTimes /></button>
                </div>
                <form className="add-gem-form" onSubmit={handleEditGemSave} style={{ padding: "1.5rem" }}>
                  <div className="form-group">
                    <label>Name *</label>
                    <input value={editGem.name} onChange={(e) => setEditGem({ ...editGem, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select value={editGem.category_id} onChange={(e) => setEditGem({ ...editGem, category_id: e.target.value })} required>
                      <option value="">— Select Category —</option>
                      {backendCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Color</label>
                    <input value={editGem.color} onChange={(e) => setEditGem({ ...editGem, color: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Carat</label>
                    <input type="number" min="0" step="0.01" value={editGem.carat} onChange={(e) => setEditGem({ ...editGem, carat: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Length (mm)</label>
                    <input type="number" min="0" step="0.01" value={editGem.length} onChange={(e) => setEditGem({ ...editGem, length: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Width (mm)</label>
                    <input type="number" min="0" step="0.01" value={editGem.width} onChange={(e) => setEditGem({ ...editGem, width: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Height (mm)</label>
                    <input type="number" min="0" step="0.01" value={editGem.height} onChange={(e) => setEditGem({ ...editGem, height: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Price (USD) *</label>
                    <input type="number" min="0.01" step="0.01" value={editGem.price} onChange={(e) => setEditGem({ ...editGem, price: e.target.value })} required />
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
                      <option>Unheated</option>
                      <option>Heated</option>
                      <option>No indication of heating</option>
                      <option>Beryllium treated</option>
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
                  <div className="admin-account-modal-actions" style={{ gridColumn: "1 / -1" }}>
                    <button type="button" className="admin-modal-cancel" onClick={() => setEditGem(null)}>Cancel</button>
                    <button type="submit" className="add-gem-submit-btn" disabled={gemSaving}>{gemSaving ? "Saving…" : "Save Changes"}</button>
                  </div>
                </form>
              </section>
            </div>
          )}
          {editCertificate && (
            <div className="admin-modal-backdrop" onClick={() => !certificateSaving && setEditCertificate(null)}>
              <section
                className="admin-account-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="certificate-modal-title"
                onClick={(event) => event.stopPropagation()}
                style={{ maxWidth: "700px", width: "95vw" }}
              >
                <div className="admin-account-modal-heading">
                  <div>
                    <span>GEMSTONE CERTIFICATE</span>
                    <h3 id="certificate-modal-title">
                      {editCertificate.id ? "Edit Certificate" : "Add Certificate"} — {editCertificate.gemstone_name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="admin-modal-close"
                    aria-label="Close certificate form"
                    onClick={() => setEditCertificate(null)}
                    disabled={certificateSaving}
                  >
                    <FaTimes />
                  </button>
                </div>
                <form className="add-gem-form" onSubmit={handleCertificateSave} style={{ padding: "1.5rem" }}>
                  <div className="form-group">
                    <label>Certificate Number *</label>
                    <input
                      value={editCertificate.certificate_number}
                      onChange={(event) => setEditCertificate({
                        ...editCertificate,
                        certificate_number: event.target.value
                      })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Laboratory *</label>
                    <input
                      value={editCertificate.laboratory}
                      onChange={(event) => setEditCertificate({
                        ...editCertificate,
                        laboratory: event.target.value
                      })}
                      placeholder="e.g. GIA, GRS, SSEF"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Certificate URL</label>
                    <input
                      type="text"
                      value={editCertificate.certificate_url}
                      onChange={(event) => setEditCertificate({
                        ...editCertificate,
                        certificate_url: event.target.value
                      })}
                      placeholder="Link to the laboratory certificate"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Certificate File (JPG, PNG or PDF — optional)</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                      onChange={(event) => setEditCertificate({
                        ...editCertificate,
                        certificate_file: event.target.files?.[0] || null
                      })}
                    />
                    <small>Maximum file size: 10 MB. Choose a file or provide a certificate URL.</small>
                    {editCertificate.certificate_file && (
                      <small>Selected file: {editCertificate.certificate_file.name}</small>
                    )}
                    {!editCertificate.certificate_file && editCertificate.certificate_url && (
                      <a
                        href={/^https?:\/\//i.test(editCertificate.certificate_url)
                          ? editCertificate.certificate_url
                          : `${API_BASE_URL}${editCertificate.certificate_url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View current certificate file
                      </a>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Verification Status</label>
                    <select
                      value={editCertificate.verification_status}
                      onChange={(event) => setEditCertificate({
                        ...editCertificate,
                        verification_status: event.target.value
                      })}
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Issue Date</label>
                    <input
                      type="date"
                      value={editCertificate.issue_date}
                      onChange={(event) => setEditCertificate({
                        ...editCertificate,
                        issue_date: event.target.value
                      })}
                    />
                  </div>
                  <div className="admin-account-modal-actions" style={{ gridColumn: "1 / -1" }}>
                    <button
                      type="button"
                      className="admin-modal-cancel"
                      onClick={() => setEditCertificate(null)}
                      disabled={certificateSaving}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="add-gem-submit-btn" disabled={certificateSaving}>
                      {certificateSaving ? "Saving…" : "Save Certificate"}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="about-footer">
        <div className="about-footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="Ceylon Royal Gemstones" />
              <div><strong>CEYLON</strong><small>ROYAL GEMSTONES</small></div>
            </div>
            <p>Discover the timeless beauty of authentic Sri Lankan gemstones, carefully sourced, crafted and presented with royal elegance.</p>
          </div>
          <div>
            <h4>EXPLORE</h4>
            <a href="/">Home</a>
            <a href="/gemstones">Shop</a>
            <a href="/About">Our Heritage</a>
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
          <p>© 2026 Ceylon Royal Gemstones. All Rights Reserved.</p>
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
                <img src="/logo.png" alt="Ceylon Royal Gemstones" />
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
