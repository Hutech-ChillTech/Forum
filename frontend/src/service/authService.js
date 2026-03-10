const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const authService = {
  async login({ email, password }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Đăng nhập thất bại");
    }
    return data.result;
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Đăng ký thất bại");
    }
    return data.result;
  },

  async logout() {
    const token = localStorage.getItem("token");
    if (!token) return;
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  async refreshToken(refreshToken) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Token refresh failed");
    }
    return data.result;
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn() {
    return !!localStorage.getItem("token");
  },

  saveSession(authResult) {
    localStorage.setItem("token", authResult.accessToken);
    if (authResult.user) {
      localStorage.setItem("user", JSON.stringify(authResult.user));
    }
  },
};

export default authService;
