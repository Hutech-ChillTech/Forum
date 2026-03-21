<<<<<<< HEAD
import { useState, useEffect } from "react";
import userService from "../service/userService";
import postService from "../service/postService";
import tagService from "../service/tagService";
import "../styles/Admin.css";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");
=======
import { useState, useEffect, useCallback } from 'react';
import userService from '../service/userService';
import '../styles/Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
>>>>>>> e787e2f00f81ad9c35983768bd468eb6fc8ce456

  // ─── Users ─────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

<<<<<<< HEAD
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
=======
  // ─── Load Users ───────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
>>>>>>> e787e2f00f81ad9c35983768bd468eb6fc8ce456
    setUsersLoading(true);
    try {
      let data;
      if (userSearch.trim()) {
        data = await userService.searchUsers(userSearch.trim(), userPage, 15);
      } else {
        data = await userService.getAllUsers(userPage, 15);
      }
      setUsers(data.users || data.content || []);
      setUserTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
<<<<<<< HEAD
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
=======
  }, [userPage, userSearch]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
>>>>>>> e787e2f00f81ad9c35983768bd468eb6fc8ce456

  // ─── Actions ──────────────────────────────────────────────────
  const handleBanUser = async (userId) => {
    if (!window.confirm('Bạn chắc chắn muốn cấm người dùng này?')) return;
    try {
      await userService.banUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, status: "BANNED" } : u)),
      );
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await userService.unbanUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, status: "ACTIVE" } : u)),
      );
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  };

<<<<<<< HEAD
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
=======
  const handleUpdateUserRole = async (userId, role) => {
    try {
      await userService.updateUserRole(userId, role);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, role: role } : u));
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  // ─── Helpers ──────────────────────────────────────────────────
  const getStatusClass = (status) => {
    if (!status) return 'success';
    const s = status.toLowerCase();
    if (s === 'active' || s === 'published') return 'success';
    if (s === 'banned' || s === 'deleted') return 'danger';
    if (s === 'draft' || s === 'inactive') return 'warning';
    return 'success';
  };

  const renderPagination = (currentPage, totalPages, setPageFn) => {
    if (totalPages <= 1) return null;
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);

    return (
      <div className="admin-pagination">
        <button className="page-btn" disabled={currentPage === 0} onClick={() => setPageFn(0)}>«</button>
        <button className="page-btn" disabled={currentPage === 0} onClick={() => setPageFn(currentPage - 1)}>‹</button>
        {Array.from({ length: end - start }, (_, i) => {
          const p = start + i;
          return (
            <button key={p} className={'page-btn' + (currentPage === p ? ' active' : '')} onClick={() => setPageFn(p)}>{p + 1}</button>
          );
        })}
        <button className="page-btn" disabled={currentPage === totalPages - 1} onClick={() => setPageFn(currentPage + 1)}>›</button>
        <button className="page-btn" disabled={currentPage === totalPages - 1} onClick={() => setPageFn(totalPages - 1)}>»</button>
      </div>
    );
  };

  const tabConfig = [
    {
      key: 'users',
      label: 'Quản lý người dùng & Moderator',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    }
  ];
>>>>>>> e787e2f00f81ad9c35983768bd468eb6fc8ce456

  return (
    <div className="admin-layout">
      {/* ─── Sidebar trái ─── */}
      <aside className="admin-left-sidebar">
        <div className="admin-logo-section">
          <div className="admin-logo-icon">🛡️</div>
          <span className="admin-logo-text">ForumIT Admin</span>
        </div>
        <nav className="admin-nav-list">
          {tabConfig.map(({ key, label, icon }) => (
            <button
              key={key}
<<<<<<< HEAD
              className={"admin-tab-btn" + (activeTab === key ? " active" : "")}
=======
              className={`admin-nav-item ${activeTab === key ? 'active' : ''}`}
>>>>>>> e787e2f00f81ad9c35983768bd468eb6fc8ce456
              onClick={() => setActiveTab(key)}
            >
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>
            Đăng xuất
          </button>
        </div>
      </aside>

<<<<<<< HEAD
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
=======
      {/* ─── Main Content Canvas ─── */}
      <div className="admin-main-content">
        <header className="admin-top-navbar">
          <div className="navbar-breadcrumb">
            Bảng điều khiển / <strong>{tabConfig.find(t => t.key === activeTab)?.label}</strong>
          </div>
          <div className="navbar-actions">
            <span className="navbar-date" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {new Date().toLocaleDateString('vi-VN')}
            </span>
          </div>
        </header>

        <div className="admin-content-viewport">
          {activeTab === 'users' && (
            <div className="admin-content animate-in">
              <div className="section-header">
                <h2 className="section-title">Quản lý người dùng & Moderator</h2>
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setUserPage(0); }}
                  className="filter-select"
                  style={{ width: '250px' }}
                />
>>>>>>> e787e2f00f81ad9c35983768bd468eb6fc8ce456
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
                              value={u.role || 'USER'}
                              onChange={(e) => handleUpdateUserRole(u.userId, e.target.value)}
                              className="status-select-v2"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                            >
                              <option value="USER">USER</option>
                              <option value="MODERATOR">MODERATOR</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td>
                            <span className={`status-badge-v2 ${getStatusClass(u.status)}`} style={{ fontSize: '11px' }}>
                              {u.status === 'BANNED' ? 'BỊ CẤM' : 'ĐANG HOẠT ĐỘNG'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              {u.status === 'BANNED' ? (
                                <button className="btn-action btn-action--success" onClick={() => handleUnbanUser(u.userId)} style={{ padding: '4px 8px', fontSize: '12px' }}>Bỏ cấm</button>
                              ) : (
                                <button className="btn-action btn-action--danger" onClick={() => handleBanUser(u.userId)} style={{ padding: '4px 8px', fontSize: '12px' }}>Cấm</button>
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
<<<<<<< HEAD
          </div>
        )}

        {/* -- USERS -- */}
        {activeTab === "users" && (
          <div className="admin-section">
            {usersLoading ? (
              <div className="admin-loading">Đang tải...</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.userId}>
                      <td>{u.userName}</td>
                      <td>{u.fullName}</td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={
                            "status-badge " + (u.status || "").toLowerCase()
                          }
                        >
                          {u.status}
                        </span>
                      </td>
                      <td>
                        {u.status === "BANNED" ? (
                          <button
                            className="btn-unban"
                            onClick={() => handleUnbanUser(u.userId)}
                          >
                            Bỏ cấm
                          </button>
                        ) : (
                          <button
                            className="btn-ban"
                            onClick={() => handleBanUser(u.userId)}
                          >
                            Cấm
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-row">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            {userTotalPages > 1 && (
              <div className="admin-pagination">
                {Array.from({ length: userTotalPages }, (_, i) => (
                  <button
                    key={i}
                    className={"page-btn" + (userPage === i ? " active" : "")}
                    onClick={() => setUserPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -- POSTS -- */}
        {activeTab === "posts" && (
          <div className="admin-section">
            {postsLoading ? (
              <div className="admin-loading">Đang tải...</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Tác giả</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.postId}>
                      <td className="post-title-cell" title={p.title}>
                        {p.title}
                      </td>
                      <td>{p.userName}</td>
                      <td>
                        <select
                          className="status-select"
                          value={p.status || ""}
                          onChange={(e) =>
                            handleUpdatePostStatus(p.postId, e.target.value)
                          }
                        >
                          <option value="PUBLISHED">PUBLISHED</option>
                          <option value="DRAFT">DRAFT</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                          <option value="DELETED">DELETED</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeletePost(p.postId)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty-row">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            {postTotalPages > 1 && (
              <div className="admin-pagination">
                {Array.from({ length: postTotalPages }, (_, i) => (
                  <button
                    key={i}
                    className={"page-btn" + (postPage === i ? " active" : "")}
                    onClick={() => setPostPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -- TAGS -- */}
        {activeTab === "tags" && (
          <div className="admin-section">
            <div className="tag-create-form">
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                placeholder="Nhập tên tag mới..."
                className="tag-input"
              />
              <button className="btn-create" onClick={handleCreateTag}>
                Tạo tag
              </button>
            </div>
            {tagsLoading ? (
              <div className="admin-loading">Đang tải...</div>
            ) : (
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
                      <td>
                        <span className="tag-pill">{t.name}</span>
                      </td>
                      <td>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteTag(t.tagId)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tags.length === 0 && (
                    <tr>
                      <td colSpan="2" className="empty-row">
                        Chưa có tag nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </>
=======
          )}
        </div>
      </div>
    </div>
>>>>>>> e787e2f00f81ad9c35983768bd468eb6fc8ce456
  );
};

export default Admin;
