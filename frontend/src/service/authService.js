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


  async changePassword(changePasswordData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(changePasswordData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Doi mat khau that bai");
    return data.result;
  },
  saveSession(authResult) {
    localStorage.setItem("token", authResult.accessToken);
    if (authResult.refreshToken) {
      localStorage.setItem("refreshToken", authResult.refreshToken);
    }

    try {
      // Simple JWT decoding
      const base64Url = authResult.accessToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const decoded = JSON.parse(jsonPayload);
      const userProfile = {
        userId: decoded.userId,
        username: decoded.userName,
        email: decoded.email,
        fullName: decoded.fullName,
        avatar: decoded.avatarURL,
        role: decoded.role,
        status: decoded.status,
        verifyStatus: decoded.verifyStatus
      };

      localStorage.setItem("userProfile", JSON.stringify(userProfile));
      // Also keep 'user' key for backward compatibility if needed
      localStorage.setItem("user", JSON.stringify(userProfile));
      
      // Dispatch event to update Header and other components immediately
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: userProfile }));
    } catch (e) {
      console.error("Error saving session/decoding token:", e);
    }
  },
};


export default authService;
