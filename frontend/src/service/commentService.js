const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const commentService = {
  async getCommentsByPost(postId, page = 0, size = 50) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/comments/post/${postId}?page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch comments");
    const data = await response.json();
    return data.result ?? data;
  },

  async getCommentById(commentId) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/comments/${commentId}`,
    );
    if (!response.ok) throw new Error("Comment not found");
    const data = await response.json();
    return data.result ?? data;
  },

  async getReplies(commentId) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/comments/${commentId}/replies`,
    );
    if (!response.ok) throw new Error("Failed to fetch replies");
    const data = await response.json();
    return data.result ?? data;
  },

  async createComment(commentData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(commentData),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to create comment");
    return data.result ?? data;
  },

  async updateComment(commentId, userId, content) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/comments/${commentId}?userId=${userId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ content }),
      },
    );
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to update comment");
    return data.result ?? data;
  },

  async deleteComment(commentId, userId) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/comments/${commentId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: authHeader(),
      },
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to delete comment");
    }
  },

  async countComments(postId) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/comments/count/post/${postId}`,
    );
    if (!response.ok) throw new Error("Failed to get comment count");
    const data = await response.json();
    return data.result ?? data;
  },
};

export default commentService;
