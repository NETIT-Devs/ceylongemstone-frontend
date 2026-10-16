const accountsKey = "ceylon-admin-accounts";
const sessionKey = "ceylon-admin-session";

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