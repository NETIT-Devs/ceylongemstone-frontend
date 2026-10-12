import { API_BASE_URL } from "./services/api.js";

const accountsKey = "ceylon-admin-accounts";
const sessionKey = "ceylon-admin-session";

const ADMIN_LOGIN_ENDPOINTS = [
  "/api/admin/login",
  "/admin/login",
  "/api/auth/admin/login",
  "/auth/admin/login",
];

export const DEFAULT_ADMIN_ACCOUNTS = [];

export const readAdminAccounts = () => {
  try {
    const raw = window.localStorage.getItem(accountsKey);
    if (!raw) {
      window.localStorage.setItem(accountsKey, JSON.stringify(DEFAULT_ADMIN_ACCOUNTS));
      return DEFAULT_ADMIN_ACCOUNTS;
    }
    const accounts = JSON.parse(raw);
    if (!Array.isArray(accounts)) {
      window.localStorage.setItem(accountsKey, JSON.stringify(DEFAULT_ADMIN_ACCOUNTS));
      return DEFAULT_ADMIN_ACCOUNTS;
    }
    return accounts;
  } catch {
    return DEFAULT_ADMIN_ACCOUNTS;
  }
};

export const writeAdminAccounts = (accounts) => {
  window.localStorage.setItem(accountsKey, JSON.stringify(accounts));
};

export const readAdminSession = () => {
  try {
    return JSON.parse(window.localStorage.getItem(sessionKey) || "null");
  } catch {
    return null;
  }
};

export const hasAdminAccess = (path) => {
  const session = readAdminSession();
  if (!session?.accountId) return false;

  const account = readAdminAccounts().find((item) => item.id === session.accountId);
  if (!account || account.role !== session.role || account.status !== "active") return false;
  if (path === "/super-admin") return account.role === "super-admin";
  return account.role === "admin" || account.role === "super-admin";
};

export const hashAdminPassword = async (password) => {
  const passwordBytes = new TextEncoder().encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", passwordBytes);
  return Array.from(new Uint8Array(hashBuffer), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

export const loginAdminWithBackend = async (email, password) => {
  if (!API_BASE_URL) {
    return null;
  }

  const normalizedEmail = String(email || "").trim().toLowerCase();
  const candidateEndpoints = [...new Set(ADMIN_LOGIN_ENDPOINTS)];
  let lastError = null;

  for (const endpoint of candidateEndpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (!response.ok) {
        lastError = new Error(`Admin login failed at ${endpoint}: ${response.status}`);
        continue;
      }

      const payload = await response.json().catch(() => ({}));
      const adminAccount =
        payload?.admin ||
        payload?.user ||
        payload?.account ||
        payload?.data?.admin ||
        payload?.data?.user ||
        payload?.data?.account ||
        null;

      if (adminAccount && (adminAccount.role === "admin" || adminAccount.role === "super-admin")) {
        return {
          id: adminAccount.id || adminAccount.accountId || adminAccount._id || adminAccount.email || normalizedEmail,
          name: adminAccount.name || adminAccount.fullName || "Administrator",
          email: adminAccount.email || normalizedEmail,
          department: adminAccount.department || "Operations",
          role: adminAccount.role || "admin",
          phone: adminAccount.phone || "",
          status: adminAccount.status || "active",
          passwordHash: adminAccount.passwordHash || "",
          source: "backend",
        };
      }

      if (payload?.success === true && payload?.email) {
        return {
          id: payload.id || payload.accountId || payload._id || payload.email,
          name: payload.name || payload.fullName || "Administrator",
          email: payload.email,
          department: payload.department || "Operations",
          role: payload.role || "admin",
          phone: payload.phone || "",
          status: payload.status || "active",
          passwordHash: payload.passwordHash || "",
          source: "backend",
        };
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    console.warn("Backend admin login unavailable or rejected", lastError);
  }

  return null;
};

export const startAdminSession = (account) => {
  const session = {
    accountId: account.id,
    email: account.email,
    name: account.name,
    role: account.role
  };
  window.localStorage.setItem(sessionKey, JSON.stringify(session));
  return session;
};

export const endAdminSession = () => {
  window.localStorage.removeItem(sessionKey);
  window.localStorage.removeItem("ceylon-admin");
};