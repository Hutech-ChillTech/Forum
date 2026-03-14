import { apiFetch, API_BASE_URL } from '../utils/apiFetch.js';


const shareService = {
  async sharePost(postId, shareData) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}/shares`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shareData) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to share post");
    return data.result ?? data;
  },

  async getSharesByPost(postId, page = 0, size = 20) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}/shares?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch shares");
    const data = await response.json(); return data.result ?? data;
  },

  async getMyShares(page = 0, size = 20) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/users/me/shares?page=${page}&size=${size}`, {
      });
    if (!response.ok) throw new Error("Failed to fetch my shares");
    const data = await response.json(); return data.result ?? data;
  },

  async countShares(postId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}/shares/count`);
    if (!response.ok) throw new Error("Failed to count shares");
    const data = await response.json(); return data.result ?? data;
  } };

export default shareService;
