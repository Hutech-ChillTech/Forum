import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ImageGrid from '../components/ImageGrid';
import ChatBox from '../components/ChatBox';
import '../styles/Posts.css';
import '../styles/PostDetail.css';

const Posts = () => {
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
    const [questions] = useState([
        {
            id: 1,
            title: 'Java.lang.NoClassDefFoundError: org/eclipse/jetty/util/component/ContainerLifeCycle',
            content: 'I was writing a simple program to send requests to a certain api using java and i decided to use jetty-client for http request handling...',
            author: 'user123',
            tags: ['c++', 'language-lawyer', 'undefined-behavior', 'constant-expression'],
            askedTime: '3 years, 1 month ago',
            modifiedTime: 'today',
            images: ['/images/download.jpg', '/images/download (2).png'],
            likes: 45,
            comments: 12
        },
        {
            id: 2,
            title: 'How to fix authentication error in Spring Boot?',
            content: 'I am getting 401 unauthorized error when trying to access protected endpoints...',
            author: 'developer456',
            tags: ['java', 'spring-boot', 'security'],
            askedTime: '2 days ago',
            modifiedTime: '1 day ago',
            youtube: 'Tn6-PIqc4UM',
            likes: 12,
            comments: 2
        },
        {
            id: 3,
            title: 'React useState not updating immediately',
            content: 'When I call setState, the state variable does not update immediately. Why is this happening?',
            author: 'reactDev789',
            tags: ['javascript', 'reactjs', 'hooks'],
            askedTime: '1 week ago',
            modifiedTime: '3 days ago',
            images: ['/images/download.png', '/images/download.jpg', '/images/download (3).png'],
            likes: 120,
            comments: 48
        },
        {
            id: 4,
            title: 'Best practices for database indexing in PostgreSQL',
            content: 'What are the best practices when creating indexes in PostgreSQL for optimal query performance?',
            author: 'dbAdmin',
            tags: ['postgresql', 'database', 'indexing', 'performance'],
            askedTime: '5 days ago',
            modifiedTime: '2 days ago',
            likes: 3,
            comments: 0
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
                            <div key={question.id} className="question-card" style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                <div className="post-header" style={{ marginBottom: '8px' }}>
                                    <div className="post-avatar-small">
                                        <span className="post-avatar-initials-small">
                                            {question.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </span>
                                    </div>
                                    <div className="post-author-info" style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span className="post-author-name" style={{ marginRight: '8px' }}>{question.author}</span>
                                            <button onClick={() => toggleFollow(question.author)} style={{ background: 'none', border: 'none', color: followedUsers[question.author] ? '#6a737c' : '#0052cc', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', padding: '0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {followedUsers[question.author] ? (
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
                                        <span className="post-time">{question.askedTime}</span>
                                    </div>
                                </div>
                                <div className="question-content" style={{ flexGrow: 1 }}>
                                    <h3 className="question-title">
                                        <a href={`/posts/${question.id}`}>{question.title}</a>
                                    </h3>
                                    <p className="question-excerpt">{question.content}</p>

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

                                    <div className="question-footer">
                                        <div className="question-tags">
                                            {question.tags.map((tag, index) => (
                                                <span key={index} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="post-actions" style={{ marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <button className="post-action-btn" onClick={() => toggleLike(question.id)} style={{ color: likedPosts[question.id] ? '#0066FF' : 'inherit' }}>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                            </svg>
                                            <span>{question.likes + (likedPosts[question.id] ? 1 : 0)}</span>
                                        </button>
                                        <button className="post-action-btn" onClick={() => setExpandedCommentsId(expandedCommentsId === question.id ? null : question.id)}>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                                <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                                            </svg>
                                            <span>{question.comments}</span>
                                        </button>
                                        <button className="post-action-btn" onClick={() => toggleSave(question.id)} style={{ marginLeft: 'auto', color: savedPosts[question.id] ? '#0066FF' : 'inherit' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill={savedPosts[question.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                            <span>{savedPosts[question.id] ? 'Đã lưu' : 'Lưu Bài'}</span>
                                        </button>
                                    </div>

                                    {/* Inline Comments Section Mock */}
                                    {expandedCommentsId === question.id && (
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
                                                        value={commentSortOrder}
                                                        onChange={(e) => setCommentSortOrder(e.target.value)}
                                                        style={{ padding: '6px 12px', borderRadius: '12px', border: '1px solid #babfc4', fontSize: '12px', cursor: 'pointer', outline: 'none' }}
                                                    >
                                                        <option value="newest">Mới nhất</option>
                                                        <option value="oldest">Cũ nhất (Trễ nhất)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: commentSortOrder === 'newest' ? 'column' : 'column-reverse' }}>
                                                <div className="comment-item" style={{ marginTop: '16px', order: 2 }}>
                                                    <div className="comment-user-avatar">
                                                        <img src="/images/download (3).png" alt="avatar" />
                                                    </div>
                                                    <div className="comment-content-wrapper">
                                                        <span className="comment-username">DevGuy</span>
                                                        <div className="comment-bubble">
                                                            <p>Câu hỏi rất thú vị, hóng cao nhân vào giải đáp!</p>
                                                            <div className="comment-actions">
                                                                <button><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 7v7h3V7H2zm4 7h6.5c.6 0 1.2-.4 1.4-1l1.5-4.5c.1-.2.1-.4.1-.5V7c0-.6-.4-1-1-1H9.8L11 3.2c.1-.2.1-.5 0-.8-.1-.2-.4-.4-.7-.4H9.5L6 6v8z" /></svg> 2</button>
                                                                <button className="reply-btn" onClick={() => setReplyingTo(replyingTo === question.id + '_c1' ? null : question.id + '_c1')}><svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 3h10v7H5l-3 3V3z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> Phản hồi</button>
                                                                <button className="more-btn">•••</button>
                                                                <span style={{ fontSize: '11px', color: '#6a737c', marginLeft: 'auto' }}>1 giờ trước</span>
                                                            </div>
                                                            {replyingTo === question.id + '_c1' && (
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
                                                                    <span className="comment-username">{question.author}</span>
                                                                    <div className="comment-bubble">
                                                                        <p>Cảm ơn bạn nhé!</p>
                                                                        <div className="comment-actions">
                                                                            <button><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 7v7h3V7H2zm4 7h6.5c.6 0 1.2-.4 1.4-1l1.5-4.5c.1-.2.1-.4.1-.5V7c0-.6-.4-1-1-1H9.8L11 3.2c.1-.2.1-.5 0-.8-.1-.2-.4-.4-.7-.4H9.5L6 6v8z" /></svg> 0</button>
                                                                            <button className="reply-btn" onClick={() => setReplyingTo(replyingTo === question.id + '_r1' ? null : question.id + '_r1')}><svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 3h10v7H5l-3 3V3z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> Phản hồi</button>
                                                                            <button className="more-btn">•••</button>
                                                                            <span style={{ fontSize: '11px', color: '#6a737c', marginLeft: 'auto' }}>45 phút trước</span>
                                                                        </div>
                                                                        {replyingTo === question.id + '_r1' && (
                                                                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center', animation: 'fadeIn 0.2s ease-out' }}>
                                                                                <input type="text" placeholder={`Phản hồi ${question.author}...`} className="comment-input-area" style={{ border: '1px solid #babfc4', borderRadius: '12px', padding: '6px 10px', height: 'auto', flex: 1, fontSize: '13px' }} autoFocus />
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
                                                            <p>Thử xem lại phiên bản Maven của bạn nhé.</p>
                                                            <div className="comment-actions">
                                                                <button><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 7v7h3V7H2zm4 7h6.5c.6 0 1.2-.4 1.4-1l1.5-4.5c.1-.2.1-.4.1-.5V7c0-.6-.4-1-1-1H9.8L11 3.2c.1-.2.1-.5 0-.8-.1-.2-.4-.4-.7-.4H9.5L6 6v8z" /></svg> 0</button>
                                                                <button className="reply-btn" onClick={() => setReplyingTo(replyingTo === question.id + '_c2' ? null : question.id + '_c2')}><svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 3h10v7H5l-3 3V3z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> Phản hồi</button>
                                                                <button className="more-btn">•••</button>
                                                                <span style={{ fontSize: '11px', color: '#6a737c', marginLeft: 'auto' }}>25 phút trước</span>
                                                            </div>
                                                            {replyingTo === question.id + '_c2' && (
                                                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center', animation: 'fadeIn 0.2s ease-out' }}>
                                                                    <input type="text" placeholder={`Phản hồi luckyluke...`} className="comment-input-area" style={{ border: '1px solid #babfc4', borderRadius: '12px', padding: '6px 10px', height: 'auto', flex: 1, fontSize: '13px' }} autoFocus />
                                                                    <button className="btn-primary" style={{ padding: '6px 12px', height: 'auto', fontSize: '12px' }}>Gửi</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                                <a href={`/posts/${question.id}`} style={{ fontSize: '13px', color: '#0052cc', textDecoration: 'none', fontWeight: '500' }}>Xem tất cả bình luận ở trang chi tiết</a>
                                            </div>
                                        </div>
                                    )}
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



            <button
                className="ai-chat-fab"
                onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Chat AI</span>
            </button>

            <ChatBox
                isOpen={isAIChatOpen}
                onClose={() => setIsAIChatOpen(false)}
            />

            <Footer />
        </div >
    );
};
export default Posts;
