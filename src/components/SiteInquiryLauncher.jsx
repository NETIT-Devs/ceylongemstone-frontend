import { useEffect, useState } from "react";
import SiteInquiryModal from "./SiteInquiryModal.jsx";

function SiteInquiryLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleInquiryClick = (event) => {
      const inquiryLink = event.target.closest(
        "a.about-inquire-btn, a.mobile-site-menu-inquire"
      );
      if (!inquiryLink) return;

      event.preventDefault();
      setIsOpen(true);
    };

    document.addEventListener("click", handleInquiryClick);
    return () => document.removeEventListener("click", handleInquiryClick);
  }, []);

  return isOpen ? (
    <SiteInquiryModal source="Website" onClose={() => setIsOpen(false)} />
  ) : null;
}

export default SiteInquiryLauncher;
