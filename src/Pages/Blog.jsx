import { useState } from "react";
import {
  FaEnvelope,
  FaFacebookF,
  FaHeart,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSearch,
  FaShoppingBag,
  FaStar,
  FaWhatsapp,
  FaClock,
  FaArrowRight,
  FaBookOpen,
  FaGem,
} from "react-icons/fa";
import CollectionDrawerPanel from "../components/CollectionDrawerPanel.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import SiteInquiryModal from "../components/SiteInquiryModal.jsx";
import { useSharedCollection } from "../useSharedCollection.js";
import "./About.css";
import "./Blog.css";

const blogPosts = [
  {
    id: 1,
    title: "The Complete Gemstone Guide: Understanding Ceylon's Finest Treasures",
    category: "Gemstone Guide",
    date: "September 15, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
    excerpt: "Discover the fascinating world of Ceylon gemstones — from royal blue sapphires to rare padparadschas. Learn how to identify, evaluate, and care for these precious treasures.",
    content: [
      "Ceylon, now known as Sri Lanka, has been celebrated for millennia as the 'Island of Gems.' The island's rich geological history has produced some of the world's most sought-after gemstones, including the legendary Ceylon blue sapphire, the rare padparadscha sapphire, and the elusive alexandrite.",
      "Understanding gemstones requires knowledge of the four Cs: color, clarity, cut, and carat weight. Each of these factors plays a crucial role in determining a gemstone's value and appeal. Ceylon sapphires, in particular, are renowned for their exceptional cornflower blue hue and superior clarity.",
      "When evaluating a Ceylon gemstone, always request a certificate from a reputable gemological laboratory such as GIA, GRS, or SSEF. These certificates provide detailed information about the gemstone's origin, treatment status, and quality parameters.",
      "Proper care of your gemstones ensures their longevity and brilliance. Store each piece separately to avoid scratches, clean with mild soap and warm water, and avoid exposure to harsh chemicals and extreme temperatures."
    ]
  },
  {
    id: 2,
    title: "Gemstone Artistry: The Ancient Craft of Ceylon Lapidary",
    category: "Gemstone Article",
    date: "September 10, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    excerpt: "Explore the traditional art of gemstone cutting in Sri Lanka, where master lapidaries transform rough stones into dazzling works of art using techniques passed down through generations.",
    content: [
      "The art of gemstone cutting, or lapidary, has been practiced in Sri Lanka for over 2,500 years. The island's master cutters have perfected techniques that maximize each stone's natural beauty, fire, and brilliance.",
      "Traditional Ceylon lapidary begins with careful examination of the rough stone. The master cutter studies the crystal's natural axes, inclusions, and color distribution to determine the optimal cut that will showcase the gemstone's finest qualities.",
      "Unlike modern machine cutting, traditional hand-cutting allows for greater precision and customization. Each facet is carefully calculated and executed by hand, resulting in gemstones with exceptional light performance and character.",
      "Today, Ceylon's lapidary tradition continues to thrive, blending ancient techniques with modern technology. The result is gemstones of unparalleled quality that are treasured by collectors and connoisseurs worldwide."
    ]
  },
  {
    id: 3,
    title: "Investing in Ceylon Sapphires: A Collector's Perspective",
    category: "Gemstone Guide",
    date: "September 5, 2026",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
    excerpt: "Why Ceylon sapphires continue to appreciate in value and what every collector should know before investing in these magnificent gemstones.",
    content: [
      "Ceylon sapphires have long been considered among the finest investments in the gemstone world. Their rarity, exceptional color, and historical significance have driven consistent appreciation in value over decades.",
      "The most valuable Ceylon sapphires exhibit a pure, vivid cornflower blue color with excellent transparency. Stones over 5 carats of exceptional quality are increasingly rare and command significant premiums in the market.",
      "When investing in Ceylon sapphires, provenance is key. Stones with documented origins from Sri Lanka's renowned mining regions, particularly Ratnapura and Elahera, are highly prized by collectors.",
      "Always purchase from reputable dealers who provide independent laboratory certificates. A GIA or GRS certificate not only authenticates the stone but also documents any treatments, which significantly impacts value."
    ]
  },
  {
    id: 4,
    title: "The Science Behind Gemstone Colors: Why Ceylon Gems Are Unique",
    category: "Gemstone Article",
    date: "August 28, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=800",
    excerpt: "Delve into the geological processes that create the extraordinary colors found in Ceylon gemstones, from trace elements to crystal structure.",
    content: [
      "The mesmerizing colors of Ceylon gemstones are the result of complex geological processes that span millions of years. Trace elements within the crystal lattice interact with light to produce the brilliant hues that make these gems so desirable.",
      "Iron and titanium impurities create the iconic blue of Ceylon sapphires, while chromium produces the fiery red of rubies. The padparadscha sapphire's unique pink-orange color results from a delicate balance of trace elements and natural irradiation.",
      "Sri Lanka's unique geological history, with its ancient metamorphic rocks and alluvial deposits, has created ideal conditions for gemstone formation. The island's gem-bearing gravels, known as 'illam,' have yielded some of the world's most famous gems.",
      "Understanding the science behind gemstone colors not only enhances appreciation but also helps in identifying natural stones from synthetic or treated alternatives."
    ]
  }
];

const Blog = () => {
  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div className="blog-page">
      <nav className="about-navbar blog-page-navbar">
        <a href="/" className="about-navbar-logo">
          <img src="/logo.png" alt="Ceylon Royal Gemstones" />
          <div className="about-logo-text"><span>CEYLON</span><small>ROYAL GEMSTONES</small></div>
        </a>
        <div className="about-nav-links">
          <a href="/">Home</a>
          <a href="/gemstones">Gemstones</a>
          <a href="/About">Heritage</a>
          <a href="/trust">Certification</a>
          <a href="/reviews">Reviews</a>
          <a href="/contact">Contact</a>
          <a href="/blog" className="active">Blog</a>
          <a href="/login">Login</a>
          <InternationalNavEntry />
        </div>
        <div className="about-nav-actions">
          <InternationalNavEntry mobile />
          <button
            type="button"
            className="about-nav-icon"
            title="Search"
            aria-label="Search gemstones"
            onClick={() => {
              const query = prompt("Search gemstones:");
              if (query) {
                window.location.href = `/?search=${encodeURIComponent(query)}`;
              }
            }}
          >
            <FaSearch />
          </button>
          <button
            type="button"
            className="about-nav-icon"
            title="Wishlist"
            aria-label={`Open wishlist, ${wishlist.reduce((sum, item) => sum + item.quantity, 0)} items`}
            onClick={() => setActiveDrawer("wishlist")}
          >
            <FaHeart />
            {wishlist.length > 0 && <span className="about-badge">{wishlist.reduce((sum, item) => sum + item.quantity, 0)}</span>}
          </button>
          <button
            type="button"
            className="about-nav-icon"
            title="Shopping Cart"
            aria-label={`Open cart, ${cart.reduce((sum, item) => sum + item.quantity, 0)} items`}
            onClick={() => setActiveDrawer("cart")}
          >
            <FaShoppingBag />
            {cart.length > 0 && <span className="about-badge">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
          </button>
          <button type="button" className="about-inquire-btn" onClick={() => setIsInquiryOpen(true)}>
            INQUIRE NOW
          </button>
        </div>
      </nav>

      <main>
        {/* Dark Hero Header Section */}
        <section className="about-hero blog-page-hero">
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

            <span className="gold-subtitle">BLOG &amp; ARTICLES</span>

            <h1>Gemstone Guide &amp; Articles</h1>

            <p>
              Expert insights, guides, and stories from the world of authentic Ceylon gemstones.
            </p>

            <div className="about-gold-line"></div>
          </div>
        </section>

        <section className="blog-page-content" aria-label="Blog articles">
          <div className="blog-page-grid">
            {blogPosts.map((post) => (
              <article className="blog-page-card" key={post.id}>
                <div className="blog-page-card-image">
                  <img src={post.image} alt={post.title} />
                  <span className="blog-page-card-category">{post.category}</span>
                </div>
                <div className="blog-page-card-body">
                  <div className="blog-page-card-meta">
                    <span><FaClock /> {post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <button
                    type="button"
                    className="blog-page-read-btn"
                    onClick={() => setSelectedPost(post)}
                  >
                    Read More <FaArrowRight />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Article Modal */}
        {selectedPost && (
          <div className="blog-modal-backdrop" onClick={() => setSelectedPost(null)}>
            <div className="blog-modal" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="blog-modal-close"
                onClick={() => setSelectedPost(null)}
                aria-label="Close article"
              >
                ×
              </button>
              <div className="blog-modal-image">
                <img src={selectedPost.image} alt={selectedPost.title} />
              </div>
              <div className="blog-modal-content">
                <span className="blog-modal-category">{selectedPost.category}</span>
                <h2>{selectedPost.title}</h2>
                <div className="blog-modal-meta">
                  <span><FaClock /> {selectedPost.date}</span>
                  <span>{selectedPost.readTime}</span>
                </div>
                {selectedPost.content.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="about-footer">
        <div className="about-footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="Ceylon Royal Gemstones" />
              <div><strong>CEYLON</strong><small>ROYAL GEMSTONES</small></div>
            </div>
            <p>Discover the timeless beauty of authentic Sri Lankan gemstones, carefully sourced, crafted and presented with royal elegance.</p>
          </div>
          <div>
            <h4>EXPLORE</h4>
            <a href="/">Home</a>
            <a href="/gemstones">Gemstones</a>
            <a href="/About">Our Heritage</a>
            <a href="/trust">Trust &amp; Certification</a>
            <a href="/reviews">Reviews</a>
            <a href="/contact">Contact</a>
            <a href="/blog">Blog</a>
          </div>
          <div>
            <h4>CONTACT</h4>
            <a href="tel:+94712345678"><FaPhoneAlt /> +94 71 234 5678</a>
            <a href="mailto:info@ceylonroyalgemstones.com"><FaEnvelope /> info@ceylonroyalgemstones.com</a>
            <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" className="footer-whatsapp"><FaWhatsapp /> WhatsApp</a>
            <a href="#"><FaMapMarkerAlt /> Ratnapura, Sri Lanka</a>
          </div>
          <div>
            <h4>FOLLOW US</h4>
            <p>Follow our journey and discover the world of Ceylon gemstones.</p>
            <div className="footer-social-icons">
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" className="footer-whatsapp-icon" aria-label="WhatsApp"><FaWhatsapp /></a>
            </div>
          </div>
        </div>
        <div className="about-footer-bottom">
          <p>© 2026 Ceylon Royal Gemstones. All Rights Reserved.</p>
          <span>NATURAL • AUTHENTIC • CEYLON</span>
        </div>
      </footer>

      <CollectionDrawerPanel
        activeDrawer={activeDrawer}
        setActiveDrawer={setActiveDrawer}
        wishlist={wishlist}
        setWishlist={setWishlist}
        cart={cart}
        setCart={setCart}
      />
      {isInquiryOpen && <SiteInquiryModal source="Blog" onClose={() => setIsInquiryOpen(false)} />}
    </div>
  );
};

export default Blog;
