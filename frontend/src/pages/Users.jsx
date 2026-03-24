import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import userService from "../service/userService";
import followService from "../service/followService";
import authService from "../service/authService";
import "../styles/Users.css";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [followStates, setFollowStates] = useState({});
  const [followLoading, setFollowLoading] = useState({});
  const currentUserId = authService.getUser()?.userId;

  const fetchUsers = async (page = 0, search = "") => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (search.trim()) {
        data = await userService.searchUsers(search.trim(), page, 20);
      } else if (activeTab === "active") {
        data = await userService.getActiveUsers(page, 20);
      } else {
        data = await userService.getAllUsers(page, 20);
      }
      const fetchedUsers = data.users || [];
      setUsers(fetchedUsers);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);

      // Load initial follow states for all non-self users
      if (currentUserId && fetchedUsers.length > 0) {
        const otherUsers = fetchedUsers.filter(
          (u) => String(u.userId) !== String(currentUserId),
        );
        const statuses = await Promise.allSettled(
          otherUsers.map((u) => followService.getFollowStatus(u.userId)),
        );
        const newStates = {};
        otherUsers.forEach((u, i) => {
          if (statuses[i].status === "fulfilled") {
            newStates[u.userId] = statuses[i].value;
          }
        });
        setFollowStates(newStates);
      }
    } catch (e) {
      setError("Không thể tải danh sách người dùng.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchUsers(0, searchQuery);
  };

  const handleFollowToggle = async (user) => {
    if (followLoading[user.userId]) return;
    const current = followStates[user.userId];
    const isFollowing = current?.isFollowing;
    setFollowLoading((prev) => ({ ...prev, [user.userId]: true }));
    setFollowStates((prev) => ({
      ...prev,
      [user.userId]: { isFollowing: !isFollowing },
    }));
    try {
      if (isFollowing) {
        await followService.unfollow(user.userId);
      } else {
        const result = await followService.follow(user.userId);
        if (result?.alreadyFollowing) {
          // Server says already following — correct the state
          setFollowStates((prev) => ({
            ...prev,
            [user.userId]: { isFollowing: true },
          }));
        }
      }
    } catch (e) {
      // On error, fetch the real state from server instead of reverting to stale value
      try {
        const realStatus = await followService.getFollowStatus(user.userId);
        setFollowStates((prev) => ({
          ...prev,
          [user.userId]: realStatus,
        }));
      } catch {
        // Fall back to reverting if status fetch also fails
        setFollowStates((prev) => ({
          ...prev,
          [user.userId]: { isFollowing },
        }));
      }
      console.error(e);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [user.userId]: false }));
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <main className="users-main">
        <div className="users-header">
          <h1 className="users-title">Người dùng</h1>
          {totalItems > 0 && (
            <span className="users-count">{totalItems} người dùng</span>
          )}
        </div>

        <form className="users-search-bar" onSubmit={handleSearch}>
          <div className="search-container-inner">
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
              className="users-search-input"
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="users-tabs">
          {[
            ["all", "Tất cả"],
            ["active", "Đang hoạt động"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={"tab-btn" + (activeTab === key ? " active" : "")}
              onClick={() => {
                setActiveTab(key);
                setCurrentPage(0);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="users-loading">Đang tải...</div>
        ) : error ? (
          <div className="users-error">{error}</div>
        ) : (
          <>
            <div className="users-list-container">
              {users.length === 0 ? (
                <div className="users-empty">
                  Không tìm thấy người dùng nào.
                </div>
              ) : (
                <div className="users-list">
                  {users.map((user) => (
                    <Link
                      to={"/profile/" + user.userId}
                      key={user.userId}
                      className="user-item-row"
                    >
                      <div className="user-item-avatar">
                        {user.avatarURL ? (
                          <img src={user.avatarURL} alt={user.userName} />
                        ) : (
                          <div className="user-avatar-initials">
                            {getInitials(user.fullName || user.userName)}
                          </div>
                        )}
                      </div>

                      <div className="user-item-content">
                        <div className="user-item-info">
                          <h3 className="user-item-name">
                            {user.fullName || user.userName}
                          </h3>
                          <span className="user-item-username">
                            @{user.userName}
                          </span>
                          <p className="user-item-bio">
                            {user.email || "Thành viên mới của SkillForum"}
                          </p>
                        </div>
                        {currentUserId &&
                          String(user.userId) !== String(currentUserId) && (
                            <button
                              className={`follow-user-btn${followStates[user.userId]?.isFollowing ? " following" : ""}`}
                              disabled={followLoading[user.userId]}
                              onClick={(e) => {
                                e.preventDefault();
                                handleFollowToggle(user);
                              }}
                            >
                              {followLoading[user.userId]
                                ? "..."
                                : followStates[user.userId]?.isFollowing
                                  ? "Bỏ theo dõi"
                                  : "Theo dõi"}
                            </button>
                          )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                {currentPage > 0 && (
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Trước
                  </button>
                )}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p =
                    Math.max(0, Math.min(currentPage - 3, totalPages - 7)) + i;
                  return (
                    <button
                      key={p}
                      className={
                        "page-btn" + (currentPage === p ? " active" : "")
                      }
                      onClick={() => setCurrentPage(p)}
                    >
                      {p + 1}
                    </button>
                  );
                })}
                {currentPage < totalPages - 1 && (
                  <button
                    className="page-btn next"
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
    </>
  );
};

export default Users;
