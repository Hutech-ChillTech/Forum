import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import CreatePostModal from '../components/CreatePostModal';
import ChatBox from '../components/ChatBox';
import ImageGrid from '../components/ImageGrid';
import '../styles/Home.css';
import '../styles/PostDetail.css';

const Home = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [expandedCommentsId, setExpandedCommentsId] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [likedPosts, setLikedPosts] = useState({});
    const [savedPosts, setSavedPosts] = useState({});
    const [followedUsers, setFollowedUsers] = useState({});
    const [globalCommentSortOrder, setGlobalCommentSortOrder] = useState('newest');

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
                        onClick={() => setIsModalOpen(true)}
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
                            <h2 className="greeting-text">Xin chào, chia sẻ gì đó nhé!</h2>
                        </div>
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
                                        <div className="post-author-info" style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span className="post-author-name" style={{ marginRight: '8px' }}>{post.author}</span>
                                                <button onClick={() => toggleFollow(post.author)} style={{ background: 'none', border: 'none', color: followedUsers[post.author] ? '#6a737c' : '#0052cc', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', padding: '0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {followedUsers[post.author] ? (
                                                        <>
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                                                            Đang theo dõi
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                                                            Theo dõi
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <span className="post-time">{formatTime(post.timestamp)}</span>
                                        </div>
                                    </div>
                                    {post.contentBlocks ? (
                                        <div className="post-content-blocks" style={{ margin: '12px 0' }}>
                                            {post.contentBlocks.map((block, i) => {
                                                if (block.type === 'text') return <p key={i} style={{ whiteSpace: 'pre-wrap', margin: '8px 0', fontSize: '15px', color: '#3b4045' }}>{block.content}</p>;
                                                if (block.type === 'code') return <pre key={i} style={{ background: '#1e1e1e', color: '#e6e6e6', padding: '16px', borderRadius: '12px', overflowX: 'auto', fontFamily: "Consolas, Monaco, monospace", margin: '8px 0', fontSize: '14px' }}><code>{block.content}</code></pre>;
                                                if (block.type === 'image') return <img key={i} src={block.content} alt="Post content" style={{ width: '100%', borderRadius: '12px', margin: '8px 0', maxHeight: '450px', objectFit: 'contain', backgroundColor: '#e3e6e8' }} />;
                                                return null;
                                            })}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="post-content-text">
                                                <a href={`/posts/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                    {post.content}
                                                </a>
                                            </div>

                                            {post.images && post.images.length > 0 && (
                                                <a href={`/posts/${post.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                                                    <ImageGrid images={post.images} />
                                                </a>
                                            )}

                                            {post.video && (
                                                <a href={`/posts/${post.id}`} style={{ display: 'block' }}>
                                                    <div className="post-media-preview" style={{ margin: '15px 0', width: '100%', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                                                        <video src={post.video} controls style={{ width: '100%', maxHeight: '450px', display: 'block' }} />
                                                    </div>
                                                </a>
                                            )}
                                        </>
                                    )}

                                    <div className="post-actions">
                                        <button className="post-action-btn" onClick={() => toggleLike('userpost_' + post.id)} style={{ color: likedPosts['userpost_' + post.id] ? '#0066FF' : 'inherit' }}>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                            </svg>
                                            <span>{post.likes + (likedPosts['userpost_' + post.id] ? 1 : 0)}</span>
                                        </button>
                                        <button className="post-action-btn" onClick={() => setExpandedCommentsId(expandedCommentsId === post.id ? null : post.id)}>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                                <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                                            </svg>
                                            <span>{post.comments}</span>
                                        </button>
                                        <button className="post-action-btn" onClick={() => toggleSave('userpost_' + post.id)} style={{ marginLeft: 'auto', color: savedPosts['userpost_' + post.id] ? '#0066FF' : 'inherit' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill={savedPosts['userpost_' + post.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                            <span>{savedPosts['userpost_' + post.id] ? 'Đã lưu' : 'Lưu Bài'}</span>
                                        </button>
                                    </div>

                                    {/* Inline Comments Section Mock */}
                                    {expandedCommentsId === post.id && (
                                        <div className="comments-thread" style={{ marginTop: '16px', borderTop: '1px solid #e3e6e8', paddingTop: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e6f0ff', color: '#0052cc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}>
                                                        U
                                                    </div>
                                                    <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                                        <input type="text" placeholder="Thêm bình luận..." className="comment-input-area" style={{ border: '1px solid #babfc4', borderRadius: '12px', padding: '8px 12px', height: 'auto' }} />
                                                        <button className="btn-primary" style={{ padding: '8px 16px', height: 'auto', whiteSpace: 'nowrap' }}>Gửi</button>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
                                                    <label style={{ fontSize: '12px', color: '#6a737c', fontWeight: '500' }}>Sắp xếp:</label>
                                                    <select
                                                        value={globalCommentSortOrder}
                                                        onChange={(e) => setGlobalCommentSortOrder(e.target.value)}
                                                        style={{ padding: '6px 12px', borderRadius: '12px', border: '1px solid #babfc4', fontSize: '12px', cursor: 'pointer', outline: 'none' }}
                                                    >
                                                        <option value="newest">Mới nhất</option>
                                                        <option value="oldest">Cũ nhất (Trễ nhất)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: globalCommentSortOrder === 'newest' ? 'column' : 'column-reverse' }}>
                                                <div className="comment-item" style={{ marginTop: '16px', order: 2 }}>
                                                    <div className="comment-user-avatar">
                                                        <img src="/images/download (3).png" alt="avatar" />
                                                    </div>
                                                    <div className="comment-content-wrapper">
                                                        <span className="comment-username">DevGuy</span>
                                                        <div className="comment-bubble">
                                                            <p>Bài viết rất hay, cảm ơn bạn đã chia sẻ!</p>
                                                            <div className="comment-actions">
                                                                <button><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 7v7h3V7H2zm4 7h6.5c.6 0 1.2-.4 1.4-1l1.5-4.5c.1-.2.1-.4.1-.5V7c0-.6-.4-1-1-1H9.8L11 3.2c.1-.2.1-.5 0-.8-.1-.2-.4-.4-.7-.4H9.5L6 6v8z" /></svg> 2</button>
                                                                <button className="reply-btn" onClick={() => setReplyingTo(replyingTo === post.id + '_c1' ? null : post.id + '_c1')}><svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 3h10v7H5l-3 3V3z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> Phản hồi</button>
                                                                <button className="more-btn">•••</button>
                                                                <span style={{ fontSize: '11px', color: '#6a737c', marginLeft: 'auto' }}>1 giờ trước</span>
                                                            </div>
                                                            {replyingTo === post.id + '_c1' && (
                                                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center', animation: 'fadeIn 0.2s ease-out' }}>
                                                                    <input type="text" placeholder={`Phản hồi DevGuy...`} className="comment-input-area" style={{ border: '1px solid #babfc4', borderRadius: '12px', padding: '6px 10px', height: 'auto', flex: 1, fontSize: '13px' }} autoFocus />
                                                                    <button className="btn-primary" style={{ padding: '6px 12px', height: 'auto', fontSize: '12px' }}>Gửi</button>
                                                                    <button style={{ padding: '6px', height: 'auto', fontSize: '12px', backgroundColor: 'transparent', color: '#6a737c', border: 'none', cursor: 'pointer' }} onClick={() => setReplyingTo(null)}>Hủy</button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Child Comment (Reply) */}
                                                        <div className="comment-replies" style={{ marginTop: '16px' }}>
                                                            <div className="comment-connector"></div>
                                                            <div className="comment-item nested">
                                                                <div className="comment-user-avatar">
                                                                    <img src="/images/download (2).png" alt="avatar" />
                                                                </div>
                                                                <div className="comment-content-wrapper">
                                                                    <span className="comment-username">{post.author}</span>
                                                                    <div className="comment-bubble">
                                                                        <p>Cảm ơn bạn nhé!</p>
                                                                        <div className="comment-actions">
                                                                            <button><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 7v7h3V7H2zm4 7h6.5c.6 0 1.2-.4 1.4-1l1.5-4.5c.1-.2.1-.4.1-.5V7c0-.6-.4-1-1-1H9.8L11 3.2c.1-.2.1-.5 0-.8-.1-.2-.4-.4-.7-.4H9.5L6 6v8z" /></svg> 0</button>
                                                                            <button className="reply-btn" onClick={() => setReplyingTo(replyingTo === post.id + '_r1' ? null : post.id + '_r1')}><svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 3h10v7H5l-3 3V3z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> Phản hồi</button>
                                                                            <button className="more-btn">•••</button>
                                                                            <span style={{ fontSize: '11px', color: '#6a737c', marginLeft: 'auto' }}>45 phút trước</span>
                                                                        </div>
                                                                        {replyingTo === post.id + '_r1' && (
                                                                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center', animation: 'fadeIn 0.2s ease-out' }}>
                                                                                <input type="text" placeholder={`Phản hồi ${post.author}...`} className="comment-input-area" style={{ border: '1px solid #babfc4', borderRadius: '12px', padding: '6px 10px', height: 'auto', flex: 1, fontSize: '13px' }} autoFocus />
                                                                                <button className="btn-primary" style={{ padding: '6px 12px', height: 'auto', fontSize: '12px' }}>Gửi</button>
                                                                                <button style={{ padding: '6px', height: 'auto', fontSize: '12px', backgroundColor: 'transparent', color: '#6a737c', border: 'none', cursor: 'pointer' }} onClick={() => setReplyingTo(null)}>Hủy</button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="comment-item" style={{ marginTop: '16px' }}>
                                                    <div className="comment-user-avatar">
                                                        <img src="/images/download.png" alt="avatar" />
                                                    </div>
                                                    <div className="comment-content-wrapper">
                                                        <span className="comment-username">luckyluke</span>
                                                        <div className="comment-bubble">
                                                            <p>Mình cũng đang gặp lỗi tương tự, fix như thế nào vậy bạn?</p>
                                                            <div className="comment-actions">
                                                                <button><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 7v7h3V7H2zm4 7h6.5c.6 0 1.2-.4 1.4-1l1.5-4.5c.1-.2.1-.4.1-.5V7c0-.6-.4-1-1-1H9.8L11 3.2c.1-.2.1-.5 0-.8-.1-.2-.4-.4-.7-.4H9.5L6 6v8z" /></svg> 0</button>
                                                                <button className="reply-btn" onClick={() => setReplyingTo(replyingTo === post.id + '_c2' ? null : post.id + '_c2')}><svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 3h10v7H5l-3 3V3z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> Phản hồi</button>
                                                                <button className="more-btn">•••</button>
                                                                <span style={{ fontSize: '11px', color: '#6a737c', marginLeft: 'auto' }}>25 phút trước</span>
                                                            </div>
                                                            {replyingTo === post.id + '_c2' && (
                                                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center', animation: 'fadeIn 0.2s ease-out' }}>
                                                                    <input type="text" placeholder={`Phản hồi luckyluke...`} className="comment-input-area" style={{ border: '1px solid #babfc4', borderRadius: '12px', padding: '6px 10px', height: 'auto', flex: 1, fontSize: '13px' }} autoFocus />
                                                                    <button className="btn-primary" style={{ padding: '6px 12px', height: 'auto', fontSize: '12px' }}>Gửi</button>
                                                                    <button style={{ padding: '6px', height: 'auto', fontSize: '12px', backgroundColor: 'transparent', color: '#6a737c', border: 'none', cursor: 'pointer' }} onClick={() => setReplyingTo(null)}>Hủy</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                                <a href={`/posts/${post.id}`} style={{ fontSize: '13px', color: '#0052cc', textDecoration: 'none', fontWeight: '500' }}>Xem tất cả bình luận ở trang chi tiết</a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Featured Questions */}
                    <div className="featured-questions">
                        {featuredQuestions.map((question) => (
                            <div key={question.id} className="featured-question-card" style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                <div className="post-header" style={{ marginBottom: '8px' }}>
                                    <div className="post-avatar-small">
                                        <span className="post-avatar-initials-small">
                                            {question.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </span>
                                    </div>
                                    <div className="post-author-info">
                                        <span className="post-author-name">{question.author}</span>
                                        <span className="post-time">{question.askedTime}</span>
                                    </div>
                                </div>
                                <div className="question-content" style={{ flexGrow: 1 }}>
                                    <h3 className="question-title" style={{ margin: '0 0 5px 0', fontSize: '17px', fontWeight: '400', lineHeight: '1.3' }}>
                                        <a href={`/posts/${question.id}`} style={{ color: '#0052cc', textDecoration: 'none' }}>{question.title}</a>
                                    </h3>
                                    <p className="question-excerpt" style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#3b4045', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{question.excerpt}</p>

                                    {question.images && question.images.length > 0 && (
                                        <a href={`/posts/${question.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                                            <ImageGrid images={question.images} />
                                        </a>
                                    )}

                                    {question.video && (
                                        <div className="question-media-preview" style={{ margin: '10px 0', width: '100%', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                                            <video src={question.video} controls style={{ width: '100%', maxHeight: '450px', display: 'block' }} />
                                        </div>
                                    )}

                                    {question.youtube && (
                                        <div className="question-media-preview" style={{ margin: '10px 0', width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative', paddingTop: '56.25%' }}>
                                            <iframe src={`https://www.youtube.com/embed/${question.youtube}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="YouTube video"></iframe>
                                        </div>
                                    )}

                                    <div className="question-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                                        <div className="question-tags" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {question.tags.map((tag, index) => (
                                                <span key={index} className="tag" style={{ fontSize: '12px', color: '#0052cc', backgroundColor: '#e6f0ff', padding: '6px 12px', borderRadius: '20px' }}>{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="post-actions" style={{ marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <button className="post-action-btn" onClick={() => toggleLike('featured_' + question.id)} style={{ color: likedPosts['featured_' + question.id] ? '#0066FF' : 'inherit' }}>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                            </svg>
                                            <span>{question.likes + (likedPosts['featured_' + question.id] ? 1 : 0) || 0}</span>
                                        </button>
                                        <button className="post-action-btn" onClick={() => setExpandedCommentsId(expandedCommentsId === 'featured_' + question.id ? null : 'featured_' + question.id)}>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                                <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                                            </svg>
                                            <span>{question.comments || 0}</span>
                                        </button>
                                        <button className="post-action-btn" onClick={() => toggleSave('featured_' + question.id)} style={{ marginLeft: 'auto', color: savedPosts['featured_' + question.id] ? '#0066FF' : 'inherit' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill={savedPosts['featured_' + question.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                            <span>{savedPosts['featured_' + question.id] ? 'Đã lưu' : 'Lưu Bài'}</span>
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

            {/* Floating Action Buttons */}
            < div className="floating-buttons" >
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
                    className="ai-chat-fab"
                    style={{ position: 'static' }}
                    onClick={() => setIsChatOpen(!isChatOpen)}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 012 2z" />
                    </svg>
                    <span>Chat AI</span>
                </button>
            </div >

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
        </div >
    );
};

export default Home;
