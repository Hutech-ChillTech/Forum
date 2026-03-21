import { useState, useEffect } from "react";
import { useSearchParams, Link, useOutletContext } from "react-router-dom";
import PostCard from "../components/PostCard";
import searchService from "../service/searchService";
import "../styles/Search.css";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { setSelectedPostId } = useOutletContext();

  const [results, setResults] = useState({ users: [], tags: [], posts: [] });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      handleSearch();
    }
    fetchHistory();
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchService.globalSearch(query);
      setResults(data);
      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await searchService.getSearchHistory();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching search history:", err);
    }
  };

  const handleClearHistory = async () => {
    try {
      await searchService.clearSearchHistory();
      setHistory([]);
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  const handleRemoveHistoryItem = async (e, keyword) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await searchService.removeSearchHistoryItem(keyword);
      setHistory((prev) => prev.filter((item) => item !== keyword));
    } catch (err) {
      console.error("Error removing history item:", err);
    }
  };

  const isEmpty =
    !results.users.length && !results.tags.length && !results.posts.length;

  return (
    <div className="search-results-wrapper">
      <div className="search-main-content">
        <div className="search-header">
          <div className="search-header-top">
            <h1 className="search-title">Kết quả tìm kiếm</h1>
            <Link to="/posts" className="btn-primary">
              Đặt câu hỏi
            </Link>
          </div>
          <p className="search-subtitle">
            {query
              ? `Kết quả cho "${query}"`
              : "Vui lòng nhập từ khóa để tìm kiếm"}
          </p>
        </div>

        {loading ? (
          <div className="search-loading">Đang tìm kiếm...</div>
        ) : error ? (
          <div className="search-error">{error}</div>
        ) : isEmpty ? (
          <div className="empty-state">
            <p>
              Không tìm thấy kết quả nào cho <strong>"{query}"</strong>
            </p>
            <p style={{ marginTop: "8px", color: "var(--text-secondary)" }}>
              Thử sử dụng các từ khóa khác hoặc kiểm tra lại chính tả.
            </p>
          </div>
        ) : (
          <div className="search-results-content">
            {/* Tags Section */}
            {results.tags.length > 0 && (
              <section className="results-section">
                <h2 className="section-title">Thẻ ({results.tags.length})</h2>
                <div className="tags-grid">
                  {results.tags.map((tag) => (
                    <Link
                      key={tag.tagId}
                      to={`/posts?tag=${tag.name}`}
                      className="tag-item"
                    >
                      <span className="tag">{tag.name}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Users Section */}
            {results.users.length > 0 && (
              <section className="results-section">
                <h2 className="section-title">
                  Người dùng ({results.users.length})
                </h2>
                <div className="users-list">
                  {results.users.map((user) => (
                    <div key={user.userId} className="user-search-card">
                      <div className="user-avatar">
                        {user.avatarURL ? (
                          <img src={user.avatarURL} alt={user.userName} />
                        ) : (
                          <span>{user.userName[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div className="user-info">
                        <Link
                          to={`/profile/${user.userId}`}
                          className="user-name"
                        >
                          {user.fullName || user.userName}
                        </Link>
                        <span className="user-handle">@{user.userName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Posts Section */}
            {results.posts.length > 0 && (
              <section className="results-section">
                <h2 className="section-title">
                  Bài viết ({results.posts.length})
                </h2>
                <div className="questions-list">
                  {results.posts.map((post, idx) => (
                    <PostCard
                      key={post.postId || post.id || idx}
                      post={post}
                      onOpenModal={(id) => setSelectedPostId(id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <aside className="search-right-sidebar">
        <div className="sidebar-widget">
          <div className="widget-header">
            <h3 className="widget-title">Lịch sử tìm kiếm</h3>
            {history.length > 0 && (
              <button className="clear-btn" onClick={handleClearHistory}>
                Xóa
              </button>
            )}
          </div>
          <div className="history-list">
            {history.length > 0 ? (
              history.map((term, index) => (
                <div key={index} className="history-item-container">
                  <Link
                    to={`/search?q=${encodeURIComponent(term)}`}
                    className="history-item"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{term}</span>
                  </Link>
                  <button
                    className="remove-item-btn"
                    onClick={(e) => handleRemoveHistoryItem(e, term)}
                    title="Xóa"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <p className="empty-history">Trống</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Search;
