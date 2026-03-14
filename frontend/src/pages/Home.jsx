import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import ImageGrid from '../components/ImageGrid';
import PostCard from '../components/PostCard';
import postService from '../service/postService';
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

    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch posts from API
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const data = await postService.getPublishedPosts(0, 20);
                // Backend returns list in 'posts' field based on buildPageResponse
                setUserPosts(data.posts || []);
            } catch (err) {
                console.error('Failed to fetch posts:', err);
                setError('Không thể tải bài viết. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Handle new post creation
    const handlePostCreated = (newPost) => {
        // newPost is already the format from API (PostResponse)
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
        if (!timestamp) return 'vừa xong';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return 'vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return `${Math.floor(diff / 86400)} ngày trước`;
    };

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
                                Xin chào {(userData.name || "bạn").split(' ').pop()}, chia sẻ gì đó nhé!
                            </h2>
                        </div>
                    </div>

                    {/* User Posts */}
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Đang tải bài viết...
                        </div>
                    ) : userPosts.length > 0 ? (
                        <div className="user-posts-section">
                            <h2 className="section-title">Bài viết</h2>
                            {userPosts.map((post) => (
                                <PostCard key={post.postId || post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: 'var(--card-bg)', borderRadius: '12px', marginBottom: '20px' }}>
                            Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!
                        </div>
                    )}

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
