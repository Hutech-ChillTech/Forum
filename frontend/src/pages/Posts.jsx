import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import '../styles/Posts.css';
import '../styles/PostDetail.css';

const Videos = () => {
    const [expandedCommentsId, setExpandedCommentsId] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [likedPosts, setLikedPosts] = useState({});
    const [savedPosts, setSavedPosts] = useState({});
    const [followedUsers, setFollowedUsers] = useState({});
    const [commentSortOrder, setCommentSortOrder] = useState('newest');
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);

    const toggleLike = (id) => setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleSave = (id) => setSavedPosts(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleFollow = (author) => setFollowedUsers(prev => ({ ...prev, [author]: !prev[author] }));

    const [videoPosts] = useState([
        {
            id: 1,
            title: 'Hướng dẫn cài đặt môi trường Java cho người mới bắt đầu',
            excerpt: 'Video này mình sẽ hướng dẫn các bạn cách cài đặt JDK và IntelliJ IDEA một cách chi tiết nhất.',
            author: 'Lập Trình Viên TV',
            tags: ['java', 'tutorial', 'beginner'],
            askedTime: '2 giờ trước',
            youtube: 'Tn6-PIqc4UM',
            likes: 1250,
            comments: 84
        },
        {
            id: 2,
            title: 'Top 5 thư viện React cực hay năm 2024',
            excerpt: 'Chia sẻ các thư viện giúp tăng tốc độ phát triển dự án React của bạn.',
            author: 'Tech Guru',
            tags: ['javascript', 'react', 'frontend'],
            askedTime: '5 giờ trước',
            youtube: 'grEKMHGYyns',
            likes: 840,
            comments: 32
        },
        {
            id: 3,
            title: 'Short: Giải thích nhanh về Docker trong 60 giây',
            excerpt: 'Docker là gì? Tại sao lập trình viên nào cũng cần biết?',
            author: 'Dev Ops Pro',
            tags: ['docker', 'devops', 'shorts'],
            askedTime: '1 ngày trước',
            youtube: 'Tn6-PIqc4UM', // Dùng tạm mock youtube id
            likes: 3200,
            comments: 112,
            isShort: true
        },
        {
            id: 4,
            title: 'Xây dựng ứng dụng Chat Realtime với Socket.io',
            excerpt: 'Hướng dẫn step-by-step xây dựng ứng dụng chat đơn giản.',
            author: 'Code With Me',
            tags: ['nodejs', 'socketio', 'backend'],
            askedTime: '2 ngày trước',
            youtube: 'grEKMHGYyns',
            likes: 560,
            comments: 18
        }
    ]);

    return (
        <div className="posts-layout">
            <Header />

            <div className="posts-container">
                {/* Left Sidebar */}
                <aside className="posts-sidebar">
                    <Sidebar activePage="posts" />
                </aside>

                {/* Main Content */}
                <main className="posts-main">
                    <div className="questions-header">
                        <h1>Khám phá Video</h1>
                        <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('openCreatePost'))}>Tải video lên</button>
                    </div>

                    <div className="questions-toolbar">
                        <div className="questions-count">{videoPosts.length} video</div>
                        <div className="questions-filters">
                            <button className="filter-btn">Dành cho bạn</button>
                            <button className="filter-btn">Mới nhất</button>
                            <button className="filter-btn">Học tập</button>
                            <button className="filter-btn">Shorts</button>
                            <button className="filter-btn">Live</button>
                        </div>
                    </div>

                    <div className="questions-list">
                        {videoPosts.map((post) => (
                            <div key={post.id} className={`question-card ${post.isShort ? 'short-video-style' : ''}`} style={{ display: 'flex', gap: '12px', flexDirection: 'column', backgroundColor: 'var(--card-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <div className="post-header" style={{ marginBottom: '8px' }}>
                                    <div className="post-avatar-small">
                                        <span className="post-avatar-initials-small">
                                            {post.author.slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="post-author-info" style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span className="post-author-name" style={{ marginRight: '8px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{post.author}</span>
                                            <button onClick={() => toggleFollow(post.author)} style={{ background: 'none', border: 'none', color: followedUsers[post.author] ? 'var(--text-secondary)' : 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', padding: '0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {followedUsers[post.author] ? '• Đang theo dõi' : '• Theo dõi'}
                                            </button>
                                        </div>
                                        <span className="post-time" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{post.askedTime}</span>
                                    </div>
                                </div>
                                <div className="question-content" style={{ flexGrow: 1 }}>
                                    <h3 className="question-title" style={{ marginBottom: '8px', fontSize: '18px' }}>
                                        <a href={`/posts/${post.id}`} style={{ textDecoration: 'none', color: 'var(--text-color)' }}>{post.title}</a>
                                    </h3>
                                    <p className="question-excerpt" style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>{post.excerpt}</p>

                                    {post.youtube && (
                                        <div className="question-media-preview" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative', paddingTop: post.isShort ? '177.77%' : '56.25%', maxWidth: post.isShort ? '320px' : '100%', margin: post.isShort ? '10px auto' : '10px 0' }}>
                                            <iframe src={`https://www.youtube.com/embed/${post.youtube}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="YouTube video"></iframe>
                                        </div>
                                    )}

                                    <div className="question-footer">
                                        <div className="question-tags" style={{ display: 'flex', gap: '8px' }}>
                                            {post.tags.map((tag, index) => (
                                                <span key={index} className="tag" style={{ backgroundColor: 'var(--secondary-bg)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>#{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="post-actions" style={{ marginTop: '16px', display: 'flex', gap: '20px', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                                        <button className="post-action-btn" onClick={() => toggleLike(post.id)} style={{ color: likedPosts[post.id] ? 'var(--primary-color)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill={likedPosts[post.id] ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                                            <span style={{ fontWeight: '500' }}>{post.likes + (likedPosts[post.id] ? 1 : 0)}</span>
                                        </button>
                                        <button className="post-action-btn" onClick={() => setExpandedCommentsId(expandedCommentsId === post.id ? null : post.id)} style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                            <span style={{ fontWeight: '500' }}>{post.comments}</span>
                                        </button>
                                        <button className="post-action-btn" onClick={() => {
                                            navigator.clipboard.writeText(window.location.origin + '/posts/' + post.id);
                                            alert('Đã sao chép liên kết video!');
                                        }} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                                            <span style={{ marginLeft: '6px', fontWeight: '500' }}>Chia sẻ</span>
                                        </button>
                                        <button className="post-action-btn" onClick={() => toggleSave(post.id)} style={{ marginLeft: 'auto', color: savedPosts[post.id] ? 'var(--primary-color)' : 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill={savedPosts[post.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                        </button>
                                    </div>

                                    {expandedCommentsId === post.id && (
                                        <div className="comments-thread" style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                                <input type="text" placeholder="Thêm bình luận về video..." className="comment-input-area" style={{ border: '1px solid var(--border-color)', borderRadius: '20px', padding: '10px 16px', flex: 1, backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }} />
                                                <button className="btn-primary" style={{ borderRadius: '20px', padding: '0 20px' }}>Gửi</button>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <a href={`/posts/${post.id}`} style={{ fontSize: '13px', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>Xem tất cả bình luận</a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside className="posts-right-sidebar">
                    <div className="sidebar-widget">
                        <h3 className="widget-title">Trending Videos</h3>
                        <ul className="widget-list">
                            <li><a href="#">Tương lai của AI trong năm 2025</a></li>
                            <li><a href="#">Học Docker trong 10 phút</a></li>
                            <li><a href="#">Tại sao nên dùng Next.js 15?</a></li>
                        </ul>
                    </div>

                    <div className="sidebar-widget">
                        <h3 className="widget-title">Shorts Challenges</h3>
                        <ul className="widget-list">
                            <li><a href="#">#CodeChallenge60s</a></li>
                            <li><a href="#">#DevLifeShorts</a></li>
                        </ul>
                    </div>
                </aside>
            </div>



            <button
                className="ai-chat-fab"
                onClick={() => setIsAIChatOpen(!isAIChatOpen)}
                title="Chat với AI"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>

            <ChatBox
                isOpen={isAIChatOpen}
                onClose={() => setIsAIChatOpen(false)}
            />

            <Footer />
        </div >
    );
};

export default Videos;
