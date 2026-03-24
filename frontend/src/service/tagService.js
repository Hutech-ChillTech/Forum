import { apiFetch, API_BASE_URL } from '../utils/apiFetch.js';


const tagService = {
  async getAllTags(page = 0, size = 50) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/tags?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch tags");
    const data = await response.json(); return data.result ?? data;
  },

  async getTagById(id) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/tags/${id}`);
    if (!response.ok) throw new Error("Tag not found");
    const data = await response.json(); return data.result ?? data;
  },

  async searchTagByName(name) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/tags/search?name=${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error("Tag not found");
    const data = await response.json(); return data.result ?? data;
  },

  async getTagsByPost(postId) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/tags/post/${postId}`);
    if (!response.ok) throw new Error("Failed to fetch tags for post");
    const data = await response.json(); return data.result ?? data;
  },

  async createTag(name) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create tag");
    return data.result ?? data;
  },

  async deleteTag(id) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/tags/${id}`, {
      method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete tag");
  },

  // ─── Admin Endpoints ──────────────────────────────────────────
  async adminGetAllTags(page = 0, size = 50) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/internal-mng/tags?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch tags for admin");
    const data = await response.json(); return data.result ?? data;
  },

  async adminCreateTag(name) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/internal-mng/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create tag");
    return data.result ?? data;
  },

  async adminDeleteTag(id) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/internal-mng/tags/${id}`, {
      method: "DELETE"
    });
    if (!response.ok) throw new Error("Failed to delete tag");
  },

  async adminUpdateTag(id, name) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/internal-mng/tags/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update tag");
    return data.result ?? data;
  }
};

export default tagService;
