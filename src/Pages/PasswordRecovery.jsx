import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaEnvelope, FaLock } from "react-icons/fa";
import BrandLogo from "../components/BrandLogo.jsx";
import { apiPost } from "../services/api.js";
import "./PasswordRecovery.css";

const PasswordRecoveryCard = ({ children, eyebrow, title, description }) => (
  <main className="password-recovery-page">
    <section className="password-recovery-card" aria-labelledby="recovery-title">
      <Link className="password-recovery-brand" to="/" aria-label="Ceylon Royal Gemstones home">
        <BrandLogo alt="" />
        <span>
          <strong>CEYLON</strong>
          <small>ROYAL GEMSTONES</small>
        </span>
      </Link>
      <div className="password-recovery-heading">
        <span className="password-recovery-eyebrow">{eyebrow}</span>
        <h1 id="recovery-title">{title}</h1>
        <p>{description}</p>
      </div>
      {children}
      <Link className="password-recovery-back" to="/login">
        <FaArrowLeft aria-hidden="true" />
        Back to sign in
      </Link>
    </section>
    <p className="password-recovery-footnote">
      Ceylon Royal Gemstones <span>•</span> Secure account access
    </p>
  </main>
);

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResetLink("");
    setIsLoading(true);

    try {
      const response = await apiPost("/api/auth/forgot-password", {
        email: email.trim(),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "We couldn't create a reset link. Please try again.");
        return;
      }

      setResetLink(data.resetLink);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PasswordRecoveryCard
      eyebrow="Account assistance"
      title={resetLink ? "Check your reset link" : "Forgot your password?"}
      description={
        resetLink
          ? "Use the secure link below to choose a new password. The link expires in one hour."
          : "Enter the email address associated with your account and we'll help you reset your password."
      }
    >
      {resetLink ? (
        <div className="password-recovery-result" role="status">
          <div className="password-recovery-success-icon">
            <FaCheckCircle aria-hidden="true" />
          </div>
          <strong>Reset link ready</strong>
          <p>For this development setup, open the reset link below to continue.</p>
          <a className="password-recovery-submit" href={resetLink}>
            Continue to reset password
          </a>
          <button
            className="password-recovery-secondary"
            type="button"
            onClick={() => setResetLink("")}
          >
            Send another link
          </button>
        </div>
      ) : (
        <form className="password-recovery-form" onSubmit={handleSubmit}>
          {error && (
            <div className="password-recovery-error" role="alert">
              {error}
            </div>
          )}
          <label htmlFor="recovery-email">Email address</label>
          <div className="password-recovery-input">
            <FaEnvelope aria-hidden="true" />
            <input
              id="recovery-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <button className="password-recovery-submit" type="submit" disabled={isLoading}>
            {isLoading ? "Creating reset link..." : "Send reset link"}
          </button>
        </form>
      )}
    </PasswordRecoveryCard>
  );
};

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Your passwords don't match. Please check and try again.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiPost("/api/auth/reset-password", {
        token,
        password,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "We couldn't reset your password. Request a new link and try again.");
        return;
      }

      setIsComplete(true);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <PasswordRecoveryCard
        eyebrow="Secure account access"
        title="Reset link unavailable"
        description="This link is missing its reset token. Request a new password reset link to continue."
      >
        <Link className="password-recovery-submit password-recovery-button-link" to="/forgot-password">
          Request a new link
        </Link>
      </PasswordRecoveryCard>
    );
  }

  if (isComplete) {
    return (
      <PasswordRecoveryCard
        eyebrow="Account secured"
        title="Password updated"
        description="Your password has been reset successfully. You can now sign in with your new password."
      >
        <Link className="password-recovery-submit password-recovery-button-link" to="/login">
          Continue to sign in
        </Link>
      </PasswordRecoveryCard>
    );
  }

  return (
    <PasswordRecoveryCard
      eyebrow="Secure account access"
      title="Create a new password"
      description="Choose a strong password with at least 8 characters."
    >
      <form className="password-recovery-form" onSubmit={handleSubmit}>
        {error && (
          <div className="password-recovery-error" role="alert">
            {error}
          </div>
        )}
        <label htmlFor="new-password">New password</label>
        <div className="password-recovery-input">
          <FaLock aria-hidden="true" />
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <label htmlFor="confirm-new-password">Confirm new password</label>
        <div className="password-recovery-input">
          <FaLock aria-hidden="true" />
          <input
            id="confirm-new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Enter your new password again"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>
        <button className="password-recovery-submit" type="submit" disabled={isLoading}>
          {isLoading ? "Updating password..." : "Update password"}
        </button>
      </form>
    </PasswordRecoveryCard>
  );
};
