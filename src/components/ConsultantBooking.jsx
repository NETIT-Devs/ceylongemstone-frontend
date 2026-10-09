import { useState } from "react";
import "../Pages/Consultation.css";

const specialists = [
  {
    id: "sapphire",
    number: "01",
    title: "Sapphire selection advisor",
    focus: "Experience focus: comparing Ceylon sapphire color, clarity, cut and carat for collector requirements.",
    specialty: "Sapphires, color and selection",
    portrait: "/guide1.jpg"
  },
  {
    id: "certification",
    number: "02",
    title: "Certification guide",
    focus: "Experience focus: explaining gemstone reports, treatment descriptions and available certification documents.",
    specialty: "Certificates and treatments",
    portrait: "/guide2.jpg"
  },
  {
    id: "craftsmanship",
    number: "03",
    title: "Cut & craftsmanship advisor",
    focus: "Experience focus: discussing gemstone cuts, proportions, light return and presentation details.",
    specialty: "Cut, clarity and craftsmanship",
    portrait: "/guide3.jpg"
  },
  {
    id: "international",
    number: "04",
    title: "International order advisor",
    focus: "Experience focus: reviewing destination-specific shipping questions, documentation and import considerations.",
    specialty: "International orders and delivery",
    portrait: "/guide4.jpg"
  }
];

const ConsultantBooking = ({ sectionId = "specialists" }) => {
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [status, setStatus] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const message = [
      "Ceylon Royal Gemstones video consultation request",
      `Specialist: ${selectedSpecialist.title}`,
      `Full name: ${values.get("name")}`,
      `Email: ${values.get("email")}`,
      `WhatsApp / phone: ${values.get("phone")}`,
      `Country and time zone: ${values.get("country")}`,
      `Preferred date: ${values.get("date")}`,
      `Preferred time: ${values.get("time")}`,
      `Consultation topic: ${values.get("topic")}`,
      `Gemstone or details: ${values.get("details")}`
    ].join("\n");

    window.open(
      `https://wa.me/94771234567?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setStatus("Your request is prepared in WhatsApp. Send the message to request confirmation.");
  };

  return (
    <>
      <section className="consultation-specialists" id={sectionId}>
        <div className="consultation-section-heading">
          <p className="consultation-eyebrow">FOUR CONSULTATION FOCUSES</p>
          <h2>Select who you would like to speak with</h2>
          <p>Representative portraits show each consultation focus; the team confirms your appointment.</p>
        </div>

        <div className="consultant-grid">
          {specialists.map((specialist) => {
            const selected = selectedSpecialist?.id === specialist.id;

            return (
              <button
                type="button"
                className={`consultant-option ${selected ? "selected" : ""}`}
                key={specialist.id}
                aria-pressed={selected}
                onClick={() => {
                  setSelectedSpecialist(specialist);
                  setStatus("");
                }}
              >
                <span className="consultant-number">{specialist.number}</span>
                  <span className="consultant-profile">
                    <span className="consultant-profile-copy">
                      <span className="consultant-title">{specialist.title}</span>
                      <span className="consultant-specialty">{specialist.specialty}</span>
                    </span>
                    <img
                      className="consultant-photo"
                      src={specialist.portrait}
                      alt={`Representative portrait for ${specialist.title}`}
                    />
                  </span>
                <span className="consultant-experience">{specialist.focus}</span>
                <span className="consultant-select-label">{selected ? "SELECTED" : "SELECT SPECIALIST"}</span>
              </button>
            );
          })}
        </div>
      </section>

      {selectedSpecialist && (
        <section className="consultation-booking" id={`${sectionId}-booking`}>
          <div className="consultation-booking-heading">
            <p className="consultation-eyebrow">BOOK A VIDEO CONSULTATION</p>
            <h2>{selectedSpecialist.title}</h2>
            <p>{selectedSpecialist.specialty}</p>
          </div>
          <form className="consultation-booking-form" onSubmit={handleSubmit}>
            <label>Full name<input name="name" autoComplete="name" required /></label>
            <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
            <label>WhatsApp / phone<input name="phone" type="tel" autoComplete="tel" required /></label>
            <label>Country and time zone<input name="country" placeholder="e.g. London, GMT" required /></label>
            <label>Preferred date<input name="date" type="date" required /></label>
            <label>Preferred time<input name="time" type="time" required /></label>
            <label className="consultation-field-wide">
              Consultation topic
              <select name="topic" defaultValue="Gemstone selection" required>
                <option>Gemstone selection</option>
                <option>Certificate and treatment</option>
                <option>Cut and craftsmanship</option>
                <option>International shipping</option>
                <option>Other question</option>
              </select>
            </label>
            <label className="consultation-field-wide">
              Gemstone or additional details
              <textarea name="details" rows="3" placeholder="Share the gemstone, certificate number or questions you want to discuss." required />
            </label>
            <button className="consultation-submit" type="submit">SEND BOOKING REQUEST VIA WHATSAPP</button>
            {status && <p className="consultation-status" role="status">{status}</p>}
          </form>
        </section>
      )}
    </>
  );
};

export default ConsultantBooking;