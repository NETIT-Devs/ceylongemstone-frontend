import { useCallback, useEffect, useRef, useState } from "react";
import ShopNavDropdown from "../components/ShopNavDropdown.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import {
  FaGem,
  FaCrown,
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
  FaUpload,
  FaBan,
  FaEdit,
  FaSync,
  FaPercent,
  FaCalendarAlt
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
import { useManagedBlogPosts } from "../useSiteContent.js";
import { TREATMENT_OPTIONS } from "../treatments.js";
import { formatProductOfferEndDate, withActiveProductOffer } from "../productOffers.js";
import {
  endAdminSession,
  readAdminSession,
  writeAdminAccounts
} from "../adminAccess.js";
import { API_BASE_URL, apiGet, apiPost, apiPut, apiDelete, apiRequest, resolveMediaUrl } from "../services/api.js";
import "./AdminDashboard.css";
import "./About.css";
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";

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

const toLocalDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateRangeForPreset = (preset) => {
  const today = new Date();
  const endDate = toLocalDateInputValue(today);
  if (preset === "today") {
    return { startDate: endDate, endDate };
  }

  if (preset === "this-year") {
    return {
      startDate: toLocalDateInputValue(new Date(today.getFullYear(), 0, 1)),
      endDate
    };
  }

  return {
    startDate: toLocalDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate
  };
};

const createShipmentForm = (order, existingShipment, shippingMethods) => {
  const defaultDelivery = new Date();
  defaultDelivery.setDate(defaultDelivery.getDate() + 5);
  return {
    courier: existingShipment?.courier || "DHL Express",
    tracking_number:
      existingShipment?.tracking_number ||
      `CRG-${order.dbId || "TRK"}-${Date.now().toString().slice(-6)}`,
    shipping_method_id:
      existingShipment?.shipping_method_id || (shippingMethods[0]?.id || 2),
    estimated_delivery: existingShipment?.estimated_delivery
      ? String(existingShipment.estimated_delivery).slice(0, 10)
      : defaultDelivery.toISOString().slice(0, 10),
    status: existingShipment?.status ||
      (order.status === "DELIVERED" ? "DELIVERED" : "SHIPPED")
  };
};

const AdminDashboard = ({ isSuperAdmin = false }) => {
  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("ORDERS");
  const [dashboardStats, setDashboardStats] = useState({
    gemstoneInventory: 0,
    jewelleryInventory: 0,
    totalOrders: 0,
    shipmentsInTransit: 0
  });
  const [dateRangePreset, setDateRangePreset] = useState("this-month");
  const [dateRangeDraft, setDateRangeDraft] = useState(() =>
    getDateRangeForPreset("this-month")
  );
  const [appliedDateRange, setAppliedDateRange] = useState(() =>
    getDateRangeForPreset("this-month")
  );
  const [adminOrders, setAdminOrders] = useState([]);
  const [backendGems, setBackendGems] = useState([]);
  const [backendCategories, setBackendCategories] = useState([]);
  const [databaseGemApprovals, setDatabaseGemApprovals] = useState([]);
  const [databaseJewelleryApprovals, setDatabaseJewelleryApprovals] = useState([]);
  const [gemApprovalsError, setGemApprovalsError] = useState("");
  const [jewelleryApprovalsError, setJewelleryApprovalsError] = useState("");
  const [gemApprovalsLoading, setGemApprovalsLoading] = useState(false);
  const [jewelleryApprovalsLoading, setJewelleryApprovalsLoading] = useState(false);
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
  const [gemProductOverrides] = useGemProductOverrides();
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
  const storefrontGemsList = gemsList.filter(
    (gem) => !gem.approval_status || gem.approval_status === "approved"
  );

  const [inventory] = useGemInventory(products);
  const [stockAdditions, setStockAdditions] = useState({});
  const [lowStockItems, setLowStockItems] = useState([]);
  const [lowStockLoading, setLowStockLoading] = useState(false);
  const [lowStockError, setLowStockError] = useState("");
  const [restockingItemKey, setRestockingItemKey] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [backendCustomerReviews, setBackendCustomerReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [updatingReviewId, setUpdatingReviewId] = useState(null);
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [adminAccountsLoading, setAdminAccountsLoading] = useState(false);
  const [adminAccountsError, setAdminAccountsError] = useState("");
  const [newAdminAccount, setNewAdminAccount] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [isAdminSaving, setIsAdminSaving] = useState(false);
  const [selectedAdminAccount, setSelectedAdminAccount] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [backendShipments, setBackendShipments] = useState([]);
  const backendShipmentsRef = useRef(backendShipments);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [activeShipmentOrder, setActiveShipmentOrder] = useState(null);
  const [shipmentSaving, setShipmentSaving] = useState(false);
  const [shipmentForm, setShipmentForm] = useState({
    courier: "DHL Express",
    tracking_number: "",
    shipping_method_id: "",
    estimated_delivery: "",
    status: "SHIPPED"
  });
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
    product_name: "",
    jewellery_type: "Necklaces",
    gemstone_type: "",
    color: "",
    description: "",
    material: "",
    price: "",
    currency: "USD",
    stock_quantity: "1",
    image_url: "",
    offer_rate: "",
    offer_start_date: "",
    offer_end_date: "",
    is_handcrafted: true,
    status: "active"
  });
  const [editGem, setEditGem] = useState(null); // gem being edited
  const [editGemFiles, setEditGemFiles] = useState({});
  const [gemSaving, setGemSaving] = useState(false);
  const [editCertificate, setEditCertificate] = useState(null);
  const [certificateSaving, setCertificateSaving] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificateDeleting, setCertificateDeleting] = useState(null);

  // ─── Backend jewellery state ────────────────────────────────────────────────
  const [backendJewellery, setBackendJewellery] = useState([]);
  const [jewelleryLoading, setJewelleryLoading] = useState(false);
  const [jewelleryError, setJewelleryError] = useState("");
  const [jewellerySaving, setJewellerySaving] = useState(false);
  const [editingDbJewelleryId, setEditingDbJewelleryId] = useState(null);
  const [jewelleryImageFile, setJewelleryImageFile] = useState(null);
  const [jewelleryTypeFilter, setJewelleryTypeFilter] = useState("all");
  const filteredBackendJewellery = backendJewellery.filter(
    (item) => jewelleryTypeFilter === "all" ||
      String(item.jewellery_type || "").trim().toLowerCase() === jewelleryTypeFilter.toLowerCase()
  );

  const jewelleryList = [
    ...backendJewellery.map((item) => ({
      id: item.id,
      productKey: item.product_code || `jewellery-db-${item.id}`,
      product_code: item.product_code,
      name: item.product_name,
      discountRate: item.discountRate ?? item.offer_rate,
      offerStartDate: item.offerStartDate ?? item.offer_start_date,
      offerEndDate: item.offerEndDate ?? item.offer_end_date,
      category: item.jewellery_type || "Jewellery",
      color: item.color || "—",
      shape: item.gemstone_type || item.jewellery_type || "Jewellery",
      basePriceUSD: Number(item.price) || 0,
      price: Number(item.price) || 0,
      image: resolveMediaUrl(item.image_url) || "/BlueBracelete.jpg",
      isDbItem: true,
      status: item.status,
      ...item
    })),
    ...jewelleryProducts
      .map((item) => ({
        ...item,
        ...jewelleryProductOverrides[String(item.id)]
      }))
      .filter((item) => !item.deleted),
    ...jewellerySubmissions.map((submission) => submission.jewellery)
  ];
  const storefrontJewelleryList = jewelleryList.filter((item) =>
    item.isDbItem
      ? ["active", "approved"].includes(String(item.status || "").toLowerCase())
      : !["pending", "rejected", "inactive", "draft"].includes(String(item.status || "").toLowerCase())
  );

  const refreshDashboardStats = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        startDate: appliedDateRange.startDate,
        endDate: appliedDateRange.endDate
      });
      const response = await apiGet(`/api/dashboard/stats?${params.toString()}`);
      const data = await readGemApiResponse(response, "Unable to load dashboard statistics.");
      if (!data.data || !Number.isFinite(Number(data.data.active_gemstones)) ||
          !Number.isFinite(Number(data.data.active_jewellery)) ||
          !Number.isFinite(Number(data.data.total_orders)) ||
          !Number.isFinite(Number(data.data.shipments_in_transit))) {
        throw new Error("The dashboard statistics service returned invalid data.");
      }
      setDashboardStats({
        gemstoneInventory: Number(data.data.active_gemstones),
        jewelleryInventory: Number(data.data.active_jewellery),
        totalOrders: Number(data.data.total_orders),
        shipmentsInTransit: Number(data.data.shipments_in_transit)
      });
      return true;
    } catch (error) {
      console.error("Unable to load dashboard statistics:", error);
      return false;
    }
  }, [appliedDateRange.startDate, appliedDateRange.endDate]);

  // helper – re-fetch gems list
  const refreshGems = useCallback(async () => {
    setGemsLoading(true);
    setGemstonesError("");
    try {
      const response = await apiGet("/api/gemstones");
      const data = await readGemApiResponse(response, "Unable to load gemstones.");
      if (!Array.isArray(data.data)) {
        throw new Error("The gemstone service returned an invalid inventory.");
      }
      setBackendGems(data.data);
      await refreshDashboardStats();
      return true;
    } catch (error) {
      setGemstonesError(error instanceof Error ? error.message : "Unable to load gemstones.");
      return false;
    } finally {
      setGemsLoading(false);
    }
  }, [refreshDashboardStats]);

  const refreshCategories = useCallback(async () => {
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
  }, []);

  const refreshGemApprovals = useCallback(async () => {
    setGemApprovalsLoading(true);
    setGemApprovalsError("");
    try {
      const response = await apiGet("/api/gemstones/pending-approvals");
      const data = await readGemApiResponse(response, "Unable to load pending gemstone approvals.");
      if (!Array.isArray(data.data)) {
        throw new Error("The gemstone approval service returned invalid data.");
      }
      setDatabaseGemApprovals(data.data);
      return true;
    } catch (error) {
      setGemApprovalsError(error instanceof Error ? error.message : "Unable to load pending gemstone approvals.");
      return false;
    } finally {
      setGemApprovalsLoading(false);
    }
  }, []);

  const refreshJewelleryApprovals = useCallback(async () => {
    setJewelleryApprovalsLoading(true);
    setJewelleryApprovalsError("");
    try {
      const response = await apiGet("/api/jewellery/pending-approvals");
      const data = await readGemApiResponse(response, "Unable to load pending jewellery approvals.");
      if (!Array.isArray(data.data)) {
        throw new Error("The jewellery approval service returned invalid data.");
      }
      setDatabaseJewelleryApprovals(data.data);
      return true;
    } catch (error) {
      setJewelleryApprovalsError(error instanceof Error ? error.message : "Unable to load pending jewellery approvals.");
      return false;
    } finally {
      setJewelleryApprovalsLoading(false);
    }
  }, []);

  const refreshLowStock = useCallback(async () => {
    setLowStockLoading(true);
    setLowStockError("");
    try {
      const response = await apiGet("/api/dashboard/low-stock");
      const data = await readGemApiResponse(response, "Unable to load low-stock inventory.");
      if (!Array.isArray(data.data)) {
        throw new Error("The dashboard service returned invalid low-stock data.");
      }
      setLowStockItems(data.data);
      return true;
    } catch (error) {
      setLowStockError(error instanceof Error ? error.message : "Unable to load low-stock inventory.");
      return false;
    } finally {
      setLowStockLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    Promise.resolve().then(() => {
      if (isCurrent) refreshDashboardStats();
    });

    return () => {
      isCurrent = false;
    };
  }, [refreshDashboardStats]);

  const selectDateRangePreset = (preset) => {
    setDateRangePreset(preset);
    if (preset !== "custom") {
      const range = getDateRangeForPreset(preset);
      setDateRangeDraft(range);
      setAppliedDateRange(range);
    }
  };

  const applyCustomDateRange = (event) => {
    event.preventDefault();
    if (
      dateRangeDraft.startDate &&
      dateRangeDraft.endDate &&
      dateRangeDraft.startDate <= dateRangeDraft.endDate
    ) {
      setDateRangePreset("custom");
      setAppliedDateRange(dateRangeDraft);
    }
  };

  const refreshCertificates = useCallback(async () => {
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
  }, []);

  // ─── Refresh backend jewellery list ──────────────────────────────────────────
  const refreshJewellery = useCallback(async () => {
    setJewelleryLoading(true);
    setJewelleryError("");
    try {
      const response = await apiGet("/api/jewellery");
      const data = await readGemApiResponse(response, "Unable to load jewellery.");
      if (!Array.isArray(data.data)) throw new Error("Invalid jewellery response.");
      setBackendJewellery(data.data);
      await refreshDashboardStats();
      return true;
    } catch (error) {
      setJewelleryError(error instanceof Error ? error.message : "Unable to load jewellery.");
      return false;
    } finally {
      setJewelleryLoading(false);
    }
  }, [refreshDashboardStats]);

  const refreshReviews = useCallback(async () => {
    setReviewsLoading(true);
    setReviewsError("");
    try {
      const response = await apiGet("/api/reviews/admin");
      const data = await readGemApiResponse(response, "Unable to load customer reviews.");
      if (!Array.isArray(data.data)) {
        throw new Error("The review service returned invalid review data.");
      }
      setBackendCustomerReviews(data.data.map((review) => ({
        ...review,
        id: Number(review.id),
        name: review.name || "Customer",
        email: review.email || "",
        location: review.gemstone_name || "General review",
        rating: Number(review.rating),
        createdAt: review.created_at,
      })));
      return true;
    } catch (error) {
      setReviewsError(error instanceof Error ? error.message : "Unable to load customer reviews.");
      return false;
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const refreshAdminAccounts = useCallback(async () => {
    if (!isSuperAdmin) return false;

    setAdminAccountsLoading(true);
    setAdminAccountsError("");
    try {
      const response = await apiGet("/api/auth/admin-users");
      const data = await readGemApiResponse(response, "Unable to load database admin accounts.");
      if (!Array.isArray(data.users)) {
        throw new Error("The admin account service returned invalid data.");
      }

      const accounts = data.users.map((user) => ({
        id: Number(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: String(user.role).toLowerCase() === "super_admin"
          ? "super-admin"
          : "admin",
        status: Number(user.status) === 1 ? "active" : "inactive",
        approvalStatus: user.approval_status,
        createdAt: user.created_at,
        source: "backend"
      }));

      setAdminAccounts(accounts);
      writeAdminAccounts(accounts);
      return true;
    } catch (error) {
      setAdminAccountsError(
        error instanceof Error
          ? error.message
          : "Unable to load database admin accounts."
      );
      return false;
    } finally {
      setAdminAccountsLoading(false);
    }
  }, [isSuperAdmin]);

  // ─── Refresh Shipping Methods ───────────────────────────────────────────────
  const refreshShippingMethods = useCallback(async () => {
    try {
      const response = await apiGet("/api/shipping");
      const data = await readGemApiResponse(response, "Unable to load shipping methods.");
      if (Array.isArray(data.shipping_methods)) {
        setShippingMethods(data.shipping_methods);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  // ─── Refresh Shipments ──────────────────────────────────────────────────────
  const refreshShipments = useCallback(async () => {
    try {
      const response = await apiGet("/api/shipping/shipments");
      const data = await readGemApiResponse(response, "Unable to load shipments.");
      if (Array.isArray(data.shipments)) {
        backendShipmentsRef.current = data.shipments;
        setBackendShipments(data.shipments);
        return data.shipments;
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  // ─── Refresh Backend Orders & Payments Ledger ───────────────────────────────
  const refreshOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      let shipments = backendShipmentsRef.current;
      try {
        const shipRes = await apiGet("/api/shipping/shipments");
        const shipData = await shipRes.json();
        if (shipData.success && Array.isArray(shipData.shipments)) {
          shipments = shipData.shipments;
          backendShipmentsRef.current = shipments;
          setBackendShipments(shipments);
        }
      } catch {
        // Keep existing shipments
      }

      const params = new URLSearchParams({
        startDate: appliedDateRange.startDate,
        endDate: appliedDateRange.endDate
      });
      const response = await apiGet(`/api/orders?${params.toString()}`);
      const data = await readGemApiResponse(response, "Unable to load orders.");
      if (!Array.isArray(data.data)) {
        throw new Error("The order service returned invalid order data.");
      }
      if (data.success && Array.isArray(data.data)) {
        const mappedOrders = data.data.map((o) => {
          const matchingShipment = shipments.find((s) => Number(s.order_id) === Number(o.id));
          const orderTotal = Number(o.final_total ?? o.total_amount ?? 0);
          return {
            id: o.order_number || `ORD-${o.id}`,
            dbId: o.id,
            orderNumber: o.order_number || `ORD-${o.id}`,
            customerName: o.customer_name || "—",
            customerEmail: o.customer_email || "—",
            shippingAddress: o.shipping_address || "—",
            totalAmount: orderTotal,
            currency: o.currency || "USD",
            shippingCost: Number(o.shipping_cost || 0),
            paymentStatus: o.payment_status || "PENDING",
            status: o.order_status || "PENDING",
            date: o.created_at ? String(o.created_at).slice(0, 10) : "",
            createdAt: o.created_at,
            items: Array.isArray(o.items) ? o.items : [],
            shipment: matchingShipment || null,
            tracking: matchingShipment?.tracking_number || "Not assigned",
            courier: matchingShipment?.courier || "",
            shipmentStatus: matchingShipment?.status || (o.order_status === "DELIVERED" ? "DELIVERED" : o.order_status === "SHIPPED" ? "SHIPPED" : "PENDING")
          };
        });

        setAdminOrders(mappedOrders);
        const mappedPayments = mappedOrders.map((o) => ({
          id: `PAY-${o.dbId}-${String(o.id).slice(-4)}`,
          orderId: o.id,
          orderDbId: o.dbId,
          customerName: o.customerName,
          date: o.date,
          method: "Not recorded",
          amount: o.totalAmount,
          status: o.paymentStatus === "PAID" ? "SETTLED" : o.paymentStatus
        }));
        setPayments(mappedPayments);
        await refreshDashboardStats();
        return true;
      }
      return false;
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : "Unable to load orders.");
      return false;
    } finally {
      setOrdersLoading(false);
    }
  }, [
    appliedDateRange.startDate,
    appliedDateRange.endDate,
    refreshDashboardStats
  ]);

  useEffect(() => {
    Promise.resolve().then(() =>
      Promise.all([
        refreshGems(),
        refreshCategories(),
        refreshCertificates(),
        refreshJewellery(),
        refreshReviews(),
        refreshShipments(),
        refreshShippingMethods(),
        refreshLowStock(),
        ...(isSuperAdmin
          ? [
              refreshGemApprovals(),
              refreshJewelleryApprovals()
            ]
          : [])
      ])
    );
  }, [
    isSuperAdmin,
    refreshCategories,
    refreshCertificates,
    refreshGems,
    refreshGemApprovals,
    refreshJewellery,
    refreshJewelleryApprovals,
    refreshLowStock,
    refreshReviews,
    refreshShippingMethods,
    refreshShipments
  ]);

  useEffect(() => {
    Promise.resolve().then(() => refreshOrders());
  }, [refreshOrders]);

  useEffect(() => {
    Promise.resolve().then(() => refreshAdminAccounts());
  }, [refreshAdminAccounts]);

  const [managedHeroSlides, setManagedHeroSlides] = useState([]);
  const [heroSlidesLoading, setHeroSlidesLoading] = useState(false);
  const [heroSlidesError, setHeroSlidesError] = useState("");
  const [heroSlideSaving, setHeroSlideSaving] = useState(false);
  const [managedBlogPosts, setManagedBlogPosts] = useManagedBlogPosts();
  const [newHeroSlide, setNewHeroSlide] = useState({ alt: "", image: "" });
  const [editingHeroSlideId, setEditingHeroSlideId] = useState(null);
  const [newBlogPost, setNewBlogPost] = useState({
    title: "",
    category: "Gemstone Guide",
    excerpt: "",
    content: "",
    image: ""
  });
  const [editingBlogPostId, setEditingBlogPostId] = useState(null);

  const refreshHeroSlides = useCallback(async () => {
    setHeroSlidesLoading(true);
    setHeroSlidesError("");
    try {
      const response = await apiGet("/api/banners");
      const data = await response.json();
      if (!response.ok || data?.success !== true || !Array.isArray(data.banners)) {
        throw new Error(data?.message || "Unable to load homepage hero slides.");
      }
      setManagedHeroSlides(data.banners
        .filter((banner) => String(banner.media_type).toUpperCase() === "IMAGE")
        .map((banner) => ({
        id: banner.id,
        alt: banner.title,
        image: banner.media_url,
        mediaType: banner.media_type,
        sortOrder: Number(banner.sort_order) || 0,
        status: Number(banner.status) === 1
      })));
    } catch (error) {
      setHeroSlidesError(
        error instanceof Error ? error.message : "Unable to load homepage hero slides."
      );
    } finally {
      setHeroSlidesLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => refreshHeroSlides());
  }, [refreshHeroSlides]);

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

  const handleAddHeroSlide = async (event) => {
    event.preventDefault();
    if (!newHeroSlide.alt.trim() || !newHeroSlide.image) {
      showCustomAlert("Add a slide title and choose an image.", "Complete the Hero Slide", "warning");
      return;
    }

    setHeroSlideSaving(true);
    try {
      let mediaUrl = newHeroSlide.image;
      if (mediaUrl.startsWith("data:image/")) {
        const imageBlob = await (await fetch(mediaUrl)).blob();
        const uploadBody = new FormData();
        uploadBody.append("media", imageBlob, "homepage-hero.jpg");
        const uploadResponse = await apiRequest("/api/banners/upload", {
          method: "POST",
          body: uploadBody
        });
        let uploadResult;
        try {
          uploadResult = await uploadResponse.json();
        } catch {
          throw new Error("The banner upload service returned an invalid response.");
        }
        if (!uploadResponse.ok || uploadResult?.success !== true || !uploadResult.media_url) {
          throw new Error(uploadResult?.message || "Unable to upload the hero slide image.");
        }
        mediaUrl = uploadResult.media_url;
      }

      const banner = managedHeroSlides.find((slide) => slide.id === editingHeroSlideId);
      const payload = {
        title: newHeroSlide.alt.trim(),
        media_type: "IMAGE",
        media_url: mediaUrl,
        sort_order: banner?.sortOrder ?? managedHeroSlides.length,
        status: banner?.status === false ? 0 : 1
      };
      const response = editingHeroSlideId
        ? await apiPut(`/api/banners/${editingHeroSlideId}`, payload)
        : await apiPost("/api/banners", payload);
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("The banner service returned an invalid response.");
      }
      if (!response.ok || result?.success !== true) {
        throw new Error(result?.message || "Unable to save the hero slide.");
      }

      await refreshHeroSlides();
      setEditingHeroSlideId(null);
      setNewHeroSlide({ alt: "", image: "" });
      showCustomAlert(
        editingHeroSlideId
          ? "The homepage hero slide has been updated."
          : "The new homepage hero slide has been published.",
        editingHeroSlideId ? "Hero Slide Updated" : "Hero Slide Published",
        "success"
      );
    } catch (error) {
      showCustomAlert(
        error instanceof Error ? error.message : "Unable to save the hero slide.",
        "Hero Slide Save Failed",
        "warning"
      );
    } finally {
      setHeroSlideSaving(false);
    }
  };

  const handleEditHeroSlide = (slide) => {
    setEditingHeroSlideId(slide.id);
    setNewHeroSlide({ alt: slide.alt || "", image: slide.image || "" });
    document.getElementById("hero-slide-title")?.focus();
  };

  const handleCancelHeroSlideEdit = () => {
    setEditingHeroSlideId(null);
    setNewHeroSlide({ alt: "", image: "" });
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
      id: editingBlogPostId || `admin-blog-${Date.now()}`,
      title: newBlogPost.title.trim(),
      category: newBlogPost.category,
      date: editingBlogPostId
        ? managedBlogPosts.find((item) => item.id === editingBlogPostId)?.date
        : new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
          }),
      readTime: `${Math.max(1, Math.ceil(paragraphs.join(" ").split(/\s+/).length / 200))} min read`,
      image: newBlogPost.image,
      excerpt: newBlogPost.excerpt.trim(),
      content: paragraphs
    };
    setManagedBlogPosts((current) => editingBlogPostId
      ? current.map((item) => item.id === editingBlogPostId ? post : item)
      : [post, ...current]);
    setEditingBlogPostId(null);
    setNewBlogPost({
      title: "",
      category: "Gemstone Guide",
      excerpt: "",
      content: "",
      image: ""
    });
    showCustomAlert(
      editingBlogPostId
        ? "The article has been updated on the Blog page."
        : "The article has been published on the Blog page.",
      editingBlogPostId ? "Blog Post Updated" : "Blog Post Published",
      "success"
    );
  };

  const handleEditBlogPost = (post) => {
    setEditingBlogPostId(post.id);
    setNewBlogPost({
      title: post.title || "",
      category: post.category || "Gemstone Guide",
      excerpt: post.excerpt || "",
      content: Array.isArray(post.content)
        ? post.content.join("\n\n")
        : String(post.content || ""),
      image: post.image || ""
    });
    document.getElementById("blog-post-title")?.focus();
  };

  const handleCancelBlogEdit = () => {
    setEditingBlogPostId(null);
    setNewBlogPost({
      title: "",
      category: "Gemstone Guide",
      excerpt: "",
      content: "",
      image: ""
    });
  };

  const handleRemoveSiteContent = (kind, id) => {
    const isHeroSlide = kind === "hero slide";
    showCustomConfirm(
      `Remove this ${kind} from the website?`,
      async () => {
        if (isHeroSlide) {
          try {
            const response = await apiDelete(`/api/banners/${id}`);
            let result;
            try {
              result = await response.json();
            } catch {
              throw new Error("The banner service returned an invalid response.");
            }
            if (!response.ok || result?.success !== true) {
              throw new Error(result?.message || "Unable to delete the hero slide.");
            }
            await refreshHeroSlides();
            if (String(editingHeroSlideId) === String(id)) {
              setEditingHeroSlideId(null);
              setNewHeroSlide({ alt: "", image: "" });
            }
          } catch (error) {
            showCustomAlert(
              error instanceof Error ? error.message : "Unable to delete the hero slide.",
              "Hero Slide Delete Failed",
              "warning"
            );
          }
        } else {
          setManagedBlogPosts((current) => current.filter((item) => item.id !== id));
          if (editingBlogPostId === id) {
            setEditingBlogPostId(null);
            setNewBlogPost({
              title: "",
              category: "Gemstone Guide",
              excerpt: "",
              content: "",
              image: ""
            });
          }
        }
      },
      `Remove ${isHeroSlide ? "Hero Slide" : "Blog Post"}`,
      "danger"
    );
  };

  const handleStatusChange = async (orderId, newStatus, dbId) => {
    if (dbId) {
      try {
        const res = await apiPut(`/api/orders/${dbId}/status`, { order_status: newStatus });
        const resData = await res.json();
        if (!res.ok || !resData.success) {
          throw new Error(resData.message || "Failed to update order status");
        }
        showCustomAlert(`Order ${orderId} status updated to ${newStatus}.`, "Status Updated", "success");
        await refreshOrders();
        return;
      } catch (err) {
        showCustomAlert(err.message || "Failed to update order status.", "Error", "danger");
      }
    }
    setAdminOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleCancelOrder = (order) => {
    if (order.status === "DELIVERED") {
      showCustomAlert("Delivered orders cannot be cancelled.", "Action Restricted", "warning");
      return;
    }
    if (order.status === "CANCELLED") {
      showCustomAlert("This order is already cancelled.", "Notice", "info");
      return;
    }

    showCustomConfirm(
      `Are you sure you want to cancel Order ${order.orderNumber || order.id}? This will update the order status in the database to CANCELLED.`,
      async () => {
        if (order.dbId) {
          try {
            const res = await apiPut(`/api/orders/${order.dbId}/cancel`);
            const resData = await res.json();
            if (!res.ok || !resData.success) {
              throw new Error(resData.message || "Failed to cancel order");
            }
            showCustomAlert(`Order ${order.orderNumber || order.id} has been cancelled successfully.`, "Order Cancelled", "success");
            await refreshOrders();
            if (selectedOrderDetails?.id === order.id) {
              setSelectedOrderDetails((prev) => prev ? { ...prev, status: "CANCELLED" } : null);
            }
            return;
          } catch (err) {
            showCustomAlert(err.message || "Failed to cancel order.", "Error", "danger");
          }
        }
        setAdminOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: "CANCELLED" } : o))
        );
        if (selectedOrderDetails?.id === order.id) {
          setSelectedOrderDetails((prev) => prev ? { ...prev, status: "CANCELLED" } : null);
        }
      },
      "Cancel Order",
      "danger"
    );
  };

  const handlePaymentStatusChange = async (paymentId, newStatus, orderDbId) => {
    const payment = payments.find((item) => item.id === paymentId);
    if (!payment) return;

    const dbId = orderDbId || payment.orderDbId;
    if (dbId) {
      try {
        const payloadStatus = newStatus === "SETTLED" ? "PAID" : newStatus;
        const res = await apiPut(`/api/orders/${dbId}/payment-status`, { payment_status: payloadStatus });
        const resData = await res.json();
        if (!res.ok || !resData.success) {
          throw new Error(resData.message || "Failed to update payment status");
        }
        showCustomAlert(`Payment status updated to ${payloadStatus}.`, "Payment Updated", "success");
        await refreshOrders();
        return;
      } catch (err) {
        showCustomAlert(err.message || "Failed to update payment status.", "Error", "danger");
      }
    }

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

  const handleOpenShipmentModal = (order) => {
    const existingShipment = backendShipments.find((s) => Number(s.order_id) === Number(order.dbId));
    setActiveShipmentOrder(order);
    setShipmentForm(createShipmentForm(order, existingShipment, shippingMethods));
  };

  const handleSaveShipment = async (e) => {
    e.preventDefault();
    if (!activeShipmentOrder) return;

    if (!shipmentForm.tracking_number.trim() || !shipmentForm.courier.trim()) {
      showCustomAlert("Please enter a valid Courier and Tracking Number.", "Validation Error", "warning");
      return;
    }

    setShipmentSaving(true);
    try {
      const existingShipment = backendShipments.find((s) => Number(s.order_id) === Number(activeShipmentOrder.dbId));

      if (existingShipment) {
        const trackRes = await apiPut(`/api/shipping/shipments/${existingShipment.id}/tracking`, {
          tracking_number: shipmentForm.tracking_number.trim(),
          courier: shipmentForm.courier.trim(),
          estimated_delivery: shipmentForm.estimated_delivery || null
        });
        await readGemApiResponse(trackRes, "Failed to update tracking information");

        if (shipmentForm.status && shipmentForm.status !== existingShipment.status) {
          const statusRes = await apiPut(`/api/shipping/shipments/${existingShipment.id}/status`, {
            status: shipmentForm.status
          });
          await readGemApiResponse(statusRes, "Failed to update shipment status");

          if (shipmentForm.status === "DELIVERED") {
            await apiPut(`/api/orders/${activeShipmentOrder.dbId}/status`, { order_status: "DELIVERED" });
          } else if (shipmentForm.status === "CANCELLED") {
            await apiPut(`/api/orders/${activeShipmentOrder.dbId}/status`, { order_status: "CANCELLED" });
          } else if (["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(shipmentForm.status)) {
            await apiPut(`/api/orders/${activeShipmentOrder.dbId}/status`, { order_status: "SHIPPED" });
          }
        }

        showCustomAlert("Shipment & tracking information updated successfully.", "Shipment Updated", "success");
      } else {
        const createRes = await apiPost("/api/shipping/shipments", {
          order_id: activeShipmentOrder.dbId,
          shipping_method_id: Number(shipmentForm.shipping_method_id) || 2,
          tracking_number: shipmentForm.tracking_number.trim(),
          courier: shipmentForm.courier.trim(),
          estimated_delivery: shipmentForm.estimated_delivery || null
        });
        await readGemApiResponse(createRes, "Failed to create shipment");

        await apiPut(`/api/orders/${activeShipmentOrder.dbId}/status`, { order_status: "SHIPPED" });

        showCustomAlert(`Shipment created with tracking code ${shipmentForm.tracking_number} and order marked as SHIPPED.`, "Shipment Created", "success");
      }

      await refreshShipments();
      await refreshOrders();
      setActiveShipmentOrder(null);
    } catch (err) {
      showCustomAlert(err.message || "Failed to save shipment details.", "Error", "danger");
    } finally {
      setShipmentSaving(false);
    }
  };

  const handleAddAdminAccount = async (event) => {
    event.preventDefault();
    if (!isSuperAdmin) {
      showCustomAlert("Only Super Administrators can create admin accounts.", "Access Restricted", "warning");
      return;
    }
    const email = newAdminAccount.email.trim().toLowerCase();
    if (newAdminAccount.password.length < 6) {
      showCustomAlert("Please use a secure password with at least 6 characters.", "Password Too Short", "warning");
      return;
    }

    setIsAdminSaving(true);
    try {
      const response = await apiPost("/api/auth/admin-users", {
        name: newAdminAccount.name.trim(),
        email,
        password: newAdminAccount.password,
        phone: newAdminAccount.phone.trim()
      });
      const data = await readGemApiResponse(response, "Failed to create admin account.");
      if (!data.user?.id) {
        throw new Error("Admin account was created, but the server returned no user ID.");
      }

      const account = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || "",
        role: "admin",
        status: Number(data.user.status) === 1 ? "active" : "inactive",
        source: "backend",
        createdAt: data.user.created_at || new Date().toISOString()
      };
      const refreshed = await refreshAdminAccounts();
      setNewAdminAccount({ name: "", email: "", phone: "", password: "" });
      setIsAdminFormOpen(false);
      showCustomAlert(
        refreshed
          ? `Administrator account for ${account.name} has been successfully created.`
          : `Administrator account for ${account.name} was created, but the database account list could not be refreshed. Refresh the page to retry.`,
        refreshed ? "Account Created" : "Account Created; Refresh Failed",
        refreshed ? "success" : "warning"
      );
    } catch (error) {
      showCustomAlert(
        error instanceof Error ? error.message : "Failed to create admin account.",
        "Admin Account Creation Failed",
        "danger"
      );
    } finally {
      setIsAdminSaving(false);
    }
  };

  const handleAdminAccountStatus = async (accountId, status) => {
    if (!isSuperAdmin) {
      showCustomAlert("Only Super Administrators can modify admin accounts.", "Access Restricted", "warning");
      return;
    }
    if (String(accountId) === String(currentAdmin?.accountId)) {
      showCustomAlert("You cannot suspend your own active administrative session.", "Action Denied", "warning");
      return;
    }

    const databaseId = Number(accountId);
    const hasDatabaseId =
      Number.isSafeInteger(databaseId) &&
      databaseId > 0 &&
      String(databaseId) === String(accountId);

    try {
      if (hasDatabaseId) {
        const response = await apiPut(`/api/auth/users/${databaseId}/status`, {
          status: status === "active" ? 1 : 0
        });
        await readGemApiResponse(response, "Failed to update admin account status.");
      }

      const updatedAccounts = adminAccounts.map((account) =>
        String(account.id) === String(accountId) ? { ...account, status } : account
      );
      setAdminAccounts(updatedAccounts);
      writeAdminAccounts(updatedAccounts);
      setSelectedAdminAccount((selected) =>
        String(selected?.id) === String(accountId)
          ? { ...selected, status }
          : selected
      );
    } catch (error) {
      showCustomAlert(
        error instanceof Error ? error.message : "Failed to update admin account status.",
        "Account Status Update Failed",
        "danger"
      );
    }
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
      async () => {
        try {
          const databaseId = Number(account.id);
          const hasDatabaseId =
            Number.isSafeInteger(databaseId) &&
            databaseId > 0 &&
            String(databaseId) === String(account.id);

          if (hasDatabaseId) {
            const response = await apiDelete(`/api/auth/users/${databaseId}`);
            await readGemApiResponse(response, "Failed to remove admin account.");
          }

          const updatedAccounts = adminAccounts.filter(
            (item) => String(item.id) !== String(account.id)
          );
          setAdminAccounts(updatedAccounts);
          writeAdminAccounts(updatedAccounts);
          if (String(selectedAdminAccount?.id) === String(account.id)) {
            setSelectedAdminAccount(null);
          }
          showCustomAlert(
            `Admin account for ${account.name} has been removed.`,
            "Admin Account Removed",
            "success"
          );
        } catch (error) {
          showCustomAlert(
            error instanceof Error ? error.message : "Failed to remove admin account.",
            "Admin Account Removal Failed",
            "danger"
          );
        }
      },
      "Remove Admin Account",
      "danger"
    );
  };

  const handleDeleteReview = (review) => {
    showCustomConfirm(
      `Are you sure you want to delete the review submitted by ${review.name}?`,
      async () => {
        setDeletingReviewId(review.id);
        try {
          const response = await apiDelete(`/api/reviews/${review.id}`);
          await readGemApiResponse(response, "Failed to delete customer review.");
          await refreshReviews();
        } catch (error) {
          showCustomAlert(
            error instanceof Error ? error.message : "Failed to delete customer review.",
            "Review Delete Failed",
            "danger"
          );
        } finally {
          setDeletingReviewId(null);
        }
      },
      "Delete Customer Review",
      "danger"
    );
  };

  const handleReviewStatus = async (review, status) => {
    setUpdatingReviewId(review.id);
    try {
      const response = await apiPut(`/api/reviews/${review.id}/status`, { status });
      await readGemApiResponse(response, "Failed to update customer review status.");
      await refreshReviews();
      showCustomAlert(
        `Customer review ${status.toLowerCase()} successfully.`,
        "Review Updated",
        "success"
      );
    } catch (error) {
      showCustomAlert(
        error instanceof Error ? error.message : "Failed to update customer review status.",
        "Review Update Failed",
        "danger"
      );
    } finally {
      setUpdatingReviewId(null);
    }
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

  const handleEditLiveGem = (gem) => {
    setEditingGemId(gem.id);
    setEditGem({
      name: gem.name || "",
      category_id: String(gem.category_id ?? ""),
      color: gem.color || "",
      carat: gem.carat == null ? "" : String(gem.carat),
      length: gem.length == null ? "" : String(gem.length),
      width: gem.width == null ? "" : String(gem.width),
      height: gem.height == null ? "" : String(gem.height),
      clarity: gem.clarity || "",
      cut: gem.cut || "",
      shape: gem.shape || "",
      origin: gem.origin || "",
      treatment_status: gem.treatment_status || "Unheated",
      price: gem.price == null ? "" : String(gem.price),
      stock: gem.stock == null ? "0" : String(gem.stock),
      description: gem.description || "",
      status: isGemstoneActive(gem.status) ? "available" : "unavailable",
      discountRate: gem.offer_rate == null ? "" : String(gem.offer_rate),
      offerStartDate: gem.offerStartDate ||
        (gem.offer_start_date ? String(gem.offer_start_date).slice(0, 10) : ""),
      offerEndDate: gem.offerEndDate ||
        (gem.offer_end_date ? String(gem.offer_end_date).slice(0, 10) : ""),
      mainImage: gem.main_image || gem.image || "",
      backViewImage: gem.back_view_image || "",
      rightViewImage: gem.right_view_image || "",
      leftViewImage: gem.left_view_image || "",
      additional_view_1: gem.additional_view_1 || "",
      additional_view_2: gem.additional_view_2 || "",
      videoClip: gem.video_url || gem.videoUrl || ""
    });
    setEditGemFiles({});
  };

  const closeLiveGemEdit = () => {
    if (gemSaving) return;
    setEditGem(null);
    setEditingGemId(null);
    setEditGemFiles({});
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
      showCustomAlert(
        isSuperAdmin
          ? `Gemstone "${payload.name}" added successfully and is available in the shop.`
          : `Gemstone "${payload.name}" was submitted for Super Admin approval.`,
        isSuperAdmin ? "Gemstone Added" : "Gemstone Submitted",
        "success"
      );
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

  const handleSaveLiveGem = async (e) => {
    e.preventDefault();
    if (!editGem || editingGemId == null) return;
    if (!editGem.name.trim() || !editGem.category_id) {
      showCustomAlert("Gemstone name and category are required.", "Validation Error", "warning");
      return;
    }

    const numericFields = ["carat", "length", "width", "height", "price", "stock"];
    const invalidNumericValue = numericFields.some((field) => {
      const value = editGem[field];
      return value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0);
    });
    if (
      !editGem.price ||
      Number(editGem.price) <= 0 ||
      invalidNumericValue ||
      !Number.isInteger(Number(editGem.stock || 0))
    ) {
      showCustomAlert(
        "Enter a valid positive price, non-negative dimensions, and whole-number stock quantity.",
        "Invalid Gemstone Details",
        "warning"
      );
      return;
    }
    if (editGem.discountRate && (!editGem.offerStartDate || !editGem.offerEndDate)) {
      showCustomAlert("Choose both offer start and end dates.", "Offer Dates Required", "warning");
      return;
    }
    if (
      editGem.discountRate &&
      (!Number.isFinite(Number(editGem.discountRate)) ||
        Number(editGem.discountRate) < 1 ||
        Number(editGem.discountRate) > 100)
    ) {
      showCustomAlert("Offer rate must be between 1 and 100.", "Invalid Offer Rate", "warning");
      return;
    }
    if (editGem.discountRate && editGem.offerStartDate > editGem.offerEndDate) {
      showCustomAlert("Offer end date must be on or after the start date.", "Invalid Offer Dates", "warning");
      return;
    }

    setGemSaving(true);
    try {
      const payload = {
        name: editGem.name.trim().toUpperCase(),
        category_id: Number(editGem.category_id),
        color: editGem.color || "",
        carat: editGem.carat,
        length: editGem.length,
        width: editGem.width,
        height: editGem.height,
        clarity: editGem.clarity || "",
        cut: editGem.cut || "",
        shape: editGem.shape || "",
        origin: editGem.origin || "",
        treatment_status: editGem.treatment_status || "",
        price: Number(editGem.price),
        stock: Number(editGem.stock || 0),
        description: editGem.description || "",
        status: editGem.status,
        offer_rate: editGem.discountRate || "",
        offer_start_date: editGem.offerStartDate || "",
        offer_end_date: editGem.offerEndDate || ""
      };
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => formData.append(key, String(value)));
      Object.entries(editGemFiles).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const response = await apiRequest(`/api/gemstones/${editingGemId}`, {
        method: "PUT",
        body: formData
      });
      await readGemApiResponse(response, "Failed to update gemstone.");
      await refreshGems();
      const updatedName = payload.name;
      setEditGem(null);
      setEditingGemId(null);
      setEditGemFiles({});
      showCustomAlert(`"${updatedName}" has been updated successfully.`, "Gemstone Updated", "success");
    } catch (error) {
      showCustomAlert(error.message || "Failed to update gemstone.", "Error", "danger");
    } finally {
      setGemSaving(false);
    }
  };

  const handleGemApproval = async (submissionId, status, isDbItem = false) => {
    if (isDbItem) {
      try {
        const response = await apiPut(`/api/gemstones/${submissionId}/approval`, {
          approval_status: status
        });
        await readGemApiResponse(response, `Failed to ${status} gemstone.`);
        const [approvalsRefreshed] = await Promise.all([
          refreshGemApprovals(),
          refreshGems()
        ]);
        if (!approvalsRefreshed) {
          showCustomAlert(
            "Gemstone status was updated, but the pending approval list could not be refreshed.",
            "Approval Updated",
            "warning"
          );
          return;
        }
        showCustomAlert(
          `Gemstone "${databaseGemApprovals.find((item) => item.id === submissionId)?.name || `#${submissionId}`}" was ${status}.`,
          `Gemstone ${status === "approved" ? "Approved" : "Rejected"}`,
          status === "approved" ? "success" : "warning"
        );
      } catch (error) {
        showCustomAlert(error.message || `Failed to ${status} gemstone.`, "Approval Failed", "danger");
      }
      return;
    }

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
      product_name: "",
      jewellery_type: "Necklaces",
      gemstone_type: "",
      color: "",
      description: "",
      material: "",
      price: "",
      currency: "USD",
      stock_quantity: "1",
      image_url: "",
      offer_rate: "",
      offer_start_date: "",
      offer_end_date: "",
      is_handcrafted: true,
      status: "active"
    });
    setEditingDbJewelleryId(null);
    setJewelleryImageFile(null);
  };

  const closeDbJewelleryEdit = () => {
    if (jewellerySaving) return;
    resetJewelleryForm();
  };

  const handleEditJewellery = (item) => {
    // DB item (has product_code)
    if (item.product_code !== undefined) {
      setEditingDbJewelleryId(item.id);
      setNewJewellery({
        product_name: item.product_name || "",
        jewellery_type: item.jewellery_type || "Necklaces",
        gemstone_type: item.gemstone_type || "",
        color: item.color || "",
        description: item.description || "",
        material: item.material || "",
        price: String(item.price ?? ""),
        currency: item.currency || "USD",
        stock_quantity: String(item.stock_quantity ?? 1),
        image_url: item.image_url || "",
        offer_rate: item.offer_rate == null ? "" : String(item.offer_rate),
        offer_start_date: item.offer_start_date ? String(item.offer_start_date).slice(0, 10) : "",
        offer_end_date: item.offer_end_date ? String(item.offer_end_date).slice(0, 10) : "",
        is_handcrafted: item.is_handcrafted === true || Number(item.is_handcrafted) === 1,
        status: item.status || "active"
      });
      setJewelleryImageFile(null);
    } else {
      // legacy localStorage item
      setNewJewellery({
        product_name: item.name || "",
        jewellery_type: item.category || "Necklaces",
        gemstone_type: "",
        color: item.color || "",
        description: "",
        material: "",
        price: String(item.basePriceUSD ?? item.price ?? ""),
        currency: "USD",
        stock_quantity: "1",
        image_url: item.image || "",
        offer_rate: "",
        offer_start_date: "",
        offer_end_date: "",
        is_handcrafted: true,
        status: "active"
      });
      setJewelleryImageFile(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setActiveTab("JEWELLERY");
  };

  const handleSaveJewellery = async (event) => {
    event.preventDefault();
    if (!newJewellery.product_name.trim()) {
      showCustomAlert("Product name is required.", "Validation Error", "warning");
      return;
    }
    if (!newJewellery.price || Number(newJewellery.price) <= 0) {
      showCustomAlert("Enter a valid price greater than 0.", "Validation Error", "warning");
      return;
    }
    if (
      newJewellery.offer_rate &&
      (!Number.isFinite(Number(newJewellery.offer_rate)) ||
        Number(newJewellery.offer_rate) < 1 ||
        Number(newJewellery.offer_rate) > 100)
    ) {
      showCustomAlert("Offer rate must be between 1 and 100.", "Invalid Offer Rate", "warning");
      return;
    }
    if (
      newJewellery.offer_rate &&
      (!newJewellery.offer_start_date || !newJewellery.offer_end_date)
    ) {
      showCustomAlert("Choose both offer start and end dates.", "Offer Dates Required", "warning");
      return;
    }
    if (
      newJewellery.offer_rate &&
      newJewellery.offer_start_date > newJewellery.offer_end_date
    ) {
      showCustomAlert("Offer end date must be on or after the start date.", "Invalid Offer Dates", "warning");
      return;
    }

    const resolvedStatus = newJewellery.status || "active";

    const payload = {
      product_name: newJewellery.product_name.trim(),
      jewellery_type: newJewellery.jewellery_type || null,
      gemstone_type: newJewellery.gemstone_type || null,
      color: newJewellery.color || null,
      description: newJewellery.description || null,
      material: newJewellery.material || null,
      price: Number(newJewellery.price),
      currency: newJewellery.currency || "USD",
      stock_quantity: Math.max(0, parseInt(newJewellery.stock_quantity, 10) || 0),
      image_url: newJewellery.image_url || null,
      offer_rate: newJewellery.offer_rate ? Number(newJewellery.offer_rate) : null,
      offer_start_date: newJewellery.offer_start_date || null,
      offer_end_date: newJewellery.offer_end_date || null,
      is_handcrafted: newJewellery.is_handcrafted ? 1 : 0,
      status: resolvedStatus
    };

    setJewellerySaving(true);
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value == null ? "" : String(value));
      });
      if (jewelleryImageFile) formData.append("image", jewelleryImageFile);

      if (editingDbJewelleryId !== null) {
        // UPDATE existing DB record
        const res = await apiRequest(`/api/jewellery/${editingDbJewelleryId}`, {
          method: "PUT",
          body: formData
        });
        await readGemApiResponse(res, "Failed to update jewellery item.");
        showCustomAlert(`"${payload.product_name}" updated successfully in database.`, "Jewellery Updated", "success");
      } else {
        // CREATE new DB record
        const res = await apiRequest("/api/jewellery", {
          method: "POST",
          body: formData
        });
        await readGemApiResponse(res, "Failed to save jewellery item.");
        showCustomAlert(
          isSuperAdmin
            ? `"${payload.product_name}" added successfully and is available in the shop.`
            : `"${payload.product_name}" was submitted for Super Admin approval.`,
          isSuperAdmin ? "Jewellery Added" : "Jewellery Submitted",
          "success"
        );
      }
      resetJewelleryForm();
      await refreshJewellery();
    } catch (error) {
      showCustomAlert(error.message || "Failed to save jewellery item.", "Error", "danger");
    } finally {
      setJewellerySaving(false);
    }
  };

  const handleJewelleryApproval = async (submissionId, status, isDbItem = false) => {
    const isDb = isDbItem || databaseJewelleryApprovals.some((item) => item.id === submissionId);
    if (isDb) {
      try {
        const res = await apiPut(`/api/jewellery/${submissionId}/status`, { status });
        await readGemApiResponse(res, `Failed to update status to ${status}`);
        const itemObj = databaseJewelleryApprovals.find((item) => item.id === submissionId);
        const [approvalsRefreshed] = await Promise.all([
          refreshJewelleryApprovals(),
          refreshJewellery()
        ]);
        if (!approvalsRefreshed) {
          showCustomAlert(
            "Jewellery status was updated, but the pending approval list could not be refreshed.",
            "Approval Updated",
            "warning"
          );
          return;
        }
        showCustomAlert(
          `Jewellery request "${itemObj?.product_name || `#${submissionId}`}" has been ${
            status === "approved" ? "approved and is now available in the shop." : "rejected."
          }`,
          `Jewellery ${status === "approved" ? "Approved" : "Rejected"}`,
          status === "approved" ? "success" : "warning"
        );
      } catch (err) {
        showCustomAlert(err.message || "Failed to update jewellery status.", "Error", "danger");
      }
    } else {
      setJewellerySubmissions((current) =>
        current.map((submission) =>
          submission.id === submissionId
            ? { ...submission, status, reviewedAt: new Date().toISOString() }
            : submission
        )
      );
    }
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

  const openCertificateModal = (gem, certificate = null) => {
    setCertificateFile(null);
    setEditCertificate({
      id: certificate?.id || null,
      gemstone_id: gem.id,
      gemstone_name: gem.name,
      certificate_number: certificate?.certificate_number || "",
      laboratory: certificate?.laboratory || "",
      certificate_url: certificate?.certificate_url || "",
      verification_status: String(certificate?.verification_status || "PENDING").toUpperCase(),
      issue_date: certificate?.issue_date ? String(certificate.issue_date).slice(0, 10) : ""
    });
  };

  const closeCertificateModal = () => {
    if (certificateSaving) return;
    setEditCertificate(null);
    setCertificateFile(null);
  };

  const handleSaveCertificate = async (event) => {
    event.preventDefault();
    if (!editCertificate) return;
    setCertificateSaving(true);
    try {
      const body = new FormData();
      body.append("gemstone_id", String(editCertificate.gemstone_id));
      body.append("certificate_number", editCertificate.certificate_number.trim());
      body.append("laboratory", editCertificate.laboratory.trim());
      body.append("verification_status", editCertificate.verification_status);
      body.append("issue_date", editCertificate.issue_date);
      body.append("certificate_url", editCertificate.certificate_url || "");
      if (certificateFile) body.append("certificate", certificateFile);

      const response = editCertificate.id
        ? await apiRequest(`/api/certificates/${editCertificate.id}`, { method: "PUT", body })
        : await apiRequest("/api/certificates", { method: "POST", body });
      await readGemApiResponse(response, "Failed to save gemstone certificate.");
      const refreshed = await refreshCertificates();
      if (!refreshed) {
        throw new Error("Certificate was saved, but the certificate list could not be refreshed.");
      }
      setEditCertificate(null);
      setCertificateFile(null);
      showCustomAlert("Certificate saved successfully.", "Certificate Saved", "success");
    } catch (error) {
      showCustomAlert(error.message || "Failed to save gemstone certificate.", "Error", "danger");
    } finally {
      setCertificateSaving(false);
    }
  };

  const handleDeleteJewellery = (itemId, isDbItem = false) => {
    showCustomConfirm(
      "Permanently delete this jewellery item from the database?",
      async () => {
        if (isDbItem) {
          try {
            const res = await apiDelete(`/api/jewellery/${itemId}`);
            await readGemApiResponse(res, "Failed to delete jewellery item.");
            showCustomAlert("Jewellery item deleted.", "Deleted", "success");
            await refreshJewellery();
          } catch (error) {
            showCustomAlert(error.message || "Failed to delete jewellery item.", "Error", "danger");
          }
        } else {
          const isBaseProduct = jewelleryProducts.some((item) => item.id === itemId);
          if (isBaseProduct) {
            setJewelleryProductOverrides((current) => ({
              ...current,
              [String(itemId)]: { ...current[String(itemId)], deleted: true }
            }));
          } else {
            setJewellerySubmissions((current) =>
              current.filter((submission) => submission.jewellery.id !== itemId)
            );
          }
        }
      },
      "Delete Jewellery",
      "danger"
    );
  };

  const handleRestockItem = async (item) => {
    const itemKey = `${item.item_type}-${item.id}`;
    const quantity = Number(stockAdditions[itemKey] ?? 1);
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      showCustomAlert("Enter a positive whole number of units to add.", "Invalid Quantity", "warning");
      return;
    }

    setRestockingItemKey(itemKey);
    try {
      const response = await apiPost(
        `/api/dashboard/stock/${item.item_type}/${item.id}/restock`,
        { quantity }
      );
      const result = await readGemApiResponse(response, "Unable to update inventory stock.");
      if (!Number.isSafeInteger(Number(result.data?.quantity))) {
        throw new Error("The inventory service returned an invalid stock quantity.");
      }

      setStockAdditions((current) => ({ ...current, [itemKey]: 1 }));
      const refreshed = await refreshLowStock();
      if (!refreshed) {
        showCustomAlert(
          "Stock was updated, but the low-stock list could not be refreshed.",
          "Stock Updated",
          "warning"
        );
      } else {
        showCustomAlert(
          `${item.item_name} stock updated to ${result.data.quantity}.`,
          "Stock Updated",
          "success"
        );
      }
      if (item.item_type === "gemstone") {
        await refreshGems();
      } else {
        await refreshJewellery();
      }
    } catch (error) {
      showCustomAlert(error.message || "Unable to update inventory stock.", "Restock Failed", "danger");
    } finally {
      setRestockingItemKey(null);
    }
  };

  const handleDeleteGem = (gemId) => {
    showCustomConfirm(
      "Are you sure you want to permanently remove this certified gemstone from inventory?",
      async () => {
        const isDbGem = backendGems.some((g) => String(g.id) === String(gemId));
        if (isDbGem || (typeof gemId === "number" && gemId < 1000000000)) {
          try {
            const res = await apiDelete(`/api/gemstones/${gemId}`);
            await readGemApiResponse(res, "Failed to delete gemstone from database.");
            showCustomAlert("Gemstone successfully deleted from database.", "Gemstone Deleted", "success");
            await refreshGems();
          } catch (err) {
            showCustomAlert(err.message || "Failed to delete gemstone.", "Error", "danger");
          }
        }
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
  const lowStockCount = lowStockItems.length;
  const lowStockGroups = [
    { type: "gemstone", title: "Gemstones", icon: <FaGem /> },
    { type: "jewellery", title: "Jewellery", icon: <FaShoppingBag /> }
  ];
  const pendingGemApprovals = [
    ...databaseGemApprovals.map((gem) => ({
      id: gem.id,
      isDb: true,
      gem: {
        ...gem,
        category: gem.category_name || "Other Gemstone"
      },
      submittedAt: gem.created_at
    })),
    ...gemSubmissions.filter((submission) => submission.status === "pending")
  ];
  const pendingJewelleryApprovals = [
    ...databaseJewelleryApprovals.map((item) => ({
        id: item.id,
        isDb: true,
        jewellery: {
          id: item.id,
          name: item.product_name,
          category: item.jewellery_type || "Jewellery",
          color: item.color || "—",
          shape: item.gemstone_type
            ? `${item.gemstone_type} • ${item.material || ""}`
            : (item.material || item.product_code || "Fine Jewellery"),
          price: item.price,
          currency: item.currency || "USD",
          image: resolveMediaUrl(item.image_url) || "/BlueBracelete.jpg",
          stock: item.stock_quantity,
          handcrafted: item.is_handcrafted,
          product_code: item.product_code
        },
        status: item.status,
        submittedAt: item.created_at
      })),
    ...jewellerySubmissions.filter(
      (submission) => submission.status === "pending"
    )
  ];
  const currentAdmin = readAdminSession();
  const visibleAdminAccounts = adminAccounts.filter((account) => {
    const matchesCurrentId =
      currentAdmin?.accountId != null &&
      String(account.id) === String(currentAdmin.accountId);
    const matchesCurrentEmail =
      currentAdmin?.email &&
      String(account.email || "").toLowerCase() === currentAdmin.email.toLowerCase();

    return !matchesCurrentId && !matchesCurrentEmail;
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

          <section className="admin-date-filter" aria-label="Dashboard date range filter">
            <div className="admin-date-filter-heading">
              <span className="reporting-period-label">
                <FaCalendarAlt aria-hidden="true" />
                REPORTING PERIOD
              </span>
              <strong>Filter order activity</strong>
            </div>
            <div className="admin-date-filter-content">
              <div className="admin-date-presets" role="group" aria-label="Date range presets">
                <button
                  type="button"
                  className={dateRangePreset === "today" ? "active" : ""}
                  aria-pressed={dateRangePreset === "today"}
                  onClick={() => selectDateRangePreset("today")}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={dateRangePreset === "this-month" ? "active" : ""}
                  aria-pressed={dateRangePreset === "this-month"}
                  onClick={() => selectDateRangePreset("this-month")}
                >
                  This Month
                </button>
                <button
                  type="button"
                  className={dateRangePreset === "this-year" ? "active" : ""}
                  aria-pressed={dateRangePreset === "this-year"}
                  onClick={() => selectDateRangePreset("this-year")}
                >
                  This Year
                </button>
                <button
                  type="button"
                  className={dateRangePreset === "custom" ? "active" : ""}
                  aria-pressed={dateRangePreset === "custom"}
                  onClick={() => selectDateRangePreset("custom")}
                >
                  Custom Range
                </button>
              </div>
              {dateRangePreset === "custom" && (
                <form className="admin-date-range-form" onSubmit={applyCustomDateRange}>
                  <label>
                    <span>From</span>
                    <input
                      type="date"
                      value={dateRangeDraft.startDate}
                      max={dateRangeDraft.endDate || undefined}
                      onChange={(event) => {
                        setDateRangePreset("custom");
                        setDateRangeDraft((range) => ({
                          ...range,
                          startDate: event.target.value
                        }));
                      }}
                      aria-label="Start date"
                    />
                  </label>
                  <span className="admin-date-range-separator" aria-hidden="true">—</span>
                  <label>
                    <span>To</span>
                    <input
                      type="date"
                      value={dateRangeDraft.endDate}
                      min={dateRangeDraft.startDate || undefined}
                      onChange={(event) => {
                        setDateRangePreset("custom");
                        setDateRangeDraft((range) => ({
                          ...range,
                          endDate: event.target.value
                        }));
                      }}
                      aria-label="End date"
                    />
                  </label>
                  <button
                    type="submit"
                    className="admin-date-apply"
                    disabled={
                      !dateRangeDraft.startDate ||
                      !dateRangeDraft.endDate ||
                      dateRangeDraft.startDate > dateRangeDraft.endDate
                    }
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* STATS OVERVIEW CARDS */}
          <div className={`admin-stats-grid ${isSuperAdmin ? "admin-stats-6cols" : "admin-stats-5cols"}`}>
            <div className="admin-stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("ORDERS")}>
              <div className="stat-icon gold"><FaShoppingBag /></div>
              <div>
                <span>Total Orders</span>
                <strong>{dashboardStats.totalOrders} Orders</strong>
              </div>
            </div>
            <button
              type="button"
              className="admin-stat-card admin-stat-card-button"
              onClick={() => setActiveTab("GEMS")}
            >
              <div className="stat-icon green"><FaGem /></div>
              <div>
                <span>Gemstones Inventory</span>
                <strong>{dashboardStats.gemstoneInventory} Items</strong>
              </div>
            </button>
            <button
              type="button"
              className="admin-stat-card admin-stat-card-button"
              onClick={() => setActiveTab("JEWELLERY")}
            >
              <div className="stat-icon purple"><FaCrown /></div>
              <div>
                <span>Jewellery Inventory</span>
                <strong>{dashboardStats.jewelleryInventory} Items</strong>
              </div>
            </button>
            <div className="admin-stat-card">
              <div className="stat-icon blue"><FaTruck /></div>
              <div>
                <span>Shipments in Transit / Dispatched</span>
                <strong>{dashboardStats.shipmentsInTransit} Orders</strong>
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
              <FaStar /> Customer Reviews ({backendCustomerReviews.length})
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
              <FaCrown /> Jewellery Management ({jewelleryList.length})
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
              <div className="admin-section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "1.2rem" }}>
                <div>
                  <h2><FaShoppingBag /> Customer Orders &amp; Shipment Tracking</h2>
                  <p>Real-time customer orders, automated air courier tracking, and order fulfillment controls.</p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    type="button"
                    className="admin-action-btn"
                    onClick={() => { refreshOrders(); refreshShipments(); }}
                    title="Refresh orders from MySQL database"
                  >
                    <FaSync /> Refresh Orders
                  </button>
                  <span className="admin-live-note">LIVE DATABASE · ORDERS</span>
                </div>
              </div>

              {ordersLoading ? (
                <p className="admin-empty-state">Loading customer orders from database…</p>
              ) : ordersError ? (
                <p className="admin-empty-state" role="alert">{ordersError}</p>
              ) : adminOrders.length === 0 ? (
                <p className="admin-empty-state">No customer orders recorded yet.</p>
              ) : (
                <div className="admin-table-wrapper order-table-wrapper">
                  <table className="admin-table admin-orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer &amp; Destination</th>
                        <th>Ordered Items</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Order Status</th>
                        <th>Shipment &amp; Tracking</th>
                        <th>Update Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminOrders.map((order) => (
                        <tr key={order.id}>
                          <td data-label="Order ID">
                            <strong className="order-code">{order.orderNumber || order.id}</strong>
                            <div className="order-date">{order.date}</div>
                          </td>
                          <td data-label="Customer & Destination">
                            <strong>{order.customerName}</strong>
                            <div className="table-subtext">{order.customerEmail}</div>
                            <div className="table-subtext"><FaMapMarkerAlt /> {order.shippingAddress}</div>
                          </td>
                          <td data-label="Ordered Items">
                            {order.items.length > 0 ? order.items.map((item) => (
                              <div key={item.id}>
                                <strong>{item.gemstone_name}</strong>
                                <div className="table-subtext">
                                  Quantity: {item.quantity} · {Number(item.price).toLocaleString()} {item.currency || order.currency}
                                </div>
                              </div>
                            )) : <span className="table-subtext">No item details available.</span>}
                          </td>
                          <td data-label="Amount">
                            <strong className="gold-text">
                              ${Number(order.totalAmount || 0).toLocaleString()} {order.currency || "USD"}
                            </strong>
                          </td>
                          <td data-label="Payment">
                            <span className={`status-pill status-${String(order.paymentStatus).toLowerCase()}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td data-label="Order Status">
                            <span className={`status-pill status-${String(order.status).toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                          <td data-label="Shipment & Tracking">
                            {order.shipment ? (
                              <div>
                                <strong style={{ fontSize: "11px", color: "#041d1a", display: "block" }}>
                                  {order.shipment.courier || order.courier}
                                </strong>
                                <span style={{ fontSize: "11px", color: "#b58c36", fontFamily: "monospace", fontWeight: "700" }}>
                                  {order.shipment.tracking_number}
                                </span>
                                <div style={{ marginTop: "3px" }}>
                                  <span className={`status-pill status-${String(order.shipment.status || "SHIPPED").toLowerCase()}`} style={{ fontSize: "9px", padding: "2px 6px" }}>
                                    {order.shipment.status}
                                  </span>
                                </div>
                              </div>
                            ) : order.status === "DELIVERED" ? (
                              <span className="status-pill status-delivered" style={{ fontSize: "10px", padding: "2px 8px" }}>
                                Delivered
                              </span>
                            ) : (
                              <div>
                                <span style={{ fontSize: "11px", color: "#8a7b58", display: "block" }}>Pending Dispatch</span>
                                <button
                                  type="button"
                                  className="admin-action-btn"
                                  style={{ fontSize: "10px", padding: "3px 8px", marginTop: "4px" }}
                                  onClick={() => handleOpenShipmentModal(order)}
                                >
                                  <FaTruck /> Dispatch
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="order-status-cell" data-label="Update Status">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.orderNumber || order.id, e.target.value, order.dbId)}
                              className="admin-status-select"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td className="order-actions-cell" data-label="Actions">
                            <div className="order-actions">
                              <button
                                type="button"
                                className="admin-action-btn"
                                title="Manage Shipment & Tracking Code"
                                onClick={() => handleOpenShipmentModal(order)}
                              >
                                <FaTruck /> Shipment
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn"
                                title="View Dossier & Invoice Details"
                                onClick={() => setSelectedOrderDetails(order)}
                              >
                                <FaFileInvoice /> Details
                              </button>
                              {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                                <button
                                  type="button"
                                  className="gem-delete-btn"
                                  title="Cancel Order"
                                  onClick={() => handleCancelOrder(order)}
                                >
                                  <FaBan /> Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                  <p>Approve reviews to publish them on the storefront. Reject or unpublish reviews to hide them, or delete them permanently.</p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    type="button"
                    className="admin-action-btn"
                    onClick={refreshReviews}
                    disabled={reviewsLoading}
                    title="Refresh customer reviews from the database"
                  >
                    <FaSync /> {reviewsLoading ? "Refreshing…" : "Refresh Reviews"}
                  </button>
                  <span className="admin-live-note">{backendCustomerReviews.length} CUSTOMER REVIEWS</span>
                </div>
              </div>

              {reviewsError && <p className="admin-empty-state" role="alert">{reviewsError}</p>}
              {reviewsLoading && <p className="admin-empty-state" role="status">Loading customer reviews…</p>}
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
                    {backendCustomerReviews.map((review) => (
                      <tr key={review.id}>
                        <td>
                          <strong>{review.name}</strong>
                          <div className="table-subtext">{review.email || "Customer review"}</div>
                          <div className="table-subtext">{review.status || "PENDING"}</div>
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
                          <div className="review-admin-actions">
                            {review.status !== "APPROVED" && (
                              <button
                                type="button"
                                className="admin-action-btn review-approve-btn"
                                disabled={updatingReviewId === review.id || deletingReviewId === review.id}
                                onClick={() => handleReviewStatus(review, "APPROVED")}
                              >
                                <FaCheckCircle /> Approve
                              </button>
                            )}
                            {review.status !== "REJECTED" && (
                              <button
                                type="button"
                                className={`admin-action-btn ${review.status === "APPROVED" ? "review-unpublish-btn" : "review-reject-btn"}`}
                                disabled={updatingReviewId === review.id || deletingReviewId === review.id}
                                onClick={() => handleReviewStatus(review, "REJECTED")}
                              >
                                {review.status === "APPROVED" ? <FaBan /> : <FaTimes />}
                                {review.status === "APPROVED" ? "Unpublish" : "Reject"}
                              </button>
                            )}
                            <button
                              type="button"
                              className="review-delete-btn"
                              aria-label={`Delete review by ${review.name}`}
                              disabled={deletingReviewId === review.id || updatingReviewId === review.id}
                              onClick={() => handleDeleteReview(review)}
                            >
                              <FaTrash /> {deletingReviewId === review.id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {backendCustomerReviews.length === 0 && !reviewsLoading && !reviewsError && (
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
                <span className="admin-live-note">DATABASE-BACKED ACCOUNTS</span>
              </div>

              <div className="super-admin-profile">
                <span className="super-admin-profile-icon"><FaShieldAlt /></span>
                <div><span>Current Session</span><strong>{currentAdmin?.name || "Active Admin"}</strong></div>
                <div><span>Email</span><strong>{currentAdmin?.email || "Not available"}</strong></div>
                <div><span>Role</span><strong>{(currentAdmin?.role || "admin").toUpperCase()}</strong></div>
              </div>

              <div className="admin-account-toolbar">
                <span>{visibleAdminAccounts.length} Admin accounts</span>
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
                      <label><span>Role</span><input value="Admin" readOnly /></label>
                      <label><span>Phone number</span><input type="tel" autoComplete="tel" value={newAdminAccount.phone} onChange={(event) => setNewAdminAccount((prev) => ({ ...prev, phone: event.target.value }))} placeholder="e.g. +94 71 234 5678" /></label>
                      <label className="admin-account-password-field"><span>Temporary password</span><input type="password" autoComplete="new-password" minLength={6} value={newAdminAccount.password} onChange={(event) => setNewAdminAccount((prev) => ({ ...prev, password: event.target.value }))} placeholder="Min 6 characters" required /></label>
                      <p className="admin-account-form-note">At least 6 characters. The password is hashed before it is stored.</p>
                      <div className="admin-account-modal-actions">
                        <button type="button" className="admin-modal-cancel" onClick={() => setIsAdminFormOpen(false)}>Cancel</button>
                        <button type="submit" className="admin-account-add-btn" disabled={isAdminSaving}>
                          <FaPlus /> {isAdminSaving ? "Saving…" : "Save Admin"}
                        </button>
                      </div>
                    </form>
                  </section>
                </div>
              )}

              <div className="admin-table-wrapper">
                <table className="admin-table accounts-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Phone</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                  <tbody>
                    {visibleAdminAccounts.map((account) => (
                      <tr key={account.id}>
                        <td><strong>{account.name}</strong></td>
                        <td>{account.email}</td>
                        <td>—</td>
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
                    {adminAccountsLoading && (
                      <tr><td className="admin-empty-state" colSpan="8">Loading database admin accounts…</td></tr>
                    )}
                    {!adminAccountsLoading && adminAccountsError && (
                      <tr><td className="admin-empty-state" colSpan="8">{adminAccountsError}</td></tr>
                    )}
                    {!adminAccountsLoading && !adminAccountsError && visibleAdminAccounts.length === 0 && (
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
                      <div><dt>Department</dt><dd>—</dd></div>
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
                <div className="stock-alert-heading-actions">
                  <span className="admin-live-note">{lowStockCount} LOW STOCK ITEMS</span>
                  <button
                    type="button"
                    className="admin-action-btn"
                    onClick={refreshLowStock}
                    disabled={lowStockLoading}
                  >
                    {lowStockLoading ? "Loading…" : "Refresh"}
                  </button>
                </div>
              </div>

              {lowStockError ? (
                <p className="admin-empty-state" role="alert">
                  {lowStockError}{" "}
                  <button type="button" className="admin-action-btn" onClick={refreshLowStock}>Retry</button>
                </p>
              ) : lowStockLoading && lowStockItems.length === 0 ? (
                <p className="admin-empty-state">Loading low-stock inventory…</p>
              ) : (
                <div className="stock-alert-groups">
                  {lowStockGroups.map((group) => {
                    const items = lowStockItems.filter((item) => item.item_type === group.type);

                    return (
                      <section className={`stock-alert-group stock-alert-group-${group.type}`} key={group.type}>
                        <header className="stock-alert-group-heading">
                          <div className="stock-alert-group-title">
                            <span className="stock-alert-group-icon">{group.icon}</span>
                            <div>
                              <h3>{group.title}</h3>
                              <p>{group.type === "gemstone" ? "Gemstone inventory" : "Jewellery inventory"}</p>
                            </div>
                          </div>
                          <span className="stock-alert-group-count">{items.length}</span>
                        </header>
                        {items.length === 0 ? (
                          <p className="stock-alert-group-empty">No low-stock {group.title.toLowerCase()}.</p>
                        ) : (
                          <div className="stock-alert-list">
                            {items.map((item) => {
                              const itemKey = `${item.item_type}-${item.id}`;
                              const quantity = Number(item.quantity);
                              const stockStatus = quantity === 0 ? "out" : "low";
                              const itemName = item.item_name || `${item.item_type} #${item.id}`;

                              return (
                                <article className="stock-alert-row" key={itemKey}>
                                  <img
                                    src={resolveMediaUrl(item.image_url) || "/logo.png"}
                                    alt=""
                                    onError={(event) => {
                                      event.currentTarget.src = "/logo.png";
                                    }}
                                  />
                                  <div className="stock-alert-gem">
                                    <strong>{itemName}</strong>
                                    <span>
                                      {item.category ? `${item.category} · ` : ""}
                                      {item.item_code || `#${item.id}`}
                                    </span>
                                  </div>
                                  <span className={`stock-alert-status ${stockStatus}`}>
                                    {stockStatus === "out" ? "OUT OF STOCK" : "LOW STOCK"}
                                  </span>
                                  <div className="stock-alert-row-footer">
                                    <strong className="stock-alert-quantity">{quantity} available</strong>
                                    <form
                                      className="stock-restock-form"
                                      onSubmit={(event) => {
                                        event.preventDefault();
                                        handleRestockItem(item);
                                      }}
                                    >
                                      <label className="sr-only" htmlFor={`restock-${itemKey}`}>
                                        Quantity to add for {itemName}
                                      </label>
                                      <input
                                        id={`restock-${itemKey}`}
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={stockAdditions[itemKey] ?? 1}
                                        onChange={(event) => setStockAdditions((current) => ({
                                          ...current,
                                          [itemKey]: event.target.value
                                        }))}
                                      />
                                      <button type="submit" disabled={restockingItemKey === itemKey}>
                                        <FaPlus /> {restockingItemKey === itemKey ? "Updating…" : "Add stock"}
                                      </button>
                                    </form>
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {isSuperAdmin && activeTab === "GEM_APPROVAL" && (
            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <h2><FaCheckCircle /> Gem Approval</h2>
                  <p>Review gemstones submitted by Admins before they appear in the shop.</p>
                </div>
                  <div className="stock-alert-heading-actions">
                    <span className="admin-live-note">{pendingGemApprovals.length} PENDING APPROVALS</span>
                    <button type="button" className="admin-action-btn" onClick={refreshGemApprovals} disabled={gemApprovalsLoading}>
                      {gemApprovalsLoading ? "Loading…" : "Refresh"}
                    </button>
                  </div>
                </div>
                {gemApprovalsError && (
                  <p className="admin-empty-state" role="alert">
                    {gemApprovalsError}{" "}
                    <button type="button" className="admin-action-btn" onClick={refreshGemApprovals}>Retry</button>
                  </p>
                )}

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
                          <div className="gem-approval-product">
                            {resolveMediaUrl(submission.gem.main_image || submission.gem.image) && (
                              <img
                                className="gem-approval-thumbnail"
                                src={resolveMediaUrl(submission.gem.main_image || submission.gem.image)}
                                alt={submission.gem.name || "Gemstone"}
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            )}
                            <div>
                              <strong>{submission.gem.name}</strong>
                              <div className="table-subtext">
                                {submission.gem.category || "Other Gemstone"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {submission.gem.carat ? `${submission.gem.carat} Ct` : "—"}
                          <div className="table-subtext">{submission.gem.origin || "—"}</div>
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
                              onClick={() => handleGemApproval(submission.id, "approved", submission.isDb)}
                            >
                              <FaCheckCircle /> <span className="jewellery-action-label">Approve</span>
                            </button>
                            <button
                              type="button"
                              className="gem-approval-reject"
                              onClick={() => handleGemApproval(submission.id, "rejected", submission.isDb)}
                            >
                              <FaTimes /> <span className="jewellery-action-label">Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingGemApprovals.length === 0 && (
                      <tr>
                        <td className="admin-empty-state" colSpan="5">
                          {gemApprovalsLoading
                            ? "Loading database approvals…"
                            : "There are no gemstones waiting for approval."}
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
                <div className="stock-alert-heading-actions">
                  <span className="admin-live-note">{pendingJewelleryApprovals.length} PENDING APPROVALS</span>
                  <button type="button" className="admin-action-btn" onClick={refreshJewelleryApprovals} disabled={jewelleryApprovalsLoading}>
                    {jewelleryApprovalsLoading ? "Loading…" : "Refresh"}
                  </button>
                </div>
              </div>
              {jewelleryApprovalsError && (
                <p className="admin-empty-state" role="alert">
                  {jewelleryApprovalsError}{" "}
                  <button type="button" className="admin-action-btn" onClick={refreshJewelleryApprovals}>Retry</button>
                </p>
              )}
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
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {submission.jewellery.image && (
                              <img
                                src={submission.jewellery.image}
                                alt={submission.jewellery.name}
                                style={{ width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }}
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            )}
                            <div>
                              <strong>{submission.jewellery.name}</strong>
                              <div className="table-subtext">
                                {submission.jewellery.shape}
                              </div>
                              {submission.jewellery.product_code && (
                                <code style={{ fontSize: "10px", color: "#8a9693" }}>{submission.jewellery.product_code}</code>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {submission.jewellery.category}
                          <div className="table-subtext">{submission.jewellery.color}</div>
                        </td>
                        <td>
                          <strong className="gold-text">
                            ${Number(submission.jewellery.price || 0).toLocaleString()} {submission.jewellery.currency || "USD"}
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
                              onClick={() => handleJewelleryApproval(submission.id, "approved", submission.isDb)}
                            >
                              <FaCheckCircle /> Approve
                            </button>
                            <button
                              type="button"
                              className="gem-approval-reject"
                              onClick={() => handleJewelleryApproval(submission.id, "rejected", submission.isDb)}
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
                          {jewelleryApprovalsLoading
                            ? "Loading database approvals…"
                            : "There are no jewellery items waiting for approval."}
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
                          <th>Actions</th>
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
                            <td>
                              <div className="gem-inventory-row-actions">
                                <button
                                  type="button"
                                  className="admin-action-btn gem-edit-btn"
                                  onClick={() => handleEditLiveGem(gem)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="gem-delete-btn"
                                  onClick={() => handleDeleteGem(gem.id)}
                                >
                                  <FaTrash /> Delete
                                </button>
                              </div>
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
                                    onClick={() => openCertificateModal(gem, certificate)}
                                  >
                                    <FaFileInvoice /> {certificate ? "Edit Certificate" : "Add Certificate"}
                                  </button>
                                  {certificate && (
                                    <button
                                      type="button"
                                      className="gem-delete-btn certificate-delete-btn"
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
                  <h2><FaGem /> Storefront Gemstone Collection ({storefrontGemsList.length})</h2>
                  <p>Manage gemstone product cards currently displayed in the storefront.</p>
                </div>
              </div>

              <div className="admin-gems-grid">
                {storefrontGemsList.map((gem) => {
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
                  const availableStock = gem.inventoryId
                    ? Number(gem.stock ?? 0)
                    : Number(inventory[getCollectionItemKey(gem)] ?? 0);

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
                      <p>
                        {gem.category || gem.category_name || "Gemstone"}
                        {gem.carat ? ` · ${gem.carat} Ct` : ""}
                        {gem.origin ? ` · ${gem.origin}` : ""}
                      </p>
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
                        <span className="admin-gem-discount-badge">
                          <FaPercent aria-hidden="true" />
                          <span>{discountRate}% OFF</span>
                        </span>
                      )}
                      <span className={`admin-gem-stock ${availableStock > 0 ? "in-stock" : "out-of-stock"}`}>
                        {availableStock > 0 ? `In stock: ${availableStock}` : "Out of stock"}
                      </span>
                      <div className="admin-gem-actions">
                        <button
                          type="button"
                          className="admin-action-btn gem-certificate-btn"
                          disabled={!certificatesLoaded}
                          onClick={() => openCertificateModal(
                            gem,
                            certificatesByGemstone[String(gem.inventoryId || gem.id)] || null
                          )}
                        >
                          <FaFileInvoice />
                          {certificatesLoaded
                            ? certificatesByGemstone[String(gem.inventoryId || gem.id)]
                              ? "Edit Certificate"
                              : "Add Certificate"
                            : "Loading…"}
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn gem-edit-btn"
                          style={{ justifyContent: "center", padding: "8px" }}
                          onClick={() => (
                            gem.inventoryId
                              ? handleEditLiveGem(gem)
                              : handleEditGem(gem)
                          )}
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
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === "JEWELLERY" && (
            <section className="admin-section jewellery-management-layout">
              {/* ── DATABASE JEWELLERY LIVE TABLE ─────────────────────────── */}
              <section className="admin-section gem-database-section jewellery-inventory-section">
                <div className="admin-section-heading">
                  <div>
                    <h2><FaGem /> Live Jewellery Inventory ({backendJewellery.length})</h2>
                    <p>Jewellery records stored in the MySQL database. Edit or delete items directly.</p>
                  </div>
                  {jewelleryLoading && <span className="admin-live-note">LOADING…</span>}
                  {!jewelleryLoading && (
                    <button type="button" className="admin-action-btn" onClick={refreshJewellery}>
                      ↻ Refresh
                    </button>
                  )}
                </div>
                {jewelleryError ? (
                  <p className="admin-empty-state" role="alert">
                    {jewelleryError}{" "}
                    <button type="button" className="admin-action-btn" onClick={refreshJewellery}>Retry</button>
                  </p>
                ) : backendJewellery.length === 0 && !jewelleryLoading ? (
                    <p className="admin-empty-state">No jewellery items in the database yet. Use the form above to add one.</p>
                ) : filteredBackendJewellery.length === 0 && !jewelleryLoading ? (
                    <p className="admin-empty-state">No jewellery items found for this type.</p>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table gem-management-table jewellery-management-table">
                      <thead>
                        <tr>
                          <th>Jewellery</th>
                          <th>Type</th>
                          <th>Gemstone / Color</th>
                          <th>Material</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Handcrafted</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBackendJewellery.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.product_name}</strong>
                              <div className="table-subtext">{item.product_code || "No product code"}</div>
                            </td>
                            <td>
                              <span className="gem-category-pill jewellery-type-pill">
                                {item.jewellery_type || "Other"}
                              </span>
                            </td>
                            <td>
                              {item.gemstone_type || "—"}
                              {item.color && <div className="table-subtext">{item.color}</div>}
                            </td>
                            <td>{item.material || "—"}</td>
                            <td className="gold-text">
                              ${Number(item.price).toLocaleString()}
                              <div className="table-subtext">{item.currency || "USD"}</div>
                            </td>
                            <td>{item.stock_quantity}</td>
                            <td>
                              <span className={`jewellery-handcrafted-status ${Number(item.is_handcrafted) === 1 ? "yes" : "no"}`}>
                                {Number(item.is_handcrafted) === 1 ? "Yes" : "No"}
                              </span>
                            </td>
                            <td>
                              <span className={`gem-database-status jewellery-row-status ${item.status || "pending"}`}>
                                {item.status ? item.status.toUpperCase() : "PENDING"}
                              </span>
                            </td>
                            <td>
                              <div className="jewellery-row-actions">
                                {isSuperAdmin && item.status === "pending" && (
                                  <>
                                    <button
                                      type="button"
                                      className="admin-action-btn jewellery-row-approve-btn"
                                      style={{ backgroundColor: "#1e7e34", color: "#fff", borderColor: "#1e7e34", padding: "4px 8px" }}
                                      onClick={() => handleJewelleryApproval(item.id, "approved", true)}
                                      title="Approve Request"
                                    >
                                      <FaCheckCircle /> Approve
                                    </button>
                                    <button
                                      type="button"
                                      className="admin-action-btn jewellery-row-reject-btn"
                                      style={{ backgroundColor: "#bd2130", color: "#fff", borderColor: "#bd2130", padding: "4px 8px" }}
                                      onClick={() => handleJewelleryApproval(item.id, "rejected", true)}
                                      title="Reject Request"
                                    >
                                      <FaTimes /> Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  className="admin-action-btn gem-edit-btn jewellery-row-edit-btn"
                                  onClick={() => handleEditJewellery(item)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="gem-delete-btn jewellery-row-delete-btn"
                                  onClick={() => handleDeleteJewellery(item.id, true)}
                                >
                                  <FaTrash /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* ── ADD / EDIT FORM ──────────────────────────────────────── */}
              <div
                className={`jewellery-form-slot${editingDbJewelleryId !== null ? " admin-modal-backdrop jewellery-edit-modal-backdrop" : ""}`}
                onClick={editingDbJewelleryId !== null ? closeDbJewelleryEdit : undefined}
              >
                <section
                  className={editingDbJewelleryId !== null ? "admin-account-modal jewellery-edit-modal" : undefined}
                  role={editingDbJewelleryId !== null ? "dialog" : undefined}
                  aria-modal={editingDbJewelleryId !== null ? "true" : undefined}
                  aria-labelledby={editingDbJewelleryId !== null ? "edit-jewellery-title" : undefined}
                  onClick={editingDbJewelleryId !== null ? (event) => event.stopPropagation() : undefined}
                >
              <div className={`add-gem-card${editingDbJewelleryId !== null ? " jewellery-edit-form-card" : ""}`} style={{ marginTop: editingDbJewelleryId !== null ? 0 : "2rem" }}>
                {editingDbJewelleryId !== null ? (
                  <div className="admin-account-modal-heading">
                    <div>
                      <span>LIVE JEWELLERY INVENTORY</span>
                      <h3 id="edit-jewellery-title">Edit Jewellery</h3>
                    </div>
                    <button
                      type="button"
                      className="admin-modal-close"
                      aria-label="Close Edit Jewellery modal"
                      disabled={jewellerySaving}
                      onClick={closeDbJewelleryEdit}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <h2><FaPlus /> {isSuperAdmin ? "Add Jewellery to Database" : "Submit Jewellery Request"}</h2>
                )}
                {(editingDbJewelleryId || !isSuperAdmin) && (
                  <p>
                    {editingDbJewelleryId
                      ? "Update the details below and click Save."
                      : "Enter jewellery details to submit a new request. It will be saved in the database and sent to Super Admin for approval."}
                  </p>
                )}
                <form onSubmit={handleSaveJewellery} className="add-gem-form gemstone-form">
                  <div className="gem-form-row">
                    <div className="form-group">
                      <label htmlFor="jwl-product-name">Product Name *</label>
                      <input
                        id="jwl-product-name"
                        type="text"
                        value={newJewellery.product_name}
                        onChange={(e) => setNewJewellery({ ...newJewellery, product_name: e.target.value })}
                        placeholder="e.g. Blue Sapphire Necklace"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="jwl-type">Jewellery Type</label>
                      <select
                        id="jwl-type"
                        value={newJewellery.jewellery_type}
                        onChange={(e) => setNewJewellery({ ...newJewellery, jewellery_type: e.target.value })}
                      >
                        <option value="Necklaces">Necklaces</option>
                        <option value="Bracelets">Bracelets</option>
                        <option value="Rings">Rings</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Pendants">Pendants</option>
                        <option value="Brooches">Brooches</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="jwl-gemstone-type">Gemstone Type</label>
                      <input
                        id="jwl-gemstone-type"
                        type="text"
                        value={newJewellery.gemstone_type}
                        onChange={(e) => setNewJewellery({ ...newJewellery, gemstone_type: e.target.value })}
                        placeholder="e.g. Blue Sapphire"
                      />
                    </div>
                  </div>
                  <div className="gem-form-row">
                    <div className="form-group">
                      <label htmlFor="jwl-color">Color</label>
                      <input
                        id="jwl-color"
                        type="text"
                        value={newJewellery.color}
                        onChange={(e) => setNewJewellery({ ...newJewellery, color: e.target.value })}
                        placeholder="e.g. Royal Blue"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="jwl-material">Material</label>
                      <input
                        id="jwl-material"
                        type="text"
                        value={newJewellery.material}
                        onChange={(e) => setNewJewellery({ ...newJewellery, material: e.target.value })}
                        placeholder="e.g. 18K Gold"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="jwl-image-url">Image URL / File</label>
                      <input
                        id="jwl-image-url"
                        type="text"
                        value={newJewellery.image_url}
                        onChange={(e) => setNewJewellery({ ...newJewellery, image_url: e.target.value })}
                        placeholder="https://... or /uploads/gemstones/..."
                      />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ marginTop: "6px", fontSize: "11px", color: "#6a7b77" }}
                        onChange={(event) => setJewelleryImageFile(event.target.files?.[0] || null)}
                      />
                      {jewelleryImageFile && <small className="jewellery-selected-image">Selected: {jewelleryImageFile.name}</small>}
                    </div>
                  </div>
                  <div className="gem-form-row">
                    <div className="form-group">
                      <label htmlFor="jwl-price">Price *</label>
                      <input
                        id="jwl-price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={newJewellery.price}
                        onChange={(e) => setNewJewellery({ ...newJewellery, price: e.target.value })}
                        placeholder="e.g. 1500.00"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="jwl-currency">Currency</label>
                      <select
                        id="jwl-currency"
                        value={newJewellery.currency}
                        onChange={(e) => setNewJewellery({ ...newJewellery, currency: e.target.value })}
                      >
                        <option value="USD">USD</option>
                        <option value="LKR">LKR</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="AED">AED</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="jwl-stock">Stock Quantity</label>
                      <input
                        id="jwl-stock"
                        type="number"
                        min="0"
                        step="1"
                        value={newJewellery.stock_quantity}
                        onChange={(e) => setNewJewellery({ ...newJewellery, stock_quantity: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="gem-form-row">
                    <div className="form-group">
                      <label htmlFor="jwl-offer-rate">Offer Rate (%)</label>
                      <input
                        id="jwl-offer-rate"
                        type="number"
                        min="1"
                        max="100"
                        step="0.01"
                        value={newJewellery.offer_rate}
                        onChange={(e) => setNewJewellery({ ...newJewellery, offer_rate: e.target.value })}
                        placeholder="Leave blank for no offer"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="jwl-offer-start">Offer Start Date</label>
                      <input
                        id="jwl-offer-start"
                        type="date"
                        value={newJewellery.offer_start_date}
                        onChange={(e) => setNewJewellery({ ...newJewellery, offer_start_date: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="jwl-offer-end">Offer End Date</label>
                      <input
                        id="jwl-offer-end"
                        type="date"
                        value={newJewellery.offer_end_date}
                        onChange={(e) => setNewJewellery({ ...newJewellery, offer_end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="gem-form-row">
                    <div className="form-group">
                      <label htmlFor="jwl-status">Status</label>
                      <select
                        id="jwl-status"
                        value={newJewellery.status}
                        onChange={(e) => setNewJewellery({ ...newJewellery, status: e.target.value })}
                      >
                        <option value="active">Active (Live on Frontend)</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending Approval</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "1.5rem" }}>
                      <input
                        id="jwl-handcrafted"
                        type="checkbox"
                        checked={newJewellery.is_handcrafted}
                        onChange={(e) => setNewJewellery({ ...newJewellery, is_handcrafted: e.target.checked })}
                        style={{ width: "18px", height: "18px", accentColor: "#b58c36" }}
                      />
                      <label htmlFor="jwl-handcrafted" style={{ margin: 0 }}>Handcrafted</label>
                    </div>
                  </div>
                  <div className="form-group gem-description-field">
                    <label htmlFor="jwl-description">Description</label>
                    <textarea
                      id="jwl-description"
                      rows={3}
                      value={newJewellery.description}
                      onChange={(e) => setNewJewellery({ ...newJewellery, description: e.target.value })}
                      placeholder="Brief description of this jewellery item…"
                    />
                  </div>
                  <div className="add-gem-form-actions gem-submit-actions">
                    <button type="submit" className="add-gem-submit-btn gem-submit-btn" disabled={jewellerySaving}>
                      {jewellerySaving
                        ? "Saving…"
                        : editingDbJewelleryId
                          ? <><FaPlus /> SAVE CHANGES</>
                          : <><FaPlus /> ADD JEWELLERY ITEM</>}
                    </button>
                    {editingDbJewelleryId !== null && (
                      <button type="button" className="gem-edit-cancel-btn" onClick={closeDbJewelleryEdit} disabled={jewellerySaving}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
                </section>
              </div>

                <div className="gem-management-toolbar jewellery-management-toolbar">
                  <label htmlFor="jewellery-type-filter">Filter inventory by jewellery type</label>
                  <select
                    id="jewellery-type-filter"
                    value={jewelleryTypeFilter}
                    onChange={(event) => setJewelleryTypeFilter(event.target.value)}
                  >
                    <option value="all">All Jewellery</option>
                    {["Necklaces", "Bracelets", "Rings", "Earrings", "Pendants", "Brooches", "Other"].map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <span>{filteredBackendJewellery.length} of {backendJewellery.length} database items</span>
                </div>

                {/* STOREFRONT JEWELLERY COLLECTION */}
              <div className="admin-section-heading" style={{ marginTop: "2rem" }}>
                <div>
                  <h2><FaGem /> Storefront Jewellery Collection ({storefrontJewelleryList.length})</h2>
                  <p>Manage jewellery product cards currently displayed in the storefront.</p>
                </div>
              </div>
              <div className="admin-gems-grid">
                {storefrontJewelleryList.map((item) => {
                  const offerProduct = withActiveProductOffer(item);
                  const discountRate = Number(offerProduct.discountRate);
                  const hasDiscount = discountRate > 0 && discountRate <= 100;
                  const stockValue = Number(item.stock_quantity ?? item.stockQuantity ?? item.stock ?? 0);
                  const availableStock = Number.isFinite(stockValue) ? Math.max(0, stockValue) : 0;
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
                        {hasDiscount && (
                          <span className="admin-gem-discount-badge">
                            <FaPercent aria-hidden="true" />
                            <span>{discountRate}% OFF</span>
                          </span>
                        )}
                        <span className={`admin-gem-stock ${availableStock > 0 ? "in-stock" : "out-of-stock"}`}>
                          {availableStock > 0 ? `In stock: ${availableStock}` : "Out of stock"}
                        </span>
                        <div className="admin-gem-actions">
                          <button
                            type="button"
                            className="admin-action-btn jewellery-card-edit-btn"
                            onClick={() => handleEditJewellery(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="gem-delete-btn"
                            onClick={() => handleDeleteJewellery(item.id, Boolean(item.isDbItem || item.product_code))}
                          >
                            <FaTrash /> Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
                {storefrontJewelleryList.length === 0 && (
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
                  <p>Upload, edit, or remove database-backed images used in the homepage hero slideshow.</p>
                </div>
                <span className="admin-live-note">
                  {heroSlidesLoading ? "LOADING SLIDES…" : `${managedHeroSlides.length} DATABASE SLIDES`}
                </span>
              </div>
              {heroSlidesError && (
                <p className="admin-form-error" role="alert">{heroSlidesError}</p>
              )}
              <div className="add-gem-card">
                <div className="blog-editor-heading">
                  <div>
                    <span>HOMEPAGE CONTENT</span>
                    <h3>{editingHeroSlideId ? "Edit hero slide" : "Create a new hero slide"}</h3>
                  </div>
                  {editingHeroSlideId && (
                    <button
                      type="button"
                      className="blog-cancel-edit-btn"
                      onClick={handleCancelHeroSlideEdit}
                      disabled={heroSlideSaving}
                    >
                      <FaTimes /> Cancel editing
                    </button>
                  )}
                </div>
                <form className="blog-editor-form hero-slide-editor-form" onSubmit={handleAddHeroSlide}>
                  <div className="blog-editor-main">
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
                    <div className="hero-slide-editor-note">
                      <FaCheckCircle />
                      <span>Use a concise, descriptive title to provide accessible image text.</span>
                    </div>
                  </div>
                  <aside className="blog-editor-sidebar">
                    <div className="form-group">
                      <span className="admin-form-label">Hero slide image</span>
                      <label
                        className={`blog-cover-dropzone hero-slide-dropzone ${newHeroSlide.image ? "has-image" : ""}`}
                        htmlFor="hero-slide-image"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          const file = event.dataTransfer.files?.[0];
                          if (!file) return;
                          const dataTransfer = new DataTransfer();
                          dataTransfer.items.add(file);
                          const input = document.getElementById("hero-slide-image");
                          input.files = dataTransfer.files;
                          handleProductImageSelection({ currentTarget: input }, setNewHeroSlide);
                        }}
                      >
                        <input
                          id="hero-slide-image"
                          className="admin-image-picker-input"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(event) => handleProductImageSelection(event, setNewHeroSlide)}
                        />
                        {newHeroSlide.image ? (
                          <img
                            className="blog-cover-preview"
                            src={resolveMediaUrl(newHeroSlide.image)}
                            alt="Selected hero slide preview"
                          />
                        ) : (
                          <span className="blog-cover-empty">
                            <span className="blog-cover-upload-icon"><FaUpload /></span>
                            <strong>Drop your slide image here</strong>
                            <small>or click to browse your device</small>
                            <span className="blog-cover-format">JPEG · PNG · WEBP</span>
                          </span>
                        )}
                      </label>
                      <span className="admin-image-help">Choose a high-quality landscape image · up to 10 MB.</span>
                    </div>
                    <div className="blog-editor-publish">
                      <button
                        type="submit"
                        className="add-gem-submit-btn blog-submit-btn"
                        disabled={heroSlideSaving}
                      >
                        {heroSlideSaving
                          ? "SAVING SLIDE…"
                          : editingHeroSlideId
                            ? <><FaCheckCircle /> SAVE SLIDE CHANGES</>
                            : <><FaUpload /> PUBLISH HERO SLIDE</>}
                      </button>
                      <span>
                        {editingHeroSlideId
                          ? "Your changes will update the homepage slideshow."
                          : "The slide will be added to the homepage slideshow."}
                      </span>
                    </div>
                  </aside>
                </form>
              </div>
              <div className="site-content-list">
                {heroSlidesLoading && (
                  <p className="admin-empty-state" role="status">Loading hero slides from the database…</p>
                )}
                {managedHeroSlides.map((slide) => (
                  <article className="blog-admin-card hero-admin-card" key={slide.id}>
                    <img
                      className="blog-admin-card-image"
                      src={resolveMediaUrl(slide.image)}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                      }}
                    />
                    <div className="blog-admin-card-content">
                      <div className="blog-admin-card-meta">
                        <span>Homepage hero slide</span>
                      </div>
                      <h3>{slide.alt}</h3>
                    </div>
                    <div className="blog-admin-card-actions">
                      <button
                        type="button"
                        className="blog-edit-btn"
                        onClick={() => handleEditHeroSlide(slide)}
                        aria-label={`Edit ${slide.alt}`}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        type="button"
                        className="blog-delete-btn"
                        onClick={() => handleRemoveSiteContent("hero slide", slide.id)}
                        aria-label={`Delete ${slide.alt}`}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </article>
                ))}
                {!heroSlidesLoading && !heroSlidesError && managedHeroSlides.length === 0 && (
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
                <div className="blog-editor-heading">
                  <div>
                    <span>{editingBlogPostId ? "EDIT ARTICLE" : "ARTICLE EDITOR"}</span>
                    <h3>{editingBlogPostId ? "Refine your story" : "Create a new story"}</h3>
                  </div>
                  {editingBlogPostId && (
                    <button
                      type="button"
                      className="blog-cancel-edit-btn"
                      onClick={handleCancelBlogEdit}
                    >
                      <FaTimes /> Cancel editing
                    </button>
                  )}
                </div>
                <form className="blog-editor-form" onSubmit={handleAddBlogPost}>
                  <div className="blog-editor-main">
                    <div className="blog-editor-title-row">
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
                    </div>
                    <div className="form-group">
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
                    <div className="form-group blog-content-field">
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
                  </div>
                  <aside className="blog-editor-sidebar">
                    <div className="form-group">
                      <span className="admin-form-label">Article cover image</span>
                      <label
                        className={`blog-cover-dropzone ${newBlogPost.image ? "has-image" : ""}`}
                        htmlFor="blog-post-image"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          const file = event.dataTransfer.files?.[0];
                          if (!file) return;
                          const dataTransfer = new DataTransfer();
                          dataTransfer.items.add(file);
                          const input = document.getElementById("blog-post-image");
                          input.files = dataTransfer.files;
                          handleProductImageSelection({ currentTarget: input }, setNewBlogPost);
                        }}
                      >
                        <input
                          id="blog-post-image"
                          className="admin-image-picker-input"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(event) => handleProductImageSelection(event, setNewBlogPost)}
                        />
                        {newBlogPost.image ? (
                          <img
                            className="blog-cover-preview"
                            src={resolveMediaUrl(newBlogPost.image)}
                            alt="Selected article cover preview"
                          />
                        ) : (
                          <span className="blog-cover-empty">
                            <span className="blog-cover-upload-icon"><FaUpload /></span>
                            <strong>Drop your cover image here</strong>
                            <small>or click to browse your device</small>
                            <span className="blog-cover-format">JPEG · PNG · WEBP</span>
                          </span>
                        )}
                      </label>
                      <span className="admin-image-help">Recommended landscape image · up to 10 MB.</span>
                    </div>
                    <div className="blog-editor-publish">
                      <button type="submit" className="add-gem-submit-btn blog-submit-btn">
                        {editingBlogPostId ? <FaCheckCircle /> : <FaPlus />}
                        {editingBlogPostId ? "SAVE ARTICLE CHANGES" : "PUBLISH BLOG POST"}
                      </button>
                      <span>Your article will appear on the public Blog page.</span>
                    </div>
                  </aside>
                </form>
              </div>
              <div className="site-content-list">
                {managedBlogPosts.map((post) => (
                  <article className="blog-admin-card" key={post.id}>
                    <img
                      className="blog-admin-card-image"
                      src={resolveMediaUrl(post.image)}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                      }}
                    />
                    <div className="blog-admin-card-content">
                      <div className="blog-admin-card-meta">
                        <span>{post.category}</span>
                        <span>{post.date || "Recently published"}</span>
                      </div>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                    </div>
                    <div className="blog-admin-card-actions">
                      <button
                        type="button"
                        className="blog-edit-btn"
                        onClick={() => handleEditBlogPost(post)}
                        aria-label={`Edit ${post.title}`}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        type="button"
                        className="blog-delete-btn"
                        onClick={() => handleRemoveSiteContent("blog post", post.id)}
                        aria-label={`Delete ${post.title}`}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
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

      {editCertificate && (
        <div className="admin-modal-backdrop certificate-modal-backdrop" onClick={closeCertificateModal}>
          <section
            className="admin-account-modal certificate-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="certificate-edit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-account-modal-heading">
              <div>
                <span>GEMSTONE CERTIFICATE</span>
                <h3 id="certificate-edit-title">
                  {editCertificate.id ? "Edit Certificate" : "Add Certificate"}
                </h3>
                <p>For {editCertificate.gemstone_name}</p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                aria-label="Close certificate form"
                disabled={certificateSaving}
                onClick={closeCertificateModal}
              >
                <FaTimes />
              </button>
            </div>
            <form className="certificate-edit-form" onSubmit={handleSaveCertificate}>
              <label>
                Certificate Number
                <input
                  type="text"
                  value={editCertificate.certificate_number}
                  onChange={(event) => setEditCertificate({
                    ...editCertificate,
                    certificate_number: event.target.value
                  })}
                  required
                />
              </label>
              <label>
                Laboratory
                <input
                  type="text"
                  value={editCertificate.laboratory}
                  onChange={(event) => setEditCertificate({
                    ...editCertificate,
                    laboratory: event.target.value
                  })}
                  required
                />
              </label>
              <label>
                Verification Status
                <select
                  value={editCertificate.verification_status}
                  onChange={(event) => setEditCertificate({
                    ...editCertificate,
                    verification_status: event.target.value
                  })}
                >
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </label>
              <label>
                Issue Date
                <input
                  type="date"
                  value={editCertificate.issue_date}
                  onChange={(event) => setEditCertificate({
                    ...editCertificate,
                    issue_date: event.target.value
                  })}
                />
              </label>
              <label className="certificate-file-field">
                Certificate File (PDF, JPG, PNG)
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={(event) => setCertificateFile(event.target.files?.[0] || null)}
                />
              </label>
              {certificateFile && <small className="certificate-selected-file">Selected: {certificateFile.name}</small>}
              {!certificateFile && editCertificate.certificate_url && (
                <a
                  className="certificate-current-file"
                  href={resolveMediaUrl(editCertificate.certificate_url)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View current certificate file
                </a>
              )}
              <div className="admin-account-modal-actions">
                <button type="button" disabled={certificateSaving} onClick={closeCertificateModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-account-add-btn" disabled={certificateSaving}>
                  {certificateSaving ? "Saving…" : "Save Certificate"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {editGem && (
        <div
          className="admin-modal-backdrop gem-edit-modal-backdrop"
          onClick={closeLiveGemEdit}
        >
          <section
            className="admin-account-modal gem-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-gemstone-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-account-modal-heading">
              <div>
                <span>LIVE GEMSTONE INVENTORY</span>
                <h3 id="edit-gemstone-title">Edit Gemstone</h3>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                aria-label="Close Edit Gemstone modal"
                disabled={gemSaving}
                onClick={closeLiveGemEdit}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSaveLiveGem} className="add-gem-form gemstone-form">
              <div className="gem-form-row">
                <div className="form-group">
                  <label htmlFor="edit-gem-name">Gemstone Name *</label>
                  <input
                    id="edit-gem-name"
                    type="text"
                    value={editGem.name}
                    onChange={(event) => setEditGem({ ...editGem, name: event.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-gem-category">Gemstone Category *</label>
                  <select
                    id="edit-gem-category"
                    value={editGem.category_id}
                    onChange={(event) => setEditGem({ ...editGem, category_id: event.target.value })}
                    required
                  >
                    <option value="">Select a database category</option>
                    {backendCategories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-gem-color">Color</label>
                  <input
                    id="edit-gem-color"
                    type="text"
                    value={editGem.color}
                    onChange={(event) => setEditGem({ ...editGem, color: event.target.value })}
                  />
                </div>
              </div>
              <div className="gem-form-row">
                <div className="form-group">
                  <label htmlFor="edit-gem-carat">Carat Weight</label>
                  <input
                    id="edit-gem-carat"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editGem.carat}
                    onChange={(event) => setEditGem({ ...editGem, carat: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <span className="admin-form-label">Dimensions (L x W x H)</span>
                  <div className="gem-dimension-fields">
                    {[
                      { key: "length", label: "Length" },
                      { key: "width", label: "Width" },
                      { key: "height", label: "Height" }
                    ].map(({ key, label }) => (
                      <input
                        key={key}
                        aria-label={`${label} in mm`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={label}
                        value={editGem[key]}
                        onChange={(event) => setEditGem({ ...editGem, [key]: event.target.value })}
                      />
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-gem-clarity">Clarity</label>
                  <input
                    id="edit-gem-clarity"
                    type="text"
                    value={editGem.clarity}
                    onChange={(event) => setEditGem({ ...editGem, clarity: event.target.value })}
                  />
                </div>
              </div>
              <div className="gem-form-row">
                <div className="form-group">
                  <label htmlFor="edit-gem-cut">Cut</label>
                  <input
                    id="edit-gem-cut"
                    type="text"
                    value={editGem.cut}
                    onChange={(event) => setEditGem({ ...editGem, cut: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-gem-shape">Shape</label>
                  <input
                    id="edit-gem-shape"
                    type="text"
                    value={editGem.shape}
                    onChange={(event) => setEditGem({ ...editGem, shape: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-gem-origin">Origin</label>
                  <input
                    id="edit-gem-origin"
                    type="text"
                    value={editGem.origin}
                    onChange={(event) => setEditGem({ ...editGem, origin: event.target.value })}
                  />
                </div>
              </div>
              <div className="gem-form-row">
                <div className="form-group">
                  <label htmlFor="edit-gem-treatment">Treatment Status</label>
                  <select
                    id="edit-gem-treatment"
                    value={editGem.treatment_status}
                    onChange={(event) => setEditGem({ ...editGem, treatment_status: event.target.value })}
                  >
                    {TREATMENT_OPTIONS.map((treatment) => (
                      <option key={treatment}>{treatment}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-gem-price">Price (USD $) *</label>
                  <input
                    id="edit-gem-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editGem.price}
                    onChange={(event) => setEditGem({ ...editGem, price: event.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-gem-stock">Stock Quantity</label>
                  <input
                    id="edit-gem-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={editGem.stock}
                    onChange={(event) => setEditGem({ ...editGem, stock: event.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="edit-gem-status">Availability</label>
                <select
                  id="edit-gem-status"
                  value={editGem.status}
                  onChange={(event) => setEditGem({ ...editGem, status: event.target.value })}
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div className="form-group gem-description-field">
                <label htmlFor="edit-gem-description">Description</label>
                <textarea
                  id="edit-gem-description"
                  rows={3}
                  value={editGem.description}
                  onChange={(event) => setEditGem({ ...editGem, description: event.target.value })}
                />
              </div>
              <section className="gem-media-section">
                <div>
                  <h3 className="gem-detail-upload-heading">Gemstone Gallery &amp; Uploads</h3>
                  <p className="admin-image-help">Upload the main image, four views, and one inspection clip.</p>
                </div>
                <div className="gem-media-grid">
                  {[
                    { name: "mainImage", field: "mainImage", label: "Main Gemstone Image", accept: "image/jpeg,image/png,image/webp" },
                    { name: "backViewImage", field: "backViewImage", label: "Back View", accept: "image/jpeg,image/png,image/webp" },
                    { name: "rightViewImage", field: "rightViewImage", label: "Right View", accept: "image/jpeg,image/png,image/webp" },
                    { name: "leftViewImage", field: "leftViewImage", label: "Left View", accept: "image/jpeg,image/png,image/webp" },
                    { name: "additional_view_1", field: "additional_view_1", label: "Additional View 1", accept: "image/jpeg,image/png,image/webp" },
                    { name: "additional_view_2", field: "additional_view_2", label: "Additional View 2", accept: "image/jpeg,image/png,image/webp" },
                    { name: "videoClip", field: "videoClip", label: "Inspection Video Clip", accept: "video/mp4,video/webm,video/quicktime" }
                  ].map(({ name, field, label, accept }) => (
                    <div className="form-group edit-gem-media-input" key={name}>
                      <label htmlFor={`edit-gem-${name}`}>{label}</label>
                      {editGem[field] && !editGemFiles[name] && (
                        <a href={resolveMediaUrl(editGem[field])} target="_blank" rel="noreferrer">
                          View current file
                        </a>
                      )}
                      {editGemFiles[name] && <small>{editGemFiles[name].name}</small>}
                      <input
                        id={`edit-gem-${name}`}
                        name={name}
                        type="file"
                        accept={accept}
                        onChange={(event) => setEditGemFiles({
                          ...editGemFiles,
                          [name]: event.target.files?.[0] || null
                        })}
                      />
                    </div>
                  ))}
                </div>
              </section>
              <section className="gem-offer-section">
                <div className="form-group">
                  <label htmlFor="edit-gem-offer-rate">Offer Rate (%) (optional)</label>
                  <input
                    id="edit-gem-offer-rate"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={editGem.discountRate}
                    onChange={(event) => setEditGem({ ...editGem, discountRate: event.target.value })}
                  />
                </div>
                <div className="offer-date-row">
                  <div className="form-group">
                    <label htmlFor="edit-gem-offer-start-date">Offer Start Date</label>
                    <input
                      id="edit-gem-offer-start-date"
                      type="date"
                      value={editGem.offerStartDate}
                      onChange={(event) => setEditGem({ ...editGem, offerStartDate: event.target.value })}
                      required={Boolean(editGem.discountRate)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-gem-offer-end-date">Offer End Date</label>
                    <input
                      id="edit-gem-offer-end-date"
                      type="date"
                      min={editGem.offerStartDate || undefined}
                      value={editGem.offerEndDate}
                      onChange={(event) => setEditGem({ ...editGem, offerEndDate: event.target.value })}
                      required={Boolean(editGem.discountRate)}
                    />
                  </div>
                </div>
              </section>
              <div className="add-gem-form-actions gem-submit-actions">
                <button
                  type="button"
                  className="gem-edit-cancel-btn"
                  disabled={gemSaving}
                  onClick={closeLiveGemEdit}
                >
                  Cancel
                </button>
                <button type="submit" className="add-gem-submit-btn gem-submit-btn" disabled={gemSaving}>
                  {gemSaving ? "Saving…" : "SAVE GEMSTONE"}
                </button>
              </div>
            </form>
          </section>
        </div>
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
                  <span>Order Ref: {selectedOrderDetails.orderNumber || selectedOrderDetails.id}</span>
                </div>
                <span className={`invoice-status-tag status-${String(selectedOrderDetails.status).toLowerCase()}`}>
                  ● {selectedOrderDetails.status}
                </span>
              </div>

              {/* COURIER & LIVE TRACKING BANNER */}
              <div className="invoice-tracking-banner">
                <div className="invoice-tracking-title">
                  <span><FaTruck /> International Priority Air Courier</span>
                  <span className="invoice-tracking-carrier">
                    {selectedOrderDetails.courier || selectedOrderDetails.shipment?.courier || "Not assigned"}
                  </span>
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
                  <span className="invoice-box-label"><FaGem /> Ordered Items</span>
                  {selectedOrderDetails.items?.length > 0 ? selectedOrderDetails.items.map((item) => (
                    <p key={item.id}>
                      <strong>{item.gemstone_name}</strong>
                      {" "}× {item.quantity} · {Number(item.price).toLocaleString()} {item.currency || selectedOrderDetails.currency}
                    </p>
                  )) : <p>No item details available.</p>}
                </div>

                <div className="invoice-box">
                  <span className="invoice-box-label"><FaCreditCard /> Financial Settlement</span>
                  <strong style={{ color: "#0d5c3a" }}>{selectedOrderDetails.paymentStatus}</strong>
                  <p>Order Placed: {selectedOrderDetails.date}</p>
                  <p>
                    Total: {Number(selectedOrderDetails.totalAmount).toLocaleString()} {selectedOrderDetails.currency}
                  </p>
                </div>

                <div className="invoice-box">
                  <span className="invoice-box-label"><FaShieldAlt /> Shipping Summary</span>
                  <strong>{selectedOrderDetails.status}</strong>
                  <p>Shipping cost: {Number(selectedOrderDetails.shippingCost).toLocaleString()} {selectedOrderDetails.currency}</p>
                </div>
              </div>
            </div>

            <div className="order-invoice-footer" style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="invoice-footer-btn outline"
                  onClick={() => window.print()}
                >
                  <FaPrint /> Print Invoice Slip
                </button>
                <button
                  type="button"
                  className="invoice-footer-btn outline"
                  style={{ borderColor: "#c9a24b", color: "#8a6417" }}
                  onClick={() => {
                    const orderToShip = selectedOrderDetails;
                    setSelectedOrderDetails(null);
                    handleOpenShipmentModal(orderToShip);
                  }}
                >
                  <FaTruck /> Update Shipment
                </button>
                {selectedOrderDetails.status !== "DELIVERED" && selectedOrderDetails.status !== "CANCELLED" && (
                  <button
                    type="button"
                    className="invoice-footer-btn outline"
                    style={{ borderColor: "#dc2626", color: "#dc2626", background: "#fff5f5" }}
                    onClick={() => handleCancelOrder(selectedOrderDetails)}
                  >
                    <FaBan /> Cancel Order
                  </button>
                )}
              </div>
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

      {/* LUXURY SHIPMENT & LOGISTICS TRACKING MANAGEMENT MODAL */}
      {activeShipmentOrder && (
        <div className="royal-modal-backdrop" onClick={() => !shipmentSaving && setActiveShipmentOrder(null)}>
          <div
            className="order-invoice-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shipment-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "620px" }}
          >
            <div className="order-invoice-header">
              <div className="order-invoice-header-brand">
                <BrandLogo alt="Ceylon Royal Gemstones" />
                <div className="order-invoice-header-titles">
                  <span>LOGISTICS &amp; AIR COURIER DISPATCH</span>
                  <h3 id="shipment-modal-title">Shipment &amp; Tracking Management</h3>
                </div>
              </div>
              <button
                type="button"
                className="order-invoice-close"
                aria-label="Close dialog"
                onClick={() => !shipmentSaving && setActiveShipmentOrder(null)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveShipment}>
              <div className="order-invoice-body" style={{ padding: "24px" }}>
                <div className="invoice-badge-row" style={{ marginBottom: "16px" }}>
                  <div className="invoice-order-ref">
                    <FaTruck style={{ color: "#c9a24b" }} />
                    <span>Order: {activeShipmentOrder.orderNumber || activeShipmentOrder.id}</span>
                  </div>
                  <span className={`invoice-status-tag status-${String(activeShipmentOrder.status).toLowerCase()}`}>
                    ● {activeShipmentOrder.status}
                  </span>
                </div>

                <div style={{ background: "#f8f9fa", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "18px", fontSize: "12px" }}>
                  <div><strong>Customer:</strong> {activeShipmentOrder.customerName} ({activeShipmentOrder.customerEmail})</div>
                  <div style={{ marginTop: "4px" }}><FaMapMarkerAlt style={{ color: "#b58c36", marginRight: "4px" }} /><strong>Destination:</strong> {activeShipmentOrder.shippingAddress}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#041d1a", marginBottom: "6px" }}>
                      AIR COURIER CARRIER *
                    </label>
                    <select
                      value={shipmentForm.courier}
                      onChange={(e) => setShipmentForm((f) => ({ ...f, courier: e.target.value }))}
                      className="admin-status-select"
                      style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
                      required
                    >
                      <option value="DHL Express">DHL Express Priority</option>
                      <option value="FedEx Express">FedEx Express International</option>
                      <option value="Sri Lanka Post EMS">Sri Lanka Post EMS</option>
                      <option value="UPS Worldwide Express">UPS Worldwide Express</option>
                      <option value="Aramex Priority">Aramex International</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#041d1a", marginBottom: "6px" }}>
                      AIR WAYBILL / TRACKING NUMBER *
                    </label>
                    <input
                      type="text"
                      value={shipmentForm.tracking_number}
                      onChange={(e) => setShipmentForm((f) => ({ ...f, tracking_number: e.target.value }))}
                      placeholder="e.g. DHL123456789"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#041d1a", marginBottom: "6px" }}>
                      SHIPPING METHOD
                    </label>
                    <select
                      value={shipmentForm.shipping_method_id}
                      onChange={(e) => setShipmentForm((f) => ({ ...f, shipping_method_id: e.target.value }))}
                      className="admin-status-select"
                      style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
                    >
                      {shippingMethods.map((sm) => (
                        <option key={sm.id} value={sm.id}>
                          {sm.shipping_method} ({sm.country} - ${Number(sm.shipping_cost || 0)} {sm.currency})
                        </option>
                      ))}
                      {shippingMethods.length === 0 && (
                        <option value="2">DHL Express International (Insured Courier)</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#041d1a", marginBottom: "6px" }}>
                      ESTIMATED DELIVERY DATE
                    </label>
                    <input
                      type="date"
                      value={shipmentForm.estimated_delivery}
                      onChange={(e) => setShipmentForm((f) => ({ ...f, estimated_delivery: e.target.value }))}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#041d1a", marginBottom: "6px" }}>
                    SHIPMENT LOGISTICS STATUS
                  </label>
                  <select
                    value={shipmentForm.status}
                    onChange={(e) => setShipmentForm((f) => ({ ...f, status: e.target.value }))}
                    className="admin-status-select"
                    style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
                  >
                    <option value="PENDING">PENDING (Vault Dispatch Preparation)</option>
                    <option value="SHIPPED">SHIPPED (Handed to Air Courier)</option>
                    <option value="IN_TRANSIT">IN TRANSIT (International Flight / Customs)</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY (Destination Courier)</option>
                    <option value="DELIVERED">DELIVERED (Signed &amp; Received)</option>
                    <option value="CANCELLED">CANCELLED (Shipment Cancelled)</option>
                  </select>
                </div>
              </div>

              <div className="order-invoice-footer" style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="invoice-footer-btn outline"
                  onClick={() => setActiveShipmentOrder(null)}
                  disabled={shipmentSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="invoice-footer-btn gold"
                  disabled={shipmentSaving}
                >
                  <FaTruck /> {shipmentSaving ? "Saving Shipment…" : "Save & Update Shipment"}
                </button>
              </div>
            </form>
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
