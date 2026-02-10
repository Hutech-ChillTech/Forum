const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * User Service - Xử lý các API calls liên quan đến User
 */
class UserService {
  /**
   * Tạo user mới (Đăng ký)
   */
  async createUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng ký thất bại');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra email đã tồn tại chưa
   */
  async checkEmailExists(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/check-email/${encodeURIComponent(email)}`);
      return await response.json();
    } catch (error) {
      console.error('Error checking email:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra username đã tồn tại chưa
   */
  async checkUsernameExists(userName) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/check-username/${encodeURIComponent(userName)}`);
      return await response.json();
    } catch (error) {
      console.error('Error checking username:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả users (có phân trang)
   */
  async getAllUsers(page = 0, size = 20, sort = 'createdAt,desc') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users?page=${page}&size=${size}&sort=${sort}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Lấy user theo ID
   */
  async getUserById(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('User not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Lấy user theo email
   */
  async getUserByEmail(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/email/${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error('User not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  /**
   * Lấy user theo username
   */
  async getUserByUsername(userName) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/username/${encodeURIComponent(userName)}`);
      
      if (!response.ok) {
        throw new Error('User not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin user
   */
  async updateUser(userId, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái user
   */
  async updateUserStatus(userId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  /**
   * Ban user
   */
  async banUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/ban`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to ban user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }

  /**
   * Unban user
   */
  async unbanUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/unban`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to unban user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }
  }

  /**
   * Xóa user (hard delete)
   */
  async deleteUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Xóa user (soft delete)
   */
  async softDeleteUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/soft`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to soft delete user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error soft deleting user:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm users
   */
  async searchUsers(keyword) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(keyword)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Lấy tổng số users
   */
  async getTotalUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/statistics/total`);
      
      if (!response.ok) {
        throw new Error('Failed to get total users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting total users:', error);
      throw error;
    }
  }

  /**
   * Lấy số lượng users theo status
   */
  async getUsersByStatus(status) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/statistics/status/${status}`);
      
      if (!response.ok) {
        throw new Error('Failed to get users by status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting users by status:', error);
      throw error;
    }
  }
}

export default new UserService();
