import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import chatService from "../service/chatService";
import userService from "../service/userService";
import "../styles/Chat.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getInitial = (name) => (name || "?").charAt(0).toUpperCase();

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const Avatar = ({ avatarURL, name, online }) => (
  <div
    className={`contact-avatar ${online === true ? "online" : online === false ? "offline" : ""}`}
  >
    {avatarURL ? (
      <img src={avatarURL} alt={name} className="avatar-img" />
    ) : (
      getInitial(name)
    )}
  </div>
);

const Chat = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("normal");
  const [conversations, setConversations] = useState([]);
  const [pendingSenders, setPendingSenders] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [pendingBadge, setPendingBadge] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isPendingConv, setIsPendingConv] = useState(false);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedContactRef = useRef(null);

  // Keep ref in sync so WebSocket callbacks always see latest value
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Data loading ─────────────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data || []);
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  }, []);

  const loadPendingSenders = useCallback(async () => {
    try {
      const data = await chatService.getPendingRequestSenders();
      setPendingSenders(data || []);
      setPendingBadge((data || []).length);
    } catch (err) {
      console.error("Failed to load pending senders", err);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    loadPendingSenders();
  }, [loadConversations, loadPendingSenders]);

  // Auto-select contact from URL ?userId param (e.g. navigated from Profile)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetUserId = params.get("userId");
    if (!targetUserId) return;

    const autoSelect = async () => {
      try {
        const user = await userService.getUserById(targetUserId);
        const contact = {
          userId: user.userId || user.id || targetUserId,
          fullName: user.fullName,
          userName: user.username,
          avatarURL: user.avatarURL,
          online: false,
        };
        handleSelectConversation(contact);
      } catch (err) {
        console.error("Failed to auto-select chat contact:", err);
      }
    };
    autoSelect();
  }, [location.search]);

  // ── WebSocket ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        // Normal messages
        client.subscribe("/user/queue/messages", (frame) => {
          const msg = JSON.parse(frame.body);
          const contact = selectedContactRef.current;
          const partnerId =
            msg.senderId === currentUser.userId ? msg.receiverId : msg.senderId;
          if (contact && contact.userId === partnerId) {
            setMessages((prev) => [...prev, msg]);
          }
          loadConversations();
        });

        // Pending message notification
        client.subscribe("/user/queue/pending", () => {
          setPendingBadge((prev) => prev + 1);
          loadPendingSenders();
        });

        // Real-time online/offline presence updates
        client.subscribe("/topic/presence", (frame) => {
          const { userId, online } = JSON.parse(frame.body);
          setConversations((prev) =>
            prev.map((c) => (c.userId === userId ? { ...c, online } : c)),
          );
          setSelectedContact((prev) =>
            prev && prev.userId === userId ? { ...prev, online } : prev,
          );
        });
      },
      onStompError: (frame) =>
        console.error("STOMP error:", frame.headers?.message),
    });

    client.activate();
    stompClientRef.current = client;
    return () => client.deactivate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, loadConversations, loadPendingSenders]);

  // ── Event handlers ────────────────────────────────────────────────────────

  const handleSelectConversation = async (contact) => {
    setSelectedContact(contact);
    setIsPendingConv(false);
    setLoadingMsgs(true);
    try {
      const data = await chatService.getConversation(contact.userId);
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load messages", err);
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleSelectPending = async (sender) => {
    setSelectedContact(sender);
    setIsPendingConv(true);
    setLoadingMsgs(true);
    try {
      const data = await chatService.getPendingConversation(sender.userId);
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load pending messages", err);
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedContact) return;
    if (!stompClientRef.current?.connected) return;

    stompClientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        receiverId: selectedContact.userId,
        message: inputValue.trim(),
      }),
    });
    setInputValue("");
  };

  const handleAcceptPending = async (senderId) => {
    try {
      await chatService.acceptPending(senderId);
      await Promise.all([loadPendingSenders(), loadConversations()]);
      if (selectedContact?.userId === senderId) {
        setIsPendingConv(false);
        const data = await chatService.getConversation(senderId);
        setMessages(data || []);
      }
    } catch (err) {
      console.error("Failed to accept pending", err);
    }
  };

  const handleRejectPending = async (senderId) => {
    try {
      await chatService.rejectPending(senderId);
      await loadPendingSenders();
      if (selectedContact?.userId === senderId) {
        setSelectedContact(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to reject pending", err);
    }
  };

  // ── Filtered lists ────────────────────────────────────────────────────────

  const q = searchTerm.toLowerCase();
  const filteredConversations = conversations.filter((c) =>
    (c.fullName || c.userName || "").toLowerCase().includes(q),
  );
  const filteredPending = pendingSenders.filter((s) =>
    (s.fullName || s.userName || "").toLowerCase().includes(q),
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="chat-page-container">
      {/* ── Sidebar ── */}
      <div className="chat-contacts-sidebar">
        <div className="sidebar-header">
          <h2>Tin nhắn</h2>
          <div className="search-contacts">
            <input
              type="text"
              placeholder="Tìm kiếm hội thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="chat-tabs">
            <button
              className={`tab-btn ${activeTab === "normal" ? "active" : ""}`}
              onClick={() => setActiveTab("normal")}
            >
              Bạn bè
            </button>
            <button
              className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("pending");
                setPendingBadge(0);
              }}
            >
              Tin nhắn chờ
              {pendingBadge > 0 && (
                <span className="pending-badge">{pendingBadge}</span>
              )}
            </button>
          </div>
        </div>

        <div className="contacts-list">
          {activeTab === "normal" ? (
            filteredConversations.length === 0 ? (
              <p className="empty-list-hint">Chưa có hội thoại nào</p>
            ) : (
              filteredConversations.map((contact) => (
                <div
                  key={contact.userId}
                  className={`contact-item ${selectedContact?.userId === contact.userId && !isPendingConv ? "active" : ""}`}
                  onClick={() => handleSelectConversation(contact)}
                >
                  <Avatar
                    avatarURL={contact.avatarURL}
                    name={contact.fullName || contact.userName}
                    online={contact.online}
                  />
                  <div className="contact-info">
                    <div className="contact-name">
                      {contact.fullName || contact.userName}
                    </div>
                    <div className="contact-status">
                      {contact.online ? "Đang hoạt động" : "Ngoại tuyến"}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : filteredPending.length === 0 ? (
            <p className="empty-list-hint">Không có tin nhắn chờ</p>
          ) : (
            filteredPending.map((sender) => (
              <div
                key={sender.userId}
                className={`contact-item ${selectedContact?.userId === sender.userId && isPendingConv ? "active" : ""}`}
                onClick={() => handleSelectPending(sender)}
              >
                <Avatar
                  avatarURL={sender.avatarURL}
                  name={sender.fullName || sender.userName}
                />
                <div className="contact-info">
                  <div className="contact-name">
                    {sender.fullName || sender.userName}
                  </div>
                  <div className="contact-status pending-label">
                    Chờ xác nhận
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className="chat-main-content">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="chat-header">
              <div className="header-user-info">
                <Avatar
                  avatarURL={selectedContact.avatarURL}
                  name={selectedContact.fullName || selectedContact.userName}
                  online={selectedContact.online}
                />
                <div>
                  <h3>
                    {selectedContact.fullName || selectedContact.userName}
                  </h3>
                  <span>
                    {selectedContact.online && (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#22c55e",
                          display: "inline-block",
                          marginRight: 4,
                        }}
                      />
                    )}
                    {selectedContact.online ? "Đang hoạt động" : "Ngoại tuyến"}
                  </span>
                </div>
              </div>

              <div className="header-actions">
                {isPendingConv ? (
                  <div className="pending-actions-header">
                    <button
                      className="accept-btn"
                      onClick={() =>
                        handleAcceptPending(selectedContact.userId)
                      }
                    >
                      Chấp nhận
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() =>
                        handleRejectPending(selectedContact.userId)
                      }
                    >
                      Từ chối
                    </button>
                  </div>
                ) : (
                  <button className="action-circle-btn">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Pending banner */}
            {isPendingConv && (
              <div className="pending-message-banner">
                ⚠️ Người này chưa phải bạn bè của bạn. Chấp nhận để bắt đầu trò
                chuyện.
              </div>
            )}

            {/* Messages */}
            <div className="chat-messages-area">
              {loadingMsgs ? (
                <div className="loading-msgs">Đang tải tin nhắn...</div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUser.userId;
                  return (
                    <div
                      key={msg.id ?? idx}
                      className={`chat-bubble-wrapper ${isMe ? "me" : "other"}`}
                    >
                      {!isMe && (
                        <div className="bubble-avatar">
                          {msg.senderAvatarURL ? (
                            <img
                              src={msg.senderAvatarURL}
                              alt=""
                              className="avatar-img"
                            />
                          ) : (
                            getInitial(
                              selectedContact.fullName ||
                                selectedContact.userName,
                            )
                          )}
                        </div>
                      )}
                      <div className="chat-bubble">
                        {msg.content}
                        <span className="chat-time">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input — hidden for pending conversations */}
            {!isPendingConv && (
              <form className="chat-input-row" onSubmit={handleSendMessage}>
                <button type="button" className="input-action-btn">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Viết tin nhắn..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button
                  type="submit"
                  className="chat-send-pill"
                  disabled={!inputValue.trim()}
                >
                  Gửi
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="chat-placeholder">
            <div className="placeholder-icon">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b21e8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Bắt đầu cuộc trò chuyện</h3>
            <p>Chọn một người bạn từ danh sách bên trái để bắt đầu nhắn tin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
