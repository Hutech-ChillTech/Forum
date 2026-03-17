import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/Search.css';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    // Mock data for search results
    const [results, setResults] = useState([]);

    useEffect(() => {
        // ... (mock data fetch remains same)
    }, [query]);

    return (
        <>
            <main className="search-main">
                <div className="search-header">
                    <div className="search-header-top">
                        <h1 className="search-title">Kết quả tìm kiếm</h1>
                        <a href="/posts" className="btn-primary">Đặt câu hỏi</a>
                    </div>
                    <p className="search-subtitle">Kết quả cho {query ? `"${query}"` : 'không có gì'}</p>

                    <div className="search-tips">
                        <span>Tìm kiếm nhiều thẻ với <code>[thẻ1] [thẻ2]</code></span>
                        <a href="#" className="advanced-search-link">Mẹo tìm kiếm nâng cao</a>
                    </div>
                </div>

                <div className="questions-toolbar">
                    <div className="questions-count">{results.length} kết quả</div>
                    <div className="questions-filters">
                        <button className="filter-btn active">Liên quan</button>
                        <button className="filter-btn">Mới nhất</button>
                        <button className="filter-btn">Thêm</button>
                    </div>
                </div>

                <div className="questions-list">
                    {results.length > 0 ? (
                        results.map((question) => (
                            <div key={question.id} className="question-card">
                                <div className="question-stats">
                                    <div className="stat-item">
                                        <div className="stat-value">{question.votes}</div>
                                        <div className="stat-label">phiếu</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{question.answers}</div>
                                        <div className="stat-label">trả lời</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{question.views}</div>
                                        <div className="stat-label">lượt xem</div>
                                    </div>
                                </div>

                                <div className="question-content">
                                    <h3 className="question-title">
                                        <a href={`/posts/${question.id}`}>{question.title}</a>
                                    </h3>
                                    <p className="question-excerpt">{question.content}</p>
                                    <div className="question-footer">
                                        <div className="question-tags">
                                            {question.tags.map((tag, index) => (
                                                <span key={index} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="question-meta">
                                            <span className="question-author">{question.author}</span>
                                            <span className="question-time">hỏi {question.askedTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>Không tìm thấy bất kỳ kết quả nào cho <strong>"{query}"</strong></p>
                            <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>Hãy thử xóa bộ lọc hoặc sử dụng các từ khóa tổng quát hơn.</p>
                        </div>
                    )}
                </div>
            </main>

            <aside className="search-right-sidebar">
                <div className="sidebar-widget">
                    <h3 className="widget-title">Thẻ liên quan</h3>
                    <div className="related-tags-list">
                        <a href="#" className="related-tag-item">
                            <span className="tag">java</span>
                            <span className="tag-multiplier">× 12K</span>
                        </a>
                        <a href="#" className="related-tag-item">
                            <span className="tag">spring</span>
                            <span className="tag-multiplier">× 8K</span>
                        </a>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Search;
