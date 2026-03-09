import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import '../styles/PostDetail.css';

const PostDetail = () => {
    const { id } = useParams();
    const [isSaved, setIsSaved] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);
    const [upvoteState, setUpvoteState] = useState(0); // 1, 0, -1
    const [replyingTo, setReplyingTo] = useState(null);
    const [commentSortOrder, setCommentSortOrder] = useState('newest');

    // Mock data for the specific question
    const [question] = useState({
        id: id || 1,
        title: 'Java.lang.NoClassDefFoundError: org/eclipse/jetty/util/component/ContainerLifeCycle',
        content: `
            <p>I was writing a simple program to send requests to a certain api using java and i decided to use jetty-client for http request handling. So I added the dependency in my pom.xml.</p>
            <pre><code>
<dependency>
    <groupId>org.eclipse.jetty</groupId>
    <artifactId>jetty-client</artifactId>
    <version>9.4.44.v20210927</version>
</dependency>
            </code></pre>
            <p>But when I run the application, I keep getting a NoClassDefFoundError for ContainerLifeCycle. Any ideas what might be causing this issue?</p>
        `,
        image: '../images/download.jpg',
        author: {
            name: 'user123',
            avatar: 'U',
            reputation: 154
        },
        votes: 12,
        views: 216,
        tags: ['java', 'maven', 'jetty'],
        askedTime: '3 years, 1 month ago',
        modifiedTime: 'today'
    });

    const [comments, setComments] = useState([
        {
            id: 1,
            author: 'luckyluke',
            avatar: '/images/download (3).png',
            content: 'Im sorry I am really new to java and I have never worked with maven before so could you please dumb down the answer a bit.',
            likes: 1,
            timestamp: Date.now() - 3600000 * 5, // 5 hours ago
            replies: [
                {
                    id: 11,
                    author: 'luckyluke',
                    avatar: '/images/download (2).png',
                    content: 'Oh nvm I figured it out!',
                    likes: 1
                },
                {
                    id: 12,
                    author: 'Jane Doe',
                    avatar: '/images/download.png',
                    content: 'Glad you got it working!',
                    likes: 0
                }
            ]
        },
        {
            id: 2,
            author: 'John Smith',
            avatar: '/images/download (3).png',
            content: 'This was a really helpful tutorial, thanks for sharing this workaround.',
            likes: 5,
            timestamp: Date.now() - 3600000 * 24, // 1 day ago
            replies: []
        }
    ]);

    const sortedComments = [...comments].sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        if (commentSortOrder === 'newest') {
            return timeB - timeA;
        } else {
            return timeA - timeB;
        }
    });
    const [newComment, setNewComment] = useState("");
    const [showCommentEditor, setShowCommentEditor] = useState(false);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const newComObj = {
            id: Date.now(),
            author: 'You (Guest)',
            avatar: '/images/download.jpg',
            content: newComment,
            likes: 0,
            timestamp: Date.now(),
            replies: []
        };
        setComments([...comments, newComObj]);
        setNewComment("");
        setShowCommentEditor(false);
    };

    // Mock data for answers
    const [answers] = useState([
        {
            id: 101,
            content: `
                <p>This usually happens when there is a mismatch in versions of different Jetty components. If you are using Spring Boot, it might be bringing in transitively a different version of Jetty.</p>
                <p>Try running <code>mvn dependency:tree</code> to check for conflicting versions of Jetty artifacts.</p>
            `,
            author: {
                name: 'expertJava',
                avatar: 'E',
                reputation: '45.2k'
            },
            votes: 24,
            isAccepted: true,
            answeredTime: '3 years ago'
        },
        {
            id: 102,
            content: `
                <p>I faced the exact same issue. In my case, adding <code>jetty-util</code> explicitly in my pom.xml solved the problem.</p>
            `,
            author: {
                name: 'devGuy',
                avatar: 'D',
                reputation: 890
            },
            votes: 2,
            isAccepted: false,
            answeredTime: '2 years ago'
        }
    ]);

    return (
        <div className="post-detail-layout">
            <Header />

            <div className="post-detail-container">
                {/* Left Sidebar */}
                <aside className="post-detail-sidebar">
                    <Sidebar activePage="posts" />
                </aside>

                {/* Main Content */}
                <main className="post-detail-main">
                    {/* Question Header */}
                    <div className="question-header-top">
                        <h1 className="question-header-title">{question.title}</h1>
                        <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('openCreatePost'))}>Tạo bài viết</button>
                    </div>

                    <div className="question-meta-bar">
                        <div className="meta-info">
                            <span className="meta-label">Đã đăng</span>
                            <span className="meta-value">{question.askedTime}</span>
                        </div>
                        <div className="meta-info">
                            <span className="meta-label">Hoạt động</span>
                            <span className="meta-value">{question.modifiedTime}</span>
                        </div>
                        <div className="meta-info">
                            <span className="meta-label">Lượt xem</span>
                            <span className="meta-value">{question.views} lần</span>
                        </div>
                    </div>

                    <div className="post-content-layout">
                        {/* Vote Column */}
                        <div className="vote-col">
                            <button className="vote-btn" title="This question shows research effort; it is useful and clear"
                                onClick={() => setUpvoteState(upvoteState === 1 ? 0 : 1)}
                                style={{ color: upvoteState === 1 ? '#0066FF' : 'inherit' }}>
                                <svg width="36" height="36" viewBox="0 0 36 36"><path d="M2 25h32L18 9 2 25Z" fill="currentColor"></path></svg>
                            </button>
                            <div className="vote-count">{question.votes + upvoteState}</div>
                            <button className="vote-btn" title="This question does not show any research effort; it is unclear or not useful"
                                onClick={() => setUpvoteState(upvoteState === -1 ? 0 : -1)}
                                style={{ color: upvoteState === -1 ? '#0066FF' : 'inherit' }}>
                                <svg width="36" height="36" viewBox="0 0 36 36"><path d="M2 11h32L18 27 2 11Z" fill="currentColor"></path></svg>
                            </button>
                            <button className="bookmark-btn" title="Save to reading list"
                                onClick={() => setIsSaved(!isSaved)}
                                style={{ color: isSaved ? '#0066FF' : '#babfc4' }}>
                                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 17V3c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v14l-6-4-6 4Z" fill="currentColor"></path></svg>
                            </button>
                        </div>

                        {/* Complete Question Content */}
                        <div className="post-cell">
                            <div className="post-author-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '10px' }}>
                                <div className="author-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e6f0ff', color: '#0052cc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {question.author.avatar}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', color: '#0052cc', fontSize: '13px', marginRight: '8px' }}>{question.author.name}</span>
                                        <button onClick={() => setIsFollowed(!isFollowed)} style={{ background: 'none', border: 'none', color: isFollowed ? '#6a737c' : '#0052cc', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', padding: '0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {isFollowed ? (
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
                                    <span style={{ fontSize: '12px', color: '#6a737c' }}>đã đăng vào {question.askedTime}</span>
                                </div>
                            </div>

                            <div className="post-body" dangerouslySetInnerHTML={{ __html: question.content }}></div>

                            {question.image && (
                                <div className="post-image-container" style={{ margin: '15px 0' }}>
                                    <img src={question.image} alt="Post preview" style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '500px', objectFit: 'contain' }} />
                                </div>
                            )}

                            <div className="post-tags-container">
                                {question.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>

                            <div className="post-author-row">
                                <div className="post-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Đã sao chép liên kết bài viết!');
                                    }} style={{ background: 'none', border: 'none', color: '#6a737c', cursor: 'pointer', padding: '0', fontSize: '13px' }} className="post-action-link">Chia sẻ</button>
                                    <a href="#" className="post-action-link" style={{ textDecoration: 'none' }}>Chỉnh sửa</a>
                                    <button onClick={() => setIsSaved(!isSaved)} style={{ background: 'none', border: 'none', color: isSaved ? '#0066FF' : '#6a737c', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }} className="post-action-link">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                        {isSaved ? 'Đã lưu' : 'Lưu'}
                                    </button>
                                </div>
                                <div className="author-card">
                                    <div className="author-timestamp">asked {question.askedTime}</div>
                                    <div className="author-info-box">
                                        <div className="author-avatar">{question.author.avatar}</div>
                                        <div className="author-details">
                                            <a href="#" className="author-name">{question.author.name}</a>
                                            <span className="author-reputation">{question.author.reputation}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="comments-section-container">
                                <div className="signup-alert">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M9 17A8 8 0 109 1a8 8 0 000 16zM9 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1z" fill="#3D5AFE" />
                                    </svg>
                                    <span>Sign up to request clarification or add additional context in comments.</span>
                                    <button className="alert-close">×</button>
                                </div>

                                <button className="add-comment-btn" onClick={() => setShowCommentEditor(!showCommentEditor)}>
                                    {showCommentEditor ? "Cancel comment" : "Add a comment"}
                                </button>

                                {showCommentEditor && (
                                    <div className="comment-editor-container" style={{ marginBottom: '16px' }}>
                                        <div className="editor-toolbar">
                                            <button style={{ fontFamily: 'serif', fontWeight: 'bold' }}>A</button>
                                            <button><strong>B</strong></button>
                                            <button><em>I</em></button>
                                            <button style={{ fontFamily: 'monospace' }}>&lt;/&gt;</button>
                                            <div className="toolbar-divider"></div>
                                            <button>🔗</button>
                                            <button>”</button>
                                            <button>🖼</button>
                                            <div className="toolbar-divider"></div>
                                            <button>≡</button>
                                            <button>1.</button>
                                            <button>?</button>
                                        </div>
                                        <textarea
                                            className="comment-input-area"
                                            rows="4"
                                            placeholder="Type your comment here..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        ></textarea>
                                        <div style={{ padding: '8px 12px', borderTop: '1px solid #e3e6e8', display: 'flex', justifyContent: 'flex-end' }}>
                                            <button
                                                className="btn-primary"
                                                onClick={handleAddComment}
                                                disabled={!newComment.trim()}
                                                style={{ opacity: !newComment.trim() ? 0.6 : 1 }}
                                            >
                                                Submit Comment
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="comments-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3>{comments.length} Comments</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '13px', color: '#6a737c', fontWeight: '500' }}>Sắp xếp:</label>
                                        <select
                                            value={commentSortOrder}
                                            onChange={(e) => setCommentSortOrder(e.target.value)}
                                            style={{ padding: '6px 12px', borderRadius: '12px', border: '1px solid #babfc4', fontSize: '13px', cursor: 'pointer', outline: 'none' }}
                                        >
                                            <option value="newest">Mới nhất</option>
                                            <option value="oldest">Cũ nhất (Trễ nhất)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="comments-thread">
                                    {sortedComments.map(comment => (
                                        <div key={comment.id} className="comment-item" style={{ marginTop: '16px' }}>
                                            <div className="comment-user-avatar">
                                                <img src={comment.avatar} alt={comment.author} />
                                            </div>
                                            <div className="comment-content-wrapper">
                                                <span className="comment-username">{comment.author}</span>
                                                <div className="comment-bubble">
                                                    <p>{comment.content}</p>
                                                    <div className="comment-actions">
                                                        <button><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 7v7h3V7H2zm4 7h6.5c.6 0 1.2-.4 1.4-1l1.5-4.5c.1-.2.1-.4.1-.5V7c0-.6-.4-1-1-1H9.8L11 3.2c.1-.2.1-.5 0-.8-.1-.2-.4-.4-.7-.4H9.5L6 6v8z" /></svg> {comment.likes || 0}</button>
                                                        <button className="reply-btn" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}><svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 3h10v7H5l-3 3V3z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> Reply</button>
                                                        <button className="more-btn">•••</button>
                                                    </div>
                                                    {replyingTo === comment.id && (
                                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center', animation: 'fadeIn 0.2s ease-out' }}>
                                                            <input type="text" placeholder={`Reply to ${comment.author}...`} className="comment-input-area" style={{ border: '1px solid #babfc4', borderRadius: '12px', padding: '6px 10px', height: 'auto', flex: 1, fontSize: '13px' }} autoFocus />
                                                            <button className="btn-primary" style={{ padding: '6px 12px', height: 'auto', fontSize: '12px' }}>Submit</button>
                                                            <button style={{ padding: '6px', height: 'auto', fontSize: '12px', backgroundColor: 'transparent', color: '#6a737c', border: 'none', cursor: 'pointer' }} onClick={() => setReplyingTo(null)}>Cancel</button>
                                                        </div>
                                                    )}
                                                </div>

                                                {comment.replies && comment.replies.length > 0 && (
                                                    <div className="comment-replies">
                                                        <div className="comment-connector"></div>

                                                        {comment.replies.map(reply => (
                                                            <div key={reply.id} className="comment-item nested">
                                                                <div className="comment-user-avatar">
                                                                    <img src={reply.avatar} alt={reply.author} />
                                                                </div>
                                                                <div className="comment-content-wrapper">
                                                                    <span className="comment-username">{reply.author}</span>
                                                                    <div className="comment-bubble">
                                                                        <p>{reply.content}</p>
                                                                        <div className="comment-actions">
                                                                            <button><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 7v7h3V7H2zm4 7h6.5c.6 0 1.2-.4 1.4-1l1.5-4.5c.1-.2.1-.4.1-.5V7c0-.6-.4-1-1-1H9.8L11 3.2c.1-.2.1-.5 0-.8-.1-.2-.4-.4-.7-.4H9.5L6 6v8z" /></svg> {reply.likes || 0}</button>
                                                                            <button className="reply-btn" onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}><svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 3h10v7H5l-3 3V3z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> Phản hồi</button>
                                                                            <button className="more-btn">•••</button>
                                                                        </div>
                                                                        {replyingTo === reply.id && (
                                                                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center', animation: 'fadeIn 0.2s ease-out' }}>
                                                                                <input type="text" placeholder={`Reply to ${reply.author}...`} className="comment-input-area" style={{ border: '1px solid #babfc4', borderRadius: '12px', padding: '6px 10px', height: 'auto', flex: 1, fontSize: '13px' }} autoFocus />
                                                                                <button className="btn-primary" style={{ padding: '6px 12px', height: 'auto', fontSize: '12px' }}>Submit</button>
                                                                                <button style={{ padding: '6px', height: 'auto', fontSize: '12px', backgroundColor: 'transparent', color: '#6a737c', border: 'none', cursor: 'pointer' }} onClick={() => setReplyingTo(null)}>Cancel</button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Answers Section */}
                    <div className="answers-header">
                        <h2>{answers.length} Câu trả lời</h2>
                        <div className="sort-container">
                            <label>Sorted by:</label>
                            <select className="sort-select">
                                <option>Highest score (default)</option>
                                <option>Trending (recent votes count more)</option>
                                <option>Date modified (newest first)</option>
                                <option>Date created (oldest first)</option>
                            </select>
                        </div>
                    </div>

                    {answers.map(answer => (
                        <div key={answer.id} className="post-content-layout answer-item">
                            {/* Answer Vote Column */}
                            <div className="vote-col">
                                <button className="vote-btn">
                                    <svg width="36" height="36" viewBox="0 0 36 36"><path d="M2 25h32L18 9 2 25Z" fill="currentColor"></path></svg>
                                </button>
                                <div className="vote-count">{answer.votes}</div>
                                <button className="vote-btn">
                                    <svg width="36" height="36" viewBox="0 0 36 36"><path d="M2 11h32L18 27 2 11Z" fill="currentColor"></path></svg>
                                </button>
                                {answer.isAccepted && (
                                    <div className="accepted-mark" title="The question owner accepted this as the best answer">
                                        <svg width="36" height="36" viewBox="0 0 36 36"><path d="m6 14 8 8L30 6v8L14 30l-8-8v-8Z" fill="#2e7d32"></path></svg>
                                    </div>
                                )}
                            </div>

                            {/* Answer Content */}
                            <div className="post-cell">
                                <div className="post-body" dangerouslySetInnerHTML={{ __html: answer.content }}></div>

                                <div className="post-author-row answer-author-row">
                                    <div className="post-actions">
                                        <a href="#" className="post-action-link">Share</a>
                                        <a href="#" className="post-action-link">Edit</a>
                                        <a href="#" className="post-action-link">Follow</a>
                                    </div>
                                    <div className="author-card">
                                        <div className="author-timestamp">answered {answer.answeredTime}</div>
                                        <div className="author-info-box">
                                            <div className="author-avatar" style={{ backgroundColor: '#e6f0ff', color: '#0052cc' }}>{answer.author.avatar}</div>
                                            <div className="author-details">
                                                <a href="#" className="author-name">{answer.author.name}</a>
                                                <span className="author-reputation">{answer.author.reputation}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Your Answer Form */}
                    <div className="your-answer-section">
                        <h2>Câu trả lời của bạn</h2>
                        <div className="editor-container">
                            <textarea className="answer-textarea" rows="10" placeholder="Viết câu trả lời của bạn tại đây..."></textarea>
                        </div>
                        <button className="btn-primary post-answer-btn">Gửi câu trả lời</button>
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside className="post-detail-right-sidebar">
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

export default PostDetail;
