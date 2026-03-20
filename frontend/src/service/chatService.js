import { apiFetch, API_BASE_URL } from '../utils/apiFetch.js';


const chatService = {
  stompClient: null,
  isConnecting: false,

  initWebSocket() {
    if (this.stompClient || this.isConnecting) return;
    this.isConnecting = true;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the backend URL and append /ws/websocket to bypass SockJS if possible
    const wsUrl = `${API_BASE_URL.replace(/^https?:/, wsProtocol)}/ws/websocket`;
    
    this.stompClient = new WebSocket(wsUrl);

    this.stompClient.onopen = () => {
      console.log("[chatService] WebSocket connected");
      // STOMP CONNECT frame
      const connectFrame = "CONNECT\naccept-version:1.2\nhost:localhost\n\n\0";
      this.stompClient.send(connectFrame);
      this.isConnecting = false;
    };

    this.stompClient.onmessage = (evt) => {
      if (evt.data.startsWith("CONNECTED")) {
        console.log("[chatService] STOMP connected");
      }
    };

    this.stompClient.onerror = (err) => {
      console.error("[chatService] WebSocket error:", err);
      this.isConnecting = false;
      this.stompClient = null;
    };

    this.stompClient.onclose = () => {
      console.log("[chatService] WebSocket closed");
      this.isConnecting = false;
      this.stompClient = null;
    };
  },

  sendPostLink(receiverId, postLink) {
    if (!this.stompClient || this.stompClient.readyState !== WebSocket.OPEN) {
      this.initWebSocket();
      // Wait for connection to send message
      setTimeout(() => this.sendPostLink(receiverId, postLink), 500);
      return;
    }

    const payload = JSON.stringify({
      type: "SHARE_POST",
      content: postLink,
      receiverId
    });

    // STOMP SEND frame
    const sendFrame = `SEND\ndestination:/app/chat.send\ncontent-type:application/json\n\n${payload}\0`;
    this.stompClient.send(sendFrame);
    console.log("[chatService] Share post link sent to user:", receiverId);
  },

  async sendMessage(messageData) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to send message");
    return data.result ?? data;
  },

  async getConversation(userId, page = 0, size = 30) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/messages/conversation/${userId}?page=${page}&size=${size}`, {
      });
    if (!response.ok) throw new Error("Failed to fetch conversation");
    const data = await response.json(); return data.result ?? data;
  },

  async getInbox(page = 0, size = 20) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/messages/inbox?page=${page}&size=${size}`, {
      });
    if (!response.ok) throw new Error("Failed to fetch inbox");
    const data = await response.json(); return data.result ?? data;
  },

  async getSentMessages(page = 0, size = 20) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/messages/sent?page=${page}&size=${size}`, {
      });
    if (!response.ok) throw new Error("Failed to fetch sent messages");
    const data = await response.json(); return data.result ?? data;
  },

  async deleteMessage(id) {
    const response = await apiFetch(`${API_BASE_URL}/api/v1/messages/${id}`, {
      method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete message");
  } };

export default chatService;
