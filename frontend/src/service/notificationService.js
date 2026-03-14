import { apiFetch, API_BASE_URL } from '../utils/apiFetch.js';


const notificationService = {
  async getMyNotifications(page = 0, size = 20) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/notifications?page=${page}&size=${size}`, {
      });
    if (!response.ok) throw new Error("Failed to fetch notifications");
    const data = await response.json(); return data.result ?? data;
  },

  async countUnread() {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/notifications/unread/count`, {
      });
    if (!response.ok) throw new Error("Failed to get unread count");
    const data = await response.json(); return data.result ?? data;
  },

  async markAllAsRead() {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/notifications/read-all`, {
      method: "PATCH" });
    if (!response.ok) throw new Error("Failed to mark all as read");
  },

  async deleteNotification(id) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/notifications/${id}`, {
      method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete notification");
  },

  async clearAll() {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/notifications`, {
      method: "DELETE" });
    if (!response.ok) throw new Error("Failed to clear notifications");
  } };

export default notificationService;
