import { apiFetch, API_BASE_URL } from "../utils/apiFetch.js";

const postService = {
  async getPublishedPosts(page = 0, size = 20, sort = "createdAt,desc") {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts?page=${page}&size=${size}&sort=${sort}`,
    );
    if (!response.ok) throw new Error("Failed to fetch posts");
    const data = await response.json();
    return data.result ?? data;
  },

  async getFollowingPosts(page = 0, size = 20, sort = "createdAt,desc") {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/following?page=${page}&size=${size}&sort=${sort}`,
    );
    if (!response.ok) throw new Error("Failed to fetch following posts");
    const data = await response.json();
    return data.result ?? data;
  },

  async getPostById(postId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}`);
    if (!response.ok) throw new Error("Post not found");
    const data = await response.json();
    return data.result ?? data;
  },

  async getPostsByUser(userId, page = 0, size = 20) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/user/${userId}?page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch user posts");
    const data = await response.json();
    return data.result ?? data;
  },

  async searchPosts(keyword, page = 0, size = 20) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Search failed");
    const data = await response.json();
    return data.result ?? data;
  },

  async createPost(postData) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create post");
    return data.result ?? data;
  },

  async updatePost(postId, postData) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update post");
    return data.result ?? data;
  },

  async deletePost(postId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to delete post");
    }
  },

  async getRecentPosts(days = 7, page = 0, size = 20) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/recent?days=${days}&page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch recent posts");
    const data = await response.json();
    return data.result ?? data;
  },

  async getTotalPosts() {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/statistics/total`,
    );
    if (!response.ok) throw new Error("Failed to get total");
    const data = await response.json();
    return data.result ?? data;
  },
  async getAllPostsAdmin(page = 0, size = 20, sort = "createdAt,desc") {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/all?page=${page}&size=${size}&sort=${sort}`,
      {},
    );
    if (!response.ok) throw new Error("Failed to fetch all posts");
    const data = await response.json();
    return data.result ?? data;
  },

  async getPostsByStatus(status, page = 0, size = 20, sort = "createdAt,desc") {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/status/${status}?page=${page}&size=${size}&sort=${sort}`,
      {},
    );
    if (!response.ok) throw new Error("Failed to fetch posts by status");
    const data = await response.json();
    return data.result ?? data;
  },

  async updatePostStatus(postId, status) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/${postId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );

    if (response.status === 204) return null;

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to update post status");
    return data.result ?? data;
  },

  async deletePostByAdmin(postId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/${postId}/admin`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to delete post");
    }
  },

  async countPostsByStatus(status) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/statistics/status/${status}`,
      {},
    );
    if (!response.ok) throw new Error("Failed to get count");
    const data = await response.json();
    return data.result ?? data;
  },

  async countPostsByUser(userId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/posts/statistics/user/${userId}`,
    );
    if (!response.ok) throw new Error("Failed to get count");
    const data = await response.json();
    return data.result ?? data;
  },
};

export default postService;
