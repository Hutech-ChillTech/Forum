import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import tagService from '../service/tagService';
import '../styles/Tags.css';

const Tags = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const data = await tagService.getAllTags(0, 200);
        setTags(data.tags || []);
      } catch (e) {
        setError('Kh�ng th? t?i danh s�ch tag.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tags-layout">
      <Header />
      <div className="tags-container">
        <aside className="tags-sidebar">
          <Sidebar activePage="tags" />
        </aside>

        <main className="tags-main">
          <div className="tags-header">
            <h1 className="tags-title">Tags</h1>
            <p className="tags-description">
              Tags gi�p ph�n lo?i b�i vi?t theo ch? d?. T�m tag ph� h?p d? kh�m ph� c�c b�i vi?t li�n quan.
            </p>
          </div>

          <div className="tags-search">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 16L12.65 12.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              className="tags-search-input"
              placeholder="T�m tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>�ang t?i...</div>
          ) : error ? (
            <div style={{ padding: '20px', color: 'red' }}>{error}</div>
          ) : (
            <>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {filteredTags.length} tags
              </div>
              <div className="tags-grid">
                {filteredTags.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)' }}>Kh�ng t�m th?y tag n�o.</div>
                ) : filteredTags.map((tag) => (
                  <div key={tag.tagId} className="tag-card">
                    <span className="tag-name-link">{tag.name}</span>
                  </div>
                ))}
              </div>
            </>
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

export default Tags;
