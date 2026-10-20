import { useEffect, useState } from "react";
import ShopNavDropdown from "../components/ShopNavDropdown.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import {
  FaBoxOpen,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaCertificate,
  FaDownload,
  FaShieldAlt,
  FaUserCheck,
  FaSignOutAlt,
  FaHeart,
  FaShoppingBag,
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebookF,
  FaUser,
  FaBan
} from "react-icons/fa";
import CollectionDrawerPanel from "../components/CollectionDrawerPanel.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import SiteInquiryModal from "../components/SiteInquiryModal.jsx";
import { useSharedCollection } from "../useSharedCollection.js";
import { apiGet, apiPut, clearCustomerToken, resolveMediaUrl } from "../services/api.js";
import "./MyOrders.css";
import "./About.css";
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";

const formatOrderCurrency = (amount, currency = "USD") => {
  const currencyCode = /^[A-Z]{3}$/.test(String(currency).toUpperCase())
    ? String(currency).toUpperCase()
    : "USD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);
};

const formatEstimatedDelivery = (value) => {
  const datePart = String(value || "").match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (!datePart) return value || "To be confirmed";

  const date = new Date(`${datePart}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
};

const MyOrders = () => {
  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const [user] = useState(() => {
    try {
      const customer = JSON.parse(window.localStorage.getItem("ceylon-user") || "null");
      if (customer) return customer;
      const admin = JSON.parse(window.localStorage.getItem("ceylon-admin-session") || "null");
      if (admin) return { name: admin.name || "Admin", email: admin.email || "admin@ceylongemstones.com", loggedIn: true };
      return null;
    } catch {
      return null;
    }
  });

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    const userId = user?.id || window.localStorage.getItem("ceylon-user-id");
    if (!userId) {
      return undefined;
    }

    let isActive = true;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const response = await apiGet(`/api/orders/user/${encodeURIComponent(userId)}`);
        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error("The orders service returned an invalid response.");
        }
        if (!response.ok || data?.success !== true || !Array.isArray(data?.data)) {
          throw new Error(data?.message || "Unable to load your orders.");
        }

        const fetchedOrders = data.data.map((order) => {
          const status = order.order_status || "PENDING";
          const currency = order.currency || "USD";
          const statusIsInTransit = ["DISPATCHED", "SHIPPED"].includes(status);

          return {
            id: order.order_number || `ORD-${order.id}`,
            dbId: order.id,
            date: order.created_at ? String(order.created_at).slice(0, 10) : "",
            status,
            statusColor:
              status === "DELIVERED" ? "status-delivered" :
              status === "CANCELLED" ? "status-cancelled" : "status-dispatched",
            statusText:
              status === "DELIVERED" ? "Delivered & Signed by Recipient" :
              status === "CANCELLED" ? "Order has been cancelled" :
              statusIsInTransit ? "In Transit via Priority Air Courier" :
              "Order received and being prepared",
            paymentStatus: `${order.payment_status || "PENDING"} (${Number(order.final_total ?? order.total_amount ?? 0).toLocaleString()} ${currency})`,
            trackingNumber: order.tracking_number || order.shipment?.tracking_number || "Tracking details pending",
            estimatedDelivery: order.estimated_delivery || order.shipment?.estimated_delivery || "To be confirmed",
            courier: order.courier || order.shipment?.courier || "",
            shippingMethod: order.shipping_method || order.shipment?.shipping_method || "",
            shippingAddress: order.shipping_address || "",
            currency,
            itemSubtotal: (Array.isArray(order.items) ? order.items : []).reduce(
              (sum, item) =>
                sum + Number(item.original_price ?? item.price ?? 0) *
                  (Number(item.quantity) || 1),
              0
            ),
            discountTotal: (Array.isArray(order.items) ? order.items : []).reduce(
              (sum, item) =>
                sum + Math.max(
                  0,
                  Number(item.original_price ?? item.price ?? 0) -
                    Number(item.price ?? 0)
                ) * (Number(item.quantity) || 1),
              0
            ),
            discountLabel: [...new Set(
              (Array.isArray(order.items) ? order.items : [])
                .map((item) => Number(item.discount_rate))
                .filter((rate) => rate > 0)
            )]
              .sort((a, b) => a - b)
              .map((rate) => `${rate}%`)
              .join(", "),
            shippingCost: Number(order.shipping_cost || 0),
            totalPaid: Number(
              order.final_total ?? order.total_amount ?? 0
            ),
            items: (Array.isArray(order.items) ? order.items : []).map((item) => ({
              category: String(item.item_type).toLowerCase() === "jewellery"
                ? "JEWELLERY"
                : "GEMSTONE",
              name: item.name || item.gemstone_name ||
                (item.item_type === "jewellery" ? "Jewellery" : "Gemstone"),
              carat: item.carat ? `${item.carat} Ct` : "Not provided",
              cut: item.cut || item.shape || "Not provided",
              origin: item.origin || "Not provided",
              material: item.material || (Number(item.is_handcrafted) ? "Handcrafted" : "Not provided"),
              gemstoneType: item.gemstone_type || "Not provided",
              jewelleryType: item.jewellery_type ||
                (Number(item.is_handcrafted) ? "Handcrafted" : "Not provided"),
              certificateId: item.certificate_number || "",
              price: Number(item.price || 0),
              originalPrice: Number(item.original_price ?? item.price ?? 0),
              discountRate: Number(item.discount_rate || 0),
              quantity: Number(item.quantity) || 1,
              currency: item.currency || currency,
              image: resolveMediaUrl(
                item.image || item.image_url || item.imageUrl
              ) || "/blueGem.jpg",
              tag: item.tag || item.treatment || item.item_type?.toUpperCase() || "ORDER ITEM",
            })),
            timeline: [
              { step: "Order Placed & Confirmed", date: order.created_at ? String(order.created_at).slice(0, 16) : "", completed: true },
              { step: "Gemological Lab Verification", date: "Pending", completed: !["PENDING", "CANCELLED"].includes(status) },
              { step: "Packaging & Dispatch", date: "Pending", completed: statusIsInTransit || status === "DELIVERED" },
              { step: "Delivery", date: "Pending", completed: status === "DELIVERED" },
            ],
          };
        });

        if (isActive) setOrders(fetchedOrders);
      } catch (error) {
        if (isActive) {
          setOrders([]);
          setOrdersError(error instanceof Error ? error.message : "Unable to load your orders.");
        }
      } finally {
        if (isActive) setOrdersLoading(false);
      }
    };

    fetchOrders();
    window.addEventListener("focus", fetchOrders);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchOrders();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isActive = false;
      window.removeEventListener("focus", fetchOrders);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.id]);

  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedOrderTracking, setSelectedOrderTracking] = useState(null);

  const handleLogout = () => {
    clearCustomerToken();
    window.localStorage.removeItem("ceylon-user");
    window.localStorage.removeItem("ceylon-user-id");
    window.localStorage.removeItem("ceylon-admin-session");
    window.dispatchEvent(new Event("ceylon-user-auth-change"));
    window.location.href = "/login";
  };

  const handleCancelCustomerOrder = async (order) => {
    if (order.status === "DELIVERED") {
      alert("Delivered orders cannot be cancelled.");
      return;
    }
    if (order.status === "CANCELLED") {
      alert("This order is already cancelled.");
      return;
    }
    if (!window.confirm(`Are you sure you want to cancel order ${order.id}?`)) {
      return;
    }

    if (order.dbId) {
      try {
        const res = await apiPut(`/api/orders/${order.dbId}/cancel`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to cancel order");
        }
      } catch (err) {
        alert(err.message || "Failed to cancel order");
        return;
      }
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: "CANCELLED",
              statusColor: "status-cancelled",
              statusText: "Order has been cancelled"
            }
          : o
      )
    );
    alert(`Order ${order.id} has been cancelled successfully.`);
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "DISPATCHED") return order.status === "DISPATCHED" || order.status === "PROCESSING";
    if (activeTab === "DELIVERED") return order.status === "DELIVERED";
    return true;
  });

  const wishlistCount = wishlist.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="my-orders-page">
      {/* NAVBAR */}
      <nav className="about-navbar my-orders-navbar">
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
          <a href="/blog">Blog</a>
          <a href="/contact">Contact</a>
          <a href="/my-orders" className="active">My Orders</a>
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
          {/* <button
            type="button"
            className="about-nav-icon"
            title="Shopping Cart"
            onClick={() => setActiveDrawer("cart")}
          >
            <FaShoppingBag />
            {cartCount > 0 && <span className="about-badge">{cartCount}</span>}
          </button> */}
          <a
            href="https://wa.me/94712345678"
            target="_blank"
            rel="noreferrer"
            className="about-inquire-btn"
          >
            INQUIRE NOW
          </a>
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

      {/* MAIN BODY CONTENT */}
      <main className="my-orders-main">
        <div className="my-orders-container">
          {/* USER PROFILE BREADCRUMB / HERO BANNER */}
          <section className="profile-banner">
            <div className="profile-info">
              <div className="profile-avatar">
                <FaUserCheck />
              </div>
              <div>
                <span className="profile-welcome">ROYAL COLLECTOR DASHBOARD</span>
                <h1>{user ? `Welcome back, ${user.name || user.email}` : "Customer Order Portal"}</h1>
                <p>
                  {user
                    ? `Account Email: ${user.email} • Verified Gemstone Buyer`
                    : "Track your authentic Sri Lankan gemstone purchases & certificate records."}
                </p>
              </div>
            </div>

            <div className="profile-auth-prompt">
              {user ? (
                <>
                  <p>ACCOUNT STATUS: <strong style={{ color: "#c9a24b" }}>VERIFIED VIP</strong></p>
                  <button type="button" className="user-logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <p>Access your collector account</p>
                  <a href="/login" className="my-orders-login-btn">
                    Sign In / Register
                  </a>
                </>
              )}
            </div>
          </section>

          {/* FILTER TABS */}
          <div className="orders-filter-bar">
            <div className="filter-tabs">
              <button
                type="button"
                className={`filter-tab ${activeTab === "ALL" ? "active" : ""}`}
                onClick={() => setActiveTab("ALL")}
              >
                All Orders ({orders.length})
              </button>
              <button
                type="button"
                className={`filter-tab ${activeTab === "DISPATCHED" ? "active" : ""}`}
                onClick={() => setActiveTab("DISPATCHED")}
              >
                In Transit / Processing ({orders.filter(o => o.status !== "DELIVERED").length})
              </button>
              <button
                type="button"
                className={`filter-tab ${activeTab === "DELIVERED" ? "active" : ""}`}
                onClick={() => setActiveTab("DELIVERED")}
              >
                Completed &amp; Delivered ({orders.filter(o => o.status === "DELIVERED").length})
              </button>
            </div>
            <span className="secure-badge">
              <FaShieldAlt /> 100% Insured &amp; Certified Shipments
            </span>
          </div>

          {/* ORDER CARDS LIST */}
          <div className="orders-list">
            {ordersLoading ? (
              <p className="empty-orders-card" role="status">Loading your orders…</p>
            ) : ordersError ? (
              <p className="empty-orders-card" role="alert">{ordersError}</p>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-orders-card">
                <FaBoxOpen className="empty-icon" />
                <h3>{orders.length === 0 ? "No orders yet" : "No orders found in this category"}</h3>
                <p>Browse our handpicked natural Ceylon sapphires, rubies, and emeralds.</p>
                <a href="/gemstones" className="about-inquire-btn">
                  EXPLORE GEMSTONES
                </a>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <article key={order.id} className="order-card">
                  {/* CARD HEADER */}
                  <div className="order-card-header">
                    <div className="order-meta">
                      <div className="order-id-group">
                        <span className="order-label">ORDER ID</span>
                        <strong className="order-id">{order.id}</strong>
                      </div>
                      <div className="order-meta-item">
                        <span className="order-label">DATE PLACED</span>
                        <span>{order.date}</span>
                      </div>
                      <div className="order-meta-item">
                        <span className="order-label">PAYMENT STATUS</span>
                        <span className="payment-status-badge">{order.paymentStatus}</span>
                      </div>
                    </div>

                    <div className="order-status-group">
                      <span className={`status-pill ${order.statusColor}`}>
                        {order.status === "DELIVERED" ? <FaCheckCircle /> : <FaTruck />}
                        {order.status}
                      </span>
                      <span className="status-desc">{order.statusText}</span>
                    </div>
                  </div>

                  {/* ITEMS LIST IN ORDER */}
                  <div className="order-items-list">
                    {order.items.length === 0 && <p>Item details are not available for this order.</p>}
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="order-item-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/blueGem.jpg";
                          }}
                        />
                        <div className="order-item-details">
                          <span className="order-item-tag">{item.tag}</span>
                          <h2>{item.name}</h2>
                          <div className="order-item-specs">
                            {item.category === "GEMSTONE" ? (
                              <>
                                <span>Weight: <strong>{item.carat}</strong></span>
                                <span>Cut: <strong>{item.cut}</strong></span>
                                <span>Origin: <strong>{item.origin}</strong></span>
                              </>
                            ) : (
                              <>
                                <span>Material: <strong>{item.material}</strong></span>
                                <span>Gemstone Type: <strong>{item.gemstoneType}</strong></span>
                                <span>Jewellery Type: <strong>{item.jewelleryType}</strong></span>
                              </>
                            )}
                          </div>
                          {item.category === "GEMSTONE" && item.certificateId && (
                            <div className="order-item-cert">
                              <FaCertificate /> Gemological Certificate ID: <strong>{item.certificateId}</strong>
                            </div>
                          )}
                        </div>
                        <div className="order-item-pricing">
                          <span className="order-item-price">
                            {formatOrderCurrency(item.price * item.quantity, item.currency)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="shipping-note">Qty {item.quantity}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-price-breakdown">
                    <div>
                      <span>Items Subtotal</span>
                      <strong>{formatOrderCurrency(order.itemSubtotal, order.currency)}</strong>
                    </div>
                    {order.discountTotal > 0 && (
                      <div className="order-discount-row">
                        <span>Discount{order.discountLabel ? ` (${order.discountLabel} OFF)` : ""}</span>
                        <strong>−{formatOrderCurrency(order.discountTotal, order.currency)}</strong>
                      </div>
                    )}
                    <div>
                      <span>Shipping Fee{order.shippingMethod ? ` — ${order.shippingMethod}` : ""}</span>
                      <strong>{formatOrderCurrency(order.shippingCost, order.currency)}</strong>
                    </div>
                    <div className="order-paid-row">
                      <span>Total Paid</span>
                      <strong>{formatOrderCurrency(order.totalPaid, order.currency)}</strong>
                    </div>
                  </div>

                  {/* ORDER TIMELINE STEPPER */}
                  <div className="order-timeline-container">
                    <h4>SHIPMENT &amp; VERIFICATION PROGRESS</h4>
                    <div className="timeline-stepper">
                      {order.timeline.map((step, index) => (
                        <div
                          key={index}
                          className={`timeline-step ${step.completed ? "completed" : "pending"}`}
                        >
                          <div className="timeline-dot">
                            {step.completed ? <FaCheckCircle /> : <FaClock />}
                          </div>
                          <div className="timeline-content">
                            <strong>{step.step}</strong>
                            <small>{step.date}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CARD ACTIONS FOOTER */}
                  <div className="order-card-footer">
                    <div className="tracking-code-info">
                      {order.shippingMethod && (
                        <div className="tracking-detail">
                          <span>Shipping Method</span>
                          <strong>{order.shippingMethod}</strong>
                        </div>
                      )}
                      <div className="tracking-detail">
                        <span>Airway Bill / Tracking</span>
                        <strong>{order.trackingNumber}</strong>
                      </div>
                      {order.courier && (
                        <div className="tracking-detail tracking-courier">
                          <span>Courier</span>
                          <strong>{order.courier}</strong>
                        </div>
                      )}
                    </div>

                    <div className="order-action-buttons">
                      {order.items[0]?.certificateId && (
                        <button
                          type="button"
                          className="btn-order-action secondary"
                          onClick={() =>
                            alert(`Downloading Gemological Certificate ${order.items[0].certificateId}...`)
                          }
                        >
                          <FaDownload /> Certificate (PDF)
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-order-action primary"
                        onClick={() => setSelectedOrderTracking(order)}
                      >
                        <FaTruck /> Track Live Status
                      </button>

                      <button
                        type="button"
                        className="btn-order-action outline"
                        onClick={() => setIsInquiryOpen(true)}
                      >
                        <FaEnvelope /> Support Inquiry
                      </button>

                      {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                        <button
                          type="button"
                          className="btn-order-action outline"
                          style={{ borderColor: "#dc2626", color: "#dc2626" }}
                          onClick={() => handleCancelCustomerOrder(order)}
                        >
                          <FaBan /> Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </main>

      {/* TRACKING MODAL OVERLAY */}
      {selectedOrderTracking && (
        <div className="tracking-modal-backdrop" onClick={() => setSelectedOrderTracking(null)}>
          <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FaTruck /> Shipment Tracking: {selectedOrderTracking.id}
              </h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedOrderTracking(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-tracking-summary">
                <div>
                  <span>Courier Service</span>
                  <strong>{selectedOrderTracking.courier || "Courier not assigned"}</strong>
                </div>
                <div>
                  <span>Tracking Number</span>
                  <strong>{selectedOrderTracking.trackingNumber}</strong>
                </div>
                <div>
                  <span>Estimated Delivery</span>
                  <strong className="tracking-summary-value">
                    {formatEstimatedDelivery(selectedOrderTracking.estimatedDelivery)}
                  </strong>
                </div>
              </div>

              <h4>Detailed Live Tracking Checkpoints</h4>
              <div className="tracking-checkpoints">
                {selectedOrderTracking.timeline.map((item, idx) => (
                  <div key={idx} className={`checkpoint-item ${item.completed ? "active" : ""}`}>
                    <div className="checkpoint-marker"></div>
                    <div className="checkpoint-text">
                      <strong>{item.step}</strong>
                      <p>{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="about-inquire-btn"
                onClick={() => setSelectedOrderTracking(null)}
              >
                CLOSE TRACKING
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="about-footer">
        <div className="about-footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <BrandLogo alt="Ceylon Royal Gemstones" />
              <div>
                <strong>CEYLON</strong>
                <small>ROYAL GEMSTONES</small>
              </div>
            </div>
            <p>
              Discover the timeless beauty of authentic Sri Lankan gemstones, carefully sourced,
              crafted and presented with royal elegance.
            </p>
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
            <a href="/my-orders">My Orders</a>
          </div>

          <div>
            <h4>CONTACT</h4>
            <a href="tel:+94712345678"><FaPhoneAlt /> +94 71 234 5678</a>
            <a href="mailto:info@ceylonroyalgemstones.com"><FaEnvelope /> info@ceylonroyalgemstones.com</a>
            <a
              href="https://wa.me/94712345678"
              target="_blank"
              rel="noreferrer"
              className="footer-whatsapp"
            >
              <FaWhatsapp /> WhatsApp
            </a>
            <a href="#"><FaMapMarkerAlt /> Ratnapura, Sri Lanka</a>
          </div>

          <div>
            <h4>FOLLOW US</h4>
            <p>Follow our journey and discover the world of Ceylon gemstones.</p>
            <div className="footer-social-icons">
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
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
        <SiteInquiryModal source="My Orders Page" onClose={() => setIsInquiryOpen(false)} />
      )}
    </div>
  );
};

export default MyOrders;
