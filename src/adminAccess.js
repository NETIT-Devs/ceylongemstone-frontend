const accountsKey = "ceylon-admin-accounts";
const sessionKey = "ceylon-admin-session";

export const DEFAULT_ADMIN_ACCOUNTS = [
  {
    id: "admin-super-root",
    name: "Super Administrator",
    email: "superadmin@ceylonroyalgemstones.com",
    department: "Executive",
    role: "super-admin",
    phone: "+94 71 234 5678",
    status: "active",
    passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // admin123
    createdAt: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "admin-operations-01",
    name: "Operations Admin",
    email: "admin@ceylonroyalgemstones.com",
    department: "Operations",
    role: "admin",
    phone: "+94 77 987 6543",
    status: "active",
    passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // admin123
    createdAt: "2026-09-15T00:00:00.000Z"
  }
];

export const readAdminAccounts = () => {
  try {
    const raw = window.localStorage.getItem(accountsKey);
    if (!raw) {
      window.localStorage.setItem(accountsKey, JSON.stringify(DEFAULT_ADMIN_ACCOUNTS));
      return DEFAULT_ADMIN_ACCOUNTS;
    }
    const accounts = JSON.parse(raw);
    if (!Array.isArray(accounts) || accounts.length === 0) {
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