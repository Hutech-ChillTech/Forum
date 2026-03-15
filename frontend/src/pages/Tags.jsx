import { useState, useEffect } from 'react';
import tagService from '../service/tagService';
import '../styles/Tags.css';

const Tags = () => {
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
        setError('Không thể tải danh sách tag.');
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
    <>
      <main className="tags-main">
        <div className="tags-header">
          <h1 className="tags-title">Tags</h1>
          <p className="tags-description">
            Tags giúp phân loại bài viết theo chủ đề. Tìm tag phù hợp để khám phá các bài viết liên quan.
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
            placeholder="Tìm tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tải...</div>
        ) : error ? (
          <div style={{ padding: '20px', color: 'red' }}>{error}</div>
        ) : (
          <>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {filteredTags.length} tags
            </div>
            <div className="tags-grid">
              {filteredTags.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)' }}>Không tìm thấy tag nào.</div>
              ) : filteredTags.map((tag) => (
                <div key={tag.tagId} className="tag-card">
                  <span className="tag-name-link">{tag.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default Tags;
