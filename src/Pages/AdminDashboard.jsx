import { useState } from "react";
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
import { products } from "./Gemstones.jsx";
import {
  getCollectionItemKey,
  useSharedCollection
} from "../useSharedCollection.js";
import {
  LOW_STOCK_THRESHOLD,
  useGemInventory
} from "../useGemInventory.js";
import { useGemSubmissions } from "../useGemSubmissions.js";
import { useCustomerReviews } from "../useCustomerReviews.js";
import {
  endAdminSession,
  hashAdminPassword,
  readAdminAccounts,
  readAdminSession,
  writeAdminAccounts
} from "../adminAccess.js";
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

const AdminDashboard = ({ isSuperAdmin = false }) => {
  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("ORDERS");
  const [adminOrders, setAdminOrders] = useState(initialAdminOrders);
  const [gemSubmissions, setGemSubmissions] = useGemSubmissions();
  const [deletedGemIds, setDeletedGemIds] = useState([]);
  const gemsList = [
    ...products,
    ...gemSubmissions.map((submission) => submission.gem)
  ].filter((gem) => !deletedGemIds.includes(gem.id));
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
    carat: "",
    origin: "Ratnapura, Sri Lanka",
    price: "",
    tag: "CERTIFIED NATURAL",
    image: "/blueGem.jpg"
  });

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

  const handleAddGem = (e) => {
    e.preventDefault();
    if (!newGem.name || !newGem.price) return;

    const gemId = Date.now();
    const createdGem = {
      id: gemId,
      detailId: gemId,
      productKey: `${newGem.name.toLowerCase().replace(/\s+/g, "-")}-${gemId}`,
      name: newGem.name.toUpperCase(),
      category: "Other Gemstone",
      origin: newGem.origin,
      carat: newGem.carat ? Number.parseFloat(newGem.carat) : 3,
      basePriceUSD: Number(newGem.price),
      price: Number(newGem.price),
      image: newGem.image || "/blueGem.jpg",
      tag: newGem.tag || "CERTIFIED NATURAL"
    };

    setGemSubmissions((current) => [
      ...current,
      {
        id: gemId,
        gem: createdGem,
        status: "pending",
        submittedAt: new Date().toISOString()
      }
    ]);
    setInventory((current) => ({
      ...current,
      [getCollectionItemKey(createdGem)]: current[getCollectionItemKey(createdGem)] ?? 1
    }));
    setNewGem({
      name: "",
      carat: "",
      origin: "Ratnapura, Sri Lanka",
      price: "",
      tag: "CERTIFIED NATURAL",
      image: "/blueGem.jpg"
    });
    showCustomAlert(
      `"${createdGem.name}" has been submitted for Super Admin approval.`,
      "Gemstone Submitted",
      "success"
    );
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
                      <img src={gem.image} alt="" />
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

          {/* TAB 2: GEMS MANAGEMENT */}
          {activeTab === "GEMS" && (
            <section className="admin-section">
              {/* ADD NEW GEM FORM */}
              <div className="add-gem-card">
                <h2><FaPlus /> Add New Gemstone to Inventory</h2>
                <form onSubmit={handleAddGem} className="add-gem-form">
                  <div className="form-group">
                    <label>Gemstone Name</label>
                    <input
                      type="text"
                      placeholder="e.g. CEYLON RUBY / PINK SAPPHIRE"
                      value={newGem.name}
                      onChange={(e) => setNewGem({ ...newGem, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Carat Weight</label>
                    <input
                      type="text"
                      placeholder="e.g. 3.45 Ct"
                      value={newGem.carat}
                      onChange={(e) => setNewGem({ ...newGem, carat: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (USD $)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={newGem.price}
                      onChange={(e) => setNewGem({ ...newGem, price: e.target.value })}
                      required
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
                    <label>Certification Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. CERTIFIED NATURAL"
                      value={newGem.tag}
                      onChange={(e) => setNewGem({ ...newGem, tag: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="text"
                      placeholder="/blueGem.jpg"
                      value={newGem.image}
                      onChange={(e) => setNewGem({ ...newGem, image: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="add-gem-submit-btn">
                    <FaPlus /> ADD GEMSTONE TO INVENTORY
                  </button>
                </form>
              </div>

              {/* GEMS INVENTORY LIST */}
              <h2><FaGem /> Current Gemstones Inventory ({gemsList.length})</h2>
              <div className="admin-gems-grid">
                {gemsList.map((gem) => {
                  const reviewStatus = gemSubmissions.find(
                    (submission) => submission.gem.id === gem.id
                  )?.status;

                  return (
                    <div className="admin-gem-card" key={gem.id}>
                    <img
                      src={gem.image}
                      alt={gem.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/blueGem.jpg";
                      }}
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
                      <strong className="gem-price">${Number(gem.basePriceUSD || gem.price || 0).toLocaleString()} USD</strong>
                      <div className="admin-gem-actions">
                        <button
                          type="button"
                          className="gem-delete-btn"
                          onClick={() => handleDeleteGem(gem.id)}
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
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
