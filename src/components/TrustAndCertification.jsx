import { useState } from 'react';
import { API_BASE_URL, apiGet } from '../services/api.js';
import BrandLogo from "./BrandLogo.jsx";
import { products } from '../Pages/Gemstones.jsx';

const TrustAndCertification = ({ inquiryOpen, onInquiryClose }) => {
  // State variables for certificate search and report viewing modal
  const [certNumber, setCertNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const resolveMediaUrl = (url) => {
    if (typeof url !== 'string' || !url) return '';
    if (/^(?:https?:)?\/\//i.test(url) || /^(?:data|blob):/i.test(url)) return url;
    if (url.startsWith('/uploads/')) {
      return `${API_BASE_URL.replace(/\/api\/?$/, '')}${url}`;
    }
    return url;
  };

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

  const handleSearch = async (e) => {
    e.preventDefault();
    const searchCode = certNumber.trim();
    if (!searchCode) return;

    setIsSearching(true);
    setSearchError('');
    setVerificationResult(null);
    try {
      const response = await apiGet(
        `/api/certificates/verify?code=${encodeURIComponent(searchCode)}`
      );
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error('The verification service returned an invalid response.');
      }

      if (!response.ok || result.success !== true || !result.data) {
        throw new Error(
          result.message ||
            `Unable to verify this code (HTTP ${response.status}).`
        );
      }
      setVerificationResult(result.data);
    } catch (error) {
      setSearchError(error.message || 'Unable to verify this code. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const reportUrl = resolveMediaUrl(verificationResult?.certificate_url);
  const isPdfReport = reportUrl.toLowerCase().split('?')[0].endsWith('.pdf');

  return (
    <div className="trust-certification-wrapper">
      {/* Dark Hero Header Section */}
      <section className="about-hero trust-page-hero">
        <div className="hero-overlay"></div>
        <div className="about-hero-content">
          <div className="hero-logo-wrapper">
            <BrandLogo
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
          <p className="text-sm text-slate-600 mb-6">Enter a laboratory certificate number or gemstone store/reference ID to retrieve its certificate and linked gemstone details.</p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Certificate number or gemstone reference (e.g., GIA-87492105 or GEM-1001)"
              value={certNumber}
              onChange={(e) => {
                setCertNumber(e.target.value);
                if (searchError) setSearchError('');
              }}
              className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoComplete="off"
              required
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-amber-700 transition"
            >
              {isSearching ? 'Searching…' : 'Verify Certificate'}
            </button>
          </form>

          {isSearching && (
            <p className="mt-4 text-sm text-slate-600" role="status" aria-live="polite">
              Searching the certificate registry…
            </p>
          )}
          {searchError && (
            <p className="mt-4 text-sm font-medium text-red-700" role="alert">
              {searchError}
            </p>
          )}

          {/* Search Results Display Area */}
          {verificationResult && (
            <div className="mt-6 p-5 rounded-lg border bg-slate-50">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                  <span className={`trust-certificate-status ${verificationResult.verified ? 'verified' : 'record-found'}`}>
                    {verificationResult.verified
                      ? '✓ Certificate Verified'
                      : `Certificate ${String(verificationResult.verification_status || 'PENDING').toLowerCase()}`}
                  </span>
                  <span className="text-xs text-slate-500">
                    Issued Date: {verificationResult.issue_date
                      ? String(verificationResult.issue_date).slice(0, 10)
                      : 'Not provided'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
                  <div>
                    <h3 className="mb-2 font-semibold text-slate-900">Gemstone Details</h3>
                    <p><strong>Name:</strong> {verificationResult.gemstone?.name || 'Not provided'}</p>
                    <p><strong>Store Reference:</strong> {verificationResult.gemstone?.gemstone_id || verificationResult.gemstone?.id}</p>
                    <p><strong>Category:</strong> {verificationResult.gemstone?.category_name || 'Not provided'}</p>
                    <p><strong>Weight:</strong> {verificationResult.gemstone?.carat
                      ? `${verificationResult.gemstone.carat} carats`
                      : 'Not provided'}</p>
                    <p><strong>Shape / Cut:</strong> {[verificationResult.gemstone?.shape, verificationResult.gemstone?.cut].filter(Boolean).join(' / ') || 'Not provided'}</p>
                    <p><strong>Color:</strong> {verificationResult.gemstone?.color || 'Not provided'}</p>
                    <p><strong>Treatment:</strong> {verificationResult.gemstone?.treatment_status || 'Not provided'}</p>
                    {verificationResult.gemstone?.image && (
                      <img
                        className="mt-4 max-h-64 rounded-lg object-contain"
                        src={resolveMediaUrl(verificationResult.gemstone.image)}
                        alt={verificationResult.gemstone.name || 'Certified gemstone'}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-slate-900">Laboratory Certificate</h3>
                    <p><strong>Certificate Number:</strong> {verificationResult.certificate_number}</p>
                    <p><strong>Laboratory:</strong> {verificationResult.laboratory || 'Not provided'}</p>
                    <p><strong>Verification Status:</strong> {verificationResult.verification_status || 'PENDING'}</p>
                    <p><strong>Issue Date:</strong> {verificationResult.issue_date
                      ? String(verificationResult.issue_date).slice(0, 10)
                      : 'Not provided'}</p>
                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <h4 className="mb-3 font-semibold text-slate-900">Laboratory Report</h4>
                      {reportUrl ? (
                        isPdfReport ? (
                          <a
                            className="inline-flex rounded bg-slate-800 px-4 py-2 text-xs text-white hover:bg-slate-700"
                            href={reportUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open Laboratory Report (PDF)
                          </a>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="trust-result-report-preview"
                              onClick={() => setSelectedReport(reportUrl)}
                              aria-label={`Open certificate image for ${verificationResult.certificate_number}`}
                            >
                              <img src={reportUrl} alt={`Certificate ${verificationResult.certificate_number}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedReport(reportUrl)}
                              className="mt-2 text-xs bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 transition"
                            >
                              View Full Laboratory Report
                            </button>
                          </>
                        )
                      ) : (
                        <p className="trust-certificate-pending">
                          This certificate record does not have a report file attached.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Authenticity, Treatments, Our Story & Company Info Grid */}
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
            <BrandLogo alt="Ceylon Royal Gemstones" className="about-modal-logo" />
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
              <h3 className="font-bold text-slate-900">Laboratory Report - {verificationResult?.certificate_number}</h3>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>
            <div className="trust-report-image-frame">
              <img
                src={selectedReport}
                alt={`Laboratory report for certificate ${verificationResult?.certificate_number}`}
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