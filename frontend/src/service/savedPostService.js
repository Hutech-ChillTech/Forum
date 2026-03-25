import { apiFetch, API_BASE_URL } from "../utils/apiFetch.js";

const savedPostService = {
  async bookmarkPost(postId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/${postId}/bookmarks`,
      {
        method: "POST",
      },
    );
    if (!response.ok) throw new Error("Failed to bookmark post");
  },

  async unbookmarkPost(postId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/${postId}/bookmarks`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Failed to unbookmark post");
  },

  async getMyBookmarks(page = 0, size = 20) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/me/bookmarks?page=${page}&size=${size}`,
      {},
    );
    if (!response.ok) throw new Error("Failed to fetch bookmarks");
    const data = await response.json();
    return data.result ?? data;
  },

  async isBookmarked(postId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/${postId}/bookmarks/status`,
    );
    if (!response.ok) return false;
    return await response.json();
  },
};

export default savedPostService;
