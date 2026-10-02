import { useState } from "react";
import {
  FaEnvelope,
  FaFacebookF,
  FaHeart,
  FaSearch,
  FaShoppingBag,
  FaTimes,
  FaUser,
  FaLock,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import { FaFacebook } from "react-icons/fa6";
import CollectionDrawerPanel from "../components/CollectionDrawerPanel.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import { useSharedCollection } from "../useSharedCollection.js";
import {
  readAdminAccounts,
  hashAdminPassword,
  startAdminSession,
} from "../adminAccess.js";
import "./Login.css";
import "../components/SiteFooter.css";

const Login = () => {
  const [wishlist, setWishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [successNote, setSuccessNote] = useState("");

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    if (loginError) setLoginError("");
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    if (loginError) setLoginError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    const inputEmail = loginForm.email.trim().toLowerCase();
    const inputPassword = loginForm.password;

    // Check if this account belongs to an administrator or super-admin
    const adminAccounts = readAdminAccounts();
    const matchedAdmin = adminAccounts.find(
      (acc) => acc.email.trim().toLowerCase() === inputEmail
    );

    if (matchedAdmin) {
      if (matchedAdmin.status !== "active") {
        setLoginError("This administrative account has been deactivated. Please contact an executive.");
        return;
      }

      const inputHash = await hashAdminPassword(inputPassword);
      if (inputHash !== matchedAdmin.passwordHash) {
        setLoginError("Invalid password for administrative account.");
        return;
      }

      startAdminSession(matchedAdmin);
      const isSuper = matchedAdmin.role === "super-admin";
      setSuccessNote(
        `Welcome, ${matchedAdmin.name}! Redirecting to ${isSuper ? "Super Admin" : "Admin"} Portal...`
      );
      setIsSubmitted(true);
      setTimeout(() => {
        window.location.href = isSuper ? "/super-admin" : "/admin";
      }, 1000);
      return;
    }

    // Otherwise standard customer login
    const userSession = {
      email: loginForm.email,
      name: loginForm.email.split("@")[0] || "Royal Collector",
      loggedIn: true,
    };
    window.localStorage.setItem("ceylon-user", JSON.stringify(userSession));
    setSuccessNote("Welcome back to Ceylon Royal Gemstones.");
    setIsSubmitted(true);
    setTimeout(() => {
      window.location.href = "/my-orders";
    }, 1200);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setLoginError("");

    if (registerForm.password !== registerForm.confirmPassword) {
      setLoginError("Passwords do not match. Please re-enter.");
      return;
    }

    const adminAccounts = readAdminAccounts();
    if (adminAccounts.some((acc) => acc.email.trim().toLowerCase() === registerForm.email.trim().toLowerCase())) {
      setLoginError("This email address is reserved for administration. Please sign in.");
      setIsLoginMode(true);
      return;
    }

    const userSession = {
      email: registerForm.email,
      name: registerForm.name || "Royal Collector",
      phone: registerForm.phone,
      loggedIn: true,
    };
    window.localStorage.setItem("ceylon-user", JSON.stringify(userSession));
    setSuccessNote("Your account has been created successfully.");
    setIsSubmitted(true);
    setTimeout(() => {
      window.location.href = "/my-orders";
    }, 1200);
  };

  const handleFacebookLogin = () => {
    alert("Facebook login will be available soon!");
  };

  return (
    <div className="login-page">
      {/* Home page hero video as blurred background */}
      <video
        className="login-bg-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/herosvedio.mp4" type="video/mp4" />
      </video>
      <nav className="about-navbar login-page-navbar">
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
          <a href="/blog">Blog</a>
          <a href="/login" className="active">Login</a>
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
        </div>
      </nav>

      <main className="login-main">
        <div className="login-container">
          {/* LEFT — Brand panel */}
          <div className="login-brand-panel">
            <div>
              <div className="login-brand-logo">
                <img src="/logo.png" alt="Ceylon Royal Gemstones" />
                <div className="login-brand-logo-text">
                  <span>CEYLON</span>
                  <small>ROYAL GEMSTONES</small>
                </div>
              </div>
              <div className="login-brand-tagline">
                <h2>Discover the World of <em>Authentic</em> Ceylon Gems</h2>
                <p>Access your account to track orders, save wishlists, and explore our certified collection of rare Sri Lankan gemstones.</p>
                <div className="login-brand-features">
                  <div className="login-brand-feature">
                    <div className="login-brand-feature-icon">✦</div>
                    <span>100% Lab-Certified Gemstones</span>
                  </div>
                  <div className="login-brand-feature">
                    <div className="login-brand-feature-icon">⬡</div>
                    <span>Worldwide Secure Delivery</span>
                  </div>
                  <div className="login-brand-feature">
                    <div className="login-brand-feature-icon">◈</div>
                    <span>Royal VIP Collector Benefits</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="login-brand-bottom">© 2026 CEYLON ROYAL GEMSTONES · ALL RIGHTS RESERVED</div>
          </div>

          {/* RIGHT — Form */}
          <div className="login-card">
            <div className="login-header">
              <img src="/logo.png" alt="Ceylon Royal Gemstones" className="login-logo" />
              <span className="login-subtitle">CEYLON ROYAL GEMSTONES</span>
              <h1>{isLoginMode ? "Welcome Back" : "Create Account"}</h1>
              <p>{isLoginMode ? "Sign in to access your account" : "Join our community of gemstone collectors"}</p>
            </div>

            {loginError && (
              <div
                className="login-error-alert"
                role="alert"
                style={{
                  background: "rgba(220, 53, 69, 0.15)",
                  border: "1px solid rgba(220, 53, 69, 0.45)",
                  color: "#ff8585",
                  padding: "11px 16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "0.88rem",
                  textAlign: "center",
                }}
              >
                {loginError}
              </div>
            )}

            {isSubmitted && (
              <div className="login-success">
                <strong>{isLoginMode ? "Login Successful!" : "Account Created!"}</strong>
                <p>{successNote || (isLoginMode ? "Welcome back to Ceylon Royal Gemstones." : "Your account has been created successfully.")}</p>
              </div>
            )}

            {/* Facebook Login Button */}
            <button
              type="button"
              className="login-facebook-btn"
              onClick={handleFacebookLogin}
            >
              <FaFacebook />
              Continue with Facebook
            </button>

            <div className="login-divider">
              <span>or</span>
            </div>

            {isLoginMode ? (
              <form className="login-form" onSubmit={handleLoginSubmit}>
                <div className="login-form-group">
                  <label htmlFor="login-email">Email Address</label>
                  <div className="login-input-wrapper">
                    <FaEnvelope />
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label htmlFor="login-password">Password</label>
                  <div className="login-input-wrapper">
                    <FaLock />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      required
                    />
                    <button
                      type="button"
                      className="login-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="login-form-options">
                  <label className="login-remember">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="login-forgot">Forgot Password?</a>
                </div>

                <button type="submit" className="login-submit-btn">
                  Sign In
                </button>
              </form>
            ) : (
              <form className="login-form" onSubmit={handleRegisterSubmit}>
                <div className="login-form-group">
                  <label htmlFor="register-name">Full Name</label>
                  <div className="login-input-wrapper">
                    <FaUser />
                    <input
                      id="register-name"
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={registerForm.name}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label htmlFor="register-email">Email Address</label>
                  <div className="login-input-wrapper">
                    <FaEnvelope />
                    <input
                      id="register-email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label htmlFor="register-phone">Phone Number</label>
                  <div className="login-input-wrapper">
                    <FaPhoneAlt />
                    <input
                      id="register-phone"
                      type="tel"
                      name="phone"
                      placeholder="+94 XX XXX XXXX"
                      value={registerForm.phone}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label htmlFor="register-password">Password</label>
                  <div className="login-input-wrapper">
                    <FaLock />
                    <input
                      id="register-password"
                      type="password"
                      name="password"
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label htmlFor="register-confirm">Confirm Password</label>
                  <div className="login-input-wrapper">
                    <FaLock />
                    <input
                      id="register-confirm"
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="login-submit-btn">
                  Create Account
                </button>
              </form>
            )}

            <div className="login-switch">
              {isLoginMode ? (
                <p>
                  Don't have an account?{" "}
                  <button type="button" onClick={() => setIsLoginMode(false)}>
                    Create Account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button type="button" onClick={() => setIsLoginMode(true)}>
                    Sign In
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>
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
            <a href="/login">Login</a>
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
    </div>
  );
};

export default Login;
