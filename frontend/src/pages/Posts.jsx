import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import PostCard from '../components/PostCard';
import postService from '../service/postService';
import '../styles/Posts.css';

const Posts = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [sortFilter, setSortFilter] = useState('createdAt,desc');

  const fetchPosts = async (page = 0, sort = sortFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getPublishedPosts(page, 20, sort);
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (e) {
      setError('Kh�ng th? t?i b�i vi?t. Vui l�ng th? l?i.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage, sortFilter);
  }, [currentPage, sortFilter]);

  return (
    <div className="posts-layout">
      <Header />
      <div className="posts-container">
        <aside className="posts-sidebar">
          <Sidebar activePage="posts" />
        </aside>

        <main className="posts-main">
          <div className="questions-header">
            <h1>B�i vi?t</h1>
            <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('openCreatePost'))}>
              T?o b�i vi?t
            </button>
          </div>

          <div className="questions-toolbar">
            <div className="questions-count">{totalItems} b�i vi?t</div>
            <div className="questions-filters">
              {[
                ['createdAt,desc', 'M?i nh?t'],
                ['createdAt,asc', 'Cu nh?t'],
              ].map(([val, label]) => (
                <button
                  key={val}
                  className={"filter-btn" + (sortFilter === val ? ' active' : '')}
                  onClick={() => { setSortFilter(val); setCurrentPage(0); }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>�ang t?i...</div>
          ) : error ? (
            <div style={{ padding: '20px', color: 'red' }}>{error}</div>
          ) : posts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--card-bg)', borderRadius: '12px' }}>
              Chua c� b�i vi?t n�o.
            </div>
          ) : (
            <div className="questions-list">
              {posts.map(post => (
                <PostCard key={post.postId} post={post} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              {currentPage > 0 && (
                <button className="page-btn" onClick={() => setCurrentPage(p => p - 1)}>Tru?c</button>
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
                <button className="page-btn next" onClick={() => setCurrentPage(p => p + 1)}>Ti?p</button>
              )}
            </div>
          )}
        </main>
      </div>

      <button className="ai-chat-fab" onClick={() => setIsChatOpen(!isChatOpen)} title="Chat v?i AI">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 012 2z" />
        </svg>
      </button>
      <ChatBox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <Footer />
    </div>
  );
};

export default Posts;
