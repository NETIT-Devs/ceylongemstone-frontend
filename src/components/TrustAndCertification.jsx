import { useState } from 'react';
import { products } from '../Pages/Gemstones.jsx';

const TrustAndCertification = ({ inquiryOpen, onInquiryClose }) => {
  // State variables for certificate search and report viewing modal
  const [certNumber, setCertNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const handleInquirySubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = [
      'Gemstone inquiry from the Trust & Certification page',
      `Name: ${formData.get('name')}`,
      `Email: ${formData.get('email')}`,
      `Phone: ${formData.get('phone')}`,
      `Inquiry: ${formData.get('message')}`
    ].join('\n');

    window.open(
      `https://wa.me/94712345678?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
    event.currentTarget.reset();
    onInquiryClose?.();
  };

  // Handle certificate number verification search
  const handleSearch = (e) => {
    e.preventDefault();

    const searchNumber = certNumber.trim().toUpperCase();
    const matchingProduct = products.find(
      (product) => product.certificateNumber === searchNumber
    );

    if (matchingProduct) {
      setVerificationResult({
        found: true,
        verified: false,
        gemName: matchingProduct.name,
        weight: `${matchingProduct.carat} Carats`,
        shape: `${matchingProduct.shape}${matchingProduct.cut ? ` / ${matchingProduct.cut}` : ''}`,
        treatment: matchingProduct.treatment || 'Not provided',
        lab: matchingProduct.certification || 'Not provided',
        certNo: matchingProduct.certificateNumber,
        image: matchingProduct.certImage || null
      });
      return;
    }

    if (searchNumber === "CRG-9842") {
      setVerificationResult({
        found: true,
        verified: true,
        gemName: "Ceylon Royal Blue Sapphire",
        weight: "3.25 Carats",
        shape: "Oval Cut",
        treatment: "Natural / Untreated", // Clear display of treatment status
        lab: "GIA / NGJA Certified",
        certNo: "CRG-9842",
        issueDate: "2026-05-14",
        image: "/ceti.jpg"
      });
    } else {
      setVerificationResult({
        found: false,
        message: "Please enter a valid certificate number (e.g., CRG-9842)"
      });
    }
  };

  return (
    <div className="trust-certification-wrapper">
      {/* Dark Hero Header Section */}
      <section className="about-hero trust-page-hero">
        <div className="hero-overlay"></div>
        <div className="about-hero-content">
          <div className="hero-logo-wrapper">
            <img
              src="/logo.png"
              alt="Ceylon Royal Gemstones Logo"
              className="hero-bright-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://cdn-icons-png.flaticon.com/512/3063/3063822.png";
              }}
            />
            <div className="logo-glow-effect"></div>
          </div>

          <span className="gold-subtitle">CEYLON ROYAL GUARANTEE</span>

          <h1>Trust &amp; Certification</h1>

          <p>
            At Ceylon Royal Gemstones, we guarantee 100% transparency, authentic lab-certified gemstones, and complete security for every collector and buyer.
          </p>

          <div className="about-gold-line"></div>
        </div>
      </section>

      <div className="trust-certification bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">

        {/* 1. Gem Certificate Verification & Search Section */}
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Gem Certificate Verification</h2>
          <p className="text-sm text-slate-600 mb-6">Enter a certificate or store ID (for example, CRG-1003) to find its gemstone record and available report.</p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Enter certificate or store ID (e.g., CRG-1003)"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <button 
              type="submit" 
              className="bg-amber-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-amber-700 transition"
            >
              Verify Certificate
            </button>
          </form>

          {/* Search Results Display Area */}
          {verificationResult && (
            <div className="mt-6 p-5 rounded-lg border bg-slate-50">
              {verificationResult.found ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className={`trust-certificate-status ${verificationResult.verified ? 'verified' : 'record-found'}`}>
                      {verificationResult.verified
                        ? 'Certificate Verified & Authentic'
                        : 'Gem record found'}
                    </span>
                    {verificationResult.issueDate && (
                      <span className="text-xs text-slate-500">Issued Date: {verificationResult.issueDate}</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
                    <div>
                      <p><strong>Gemstone:</strong> {verificationResult.gemName}</p>
                      <p><strong>Weight:</strong> {verificationResult.weight}</p>
                      <p><strong>Shape:</strong> {verificationResult.shape}</p>
                    </div>
                    <div>
                      <p><strong>Certificate Details:</strong> {verificationResult.lab}</p>
                      <p><strong>Certificate / Store ID:</strong> {verificationResult.certNo}</p>
                      {/* Natural / Heated / Untreated status display */}
                      <p className="mt-1">
                        <strong>Status:</strong> <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{verificationResult.treatment}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    {verificationResult.image ? (
                      <>
                        <button
                          type="button"
                          className="trust-result-report-preview"
                          onClick={() => setSelectedReport(verificationResult.certNo)}
                          aria-label={`Open certificate image for ${verificationResult.certNo}`}
                        >
                          <img
                            src={verificationResult.image}
                            alt={`Certificate image for ${verificationResult.certNo}`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedReport(verificationResult.certNo)}
                          className="text-xs bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 transition"
                        >
                          View Full Laboratory Report (PDF/Image)
                        </button>
                      </>
                    ) : (
                      <p className="trust-certificate-pending">
                        Certificate image pending upload for this gem.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-red-500 text-sm font-medium">{verificationResult.message}</p>
              )}
            </div>
          )}
        </div>

        {/* 2. Authenticity, Treatments, Heritage & Company Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Natural / Heated / Untreated info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center font-bold mb-4">01</div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Natural & Treatments</h3>
              <p className="text-sm text-slate-600">We clearly display whether a gemstone is 100% natural, heat-treated, or completely untreated. No hidden alterations.</p>
            </div>
            <span className="mt-4 text-xs font-semibold text-amber-600">Full Transparency Guaranteed</span>
          </div>

          {/* Card 2: About Sri Lankan Gemstones */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center font-bold mb-4">02</div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Sri Lankan Heritage</h3>
              <p className="text-sm text-slate-600">Directly sourced from the world-renowned gem-bearing gravels of Ceylon (Sri Lanka), celebrated for unparalleled brilliance and color.</p>
            </div>
            <span className="mt-4 text-xs font-semibold text-amber-600">Ethically Mined in Ceylon</span>
          </div>

          {/* Card 3: Company Verification */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center font-bold mb-4">03</div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Registered & Secure</h3>
              <p className="text-sm text-slate-600">Legally registered business entity in Sri Lanka with NGJA licensed operations. All online transactions are protected with advanced SSL security.</p>
            </div>
            <span className="mt-4 text-xs font-semibold text-amber-600">Licensed & Secure Payments</span>
          </div>

        </div>

        {/* 3. Company Registration & Secure Payment Information Footer */}
        <div className="bg-slate-900 text-slate-300 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h4 className="text-white font-bold text-lg">Company & Secure Payment Information</h4>
            <p className="text-xs text-slate-400 max-w-xl">
              Ceylon Royal Gemstones operates in full compliance with the National Gem and Jewellery Authority (NGJA) of Sri Lanka. We accept secure global payments via encrypted gateways, ensuring your financial and personal data remain fully protected.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded border border-slate-700">SSL Secure</span>
            <span className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded border border-slate-700">NGJA Compliant</span>
            <span className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded border border-slate-700">Verified Business</span>
          </div>
        </div>

      </div>

      {inquiryOpen && (
        <div className="about-modal-backdrop" onClick={onInquiryClose}>
          <div
            className="about-inquiry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trust-inquiry-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="about-modal-close"
              aria-label="Close inquiry form"
              onClick={onInquiryClose}
            >
              ×
            </button>
            <img src="/logo.png" alt="Ceylon Royal Gemstones" className="about-modal-logo" />
            <span>PRIVATE GEMSTONE INQUIRY</span>
            <h3 id="trust-inquiry-title">Trust &amp; Certification</h3>
            <p>Send your gemstone or certificate question to our team.</p>
            <form onSubmit={handleInquirySubmit}>
              <input type="text" name="name" placeholder="Your Full Name" autoComplete="name" required />
              <input type="email" name="email" placeholder="Email Address" autoComplete="email" required />
              <input type="tel" name="phone" placeholder="WhatsApp / Phone Number" autoComplete="tel" required />
              <textarea name="message" placeholder="Tell us about your requirements..." rows="4" required />
              <button type="submit">SEND INQUIRY VIA WHATSAPP</button>
            </form>
          </div>
        </div>
      )}

      {/* Laboratory Report Preview Modal Popup */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full relative space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900">Laboratory Report - {selectedReport}</h3>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>
            <div className="trust-report-image-frame">
              <img
                src={verificationResult?.image}
                alt={`Laboratory report for certificate ${selectedReport}`}
              />
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setSelectedReport(null)}
                className="bg-slate-800 text-white text-xs px-4 py-2 rounded-lg hover:bg-slate-700"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default TrustAndCertification;