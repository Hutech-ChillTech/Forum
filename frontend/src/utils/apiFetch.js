const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getToken() {
  return localStorage.getItem("token");
}

/**
 * Check if the current access token is expired or about to expire (within 30s).
 * Returns true if a proactive refresh is needed.
 */
function isTokenExpired() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Refresh 30 seconds before actual expiry to avoid edge-case 401s
    return Date.now() >= payload.exp * 1000 - 30000;
  } catch {
    return false;
  }
}

// ── Singleton refresh lock ──────────────────────────────────────────────────
// When multiple calls hit 401 simultaneously, only one refresh runs.
// All others wait for the same promise so the refresh token isn't consumed twice.
let refreshPromise = null;

async function tryRefresh() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = doRefresh();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function doRefresh() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const result = data.result ?? data;
    if (result.accessToken) {
      localStorage.setItem("token", result.accessToken);
      if (result.refreshToken)
        localStorage.setItem("refreshToken", result.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function clearSession() {
  ["token", "refreshToken", "user", "userProfile"].forEach((k) =>
    localStorage.removeItem(k),
  );
}

export async function apiFetch(url, options = {}) {
  // Proactive refresh: if token is expired or about to expire, refresh BEFORE
  // making the request so the browser console never shows a 401.
  if (isTokenExpired()) {
    const refreshed = await tryRefresh();
    if (!refreshed) {
      clearSession();
      window.location.href = "/login";
      throw new Error("Phien dang nhap het han. Vui long dang nhap lai.");
    }
  }

  const token = getToken();
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = getToken();
      const retryHeaders = {
        ...options.headers,
        ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
      };
      response = await fetch(url, { ...options, headers: retryHeaders });
    }
    // If still 401 after attempting refresh, force re-login
    if (response.status === 401) {
      clearSession();
      window.location.href = "/login";
      throw new Error("Phien dang nhap het han. Vui long dang nhap lai.");
    }
  }
  return response;
}

export { API_BASE_URL };
