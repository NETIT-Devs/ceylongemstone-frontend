import { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { hasAdminAccess, readAdminSession } from "../adminAccess.js";
import SiteInquiryModal from "./SiteInquiryModal.jsx";

const baseLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/gemstones#collection" },
  { label: "Our heritage", href: "/About" },
  { label: "Certification", href: "/trust" },
  { label: "Client reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
];

const readInternationalMode = () => {
  if (typeof window === "undefined") return true;
  const currentCurrency = window.localStorage.getItem("ceylon-currency") || "USD";
  if (currentCurrency === "LKR") {
    return false;
  }
  const flag = window.localStorage.getItem("ceylon-international-enabled");
  if (flag !== null) {
    return flag === "true";
  }
  return true;
};

const isSignedInCustomer = () => {
  try {
    const customer = JSON.parse(window.localStorage.getItem("ceylon-user") || "null");
    return customer?.loggedIn === true && !hasAdminAccess("/admin");
  } catch {
    return false;
  }
};

export default function MobileSiteMenu({ onInquire }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isInternationalEnabled, setIsInternationalEnabled] = useState(readInternationalMode);
  const adminSession = readAdminSession();
  const hasAdminSession = hasAdminAccess("/admin");

  useEffect(() => {
    const syncMode = () => setIsInternationalEnabled(readInternationalMode());

    window.addEventListener("storage", syncMode);
    window.addEventListener("ceylon-international-mode-change", syncMode);
    return () => {
      window.removeEventListener("storage", syncMode);
      window.removeEventListener("ceylon-international-mode-change", syncMode);
    };
  }, []);

  const openDrawer = () => {
    setIsInternationalEnabled(readInternationalMode());
    setIsOpen(true);
  };

  const links = [
    ...baseLinks,
    ...(isInternationalEnabled ? [{ label: "International clients", href: "/international" }] : []),
    ...(isSignedInCustomer() ? [{ label: "My orders", href: "/my-orders" }] : []),
    ...(hasAdminSession
      ? [{
          label: adminSession?.role === "super-admin" ? "Super Admin Portal" : "Admin Portal",
          href: adminSession?.role === "super-admin" ? "/super-admin" : "/admin",
        }]
      : []),
  ];

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="mobile-site-menu-toggle"
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-site-menu"
        onClick={() => (isOpen ? setIsOpen(false) : openDrawer())}
      >
        {isOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
      </button>
      <div className="mobile-site-menu-layer" hidden={!isOpen}>
        <button
          className="mobile-site-menu-backdrop"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsOpen(false)}
        />
        <nav
          className="mobile-site-menu-drawer"
          id="mobile-site-menu"
          aria-label="Mobile navigation"
        >
          <div className="mobile-site-menu-heading">
            <span>CEYLON ROYAL GEMSTONES</span>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setIsOpen(false)}
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>
          <div className="mobile-site-menu-links">
            {links.map(({ label, href }) => (
              <a key={href} href={href} onClick={() => setIsOpen(false)}>
                {label}
              </a>
            ))}
          </div>
          <div className="mobile-site-menu-actions">
            <button
              type="button"
              className="mobile-site-menu-inquire"
              onClick={() => {
                setIsOpen(false);
                if (typeof onInquire === "function") {
                  onInquire();
                } else {
                  setIsInquiryModalOpen(true);
                }
              }}
            >
              Inquire now
            </button>
            <a href="/join-us" onClick={() => setIsOpen(false)}>
              Join us
            </a>
            <a href="/login" onClick={() => setIsOpen(false)}>
              Login
            </a>
          </div>
        </nav>
      </div>
      {isInquiryModalOpen && (
        <SiteInquiryModal
          onClose={() => setIsInquiryModalOpen(false)}
          source="Mobile Navigation"
        />
      )}
    </>
  );
}
