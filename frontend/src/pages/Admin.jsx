import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import userService from '../service/userService';
import postService from '../service/postService';
import tagService from '../service/tagService';
import '../styles/Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');

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
  const [newTagName, setNewTagName] = useState('');
  const [tagsLoading, setTagsLoading] = useState(false);

  useEffect(() => { loadStats(); }, []);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
  }, [activeTab, userPage]);

  useEffect(() => {
    if (activeTab === 'posts') loadPosts();
  }, [activeTab, postPage]);

  useEffect(() => {
    if (activeTab === 'tags') loadTags();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const data = await postService.getTotalPosts();
      setStats({ totalPosts: data.total ?? 0 });
    } catch (e) { console.error(e); }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await userService.getAllUsers(userPage, 20);
      setUsers(data.users || []);
      setUserTotalPages(data.totalPages || 0);
    } catch (e) { console.error(e); }
    finally { setUsersLoading(false); }
  };

  const loadPosts = async () => {
    setPostsLoading(true);
    try {
      const data = await postService.getAllPostsAdmin(postPage, 20);
      setPosts(data.posts || []);
      setPostTotalPages(data.totalPages || 0);
    } catch (e) { console.error(e); }
    finally { setPostsLoading(false); }
  };

  const loadTags = async () => {
    setTagsLoading(true);
    try {
      const data = await tagService.getAllTags(0, 100);
      setTags(data.tags || []);
    } catch (e) { console.error(e); }
    finally { setTagsLoading(false); }
  };

  const handleBanUser = async (userId) => {
    try {
      await userService.banUser(userId);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, status: 'BANNED' } : u));
    } catch (e) { alert('L?i: ' + e.message); }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await userService.unbanUser(userId);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, status: 'ACTIVE' } : u));
    } catch (e) { alert('L?i: ' + e.message); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('X�a b�i vi?t n�y?')) return;
    try {
      await postService.deletePostByAdmin(postId);
      setPosts(prev => prev.filter(p => p.postId !== postId));
    } catch (e) { alert('L?i: ' + e.message); }
  };

  const handleUpdatePostStatus = async (postId, status) => {
    try {
      const updated = await postService.updatePostStatus(postId, status);
      setPosts(prev => prev.map(p => p.postId === postId ? { ...p, status: updated.status || status } : p));
    } catch (e) { alert('L?i: ' + e.message); }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('X�a tag n�y?')) return;
    try {
      await tagService.deleteTag(tagId);
      setTags(prev => prev.filter(t => t.tagId !== tagId));
    } catch (e) { alert('L?i: ' + e.message); }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const tag = await tagService.createTag(newTagName.trim());
      setTags(prev => [...prev, tag]);
      setNewTagName('');
    } catch (e) { alert('L?i: ' + e.message); }
  };

  const tabLabels = { overview: 'T?ng quan', users: 'Ngu?i d�ng', posts: 'B�i vi?t', tags: 'Tags' };

  return (
    <div className="admin-layout">
      <Header />
      <div className="admin-container">
        <aside className="admin-sidebar">
          <Sidebar activePage="admin" />
        </aside>

        <main className="admin-main">
          <h1 className="admin-title">Qu?n tr? h? th?ng</h1>

          <div className="admin-tabs">
            {Object.entries(tabLabels).map(([key, label]) => (
              <button
                key={key}
                className={"admin-tab-btn" + (activeTab === key ? ' active' : '')}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* -- OVERVIEW -- */}
          {activeTab === 'overview' && (
            <div className="admin-overview">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalPosts}</div>
                  <div className="stat-label">T?ng b�i vi?t</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">-</div>
                  <div className="stat-label">Ngu?i d�ng</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">-</div>
                  <div className="stat-label">Tags</div>
                </div>
              </div>
            </div>
          )}

          {/* -- USERS -- */}
          {activeTab === 'users' && (
            <div className="admin-section">
              {usersLoading ? (
                <div className="admin-loading">�ang t?i...</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>H? t�n</th>
                      <th>Email</th>
                      <th>Tr?ng th�i</th>
                      <th>Thao t�c</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.userId}>
                        <td>{u.userName}</td>
                        <td>{u.fullName}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={"status-badge " + (u.status || '').toLowerCase()}>
                            {u.status}
                          </span>
                        </td>
                        <td>
                          {u.status === 'BANNED' ? (
                            <button className="btn-unban" onClick={() => handleUnbanUser(u.userId)}>B? c?m</button>
                          ) : (
                            <button className="btn-ban" onClick={() => handleBanUser(u.userId)}>C?m</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan="5" className="empty-row">Kh�ng c� d? li?u</td></tr>
                    )}
                  </tbody>
                </table>
              )}
              {userTotalPages > 1 && (
                <div className="admin-pagination">
                  {Array.from({ length: userTotalPages }, (_, i) => (
                    <button
                      key={i}
                      className={"page-btn" + (userPage === i ? ' active' : '')}
                      onClick={() => setUserPage(i)}
                    >{i + 1}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* -- POSTS -- */}
          {activeTab === 'posts' && (
            <div className="admin-section">
              {postsLoading ? (
                <div className="admin-loading">�ang t?i...</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ti�u d?</th>
                      <th>T�c gi?</th>
                      <th>Tr?ng th�i</th>
                      <th>Thao t�c</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(p => (
                      <tr key={p.postId}>
                        <td className="post-title-cell" title={p.title}>{p.title}</td>
                        <td>{p.userName}</td>
                        <td>
                          <select
                            className="status-select"
                            value={p.status || ''}
                            onChange={(e) => handleUpdatePostStatus(p.postId, e.target.value)}
                          >
                            <option value="PUBLISHED">PUBLISHED</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                            <option value="DELETED">DELETED</option>
                          </select>
                        </td>
                        <td>
                          <button className="btn-delete" onClick={() => handleDeletePost(p.postId)}>X�a</button>
                        </td>
                      </tr>
                    ))}
                    {posts.length === 0 && (
                      <tr><td colSpan="4" className="empty-row">Kh�ng c� d? li?u</td></tr>
                    )}
                  </tbody>
                </table>
              )}
              {postTotalPages > 1 && (
                <div className="admin-pagination">
                  {Array.from({ length: postTotalPages }, (_, i) => (
                    <button
                      key={i}
                      className={"page-btn" + (postPage === i ? ' active' : '')}
                      onClick={() => setPostPage(i)}
                    >{i + 1}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* -- TAGS -- */}
          {activeTab === 'tags' && (
            <div className="admin-section">
              <div className="tag-create-form">
                <input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                  placeholder="Nh?p t�n tag m?i..."
                  className="tag-input"
                />
                <button className="btn-create" onClick={handleCreateTag}>T?o tag</button>
              </div>
              {tagsLoading ? (
                <div className="admin-loading">�ang t?i...</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>T�n tag</th><th>Thao t�c</th></tr>
                  </thead>
                  <tbody>
                    {tags.map(t => (
                      <tr key={t.tagId}>
                        <td><span className="tag-pill">{t.name}</span></td>
                        <td>
                          <button className="btn-delete" onClick={() => handleDeleteTag(t.tagId)}>X�a</button>
                        </td>
                      </tr>
                    ))}
                    {tags.length === 0 && (
                      <tr><td colSpan="2" className="empty-row">Chua c� tag n�o</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
