const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim() || "";

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "");

export const apiRequest = (path, options) => {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_URL must be configured before making API requests.");
  }

  const normalizedPath = String(path).replace(/^\/+/, "");
  const requestUrl = `${API_BASE_URL}/${normalizedPath}`;

  return fetch(requestUrl, options);
};
