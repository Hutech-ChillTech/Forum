import { apiFetch, API_BASE_URL } from '../utils/apiFetch.js';


const commentService = {
  async getCommentsByPost(postId, page = 0, size = 50) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/comments/post/${postId}?page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch comments");
    const data = await response.json();
    return data.result ?? data;
  },

  async getCommentById(commentId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/comments/${commentId}`,
    );
    if (!response.ok) throw new Error("Comment not found");
    const data = await response.json();
    return data.result ?? data;
  },

  async getReplies(commentId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/comments/${commentId}/replies`,
    );
    if (!response.ok) throw new Error("Failed to fetch replies");
    const data = await response.json();
    return data.result ?? data;
  },

  async createComment(commentData) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentData) });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to create comment");
    return data.result ?? data;
  },

  async updateComment(commentId, content) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/comments/${commentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }) },
    );
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to update comment");
    return data.result ?? data;
  },

  async deleteComment(commentId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/comments/${commentId}`,
      {
        method: "DELETE" },
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to delete comment");
    }
  },

  async countComments(postId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/comments/count/post/${postId}`,
    );
    if (!response.ok) throw new Error("Failed to get comment count");
    const data = await response.json();
    return data.result ?? data;
  },
  async getAllCommentsByPostAdmin(postId, page = 0, size = 20, sort = "createdAt,asc") {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/comments/post/${postId}/all?page=${page}&size=${size}&sort=${sort}`, { });
    if (!response.ok) throw new Error("Failed to fetch all comments");
    const data = await response.json(); return data.result ?? data;
  },

  async getCommentsByUser(userId, page = 0, size = 20) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/comments/user/${userId}?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch user comments");
    const data = await response.json(); return data.result ?? data;
  },

  async deleteCommentByAdmin(commentId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/internal-mng/comments/${commentId}`, { method: "DELETE" });
    if (!response.ok) { const data = await response.json(); throw new Error(data.message || "Failed to delete comment"); }
  },

  async countCommentsByUser(userId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/comments/count/user/${userId}`);
    if (!response.ok) throw new Error("Failed to get comment count");
    const data = await response.json(); return data.result ?? data;
  } };

export default commentService;
