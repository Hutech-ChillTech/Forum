import { useState, useEffect } from 'react';
import userService from '../service/userService';
import '../styles/Users.css';

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const fetchUsers = async (page = 0, search = '') => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (search.trim()) {
        data = await userService.searchUsers(search.trim(), page, 20);
      } else if (activeTab === 'active') {
        data = await userService.getActiveUsers(page, 20);
      } else {
        data = await userService.getAllUsers(page, 20);
      }
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (e) {
      setError('Không thể tải danh sách người dùng.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
  }, [currentPage, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchUsers(0, searchQuery);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <main className="users-main">
        <div className="users-header">
          <h1 className="users-title">Người dùng</h1>
          {totalItems > 0 && <span className="users-count">{totalItems} người dùng</span>}
        </div>

        <form className="users-search-bar" onSubmit={handleSearch}>
          <div className="search-container-inner">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 16L12.65 12.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
          {[['all', 'Tất cả'], ['active', 'Đang hoạt động']].map(([key, label]) => (
            <button
              key={key}
              className={"tab-btn" + (activeTab === key ? ' active' : '')}
              onClick={() => { setActiveTab(key); setCurrentPage(0); }}
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
            <div className="user-browser">
              <div className="user-grid">
                {users.length === 0 ? (
                  <div className="users-empty">Không có người dùng nào.</div>
                ) : users.map(user => (
                  <div key={user.userId} className="user-card">
                    <div className="user-card-header">
                      <div className="user-avatar-medium">
                        {user.avatarURL ? (
                          <img src={user.avatarURL} alt={user.userName} />
                        ) : (
                          <span className="avatar-initials-medium">{getInitials(user.fullName || user.userName)}</span>
                        )}
                      </div>
                      <div className="user-details">
                        <a href={"/profile?id=" + user.userId} className="user-name-link">
                          {user.fullName || user.userName}
                        </a>
                        <span className="user-location">@{user.userName}</span>
                        <div className="user-reputation">
                          <span className={"status-small " + (user.status || '').toLowerCase()}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="user-tags">
                      <span className="user-tag">{user.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                {currentPage > 0 && (
                  <button className="page-btn" onClick={() => setCurrentPage(p => p - 1)}>Trước</button>
                )}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = Math.max(0, Math.min(currentPage - 3, totalPages - 7)) + i;
                  return (
                    <button
                      key={p}
                      className={"page-btn" + (currentPage === p ? ' active' : '')}
                      onClick={() => setCurrentPage(p)}
                    >{p + 1}</button>
                  );
                })}
                {currentPage < totalPages - 1 && (
                  <button className="page-btn next" onClick={() => setCurrentPage(p => p + 1)}>Tiếp</button>
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
