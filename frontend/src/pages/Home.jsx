import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CreatePostModal from '../components/CreatePostModal';
import ChatBox from '../components/ChatBox';
import '../styles/Home.css';

const Home = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [userPosts, setUserPosts] = useState([]);

    // Handle new post creation
    const handlePostCreated = (newPost) => {
        setUserPosts(prevPosts => [newPost, ...prevPosts]);
    };

    // Helper function to format timestamp
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return 'vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return `${Math.floor(diff / 86400)} ngày trước`;
    };

    // Featured questions mock data
    const [featuredQuestions] = useState([
        {
            id: 1,
            title: 'Example of an Implementation-defined core constant expression whose evaluation has runtime undefined behavior',
            excerpt: 'While reading the standard for another language-lawyer question I came across expr.const(5): that I didn\'t understand...',
            tags: ['c++', 'language-lawyer', 'undefined-behavior', 'constant-expression'],
            author: 'Richard',
            reputation: 48.6,
            askedTime: '2 mins ago'
        },
        {
            id: 2,
            title: 'New to Java, having trouble [closed]',
            excerpt: 'I have only been doing javascript for the past 12 or so weeks, and I am having trouble with a college assignment...',
            tags: ['java', 'variables', 'static', 'non-static'],
            author: 'NewJavaLearner',
            reputation: 1,
            askedTime: '2 mins ago'
        },
        {
            id: 3,
            title: 'How do I tell CMake to emit the paths the package config module searched',
            excerpt: 'I\'d had this question: How do I tell CMake to select the package search path I see on more easily using package searches...',
            tags: ['cmake', 'pkg-config', 'build-configuration', 'search-path'],
            author: 'singularity',
            reputation: 123.6,
            askedTime: '8 mins ago'
        }
    ]);

    return (
        <div className="home-layout">
            <Header />

            <div className="home-container">
                {/* Left Sidebar */}
                <aside className="home-sidebar">
                    <nav className="sidebar-nav">
                        <a href="/" className="nav-item active">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                <path d="M9 1L1 6v9h5V9h6v6h5V6L9 1z" />
                            </svg>
                            Trang chủ
                        </a>
                        <a href="/posts" className="nav-item">
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
                <main className="home-main">
                    {/* Greeting Card */}
                    <div className="greeting-card">
                        <div className="avatar-number">3</div>
                        <h2 className="greeting-text">Xin chào, chia sẻ gì đó nhé!</h2>
                    </div>

                    {/* User Posts */}
                    {userPosts.length > 0 && (
                        <div className="user-posts-section">
                            <h2 className="section-title">Bài viết của bạn</h2>
                            {userPosts.map((post) => (
                                <div key={post.id} className="user-post-card">
                                    <div className="post-header">
                                        <div className="post-avatar-small">
                                            {post.avatar ? (
                                                <img src={post.avatar} alt={post.author} />
                                            ) : (
                                                <span className="post-avatar-initials-small">
                                                    {post.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="post-author-info">
                                            <span className="post-author-name">{post.author}</span>
                                            <span className="post-time">{formatTime(post.timestamp)}</span>
                                        </div>
                                    </div>
                                    <div className="post-content-text">{post.content}</div>
                                    <div className="post-actions">
                                        <button className="post-action-btn">
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                            </svg>
                                            <span>{post.likes}</span>
                                        </button>
                                        <button className="post-action-btn">
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                                <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                                            </svg>
                                            <span>{post.comments}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Featured Questions */}
                    <div className="featured-questions">
                        {featuredQuestions.map((question) => (
                            <div key={question.id} className="featured-question-card">
                                <h3 className="featured-question-title">
                                    <a href={`/posts/${question.id}`}>{question.title}</a>
                                </h3>
                                <p className="featured-question-excerpt">{question.excerpt}</p>
                                <div className="featured-question-footer">
                                    <div className="featured-tags">
                                        {question.tags.map((tag, index) => (
                                            <span key={index} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="featured-meta">
                                        <span className="featured-author">{question.author}</span>
                                        <span className="featured-reputation">{question.reputation}k</span>
                                        <span className="featured-time">asked {question.askedTime}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside className="home-right-sidebar">
                    <div className="tags-widget">
                        <h3 className="widget-title">Tags</h3>
                        <div className="tags-list">
                            <a href="#" className="tag-item">
                                <span className="tag-name">c++</span>
                            </a>
                            <a href="#" className="tag-item">
                                <span className="tag-name">language-lawyer</span>
                            </a>
                            <a href="#" className="tag-item">
                                <span className="tag-name">undefined-behavior</span>
                            </a>
                            <a href="#" className="tag-item">
                                <span className="tag-name">constant-expression</span>
                            </a>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Floating Action Buttons */}
            <div className="floating-buttons">
                <button
                    className="fab fab-primary"
                    title="Create Post"
                    onClick={() => setIsModalOpen(true)}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </button>
                <button
                    className="fab fab-secondary"
                    title="Messages"
                    onClick={() => setIsChatOpen(!isChatOpen)}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                </button>
            </div>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPostCreated={handlePostCreated}
            />

            <ChatBox
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />

            <Footer />
        </div>
    );
};

export default Home;
