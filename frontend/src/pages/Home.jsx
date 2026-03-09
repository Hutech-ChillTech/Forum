import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import ImageGrid from '../components/ImageGrid';
import PostCard from '../components/PostCard';
import '../styles/Home.css';
import '../styles/PostDetail.css';

const Home = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [expandedCommentsId, setExpandedCommentsId] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [likedPosts, setLikedPosts] = useState({});
    const [savedPosts, setSavedPosts] = useState({});
    const [followedUsers, setFollowedUsers] = useState({});
    const [globalCommentSortOrder, setGlobalCommentSortOrder] = useState('newest');

    // State for user data synced with localStorage
    const [userData, setUserData] = useState(() => {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                const parsed = JSON.parse(savedProfile);
                return {
                    name: parsed.fullName || parsed.displayName || "Bạn",
                    avatar: parsed.avatar || null
                };
            } catch (e) {
                console.error('Error parsing user profile in Home:', e);
            }
        }
        return {
            name: "Bạn",
            avatar: null
        };
    });

    useEffect(() => {
        const handleProfileUpdate = (e) => {
            const profile = e.detail;
            setUserData({
                name: profile.fullName || profile.displayName,
                avatar: profile.avatar || null
            });
        };

        window.addEventListener('userProfileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    }, []);

    const toggleLike = (id) => setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleSave = (id) => setSavedPosts(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleFollow = (author) => setFollowedUsers(prev => ({ ...prev, [author]: !prev[author] }));

    const [userPosts, setUserPosts] = useState(() => [
        {
            id: 101,
            author: 'Anonymous',
            avatar: '',
            content: 'Góc làm việc hôm nay của mình! Các bạn setup góc code thế nào rồi chia sẻ với nhé 😎💻',
            timestamp: Date.now() - 3600000 * 2, // 2 hours ago
            images: ['/images/download (2).png', '/images/download.jpg', '/images/download.png', '/images/download (3).png', '/images/download (2).png'],
            likes: 15,
            comments: 4
        },
        {
            id: 102,
            author: 'CodeMaster',
            avatar: 'https://ui-avatars.com/api/?name=Code+Master&background=random',
            content: 'Cuối cùng cũng học xong khoá React, mừng rơi nước mắt 😂',
            timestamp: Date.now() - 86400000, // 1 day ago
            images: ['/images/download (3).png'],
            likes: 42,
            comments: 12
        }
    ]);

    // Handle new post creation
    const handlePostCreated = (newPost) => {
        setUserPosts(prevPosts => [newPost, ...prevPosts]);
    };

    useEffect(() => {
        const onGlobalPostCreated = (e) => {
            handlePostCreated(e.detail);
        };
        window.addEventListener('globalPostCreated', onGlobalPostCreated);
        return () => window.removeEventListener('globalPostCreated', onGlobalPostCreated);
    }, []);

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

    // Featured posts mock data
    const [featuredPosts] = useState([
        {
            id: 1,
            title: 'Example of an Implementation-defined core constant expression whose evaluation has runtime undefined behavior',
            excerpt: 'While reading the standard for another language-lawyer question I came across expr.const(5): that I didn\'t understand...',
            tags: ['c++', 'language-lawyer', 'undefined-behavior', 'constant-expression'],
            author: 'Richard',
            askedTime: '2 mins ago',
            images: ['/images/download.jpg', '/images/download (3).png'],
            likes: 45,
            comments: 12
        },
        {
            id: 2,
            title: 'New to Java, having trouble [closed]',
            excerpt: 'I have only been doing javascript for the past 12 or so weeks, and I am having trouble with a college assignment...',
            tags: ['java', 'variables', 'static', 'non-static'],
            author: 'NewJavaLearner',
            askedTime: '2 mins ago',
            youtube: 'grEKMHGYyns',
            likes: 12,
            comments: 2
        },
        {
            id: 3,
            title: 'How do I tell CMake to emit the paths the package config module searched',
            excerpt: 'I\'d had this question: How do I tell CMake to select the package search path I see on more easily using package searches...',
            tags: ['cmake', 'pkg-config', 'build-configuration', 'search-path'],
            author: 'singularity',
            askedTime: '8 mins ago',
            likes: 80,
            comments: 22
        }
    ]);

    return (
        <div className="home-layout">
            <Header />

            <div className="home-container">
                {/* Left Sidebar */}
                <aside className="home-sidebar">
                    <Sidebar activePage="home" />
                </aside>

                {/* Main Content */}
                <main className="home-main">
                    {/* Greeting Card */}
                    <div
                        className="greeting-card"
                        onClick={() => window.dispatchEvent(new CustomEvent('openCreatePost'))}
                    >
                        <div className="avatar-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div className="greeting-input-mock">
                            <h2 className="greeting-text">
                                Xin chào {userData.name.split(' ').pop()}, chia sẻ gì đó nhé!
                            </h2>
                        </div>
                    </div>

                    {/* User Posts */}
                    {userPosts.length > 0 && (
                        <div className="user-posts-section">
                            <h2 className="section-title">Bài viết</h2>
                            {userPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}

                    <div className="featured-questions">
                        <h1 style={{ fontSize: '24px', fontWeight: '400', marginBottom: '15px' }}>Bài viết nổi bật</h1>
                        {featuredPosts.map((post) => (
                            <div key={post.id} className="featured-question-card" style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                <div className="post-header" style={{ marginBottom: '8px' }}>
                                    <div className="post-avatar-small">
                                        <span className="post-avatar-initials-small">
                                            {post.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </span>
                                    </div>
                                    <div className="post-author-info">
                                        <span className="post-author-name">{post.author}</span>
                                        <span className="post-time">{post.askedTime}</span>
                                    </div>
                                </div>
                                <div className="question-content" style={{ flexGrow: 1 }}>
                                    <h3 className="question-title" style={{ margin: '0 0 5px 0', fontSize: '17px', fontWeight: '400', lineHeight: '1.3' }}>
                                        <a href={`/posts/${post.id}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>{post.title}</a>
                                    </h3>
                                    <p className="question-excerpt" style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>

                                    {post.images && post.images.length > 0 && (
                                        <a href={`/posts/${post.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                                            <ImageGrid images={post.images} />
                                        </a>
                                    )}

                                    {post.video && (
                                        <div className="question-media-preview" style={{ margin: '10px 0', width: '100%', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                                            <video src={post.video} controls style={{ width: '100%', maxHeight: '450px', display: 'block' }} />
                                        </div>
                                    )}

                                    {post.youtube && (
                                        <div className="question-media-preview" style={{ margin: '10px 0', width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative', paddingTop: '56.25%' }}>
                                            <iframe src={`https://www.youtube.com/embed/${post.youtube}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="YouTube video"></iframe>
                                        </div>
                                    )}

                                    <div className="question-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                                        <div className="question-tags" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {post.tags.map((tag, index) => (
                                                <span key={index} className="tag" style={{ fontSize: '12px', color: 'var(--primary-color)', backgroundColor: 'var(--secondary-bg)', padding: '6px 12px', borderRadius: '20px' }}>{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="post-actions" style={{ marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <button className="post-action-btn" onClick={() => toggleLike('featured_' + post.id)} style={{ color: likedPosts['featured_' + post.id] ? 'var(--primary-color)' : 'inherit' }}>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                            </svg>
                                            <span>{post.likes + (likedPosts['featured_' + post.id] ? 1 : 0) || 0}</span>
                                        </button>
                                        <button className="post-action-btn" onClick={() => setExpandedCommentsId(expandedCommentsId === 'featured_' + post.id ? null : 'featured_' + post.id)}>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                                <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                                            </svg>
                                            <span>{post.comments || 0}</span>
                                        </button>
                                        <button className="post-action-btn" onClick={() => {
                                            navigator.clipboard.writeText(window.location.origin + '/posts/' + post.id);
                                            alert('Đã sao chép liên kết bài viết!');
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>
                                            </svg>
                                            <span>Chia sẻ</span>
                                        </button>
                                        <button className="post-action-btn" onClick={() => toggleSave('featured_' + post.id)} style={{ marginLeft: 'auto', color: savedPosts['featured_' + post.id] ? 'var(--primary-color)' : 'inherit' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill={savedPosts['featured_' + post.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                            <span>{savedPosts['featured_' + post.id] ? 'Đã lưu' : 'Lưu'}</span>
                                        </button>
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
            </div >

            <button
                className="ai-chat-fab"
                onClick={() => setIsChatOpen(!isChatOpen)}
                title="Chat với AI"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 012 2z" />
                </svg>
            </button>

            <ChatBox
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />

            <Footer />
        </div >
    );
};

export default Home;
