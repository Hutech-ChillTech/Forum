import { apiFetch, API_BASE_URL } from "../utils/apiFetch.js";

const likeService = {
  async toggleLike(postId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/likes/post/${postId}`,
      {
        method: "POST",
      },
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to toggle like");
    return data.result ?? data;
  },

  async getLikeStatus(postId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/likes/post/${postId}/status`,
    );
    if (!response.ok) return false;
    const data = await response.json();
    return data.result ?? false;
  },

  async getLikeCount(postId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/likes/post/${postId}/count`,
    );
    if (!response.ok) return 0;
    const data = await response.json();
    return data.result ?? 0;
  },
};

export default likeService;
