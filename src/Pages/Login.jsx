import { useState } from "react";
import ShopNavDropdown from "../components/ShopNavDropdown.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import {
  FaEnvelope,
  FaFacebookF,
  FaHeart,
  FaShoppingBag,
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
import CustomerOrdersNavLink from "../components/CustomerOrdersNavLink.jsx";
import { useSharedCollection } from "../useSharedCollection.js";
import {
  readAdminAccounts,
  startAdminSession,
  endAdminSession,
} from "../adminAccess.js";
import { apiPost, setCustomerToken } from "../services/api.js";
import "./Login.css";
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";
import "../components/SiteFooter.css";

const getPostLoginDestination = () => "/";

const REGISTERED_USERS_KEY = "ceylon-registered-users";

const getRegisteredUsers = () => {
  try {
    const raw = window.localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRegisteredUser = (user) => {
  try {
    const users = getRegisteredUsers();
    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === user.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Failed to save registered user:", err);
  }
};

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
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      const res = await apiPost("/api/auth/login", {
        email: inputEmail,
        password: inputPassword,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.message || "Invalid email or password.");
        return;
      }

      // Save token
      setCustomerToken(data.token);

      // Check if user has ADMIN or SUPER_ADMIN role
      const rawRole = String(data.user.role || "").toUpperCase();
      const isAdminRole = rawRole === "ADMIN" || rawRole === "SUPER_ADMIN" || rawRole === "SUPER-ADMIN";
      const isSuper = rawRole.includes("SUPER");

      if (isAdminRole) {
        const adminAccount = {
          id: data.user.id,
          name: data.user.name || "Administrator",
          email: data.user.email,
          role: isSuper ? "super-admin" : "admin",
          department: "Operations",
          status: "active",
          source: "backend",
          token: data.token,
        };
        startAdminSession(adminAccount);
        const userSession = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name || "Administrator",
          phone: data.user.phone,
          role: data.user.role,
          loggedIn: true,
        };
        window.localStorage.setItem("ceylon-user", JSON.stringify(userSession));
        window.localStorage.setItem("ceylon-user-id", String(data.user.id));
        window.dispatchEvent(new Event("ceylon-user-auth-change"));

        setSuccessNote(`Welcome, ${adminAccount.name}! Redirecting to ${isSuper ? "Super Admin" : "Admin"} Portal...`);
        setIsSubmitted(true);
        setTimeout(() => {
          window.location.href = isSuper ? "/super-admin" : "/admin";
        }, 1000);
        return;
      }

      // Standard customer session - clear any admin session
      endAdminSession();
      const userSession = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || data.user.email.split("@")[0],
        phone: data.user.phone,
        role: data.user.role,
        loggedIn: true,
      };
      window.localStorage.setItem("ceylon-user", JSON.stringify(userSession));
      window.localStorage.setItem("ceylon-user-id", String(data.user.id));
      window.dispatchEvent(new Event("ceylon-user-auth-change"));

      setSuccessNote("Welcome back to Ceylon Royal Gemstones.");
      setIsSubmitted(true);
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      setTimeout(() => {
        window.location.href = redirect || "/";
      }, 1200);
    } catch {
      setLoginError("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    const regEmail = registerForm.email.trim().toLowerCase();

    if (registerForm.password !== registerForm.confirmPassword) {
      setLoginError("Passwords do not match. Please re-enter.");
      return;
    }

    if (registerForm.password.length < 4) {
      setLoginError("Password must be at least 4 characters long.");
      return;
    }

    // Block admin emails from public registration
    const adminAccounts = readAdminAccounts();
    if (adminAccounts.some((acc) => acc.email.trim().toLowerCase() === regEmail)) {
      setLoginError("This email address is reserved for administration. Please sign in.");
      setIsLoginMode(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiPost("/api/auth/register", {
        name: registerForm.name.trim(),
        email: regEmail,
        phone: registerForm.phone.trim(),
        password: registerForm.password,
        role: "CUSTOMER",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setLoginError(data.message || "Registration failed. Please try again.");
        return;
      }

      endAdminSession();
      setCustomerToken(data.token);
      const userSession = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || registerForm.name.trim(),
        phone: data.user.phone,
        role: data.user.role,
        loggedIn: true,
      };
      window.localStorage.setItem("ceylon-user", JSON.stringify(userSession));
      window.localStorage.setItem("ceylon-user-id", String(data.user.id));
      window.dispatchEvent(new Event("ceylon-user-auth-change"));

      setSuccessNote("Your account has been created successfully.");
      setIsSubmitted(true);
      setTimeout(() => {
        window.location.href = getPostLoginDestination();
      }, 1200);
    } catch {
      setLoginError("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    setLoginError("");
    const fbEmail = prompt(
      "Enter your Facebook email or account to continue:",
      "collector@facebook.com"
    );
    if (!fbEmail) return;

    const cleanEmail = fbEmail.trim().toLowerCase();
    const fbName =
      cleanEmail.split("@")[0].replace(/[._-]/g, " ") || "Facebook Collector";
    const formattedName =
      fbName.charAt(0).toUpperCase() + fbName.slice(1);

    const fbUser = {
      name: formattedName,
      email: cleanEmail,
      provider: "facebook",
      verified: true,
      createdAt: new Date().toISOString(),
    };
    saveRegisteredUser(fbUser);

    const userSession = {
      email: fbUser.email,
      name: fbUser.name,
      provider: "facebook",
      verified: true,
      loggedIn: true,
    };
    window.localStorage.setItem("ceylon-user", JSON.stringify(userSession));
    window.dispatchEvent(new Event("ceylon-user-auth-change"));
    setSuccessNote(`Signed in via Facebook as ${userSession.name}! Welcome.`);
    setIsSubmitted(true);
    setTimeout(() => {
      window.location.href = getPostLoginDestination();
    }, 1200);
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
          <a href="/contact">Contact</a>
          <a href="/blog">Blog</a>
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
            style={{ borderColor: '#c9a24b', background: 'rgba(201,162,75,0.18)', color: '#c9a24b' }}
          >
            <FaUser />
            <span>LOGIN</span>
          </a>
        </div>
      </nav>

      <main className="login-main">
        <div className="login-container">
          {/* LEFT — Brand panel */}
          <div className="login-brand-panel">
            <div>
              <div className="login-brand-logo">
                <BrandLogo alt="Ceylon Royal Gemstones" />
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
              <BrandLogo alt="Ceylon Royal Gemstones" className="login-logo" />
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

            {successNote && !isSubmitted && (
              <div
                className="login-success-note"
                style={{
                  background: "rgba(40, 167, 69, 0.15)",
                  border: "1px solid rgba(40, 167, 69, 0.45)",
                  color: "#75dd8b",
                  padding: "11px 16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "0.88rem",
                  textAlign: "center",
                }}
              >
                {successNote}
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

                <button type="submit" className="login-submit-btn" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
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

                <button type="submit" className="login-submit-btn" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
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
    </div>
  );
};

export default Login;
