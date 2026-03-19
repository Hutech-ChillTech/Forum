const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getToken() {
  return localStorage.getItem("token");
}

async function tryRefresh() {
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
      if (result.refreshToken) localStorage.setItem("refreshToken", result.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function clearSession() {
  ["token", "refreshToken", "user", "userProfile"].forEach(k => localStorage.removeItem(k));
}

export async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = getToken();
      const retryHeaders = { ...options.headers, ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}) };
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
