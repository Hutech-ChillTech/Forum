import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import CreatePostModal from "./CreatePostModal";
import ChatBox from "./ChatBox";
import authService from "../service/authService";
import notificationService from "../service/notificationService";
import chatService from "../service/chatService";
import searchService from "../service/searchService";
import { apiFetch } from "../utils/apiFetch.js";
import "../styles/Header.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const Header = ({ hideAuth = false }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => authService.isLoggedIn());
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeChats, setActiveChats] = useState([]); // List of up to 5 user objects
  const [maximizedChatId, setMaximizedChatId] = useState(null); // ID/Name of the chat currently open
  const [isClosing, setIsClosing] = useState(false);
  const [isChatClosing, setIsChatClosing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [_isMenuOpen, _setIsMenuOpen] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  // Real notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const chatRef = useRef(null);
  const searchRef = useRef(null);

  // Get user data from localStorage or use defaults
  const [userData, setUserData] = useState(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        return {
          name: parsed.fullName || "User",
          username: parsed.username || "user",
          avatar: parsed.avatar || null,
        };
      } catch (e) {
        console.error("Error parsing user profile in Header:", e);
      }
    }
    return {
      name: "User",
      username: "user",
      avatar: null,
    };
  });

  // ── Real-time notification WebSocket ──────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    // Load initial unread count + recent notifications
    notificationService
      .countUnread()
      .then((data) => setUnreadCount(Number(data?.unread ?? data ?? 0)))
      .catch(() => {});
    notificationService
      .getMyNotifications(0, 5)
      .then((data) => {
        const list = data?.notifications || (Array.isArray(data) ? data : []);
        setNotifications(list.slice(0, 5));
      })
      .catch(() => {});

    // WebSocket for real-time push
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 15000,
      // Always use the freshest token on (re)connect
      beforeConnect: () => {
        const freshToken = localStorage.getItem("token");
        if (freshToken)
          client.connectHeaders = { Authorization: `Bearer ${freshToken}` };
      },
      onConnect: () => {
        client.subscribe("/user/queue/notifications", (frame) => {
          const notif = JSON.parse(frame.body);
          setUnreadCount((prev) => prev + 1);
          setNotifications((prev) => [notif, ...prev].slice(0, 5));
        });
        client.subscribe("/user/queue/messages", (frame) => {
          const msg = JSON.parse(frame.body);
          const currentUserId = JSON.parse(
            localStorage.getItem("user") || "{}",
          )?.userId;
          // Only count messages from others (not echo of own messages)
          if (msg.senderId !== currentUserId) {
            setUnreadMessages((prev) => prev + 1);
          }
          // Refresh conversations list for the dropdown
          chatService
            .getConversations()
            .then((data) => setConversations(Array.isArray(data) ? data : []))
            .catch(() => {});
        });
      },
      onStompError: () => {},
    });
    client.activate();
    return () => client.deactivate();
  }, [isLoggedIn]);

  // ── Presence heartbeat ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;

    // Use apiFetch so it auto-refreshes the token and stops heartbeat on 401
    const sendHeartbeat = () => {
      apiFetch(`${API_BASE}/api/v1/presence/heartbeat`, {
        method: "POST",
      }).catch(() => {});
    };

    // Immediate heartbeat on login / mount
    sendHeartbeat();

    // Refresh every 2 minutes
    const intervalId = setInterval(sendHeartbeat, 2 * 60 * 1000);

    // Re-ping immediately when the user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") sendHeartbeat();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isLoggedIn]);

  // Notifications are kept up-to-date by the mount-time fetch + WebSocket push.
  // No re-fetch when the panel opens — avoids overwriting real-time data with
  // potentially stale DB results (the notification may not be committed yet).

  // Load conversations when chat panel opens
  useEffect(() => {
    if (!showChat || !isLoggedIn) return;
    chatService
      .getConversations()
      .then((data) => setConversations(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [showChat, isLoggedIn]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
    } catch (e) {
      console.error("Failed to mark all read", e);
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const history = await searchService.getSearchHistory();
      setRecentSearches(history);
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  const closeNotifications = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowNotifications(false);
      setIsClosing(false);
    }, 300); // Wait for animation to finish
  };

  const closeChat = () => {
    setIsChatClosing(true);
    setTimeout(() => {
      setShowChat(false);
      setIsChatClosing(false);
    }, 300);
  };

  // Close dropdown when clicking outside and listen for profile updates
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        if (showNotifications) closeNotifications();
      }
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        if (showChat) closeChat();
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchHistory(false);
      }
    };

    const handleOpenCreatePost = () => {
      setPostToEdit(null);
      setIsCreateOpen(true);
    };

    const handleOpenEditPost = (e) => {
      setPostToEdit(e.detail);
      setIsCreateOpen(true);
    };

    const handleProfileUpdate = (e) => {
      const profile = e.detail;
      setUserData({
        name: profile.fullName || profile.displayName || "Trần Khánh Linh",
        username: profile.username || "khanhlinh_1731",
        avatar: profile.avatar || null,
      });
    };

    window.addEventListener("openCreatePost", handleOpenCreatePost);
    window.addEventListener("openEditPost", handleOpenEditPost);
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("openCreatePost", handleOpenCreatePost);
      window.removeEventListener("openEditPost", handleOpenEditPost);
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, [showNotifications, showChat, showDropdown, showSearchHistory]);

  // Fetch search history
  useEffect(() => {
    if (showSearchHistory && isLoggedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSearchHistory();
    }
  }, [showSearchHistory, isLoggedIn]);

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setShowDropdown(false);
    window.location.href = "/login";
  };

  const toggleNotifications = () => {
    if (showNotifications) {
      closeNotifications();
    } else {
      setShowNotifications(true);
      setIsClosing(false);
      setShowChat(false);
      setShowDropdown(false);
      setShowSearchHistory(false);
    }
  };

  const handleClearSearchHistory = async (e) => {
    e.stopPropagation();
    try {
      await searchService.clearSearchHistory();
      setRecentSearches([]);
    } catch (error) {
      console.error("Error clearing search history:", error);
    }
  };

  const handleRemoveHistoryItem = async (e, keyword) => {
    e.stopPropagation();
    try {
      await searchService.removeSearchHistoryItem(keyword);
      setRecentSearches((prev) => prev.filter((item) => item !== keyword));
    } catch (error) {
      console.error("Error removing history item:", error);
    }
  };

  const handleSearch = (keyword) => {
    if (!keyword.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(keyword.trim())}`;
  };

  const toggleChat = () => {
    if (showChat) {
      closeChat();
    } else {
      setShowChat(true);
      setIsChatClosing(false);
      setShowNotifications(false);
      setShowDropdown(false);
      setShowSearchHistory(false);
      setUnreadMessages(0);
    }
  };

  const _handleOpenPersonalChat = (user) => {
    setActiveChats((prev) => {
      // Check if user already exists
      const existing = prev.find((c) => c.name === user.name);
      if (existing) {
        setMaximizedChatId(user.name);
        return prev;
      }
      // Limit to 5
      if (prev.length >= 5) return prev;

      setMaximizedChatId(user.name);
      return [...prev, user];
    });
    setShowChat(false); // Close dropdown
  };

  const handleCloseChat = (userName) => {
    setActiveChats((prev) => prev.filter((c) => c.name !== userName));
    if (maximizedChatId === userName) setMaximizedChatId(null);
  };

  const handleMinimizeChat = (userName) => {
    if (maximizedChatId === userName) setMaximizedChatId(null);
  };

  const handleMaximizeChat = (userName) => {
    setMaximizedChatId(userName);
  };

  const activeChatUser = activeChats.find((c) => c.name === maximizedChatId);

  // Get user initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatNotifTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <a href="/" className="logo">
            SkillForum
          </a>
        </div>

        <div className="header-center">
          <div className="search-bar" ref={searchRef}>
            <svg
              className="search-icon"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 16L12.65 12.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onFocus={() => setShowSearchHistory(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchKeyword);
                }
              }}
            />
            {showSearchHistory && (
              <div className="search-history-dropdown">
                <div className="search-history-header">
                  <span>Lịch sử tìm kiếm</span>
                  <button
                    className="clear-history-btn"
                    onClick={handleClearSearchHistory}
                  >
                    Xóa
                  </button>
                </div>
                <ul className="search-history-list">
                  {recentSearches.length > 0 ? (
                    recentSearches.map((term, index) => (
                      <li
                        key={index}
                        className="search-history-item"
                        onClick={() => handleSearch(term)}
                      >
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
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span className="search-term">{term}</span>
                        <button
                          className="remove-item-btn"
                          onClick={(e) => handleRemoveHistoryItem(e, term)}
                          title="Xóa"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="search-history-empty">
                      Không có lịch sử tìm kiếm
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          {!hideAuth && isLoggedIn && (
            <button
              className="btn-create-header"
              title="Tạo bài viết mới"
              onClick={() => {
                setIsCreateOpen(true);
                setShowDropdown(false);
                setShowNotifications(false);
                setShowChat(false);
                setShowSearchHistory(false);
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Tạo bài</span>
            </button>
          )}
        </div>

        <div className="header-right">
          {!hideAuth && isLoggedIn ? (
            <>
              <div className="header-icons">
                <div className="notification-wrapper" ref={notificationRef}>
                  <button
                    className={`icon-btn ${showNotifications ? "active" : ""}`}
                    title="Thông báo"
                    onClick={toggleNotifications}
                  >
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
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    {unreadCount > 0 && (
                      <span className="badge">{unreadCount}</span>
                    )}
                  </button>

                  {(showNotifications || isClosing) && (
                    <div
                      className={`notification-dropdown ${isClosing ? "closing" : "opening"}`}
                    >
                      <div className="notification-header">
                        <h3>Thông báo</h3>
                        <button
                          className="mark-read-btn"
                          onClick={handleMarkAllRead}
                        >
                          Đánh dấu đã đọc
                        </button>
                      </div>
                      <div className="notification-list">
                        {notifications.length === 0 ? (
                          <div
                            style={{
                              padding: "24px",
                              textAlign: "center",
                              color: "var(--text-secondary)",
                              fontSize: "14px",
                            }}
                          >
                            Không có thông báo nào
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.notificationId}
                              className={`notification-item ${notif.status !== "READ" ? "unread" : ""}`}
                              onClick={() => {
                                closeNotifications();
                                if (notif.type === "FOLLOW" && notif.actorId) {
                                  navigate(`/profile?id=${notif.actorId}`);
                                } else if (notif.postId) {
                                  navigate(`/posts/${notif.postId}`);
                                } else {
                                  navigate("/notifications");
                                }
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="notification-avatar">
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
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                              </div>
                              <div className="notification-content">
                                <p>{notif.message}</p>
                                <span className="notification-time">
                                  {formatNotifTime(notif.createdAt)}
                                </span>
                              </div>
                              {notif.status !== "READ" && (
                                <div className="unread-dot"></div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      <div className="notification-footer">
                        <Link to="/notifications">Xem tất cả</Link>
                      </div>
                    </div>
                  )}
                </div>
                <div className="notification-wrapper" ref={chatRef}>
                  <button
                    className={`icon-btn ${showChat ? "active" : ""}`}
                    title="Tin nhắn"
                    onClick={toggleChat}
                  >
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
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {unreadMessages > 0 && (
                      <span className="badge">{unreadMessages}</span>
                    )}
                  </button>

                  {(showChat || isChatClosing) && (
                    <div
                      className={`notification-dropdown chat-dropdown ${isChatClosing ? "closing" : "opening"}`}
                      style={{ right: "-20px" }}
                    >
                      <div className="notification-header">
                        <h3>Tin nhắn</h3>
                        <button className="mark-read-btn">Xem tất cả</button>
                      </div>
                      <div className="notification-list">
                        {conversations.length === 0 ? (
                          <div
                            style={{
                              padding: "24px",
                              textAlign: "center",
                              color: "var(--text-secondary)",
                              fontSize: "14px",
                            }}
                          >
                            Chưa có cuộc trò chuyện
                          </div>
                        ) : (
                          conversations.map((conv) => (
                            <div
                              key={conv.userId}
                              className="notification-item"
                              onClick={() =>
                                navigate(`/chat?userId=${conv.userId}`)
                              }
                              style={{ cursor: "pointer" }}
                            >
                              <div
                                className="notification-avatar"
                                style={{ position: "relative" }}
                              >
                                {conv.avatarURL ? (
                                  <img
                                    src={conv.avatarURL}
                                    alt={conv.fullName}
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <span
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {(conv.fullName ||
                                      conv.userName ||
                                      "?")[0].toUpperCase()}
                                  </span>
                                )}
                                {conv.online && (
                                  <span
                                    style={{
                                      position: "absolute",
                                      bottom: 0,
                                      right: 0,
                                      width: 9,
                                      height: 9,
                                      background: "#22c55e",
                                      borderRadius: "50%",
                                      border: "2px solid white",
                                    }}
                                  ></span>
                                )}
                              </div>
                              <div className="notification-content">
                                <p
                                  style={{
                                    fontWeight: "600",
                                    marginBottom: "2px",
                                  }}
                                >
                                  {conv.fullName || conv.userName}
                                </p>
                                <p
                                  style={{
                                    fontSize: "13px",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  @{conv.userName}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="notification-footer">
                        <a href="/chat">Vào trang chat</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="user-menu" ref={dropdownRef}>
                <button
                  className={`user-avatar-btn ${showDropdown ? "active" : ""}`}
                  onClick={() => {
                    const newState = !showDropdown;
                    setShowDropdown(newState);
                    if (newState) {
                      setShowNotifications(false);
                      setShowChat(false);
                    }
                  }}
                >
                  <div className="user-avatar">
                    {userData.avatar ? (
                      <img src={userData.avatar} alt={userData.name} />
                    ) : (
                      <span className="avatar-initials">
                        {getInitials(userData.name)}
                      </span>
                    )}
                  </div>
                </button>

                {showDropdown && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        <div className="dropdown-user-name">
                          {userData.username}
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <a href="/profile" className="dropdown-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm-5 7a5 5 0 0110 0H3z" />
                      </svg>
                      Profile
                    </a>
                    <a href="/settings" className="dropdown-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M8 4.754a3.246 3.246 0 100 6.492 3.246 3.246 0 000-6.492zM5.754 8a2.246 2.246 0 114.492 0 2.246 2.246 0 01-4.492 0z" />
                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 01-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 01-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 01.52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 011.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 011.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 01.52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 01-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 01-1.255-.52l-.094-.319z" />
                      </svg>
                      Settings
                    </a>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M10 12.5a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v2a.5.5 0 001 0v-2A1.5 1.5 0 009.5 2h-8A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h8a1.5 1.5 0 001.5-1.5v-2a.5.5 0 00-1 0v2z" />
                        <path d="M15.854 8.354a.5.5 0 000-.708l-3-3a.5.5 0 00-.708.708L14.293 7.5H5.5a.5.5 0 000 1h8.793l-2.147 2.146a.5.5 0 00.708.708l3-3z" />
                      </svg>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : !hideAuth ? (
            <>
              <a href="/login" className="btn-login">
                Log In
              </a>
              <a href="/register" className="btn-signup">
                Sign up
              </a>
            </>
          ) : null}
        </div>
      </div>

      <ChatBox
        isOpen={!!maximizedChatId}
        onClose={() => handleCloseChat(maximizedChatId)}
        onMinimize={() => handleMinimizeChat(maximizedChatId)}
        title={activeChatUser?.name}
        avatar={activeChatUser?.avatar}
        status="Đang hoạt động"
        initialMessages={[
          {
            id: 1,
            text: activeChatUser?.initialMessage,
            sender: "bot",
            timestamp: new Date(),
          },
        ]}
      />

      <div className="minimized-bubbles-stack">
        {activeChats.map(
          (chat) =>
            maximizedChatId !== chat.name && (
              <div
                key={chat.name}
                className="minimized-chat-bubble"
                onClick={() => handleMaximizeChat(chat.name)}
                title={`Mở tin nhắn với ${chat.name}`}
              >
                <div className="bubble-avatar-wrapper">
                  {typeof chat.avatar === "string" &&
                  chat.avatar.length <= 2 ? (
                    <span>{chat.avatar}</span>
                  ) : (
                    <img src={chat.avatar} alt="" />
                  )}
                  <span className="bubble-online-dot"></span>
                </div>
                <button
                  className="bubble-close-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseChat(chat.name);
                  }}
                >
                  ×
                </button>
              </div>
            ),
        )}
      </div>

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setPostToEdit(null);
        }}
        postToEdit={postToEdit}
        onPostCreated={(newPost) => {
          const event = new CustomEvent("globalPostCreated", {
            detail: newPost,
          });
          window.dispatchEvent(event);
        }}
      />
    </header>
  );
};

export default Header;
