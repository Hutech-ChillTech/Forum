import { apiFetch, API_BASE_URL } from "../utils/apiFetch.js";

class UserService {
  // ─── Public endpoints (UserController /api/v1/users) ─────────────
  async getAllUsers(page = 0, size = 20, sort = "createdAt,desc") {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users?page=${page}&size=${size}&sort=${sort}`,
    );
    if (!response.ok) throw new Error("Failed to fetch users");
    return await response.json();
  }

  async getUserById(userId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/${userId}`,
    );
    if (!response.ok) throw new Error("User not found");
    const data = await response.json();
    return data.result ?? data;
  }

  async getUserByEmail(email) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/email/${encodeURIComponent(email)}`,
    );
    if (!response.ok) throw new Error("User not found");
    return await response.json();
  }

  async updateUser(userId, userData) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Failed to update user");
    return await response.json();
  }

  // ─── Admin endpoints (AdminController /api/v1/internal-mng) ──────
  async adminGetAllUsers(page = 0, size = 20, sort = "createdAt,desc") {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/internal-mng/users?page=${page}&size=${size}&sort=${sort}`,
    );
    if (!response.ok) throw new Error("Failed to fetch users");
    return await response.json();
  }

  async deleteUser(userId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/internal-mng/${userId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Failed to delete user");
  }
  async banUser(userId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/internal-mng/${userId}/ban`,
      { method: "POST" },
    );
    if (!response.ok) throw new Error("Failed to ban user");
    return await response.json();
  }

  async unbanUser(userId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/internal-mng/${userId}/unban`,
      { method: "POST" },
    );
    if (!response.ok) throw new Error("Failed to unban user");
    return await response.json();
  }

  async searchUsers(keyword, page = 0, size = 20) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/search?keyword=${encodeURIComponent(keyword)}`,
    );
    if (!response.ok) throw new Error("Failed to search users");
    const data = await response.json();
    const result = data.result ?? data;
    const users = result.users || [];
    return { users, totalPages: 1, totalItems: users.length };
  }

  async getActiveUsers(page = 0, size = 20) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/active?page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch active users");
    return await response.json();
  }

  async getMyBookmarks(page = 0, size = 20) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/me/bookmarks?page=${page}&size=${size}`,
      {},
    );
    if (!response.ok) throw new Error("Failed to fetch bookmarks");
    return await response.json();
  }

  async getMyShares(page = 0, size = 20) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/me/shares?page=${page}&size=${size}`,
      {},
    );
    if (!response.ok) throw new Error("Failed to fetch shares");
    return await response.json();
  }

  async assignRole(accountId, roleName) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/internal-mng/assign-role`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, roleName }),
      },
    );
    if (!response.ok) throw new Error("Failed to assign role " + roleName);
    return await response.json();
  }
}

export default new UserService();
