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
    if (!window.confirm('Are you sure you want to ban this user?')) return;
    try {
      await userService.banUser(userId);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, status: 'BANNED' } : u));
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await userService.unbanUser(userId);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, status: 'ACTIVE' } : u));
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleAssignRole = async (accountId, roleName) => {
    try {
      await userService.assignRole(accountId, roleName);
      setUsers(prev => prev.map(u => u.accountId === accountId ? { ...u, role: roleName } : u));
    } catch (e) { alert('Lỗi: ' + e.message); }
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
                <div className="stat-value">-</div>
                <div className="stat-label">Người dùng</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">-</div>
                <div className="stat-label">Tags</div>
              </div>

              {usersLoading ? (
                <div className="admin-loading-mini">Đang tải biểu mẫu...</div>
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
                      {users.map(u => (
                        <tr key={u.userId}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#111827' }}>
                              {u.fullName || u.userName}
                            </div>
                          </td>
                          <td style={{ color: '#6b7280' }}>{u.email}</td>
                          <td>
                            <select
                              value={u.roleName || 'USER'}
                              onChange={(e) => handleAssignRole(u.accountId, e.target.value)}
                              className="status-select-v2"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                            >
                              <option value="USER">USER</option>
                              <option value="MODERATOR">MODERATOR</option>
                            </select>
                          </td>
                          <td>
                            <span className={`status-badge-v2 ${getStatusClass(u.status)}`} style={{ fontSize: '11px' }}>
                              {u.status === 'BANNED' ? 'BANNED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              {u.status === 'BANNED' ? (
                                <button className="btn-action btn-action--success" onClick={() => handleUnbanUser(u.userId)} style={{ padding: '4px 8px', fontSize: '12px' }}>Unban</button>
                              ) : (
                                <button className="btn-action btn-action--danger" onClick={() => handleBanUser(u.userId)} style={{ padding: '4px 8px', fontSize: '12px' }}>Ban</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>Không tìm thấy người dùng nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {renderPagination(userPage, userTotalPages, setUserPage)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
