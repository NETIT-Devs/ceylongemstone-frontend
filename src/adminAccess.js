import { API_BASE_URL } from "./services/api.js";

const accountsKey = "ceylon-admin-accounts";
const sessionKey = "ceylon-admin-session";

const ADMIN_LOGIN_ENDPOINTS = [
  "/api/auth/login",
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

  const accounts = readAdminAccounts();
  const account = accounts.find(
    (item) => item.id === session.accountId || String(item.email || "").toLowerCase() === String(session.email || "").toLowerCase()
  );
  const role = account?.role || session.role;
  const status = account?.status || "active";

  if (status !== "active") return false;
  if (path === "/super-admin") return role === "super-admin";
  return role === "admin" || role === "super-admin";
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

      const rawRole = String(adminAccount?.role || payload?.role || "").toUpperCase();
      const isAdminRole =
        rawRole === "ADMIN" ||
        rawRole === "SUPER_ADMIN" ||
        rawRole === "SUPER-ADMIN" ||
        adminAccount?.role === "admin" ||
        adminAccount?.role === "super-admin";

      if (adminAccount && isAdminRole) {
        const isSuper = rawRole.includes("SUPER") || adminAccount.role === "super-admin";
        return {
          id: adminAccount.id || adminAccount.accountId || adminAccount._id || adminAccount.email || normalizedEmail,
          name: adminAccount.name || adminAccount.fullName || "Administrator",
          email: adminAccount.email || normalizedEmail,
          department: adminAccount.department || "Operations",
          role: isSuper ? "super-admin" : "admin",
          phone: adminAccount.phone || "",
          status: adminAccount.status === 0 ? "inactive" : "active",
          passwordHash: adminAccount.passwordHash || "",
          source: "backend",
          token: payload?.token || null,
        };
      }

      if (payload?.success === true && payload?.email && isAdminRole) {
        const isSuper = rawRole.includes("SUPER");
        return {
          id: payload.id || payload.accountId || payload._id || payload.email,
          name: payload.name || payload.fullName || "Administrator",
          email: payload.email,
          department: payload.department || "Operations",
          role: isSuper ? "super-admin" : "admin",
          phone: payload.phone || "",
          status: payload.status === 0 ? "inactive" : "active",
          passwordHash: payload.passwordHash || "",
          source: "backend",
          token: payload?.token || null,
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
  const accounts = readAdminAccounts();
  const existingIdx = accounts.findIndex(
    (item) => item.id === account.id || String(item.email || "").toLowerCase() === String(account.email || "").toLowerCase()
  );
  if (existingIdx >= 0) {
    accounts[existingIdx] = { ...accounts[existingIdx], ...account, status: "active" };
  } else {
    accounts.push({
      id: account.id,
      name: account.name || "Administrator",
      email: account.email,
      department: account.department || "Operations",
      role: account.role || "admin",
      phone: account.phone || "",
      status: "active",
      source: "backend"
    });
  }
  writeAdminAccounts(accounts);
  window.localStorage.setItem(sessionKey, JSON.stringify(session));
  return session;
};

export const endAdminSession = () => {
  window.localStorage.removeItem(sessionKey);
  window.localStorage.removeItem("ceylon-admin");
};