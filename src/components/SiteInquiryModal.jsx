import { useState } from "react";
import { FaTimes } from "react-icons/fa";

const SiteInquiryModal = ({ onClose, source = "Website" }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const message = [
      `Gemstone inquiry from the ${source} page`,
      `Name: ${values.get("name")}`,
      `Email: ${values.get("email")}`,
      `Phone: ${values.get("phone")}`,
      `Inquiry: ${values.get("message")}`
    ].join("\n");

    window.open(
      `https://wa.me/94712345678?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setSubmitted(true);
    form.reset();
  };

  return (
    <div className="about-modal-backdrop" onClick={onClose}>
      <section
        className="about-inquiry-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-inquiry-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="about-modal-close"
          type="button"
          aria-label="Close inquiry form"
          onClick={onClose}
        >
          <FaTimes />
        </button>
        <img className="about-modal-logo" src="/logo.png" alt="Ceylon Royal Gemstones" />
        <span>PRIVATE GEMSTONE INQUIRY</span>
        <h3 id="site-inquiry-title">Contact Our Team</h3>
        <p>Share your gemstone question and our team will respond through WhatsApp.</p>
        <form onSubmit={handleSubmit}>
          <input name="name" type="text" autoComplete="name" placeholder="Your Full Name" required />
          <input name="email" type="email" autoComplete="email" placeholder="Email Address" required />
          <input name="phone" type="tel" autoComplete="tel" placeholder="WhatsApp / Phone Number" required />
          <textarea name="message" rows="4" placeholder="Tell us about your requirements..." required />
          <button type="submit">SEND INQUIRY VIA WHATSAPP</button>
        </form>
        {submitted && <p className="site-inquiry-status" role="status">Your request is ready in WhatsApp. Send it to contact our team.</p>}
      </section>
    </div>
  );
};

export default SiteInquiryModal;