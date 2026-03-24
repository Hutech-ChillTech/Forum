import { useState, useEffect } from "react";
import userService from "../service/userService";
import postService from "../service/postService";
import tagService from "../service/tagService";
import "../styles/Admin.css";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Stats
  const [stats, setStats] = useState({ totalPosts: 0 });

  // Users
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);

  // Posts
  const [posts, setPosts] = useState([]);
  const [postPage, setPostPage] = useState(0);
  const [postTotalPages, setPostTotalPages] = useState(0);
  const [postsLoading, setPostsLoading] = useState(false);

  // Tags
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [tagsLoading, setTagsLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users") loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userPage]);

  useEffect(() => {
    if (activeTab === "posts") loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, postPage]);

  useEffect(() => {
    if (activeTab === "tags") loadTags();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const data = await postService.getTotalPosts();
      setStats({ totalPosts: data.total ?? 0 });
    } catch (e) {
      console.error(e);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await userService.getAllUsers(userPage, 20);
      setUsers(data.users || []);
      setUserTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadPosts = async () => {
    setPostsLoading(true);
    try {
      const data = await postService.getAllPostsAdmin(postPage, 20);
      setPosts(data.posts || []);
      setPostTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setPostsLoading(false);
    }
  };

  const loadTags = async () => {
    setTagsLoading(true);
    try {
      const data = await tagService.getAllTags(0, 100);
      setTags(data.tags || []);
    } catch (e) {
      console.error(e);
    } finally {
      setTagsLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm("Are you sure you want to ban this user?")) return;
    try {
      await userService.banUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, status: "BANNED" } : u)),
      );
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await userService.unbanUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, status: "ACTIVE" } : u)),
      );
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleAssignRole = async (accountId, roleName) => {
    try {
      await userService.assignRole(accountId, roleName);
      setUsers((prev) =>
        prev.map((u) =>
          u.accountId === accountId ? { ...u, role: roleName } : u,
        ),
      );
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Xóa bài viết này?")) return;
    try {
      await postService.deletePostByAdmin(postId);
      setPosts((prev) => prev.filter((p) => p.postId !== postId));
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  };

  const handleUpdatePostStatus = async (postId, status) => {
    try {
      const updated = await postService.updatePostStatus(postId, status);
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === postId ? { ...p, status: updated.status || status } : p,
        ),
      );
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm("Xóa tag này?")) return;
    try {
      await tagService.deleteTag(tagId);
      setTags((prev) => prev.filter((t) => t.tagId !== tagId));
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const tag = await tagService.createTag(newTagName.trim());
      setTags((prev) => [...prev, tag]);
      setNewTagName("");
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  };

  const tabLabels = {
    overview: "Tổng quan",
    users: "Người dùng",
    posts: "Bài viết",
    tags: "Tags",
  };

  const getStatusClass = (status) => {
    if (status === "BANNED") return "status--banned";
    if (status === "ACTIVE") return "status--active";
    return "status--offline";
  };

  const getPostStatusClass = (status) => {
    if (status === "PUBLIC") return "status--active";
    if (status === "REMOVED") return "status--banned";
    return "status--offline";
  };

  const renderPagination = (currentPage, totalPages, setPage) => {
    if (totalPages <= 1) return null;
    return (
      <div className="admin-pagination">
        <button
          className="admin-page-btn"
          disabled={currentPage === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          ← Trước
        </button>
        <span className="admin-page-info">
          {currentPage + 1} / {totalPages}
        </span>
        <button
          className="admin-page-btn"
          disabled={currentPage >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          Sau →
        </button>
      </div>
    );
  };

  return (
    <>
      <main className="admin-main">
        <h1 className="admin-title">Quản trị hệ thống</h1>

        <div className="admin-tabs">
          {Object.entries(tabLabels).map(([key, label]) => (
            <button
              key={key}
              className={"admin-tab-btn" + (activeTab === key ? " active" : "")}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* -- OVERVIEW -- */}
        {activeTab === "overview" && (
          <div className="admin-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.totalPosts}</div>
                <div className="stat-label">Tổng bài viết</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {users.length > 0 ? users.length : "-"}
                </div>
                <div className="stat-label">Người dùng</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {tags.length > 0 ? tags.length : "-"}
                </div>
                <div className="stat-label">Tags</div>
              </div>
            </div>
          </div>
        )}

        {/* -- USERS -- */}
        {activeTab === "users" && (
          <div className="admin-section">
            <h2 className="admin-section-title">Quản lý người dùng</h2>
            {usersLoading ? (
              <div className="admin-loading-mini">Đang tải...</div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên hiển thị</th>
                      <th>Email</th>
                      <th>Vai trò (Role)</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.userId}>
                        <td>
                          <div style={{ fontWeight: 600, color: "#111827" }}>
                            {u.fullName || u.userName}
                          </div>
                        </td>
                        <td style={{ color: "#6b7280" }}>{u.email}</td>
                        <td>
                          <select
                            value={u.roleName || "USER"}
                            onChange={(e) =>
                              handleAssignRole(u.accountId, e.target.value)
                            }
                            className="status-select-v2"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            <option value="USER">USER</option>
                            <option value="MODERATOR">MODERATOR</option>
                          </select>
                        </td>
                        <td>
                          <span
                            className={`status-badge-v2 ${getStatusClass(u.status)}`}
                            style={{ fontSize: "11px" }}
                          >
                            {u.status === "BANNED" ? "BANNED" : "ACTIVE"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {u.status === "BANNED" ? (
                              <button
                                className="btn-action btn-action--success"
                                onClick={() => handleUnbanUser(u.userId)}
                                style={{ padding: "4px 8px", fontSize: "12px" }}
                              >
                                Unban
                              </button>
                            ) : (
                              <button
                                className="btn-action btn-action--danger"
                                onClick={() => handleBanUser(u.userId)}
                                style={{ padding: "4px 8px", fontSize: "12px" }}
                              >
                                Ban
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            textAlign: "center",
                            color: "#9ca3af",
                            padding: "24px",
                          }}
                        >
                          Không tìm thấy người dùng nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {renderPagination(userPage, userTotalPages, setUserPage)}
          </div>
        )}

        {/* -- POSTS -- */}
        {activeTab === "posts" && (
          <div className="admin-section">
            <h2 className="admin-section-title">Quản lý bài viết</h2>
            {postsLoading ? (
              <div className="admin-loading-mini">Đang tải...</div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tiêu đề</th>
                      <th>Tác giả</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((p) => (
                      <tr key={p.postId}>
                        <td
                          style={{
                            maxWidth: 240,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.title}
                        </td>
                        <td style={{ color: "#6b7280" }}>{p.userName}</td>
                        <td>
                          <select
                            value={p.status}
                            onChange={(e) =>
                              handleUpdatePostStatus(p.postId, e.target.value)
                            }
                            className="status-select-v2"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            <option value="PUBLIC">PUBLIC</option>
                            <option value="PRIVATE">PRIVATE</option>
                            <option value="REMOVED">REMOVED</option>
                            <option value="PENDING">PENDING</option>
                          </select>
                        </td>
                        <td style={{ color: "#6b7280", fontSize: "12px" }}>
                          {p.createdAt}
                        </td>
                        <td>
                          <button
                            className="btn-action btn-action--danger"
                            onClick={() => handleDeletePost(p.postId)}
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                    {posts.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            textAlign: "center",
                            color: "#9ca3af",
                            padding: "24px",
                          }}
                        >
                          Không tìm thấy bài viết nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {renderPagination(postPage, postTotalPages, setPostPage)}
          </div>
        )}

        {/* -- TAGS -- */}
        {activeTab === "tags" && (
          <div className="admin-section">
            <h2 className="admin-section-title">Quản lý Tags</h2>
            <div
              className="tag-create-form"
              style={{ display: "flex", gap: 8, marginBottom: 16 }}
            >
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tên tag mới..."
                className="admin-input"
                onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
              />
              <button
                className="btn-action btn-action--success"
                onClick={handleCreateTag}
              >
                + Thêm tag
              </button>
            </div>
            {tagsLoading ? (
              <div className="admin-loading-mini">Đang tải...</div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên tag</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tags.map((t) => (
                      <tr key={t.tagId}>
                        <td>{t.name}</td>
                        <td>
                          <button
                            className="btn-action btn-action--danger"
                            onClick={() => handleDeleteTag(t.tagId)}
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                    {tags.length === 0 && (
                      <tr>
                        <td
                          colSpan="2"
                          style={{
                            textAlign: "center",
                            color: "#9ca3af",
                            padding: "24px",
                          }}
                        >
                          Chưa có tag nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default Admin;
