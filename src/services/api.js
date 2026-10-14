const configuredBaseUrl =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000";

export const API_BASE_URL = configuredBaseUrl
  .replace(/\/+$/, "")
  .replace(/(?:\/api)+$/i, "")
  .replace(/\/+$/, "");

// ─── Auth Token Helpers ──────────────────────────────────────────────────────

/** Returns the JWT token stored for the current customer session */
export const getCustomerToken = () => {
  try {
    return window.localStorage.getItem("ceylon-auth-token") || null;
  } catch {
    return null;
  }
};

/** Stores the JWT token for the current customer session */
export const setCustomerToken = (token) => {
  try {
    window.localStorage.setItem("ceylon-auth-token", token);
  } catch {
    // Storage unavailable
  }
};

/** Removes the JWT token (logout) */
export const clearCustomerToken = () => {
  try {
    window.localStorage.removeItem("ceylon-auth-token");
    window.localStorage.removeItem("ceylon-user");
    window.localStorage.removeItem("ceylon-user-id");
  } catch {
    // Storage unavailable
  }
};

/** Returns Authorization header object if a token is available */
export const authHeaders = () => {
  const token = getCustomerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Core Request Helper ─────────────────────────────────────────────────────

/**
 * Makes an authenticated or public API request.
 * @param {string} path  - API path e.g. "/api/auth/login"
 * @param {RequestInit} options - fetch options
 * @returns {Promise<Response>}
 */
export const apiRequest = (path, options = {}) => {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_URL must be configured before making API requests.");
  }

  const normalizedPath = String(path).replace(/^\/+/, "");
  const requestUrl = `${API_BASE_URL}/${normalizedPath}`;

  return fetch(requestUrl, {
    ...options,
    headers: {
      ...(typeof FormData !== "undefined" && options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
};

// ─── Convenience wrappers ────────────────────────────────────────────────────

export const apiGet = (path, options = {}) =>
  apiRequest(path, { method: "GET", ...options });

export const apiPost = (path, body, options = {}) =>
  apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });

export const apiPut = (path, body, options = {}) =>
  apiRequest(path, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });

export const apiDelete = (path, options = {}) =>
  apiRequest(path, { method: "DELETE", ...options });
