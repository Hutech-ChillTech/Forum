const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const postService = {
  async getPublishedPosts(page = 0, size = 20, sort = "createdAt,desc") {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/posts?page=${page}&size=${size}&sort=${sort}`,
    );
    if (!response.ok) throw new Error("Failed to fetch posts");
    const data = await response.json();
    return data.result ?? data;
  },

  async getPostById(postId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}`);
    if (!response.ok) throw new Error("Post not found");
    const data = await response.json();
    return data.result ?? data;
  },

  async getPostsByUser(userId, page = 0, size = 20) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/posts/user/${userId}?page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch user posts");
    const data = await response.json();
    return data.result ?? data;
  },

  async searchPosts(keyword, page = 0, size = 20) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/posts/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Search failed");
    const data = await response.json();
    return data.result ?? data;
  },

  async createPost(postData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(postData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create post");
    return data.result ?? data;
  },

  async updatePost(postId, userId, postData) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/posts/${postId}?userId=${userId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(postData),
      },
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update post");
    return data.result ?? data;
  },

  async deletePost(postId, userId) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/posts/${postId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: authHeader(),
      },
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to delete post");
    }
  },

  async getRecentPosts(days = 7, page = 0, size = 20) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/posts/recent?days=${days}&page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch recent posts");
    const data = await response.json();
    return data.result ?? data;
  },

  async getTotalPosts() {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/posts/statistics/total`,
    );
    if (!response.ok) throw new Error("Failed to get total");
    const data = await response.json();
    return data.result ?? data;
  },
};

export default postService;
