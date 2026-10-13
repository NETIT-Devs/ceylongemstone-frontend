import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaGem } from "react-icons/fa";
import { GiDiamondRing } from "react-icons/gi";
import "./ShopNavDropdown.css";

const SHOP_DEPARTMENTS = [
  { label: "Gems", href: "/gemstones", icon: FaGem, id: "gems" },
  { label: "Jewellery", href: "/jewellery", icon: GiDiamondRing, id: "jewellery" },
];

export default function ShopNavDropdown({ current }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="shop-nav-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="shop-nav-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        Shop
        <FaChevronDown aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="shop-nav-menu" role="menu">
          {SHOP_DEPARTMENTS.map(({ label, href, icon: Icon, id }) => (
            <a
              key={id}
              href={href}
              role="menuitem"
              aria-current={current === id ? "page" : undefined}
              className={current === id ? "active" : ""}
              onClick={() => setIsOpen(false)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
