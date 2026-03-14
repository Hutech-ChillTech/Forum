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

  async removeReaction(postId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}/reactions`, {
      method: "DELETE" });
    if (!response.ok) throw new Error("Failed to remove reaction");
  },

  async getReactions(postId, page = 0, size = 50) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}/reactions?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch reactions");
    const data = await response.json(); return data.result ?? data;
  },

  async countReactions(postId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}/reactions/count`);
    if (!response.ok) throw new Error("Failed to count reactions");
    const data = await response.json(); return data.result ?? data;
  } };

export default reactionService;
