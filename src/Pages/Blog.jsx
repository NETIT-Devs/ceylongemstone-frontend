import { useState } from "react";
import ShopNavDropdown from "../components/ShopNavDropdown.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import {
  FaEnvelope,
  FaFacebookF,
  FaHeart,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShoppingBag,
  FaUser,
  FaWhatsapp,
  FaClock,
  FaArrowRight
} from "react-icons/fa";
import CollectionDrawerPanel from "../components/CollectionDrawerPanel.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import CustomerOrdersNavLink from "../components/CustomerOrdersNavLink.jsx";
import SiteInquiryModal from "../components/SiteInquiryModal.jsx";
import { useSharedCollection } from "../useSharedCollection.js";
import "./About.css";
import "./Blog.css";
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";
import { useManagedBlogPosts } from "../useSiteContent.js";

const Blog = () => {
  const [managedBlogPosts] = useManagedBlogPosts();
  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const publishedPosts = managedBlogPosts;

  return (
    <div className="blog-page">
      <nav className="about-navbar blog-page-navbar">
        <a href="/" className="about-navbar-logo">
          <BrandLogo alt="Ceylon Royal Gemstones" />
          <div className="about-logo-text"><span>CEYLON</span><small>ROYAL GEMSTONES</small></div>
        </a>
        <MobileSiteMenu />
        <div className="about-nav-links">
          <a href="/">Home</a>
          <ShopNavDropdown />
          <a href="/About">Our Story</a>
          <a href="/trust">Certification</a>
          <a href="/reviews">Reviews</a>
          <a href="/blog" className="active">Blog</a>
          <a href="/contact">Contact</a>
          <InternationalNavEntry />
          <CustomerOrdersNavLink />
        </div>
        <div className="about-nav-actions">
          <InternationalNavEntry mobile />
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
          {/* <button
            type="button"
            className="about-nav-icon"
            title="Shopping Cart"
            aria-label={`Open cart, ${cart.reduce((sum, item) => sum + item.quantity, 0)} items`}
            onClick={() => setActiveDrawer("cart")}
          >
            <FaShoppingBag />
            {cart.length > 0 && <span className="about-badge">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
          </button> */}
          <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" className="about-inquire-btn">
            INQUIRE NOW
          </a>
          <a
            href="/join-us"
            className="navbar-joinus-btn"
            title="Join With Us"
          >
            <span>JOIN US</span>
          </a>
          <a
            href="/login"
            className="navbar-login-btn"
            title="Login / Register"
          >
            <FaUser />
            <span>LOGIN</span>
          </a>
        </div>
      </nav>

      <main>
        {/* Dark Hero Header Section */}
        <section className="about-hero blog-page-hero">
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
            {publishedPosts.map((post) => (
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
              <BrandLogo alt="Ceylon Royal Gemstones" />
              <div><strong>CEYLON</strong><small>ROYAL GEMSTONES</small></div>
            </div>
            <p>Discover the timeless beauty of authentic Sri Lankan gemstones, carefully sourced, crafted and presented with royal elegance.</p>
          </div>
          <div>
            <h4>EXPLORE</h4>
            <a href="/">Home</a>
            <a href="/gemstones">Shop</a>
            <a href="/About">Our Story</a>
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
          <p>Copyright © 2026 Powered by NETIT Technology</p>
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
