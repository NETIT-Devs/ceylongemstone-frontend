import { useEffect, useState } from "react";
import { FaGlobeAmericas } from "react-icons/fa";

const readInternationalMode = () =>
  window.localStorage.getItem("ceylon-international-enabled") === "true";

const InternationalNavEntry = ({ mobile = false, active = false }) => {
  const [enabled, setEnabled] = useState(readInternationalMode);

  useEffect(() => {
    const syncMode = () => setEnabled(readInternationalMode());

    window.addEventListener("storage", syncMode);
    window.addEventListener("ceylon-international-mode-change", syncMode);
    return () => {
      window.removeEventListener("storage", syncMode);
      window.removeEventListener("ceylon-international-mode-change", syncMode);
    };
  }, []);

  if (!enabled) return null;

  if (mobile) {
    return (
      <a
        href="/international"
        className="international-nav-entry international-nav-entry-mobile"
        aria-label="Global customer services"
        title="Global customer services"
      >
        <FaGlobeAmericas aria-hidden="true" />
      </a>
    );
  }

  return (
    <a
      href="/international"
      className={`international-nav-entry international-nav-entry-desktop ${active ? "active" : ""}`}
    >
      Global
    </a>
  );
};

export default InternationalNavEntry;