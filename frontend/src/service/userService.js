const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

class UserService {
  async getAllUsers(page = 0, size = 20, sort = 'createdAt,desc') {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/users?page=${page}&size=${size}&sort=${sort}`
    );
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  }

  async getUserById(userId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`);
    if (!response.ok) throw new Error('User not found');
    return await response.json();
  }

  async getUserByEmail(email) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/users/email/${encodeURIComponent(email)}`
    );
    if (!response.ok) throw new Error('User not found');
    return await response.json();
  }

  async updateUser(userId, userData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return await response.json();
  }

  async deleteUser(userId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    if (!response.ok) throw new Error('Failed to delete user');
  }
}

export default new UserService();
