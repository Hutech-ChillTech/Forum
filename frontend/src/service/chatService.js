import { apiFetch, API_BASE_URL } from "../utils/apiFetch.js";

const chatService = {
  // ── Gửi tin nhắn ──────────────────────────────────────────────────────────
  async sendMessage(messageData) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to send message");
    return data.result ?? data;
  },

  // ── Conversations (sidebar bạn bè) ────────────────────────────────────────
  async getConversations() {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/messages/conversations`,
    );
    if (!response.ok) throw new Error("Failed to fetch conversations");
    const data = await response.json();
    return data.result ?? data;
  },

  // ── Lịch sử hội thoại với một user ───────────────────────────────────────
  async getConversation(userId, page = 0, size = 30) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/messages/conversation/${userId}?page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch conversation");
    const data = await response.json();
    // Backend returns { messages: [...], totalItems: N, totalPages: N }
    return data.result ?? data.messages ?? data;
  },

  // ── Inbox / Sent ──────────────────────────────────────────────────────────
  async getInbox(page = 0, size = 20) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/messages/inbox?page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch inbox");
    const data = await response.json();
    return data.result ?? data.messages ?? data;
  },

  async getSentMessages(page = 0, size = 20) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/messages/sent?page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch sent messages");
    const data = await response.json();
    return data.result ?? data.messages ?? data;
  },

  // ── Pending Message Requests ──────────────────────────────────────────────
  async getPendingRequestSenders() {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/messages/pending`);
    if (!response.ok) throw new Error("Failed to fetch pending senders");
    const data = await response.json();
    return data.result ?? data;
  },

  async getPendingConversation(senderId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/messages/pending/conversation/${senderId}`,
    );
    if (!response.ok) throw new Error("Failed to fetch pending conversation");
    const data = await response.json();
    return data.result ?? data;
  },

  async acceptPending(senderId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/messages/pending/${senderId}/accept`,
      { method: "POST" },
    );
    if (!response.ok) throw new Error("Failed to accept pending");
    const data = await response.json();
    return data.result ?? data;
  },

  async rejectPending(senderId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/messages/pending/${senderId}/reject`,
      { method: "DELETE" },
    );
    if (!response.ok) throw new Error("Failed to reject pending");
  },

  // ── Xoá tin nhắn ──────────────────────────────────────────────────────────
  async deleteMessage(id) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/messages/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete message");
  },
};

export default chatService;
