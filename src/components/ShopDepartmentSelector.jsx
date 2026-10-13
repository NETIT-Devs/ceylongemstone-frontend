import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCheck, FaGem } from "react-icons/fa";
import { GiDiamondRing } from "react-icons/gi";
import "./ShopDepartmentSelector.css";

const DEPARTMENTS = [
  {
    id: "gems",
    name: "Gemstones",
    tagline: "Natural Certified Ceylon Gems",
    href: "/gemstones",
    icon: FaGem,
  },
  {
    id: "jewellery",
    name: "Jewellery",
    tagline: "Rings, Necklaces, Bracelets & Earrings",
    href: "/jewellery",
    icon: GiDiamondRing,
  },
];

export default function ShopDepartmentSelector({ current = "gems" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeDept = DEPARTMENTS.find((d) => d.id === current) || DEPARTMENTS[0];
  const ActiveIcon = activeDept.icon;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (dept) => {
    setIsOpen(false);
    if (dept.id !== current) {
      window.location.assign(dept.href);
    }
  };

  return (
    <section className="shop-department-section" aria-label="Select Shop Department">
      <div className="shop-department-inner">
        {/* Left Info Tag */}
        <div className="shop-department-info">
          <span className="shop-department-tag">BOUTIQUE SELECTION</span>
          <h2 className="shop-department-title">
            Shop by <span>Department</span>
          </h2>
        </div>

        {/* Center / Right Selector Controls */}
        <div className="shop-department-controls" ref={dropdownRef}>
          {/* Quick Switch Pills */}
          <div className="shop-department-pills" role="tablist" aria-label="Department switch tabs">
            {DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              const isSelected = dept.id === current;
              return (
                <button
                  key={dept.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`shop-dept-pill ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelect(dept)}
                >
                  <Icon className="shop-dept-pill-icon" />
                  <span>{dept.name}</span>
                </button>
              );
            })}
          </div>

          {/* Luxury Dropdown Select */}
          <div className="shop-department-dropdown-wrap">
            <button
              type="button"
              className={`shop-department-select-trigger ${isOpen ? "open" : ""}`}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <div className="shop-dept-trigger-content">
                <span className="shop-dept-trigger-label">DEPARTMENT:</span>
                <span className="shop-dept-trigger-active">
                  <ActiveIcon className="shop-dept-active-icon" />
                  <strong>{activeDept.name}</strong>
                </span>
              </div>
              <FaChevronDown className={`shop-dept-chevron ${isOpen ? "rotated" : ""}`} />
            </button>

            {isOpen && (
              <ul className="shop-department-dropdown-menu" role="listbox">
                {DEPARTMENTS.map((dept) => {
                  const Icon = dept.icon;
                  const isSelected = dept.id === current;
                  return (
                    <li key={dept.id} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        className={`shop-dept-option ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelect(dept)}
                      >
                        <div className="shop-dept-option-left">
                          <span className="shop-dept-option-icon-box">
                            <Icon />
                          </span>
                          <div className="shop-dept-option-text">
                            <strong>{dept.name}</strong>
                            <small>{dept.tagline}</small>
                          </div>
                        </div>
                        {isSelected && <FaCheck className="shop-dept-check-icon" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
