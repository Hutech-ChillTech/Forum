import { apiFetch, API_BASE_URL } from '../utils/apiFetch.js';


const reactionService = {
  async react(postId, reactionData) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reactionData) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to react");
    return data.result ?? data;
  },

  async toggleLike(postId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to toggle like");
    return data.result ?? data;
  },

  async getLikeInfo(postId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}/like/info`);
    if (!response.ok) throw new Error("Failed to fetch like info");
    const data = await response.json();
    return data.result ?? data;
  }
};

export default reactionService;
