// Use stable local-storage keys for admin accounts and the active session.
const accountsKey = "ceylon-admin-accounts";
const sessionKey = "ceylon-admin-session";

// Start with no locally stored admin accounts.
export const DEFAULT_ADMIN_ACCOUNTS = [];

// Read saved accounts, initializing storage when the value is missing or invalid.
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

// Persist the current admin account list in local storage.
export const writeAdminAccounts = (accounts) => {
  window.localStorage.setItem(accountsKey, JSON.stringify(accounts));
};

// Read the active admin session, returning null if it is missing or malformed.
export const readAdminSession = () => {
  try {
    return JSON.parse(window.localStorage.getItem(sessionKey) || "null");
  } catch {
    return null;
  }
};

// Check that the active account is enabled and has the role required for a route.
export const hasAdminAccess = (path) => {
  // Require a session before looking up the account and its current permissions.
  const session = readAdminSession();
  if (!session?.accountId) return false;

  const accounts = readAdminAccounts();
  const account = accounts.find(
    (item) => item.id === session.accountId || String(item.email || "").toLowerCase() === String(session.email || "").toLowerCase()
  );
  const role = account?.role || session.role;
  const status = account?.status || "active";

  // Deny inactive accounts and restrict the super-admin route to that role.
  if (status !== "active") return false;
  if (path === "/super-admin") return role === "super-admin";
  return role === "admin" || role === "super-admin";
};

// Hash a password with SHA-256 and return its hexadecimal representation.
export const hashAdminPassword = async (password) => {
  const passwordBytes = new TextEncoder().encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", passwordBytes);
  return Array.from(new Uint8Array(hashBuffer), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

// Save the account and establish a local admin session.
export const startAdminSession = (account) => {
  // Store only the identity and role needed for the active session.
  const session = {
    accountId: account.id,
    email: account.email,
    name: account.name,
    role: account.role
  };

  // Update an existing account or add a normalized account record.
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

  // Persist the account list and active session, then return the session data.
  writeAdminAccounts(accounts);
  window.localStorage.setItem(sessionKey, JSON.stringify(session));
  return session;
};

// Remove the active admin session and its legacy storage entry.
export const endAdminSession = () => {
  window.localStorage.removeItem(sessionKey);
  window.localStorage.removeItem("ceylon-admin");
};