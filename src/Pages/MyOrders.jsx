import { useState } from "react";
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
  FaUser
} from "react-icons/fa";
import CollectionDrawerPanel from "../components/CollectionDrawerPanel.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import SiteInquiryModal from "../components/SiteInquiryModal.jsx";
import { useSharedCollection } from "../useSharedCollection.js";
import "./MyOrders.css";
import "./About.css";
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";

// Sample luxury gemstone orders for initial view / fallback
const sampleOrders = [
  {
    id: "CRG-94821",
    date: "2026-09-28",
    status: "DISPATCHED",
    statusColor: "status-dispatched",
    statusText: "In Transit via FedEx International Priority",
    paymentStatus: "PAID ($12,500)",
    trackingNumber: "FEX-9920184712-LK",
    estimatedDelivery: "2026-10-04",
    items: [
      {
        name: "ROYAL BLUE SAPPHIRE",
        carat: "4.52 Ct",
        cut: "Cushion Cut",
        origin: "Ratnapura, Sri Lanka",
        certificateId: "GIC-2026-8891",
        price: 12500,
        image: "/blueGem.jpg",
        tag: "CERTIFIED NATURAL"
      }
    ],
    timeline: [
      { step: "Order Placed & Confirmed", date: "2026-09-28 10:30 AM", completed: true },
      { step: "Gemological Lab Verification (GIC)", date: "2026-09-28 03:15 PM", completed: true },
      { step: "Royal Vault Vaulting & Packaging", date: "2026-09-29 09:00 AM", completed: true },
      { step: "Dispatched / Customs Cleared", date: "2026-09-29 06:45 PM", completed: true },
      { step: "In Transit to Destination", date: "Estimated Oct 04, 2026", completed: false }
    ]
  },
  {
    id: "CRG-88231",
    date: "2026-09-14",
    status: "DELIVERED",
    statusColor: "status-delivered",
    statusText: "Delivered & Signed by Recipient",
    paymentStatus: "PAID ($18,900)",
    trackingNumber: "FEX-8817290123-LK",
    estimatedDelivery: "2026-09-18",
    items: [
      {
        name: "CEYLON PADPARADSCHA SAPPHIRE",
        carat: "3.18 Ct",
        cut: "Oval Master Cut",
        origin: "Elahera, Sri Lanka",
        certificateId: "GRS-2026-7734",
        price: 18900,
        image: "/PADPARADSCHAgem2.jpg",
        tag: "RARE COLLECTOR"
      }
    ],
    timeline: [
      { step: "Order Placed & Confirmed", date: "2026-09-14 02:20 PM", completed: true },
      { step: "Gemological Lab Verification (GRS)", date: "2026-09-14 05:40 PM", completed: true },
      { step: "Royal Vault Vaulting & Packaging", date: "2026-09-15 11:00 AM", completed: true },
      { step: "Dispatched / Customs Cleared", date: "2026-09-15 04:30 PM", completed: true },
      { step: "Delivered Safely", date: "2026-09-18 11:15 AM", completed: true }
    ]
  }
];

const MyOrders = () => {
  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const [user] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("ceylon-user") || "null");
    } catch {
      return null;
    }
  });
  const [orders] = useState(() => {
    try {
      const savedOrders = window.localStorage.getItem("ceylon-orders");
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...sampleOrders];
        }
      }
    } catch {
      // Fallback to sample orders
    }
    return sampleOrders;
  });
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedOrderTracking, setSelectedOrderTracking] = useState(null);

  const handleLogout = () => {
    window.localStorage.removeItem("ceylon-user");
    window.location.href = "/login";
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
            {filteredOrders.length === 0 ? (
              <div className="empty-orders-card">
                <FaBoxOpen className="empty-icon" />
                <h3>No orders found in this category</h3>
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
                            <span>Weight: <strong>{item.carat}</strong></span>
                            <span>Cut: <strong>{item.cut}</strong></span>
                            <span>Origin: <strong>{item.origin}</strong></span>
                          </div>
                          <div className="order-item-cert">
                            <FaCertificate /> Gemological Certificate ID: <strong>{item.certificateId}</strong>
                          </div>
                        </div>
                        <div className="order-item-pricing">
                          <span className="order-item-price">
                            ${Number(item.price).toLocaleString("en-US")} USD
                          </span>
                          <span className="shipping-note">Free Insured Courier Shipping</span>
                        </div>
                      </div>
                    ))}
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
                      <span>Airway Bill / Tracking: </span>
                      <strong>{order.trackingNumber}</strong>
                    </div>

                    <div className="order-action-buttons">
                      <button
                        type="button"
                        className="btn-order-action secondary"
                        onClick={() =>
                          alert(`Downloading Gemological Certificate ${order.items[0].certificateId}...`)
                        }
                      >
                        <FaDownload /> Certificate (PDF)
                      </button>

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
                  <strong>FedEx International Priority</strong>
                </div>
                <div>
                  <span>Tracking Number</span>
                  <strong>{selectedOrderTracking.trackingNumber}</strong>
                </div>
                <div>
                  <span>Estimated Delivery</span>
                  <strong>{selectedOrderTracking.estimatedDelivery}</strong>
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
              <img src="/logo.png" alt="Ceylon Royal Gemstones" />
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
            <a href="/About">Our Heritage</a>
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
        <SiteInquiryModal source="My Orders Page" onClose={() => setIsInquiryOpen(false)} />
      )}
    </div>
  );
};

export default MyOrders;
