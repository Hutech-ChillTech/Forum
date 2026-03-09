import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import '../styles/Search.css';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    // Mock data for search results
    const [results, setResults] = useState([]);

    useEffect(() => {
        // In a real app, you would fetch search results from your API here
        // For now, we'll just mock some data if there is a query
        if (query) {
            setResults([
                {
                    id: 1,
                    title: `Result for: ${query} in Java`,
                    content: 'I am trying to implement something and I got this error. How can I fix it? This issue usually happens when...',
                    author: 'John Doe',
                    votes: 12,
                    answers: 3,
                    views: 450,
                    tags: ['java', 'spring-boot'],
                    askedTime: '2 days ago'
                },
                {
                    id: 2,
                    title: `Understanding ${query} behavior`,
                    content: 'Can someone explain to me how this works in modern web development? I have read the documentation but...',
                    author: 'JaneSmith',
                    votes: 5,
                    answers: 1,
                    views: 120,
                    tags: ['javascript', 'reactjs'],
                    askedTime: '5 hours ago'
                }
            ]);
        } else {
            setResults([]);
        }
    }, [query]);

    return (
        <div className="search-layout">
            <Header hideAuth={false} />

            <div className="search-container">
                {/* Left Sidebar */}
                <aside className="search-sidebar">
                    <Sidebar activePage="" />
                </aside>

                <main className="search-main">
                    <div className="search-header">
                        <div className="search-header-top">
                            <h1 className="search-title">Search Results</h1>
                            <a href="/posts" className="btn-primary">Ask Question</a>
                        </div>
                        <p className="search-subtitle">Results for {query ? `"${query}"` : 'nothing'}</p>

                        <div className="search-tips">
                            <span>Search multiple tags with <code>[tag1] [tag2]</code></span>
                            <a href="#" className="advanced-search-link">Advanced Search Tips</a>
                        </div>
                    </div>

                    <div className="questions-toolbar">
                        <div className="questions-count">{results.length} results</div>
                        <div className="questions-filters">
                            <button className="filter-btn active">Relevance</button>
                            <button className="filter-btn">Newest</button>
                            <button className="filter-btn">More</button>
                        </div>
                    </div>

                    <div className="questions-list">
                        {results.length > 0 ? (
                            results.map((question) => (
                                <div key={question.id} className="question-card">
                                    <div className="question-stats">
                                        <div className="stat-item">
                                            <div className="stat-value">{question.votes}</div>
                                            <div className="stat-label">votes</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">{question.answers}</div>
                                            <div className="stat-label">answers</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">{question.views}</div>
                                            <div className="stat-label">views</div>
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
                                                <span className="question-time">asked {question.askedTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>We couldn't find anything for <strong>"{query}"</strong></p>
                                <p style={{ marginTop: '8px', color: '#6a737c' }}>Try removing filters or using more general keywords.</p>
                            </div>
                        )}
                    </div>
                </main>

                <aside className="search-right-sidebar">
                    <div className="sidebar-widget">
                        <h3 className="widget-title">Related Tags</h3>
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
            </div>

            <Footer />
        </div>
    );
};

export default Search;
