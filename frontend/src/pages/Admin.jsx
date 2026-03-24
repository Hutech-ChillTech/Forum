import { useState, useEffect, useCallback } from 'react';
import userService from '../service/userService';
import tagService from '../service/tagService';
import '../styles/Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');

  // ─── Users ─────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // ─── Load Users ───────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
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
  }, [userPage, userSearch]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ─── Actions ──────────────────────────────────────────────────
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

  // ─── Tags ──────────────────────────────────────────────────────
  const [tags, setTags] = useState([]);
  const [tagPage, setTagPage] = useState(0);
  const [tagTotalPages, setTagTotalPages] = useState(0);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState(null);
  const [editTagName, setEditTagName] = useState('');

  const loadTags = useCallback(async () => {
    setTagsLoading(true);
    try {
      const data = await tagService.adminGetAllTags(tagPage, 15);
      setTags(data.tags || []);
      setTagTotalPages(Math.ceil((data.totalItems || 0) / 15));
    } catch (e) {
      console.error(e);
    } finally {
      setTagsLoading(false);
    }
  }, [tagPage]);

  useEffect(() => {
    if (activeTab === 'tags') {
      loadTags();
    }
  }, [loadTags, activeTab]);

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      await tagService.adminCreateTag(newTagName.trim());
      setNewTagName('');
      loadTags();
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tag này?')) return;
    try {
      await tagService.adminDeleteTag(tagId);
      setTags(prev => prev.filter(t => t.tagId !== tagId));
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  const handleUpdateTag = async (tagId) => {
    if (!editTagName.trim()) return;
    try {
      await tagService.adminUpdateTag(tagId, editTagName.trim());
      setTags(prev => prev.map(t => t.tagId === tagId ? { ...t, name: editTagName.trim().toLowerCase() } : t));
      setEditingTagId(null);
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
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
    },
    {
      key: 'tags',
      label: 'Quản lý Tags',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      )
    }
  ];

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
              className={`admin-nav-item ${activeTab === key ? 'active' : ''}`}
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

          {activeTab === 'tags' && (
            <div className="admin-content animate-in">
              <div className="section-header">
                <h2 className="section-title">Quản lý Tags</h2>
                <form onSubmit={handleCreateTag} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Tên tag mới..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="filter-select"
                    style={{ width: '200px' }}
                  />
                  <button type="submit" className="btn-action btn-action--success" style={{ padding: '8px 16px' }}>Thêm Tag</button>
                </form>
              </div>

              {tagsLoading ? (
                <div className="admin-loading-mini">Đang tải danh sách tag...</div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tên Tag</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tags.map(t => (
                        <tr key={t.tagId}>
                          <td style={{ color: '#6b7280', fontSize: '12px' }}>{t.tagId}</td>
                          <td>
                            {editingTagId === t.tagId ? (
                              <input
                                type="text"
                                value={editTagName}
                                onChange={(e) => setEditTagName(e.target.value)}
                                className="filter-select"
                                style={{ width: '120px', padding: '4px' }}
                              />
                            ) : (
                              <div style={{ fontWeight: 600, color: '#111827' }}>#{t.name}</div>
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              {editingTagId === t.tagId ? (
                                <>
                                  <button className="btn-action btn-action--success" onClick={() => handleUpdateTag(t.tagId)} style={{ padding: '4px 8px', fontSize: '12px' }}>Lưu</button>
                                  <button className="btn-action" onClick={() => setEditingTagId(null)} style={{ padding: '4px 8px', fontSize: '12px', background: '#ccc' }}>Hủy</button>
                                </>
                              ) : (
                                <>
                                  <button className="btn-action" onClick={() => { setEditingTagId(t.tagId); setEditTagName(t.name); }} style={{ padding: '4px 8px', fontSize: '12px', background: '#e0e7ff', color: '#4338ca' }}>Sửa</button>
                                  <button className="btn-action btn-action--danger" onClick={() => handleDeleteTag(t.tagId)} style={{ padding: '4px 8px', fontSize: '12px' }}>Xóa</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {tags.length === 0 && (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>Không có tag nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {renderPagination(tagPage, tagTotalPages, setTagPage)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
