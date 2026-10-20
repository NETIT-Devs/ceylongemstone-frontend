import { FaWhatsapp } from "react-icons/fa";
import "./WhatsAppFloat.css";

function WhatsAppFloat() {
  return (
    <a
      className="whatsapp-float"
      href="https://wa.me/94712345678"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <FaWhatsapp aria-hidden="true" />
    </a>
  );
}

export default WhatsAppFloat;
