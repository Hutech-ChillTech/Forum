import { apiFetch, API_BASE_URL } from '../utils/apiFetch.js';

class UserService {
  async getAllUsers(page = 0, size = 20, sort = 'createdAt,desc') {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users?page=${page}&size=${size}&sort=${sort}`
    );
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  }

  async getUserById(userId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/users/${userId}`);
    if (!response.ok) throw new Error('User not found');
    return await response.json();
  }

  async getUserByEmail(email) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/email/${encodeURIComponent(email)}`
    );
    if (!response.ok) throw new Error('User not found');
    return await response.json();
  }

  async updateUser(userId, userData) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return await response.json();
  }

  async deleteUser(userId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete user');
  }
  async banUser(userId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/users/${userId}/ban`, { method: 'PATCH' });
    if (!response.ok) throw new Error('Failed to ban user');
    return await response.json();
  }

  async unbanUser(userId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/users/${userId}/unban`, { method: 'PATCH' });
    if (!response.ok) throw new Error('Failed to unban user');
    return await response.json();
  }

  async searchUsers(keyword, page = 0, size = 20) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/users/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Failed to search users');
    return await response.json();
  }

  async getActiveUsers(page = 0, size = 20) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/users/active?page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Failed to fetch active users');
    return await response.json();
  }

  async getMyBookmarks(page = 0, size = 20) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/users/me/bookmarks?page=${page}&size=${size}`, { });
    if (!response.ok) throw new Error('Failed to fetch bookmarks');
    return await response.json();
  }

  async getMyShares(page = 0, size = 20) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/users/me/shares?page=${page}&size=${size}`, { });
    if (!response.ok) throw new Error('Failed to fetch shares');
    return await response.json();
  }

  async updateUserRole(userId, role) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error('Failed to update user role');
    return await response.json();
  }
}


export default new UserService();
