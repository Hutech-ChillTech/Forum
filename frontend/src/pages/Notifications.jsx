import { useState, useEffect } from "react";
import notificationService from "../service/notificationService";
import "../styles/Notifications.css";

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} giờ trước`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} ngày trước`;
  return d.toLocaleDateString("vi-VN");
};

const typeIcon = (type) => {
  switch (type) {
    case "FOLLOW":
      return (
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
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      );
    case "COMMENT":
      return (
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    default:
      return (
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
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchNotifications = async (page = 0) => {
    setLoading(true);
    try {
      const data = await notificationService.getMyNotifications(page, 20);
      const list = data?.notifications || (Array.isArray(data) ? data : []);
      setNotifications(list);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(currentPage);
  }, [currentPage]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
    } catch (e) {
      console.error("Failed to mark all read", e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    } catch (e) {
      console.error("Failed to delete notification", e);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
    } catch (e) {
      console.error("Failed to clear all", e);
    }
  };

  return (
    <main className="notifications-main">
      <div className="notifications-header">
        <h1 className="notifications-title">Thông báo</h1>
        <div className="notifications-actions">
          <button className="notif-action-btn" onClick={handleMarkAllRead}>
            Đánh dấu tất cả đã đọc
          </button>
          <button className="notif-action-btn danger" onClick={handleClearAll}>
            Xóa tất cả
          </button>
        </div>
      </div>

      {loading ? (
        <div className="notifications-loading">Đang tải...</div>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--text-secondary)", marginBottom: 12 }}
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p>Không có thông báo nào</p>
        </div>
      ) : (
        <>
          <div className="notifications-list">
            {notifications.map((notif) => (
              <div
                key={notif.notificationId}
                className={`notif-item ${notif.status !== "READ" ? "unread" : ""}`}
              >
                <div className="notif-icon">{typeIcon(notif.type)}</div>
                <div className="notif-content">
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">
                    {formatTime(notif.createdAt)}
                  </span>
                </div>
                <button
                  className="notif-delete-btn"
                  onClick={() => handleDelete(notif.notificationId)}
                  title="Xóa"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="notifications-pagination">
              {currentPage > 0 && (
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Trước
                </button>
              )}
              <span className="page-info">
                Trang {currentPage + 1} / {totalPages}
              </span>
              {currentPage < totalPages - 1 && (
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Tiếp
                </button>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default Notifications;
