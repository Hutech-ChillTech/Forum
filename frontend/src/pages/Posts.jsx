import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Posts.css';

const Posts = () => {
    // Mock data for questions
    const [questions] = useState([
        {
            id: 1,
            title: 'Java.lang.NoClassDefFoundError: org/eclipse/jetty/util/component/ContainerLifeCycle',
            content: 'I was writing a simple program to send requests to a certain api using java and i decided to use jetty-client for http request handling...',
            author: 'user123',
            votes: 0,
            answers: 0,
            views: 216,
            tags: ['c++', 'language-lawyer', 'undefined-behavior', 'constant-expression'],
            askedTime: '3 years, 1 month ago',
            modifiedTime: 'today'
        },
        {
            id: 2,
            title: 'How to fix authentication error in Spring Boot?',
            content: 'I am getting 401 unauthorized error when trying to access protected endpoints...',
            author: 'developer456',
            votes: 5,
            answers: 2,
            views: 543,
            tags: ['java', 'spring-boot', 'security'],
            askedTime: '2 days ago',
            modifiedTime: '1 day ago'
        },
        {
            id: 3,
            title: 'React useState not updating immediately',
            content: 'When I call setState, the state variable does not update immediately. Why is this happening?',
            author: 'reactDev789',
            votes: 12,
            answers: 4,
            views: 1205,
            tags: ['javascript', 'reactjs', 'hooks'],
            askedTime: '1 week ago',
            modifiedTime: '3 days ago'
        },
        {
            id: 4,
            title: 'Best practices for database indexing in PostgreSQL',
            content: 'What are the best practices when creating indexes in PostgreSQL for optimal query performance?',
            author: 'dbAdmin',
            votes: 8,
            answers: 3,
            views: 892,
            tags: ['postgresql', 'database', 'indexing', 'performance'],
            askedTime: '5 days ago',
            modifiedTime: '2 days ago'
        }
    ]);

    return (
        <div className="posts-layout">
            <Header />

            <div className="posts-container">
                {/* Left Sidebar */}
                <aside className="posts-sidebar">
                    <nav className="sidebar-nav">
                        <a href="/" className="nav-item">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                <path d="M9 1L1 6v9h5V9h6v6h5V6L9 1z" />
                            </svg>
                            Trang chủ
                        </a>
                        <a href="/posts" className="nav-item active">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                <path d="M9 16A7 7 0 119 2a7 7 0 010 14zm0-2A5 5 0 109 4a5 5 0 000 10zm1-5h2v2h-2v-2zm-2 0h2v2H8V9z" />
                            </svg>
                            Câu hỏi
                        </a>
                        <a href="/tags" className="nav-item">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                <path d="M2 4.5A2.5 2.5 0 014.5 2h5.086a1 1 0 01.707.293l6.414 6.414a1 1 0 010 1.414l-5.086 5.086a1 1 0 01-1.414 0L4.293 9.293A1 1 0 014 8.586V4.5zM6 6a1 1 0 100-2 1 1 0 000 2z" />
                            </svg>
                            Tags
                        </a>
                        <a href="/challenges" className="nav-item">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                <path d="M9 1l2.5 6.5L18 9l-6.5 1.5L9 17l-2.5-6.5L0 9l6.5-1.5L9 1z" />
                            </svg>
                            Challenges
                        </a>
                        <a href="/chat" className="nav-item">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                            </svg>
                            Chat
                        </a>
                        <a href="/articles" className="nav-item">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                <path d="M4 2h10a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm1 3v2h8V5H5zm0 4v1h8V9H5zm0 3v1h5v-1H5z" />
                            </svg>
                            Articles
                        </a>
                    </nav>

                    <div className="sidebar-section">
                        <h3 className="sidebar-title">COLLECTIVES</h3>
                        <a href="#" className="collective-link">Explore all Collectives</a>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="posts-main">
                    <div className="questions-header">
                        <h1>All Questions</h1>
                        <button className="btn-primary">Ask Question</button>
                    </div>

                    <div className="questions-toolbar">
                        <div className="questions-count">{questions.length} questions</div>
                        <div className="questions-filters">
                            <button className="filter-btn">Newest</button>
                            <button className="filter-btn">Active</button>
                            <button className="filter-btn">Bountied</button>
                            <button className="filter-btn">Unanswered</button>
                            <button className="filter-btn">More</button>
                        </div>
                    </div>

                    <div className="questions-list">
                        {questions.map((question) => (
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
                                        <a href={`/questions/${question.id}`}>{question.title}</a>
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
                                            <span className="question-modified">modified {question.modifiedTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>

                {/* Right Sidebar (optional) */}
                <aside className="posts-right-sidebar">
                    <div className="sidebar-widget">
                        <h3 className="widget-title">The Overflow Blog</h3>
                        <ul className="widget-list">
                            <li><a href="#">The unexpected benefits of mentoring others</a></li>
                            <li><a href="#">Podcast 354: Building for AR with Niantic Labs</a></li>
                        </ul>
                    </div>

                    <div className="sidebar-widget">
                        <h3 className="widget-title">Featured & Meta</h3>
                        <ul className="widget-list">
                            <li><a href="#">Beta release of Collectives™ on Stack Overflow</a></li>
                            <li><a href="#">Announcing Design Accessibility Updates</a></li>
                        </ul>
                    </div>

                    <div className="sidebar-widget">
                        <h3 className="widget-title">Hot Network Questions</h3>
                        <ul className="widget-list hot-questions">
                            <li><a href="#">Why does C++ allow undefined behavior?</a></li>
                            <li><a href="#">Can I use React hooks with class components?</a></li>
                            <li><a href="#">What is the difference between SQL and NoSQL?</a></li>
                        </ul>
                    </div>
                </aside>
            </div>

            <Footer />
        </div>
    );
};

export default Posts;
