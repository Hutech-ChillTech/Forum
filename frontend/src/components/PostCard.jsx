import React, { useState } from 'react';
import ImageGrid from './ImageGrid';

const PostCard = ({ post, hideFollowButton = false }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [sortOrder, setSortOrder] = useState('newest');

    // Helper function to format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return 'vừa xong';
        if (typeof timestamp === 'string') return timestamp; // If passed as "2 mins ago"
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return `${Math.floor(diff / 86400)} ngày trước`;
    };

    return (
        <div className="user-post-card" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e3e6e8', marginBottom: '16px' }}>
            <div className="post-header" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div className="post-avatar-small" style={{ marginRight: '12px' }}>
                    {post.avatar ? (
                        <img src={post.avatar} alt={post.author} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <span className="post-avatar-initials-small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e6f0ff', color: '#0052cc', fontWeight: 'bold' }}>
                            {post.author ? post.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                        </span>
                    )}
                </div>
                <div className="post-author-info" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="post-author-name" style={{ marginRight: '8px', fontWeight: 'bold', color: '#0c0d0e' }}>{post.author}</span>
                        {!hideFollowButton && (
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
                        )}
                    </div>
                    <span className="post-time" style={{ fontSize: '12px', color: '#6a737c' }}>{formatTime(post.timestamp || post.time || post.askedTime)}</span>
                </div>
            </div>

            {post.title && (
                <h3 className="question-title" style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                    <a href={`/posts/${post.id}`} style={{ color: '#0052cc', textDecoration: 'none' }}>{post.title}</a>
                </h3>
            )}

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
                        <a href={`/posts/${post.id}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block', fontSize: '15px', lineHeight: '1.5', marginBottom: '12px' }}>
                            {post.content || post.excerpt}
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

            {post.tags && post.tags.length > 0 && (
                <div className="question-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div className="question-tags" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {post.tags.map((tag, index) => (
                            <span key={index} className="tag" style={{ fontSize: '12px', color: '#0052cc', backgroundColor: '#e6f0ff', padding: '6px 12px', borderRadius: '20px' }}>{tag}</span>
                        ))}
                    </div>
                </div>
            )}

            <div className="post-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '16px', borderTop: '1px solid #e3e6e8', paddingTop: '12px' }}>
                <button className="post-action-btn" onClick={() => setIsLiked(!isLiked)} style={{ color: isLiked ? '#0066FF' : '#6a737c', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span>{(post.likes || 0) + (isLiked ? 1 : 0)}</span>
                </button>
                <button className="post-action-btn" onClick={() => setIsExpanded(!isExpanded)} style={{ color: '#6a737c', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                    </svg>
                    <span>{post.comments || 0}</span>
                </button>
                <button className="post-action-btn" onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + '/posts/' + (post.id || ''));
                    alert('Đã sao chép liên kết bài viết!');
                }} style={{ color: '#6a737c', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    <span>Chia sẻ</span>
                </button>
                <button className="post-action-btn" onClick={() => setIsSaved(!isSaved)} style={{ marginLeft: 'auto', color: isSaved ? '#0066FF' : '#6a737c', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>{isSaved ? 'Đã lưu' : 'Lưu Bài'}</span>
                </button>
            </div>

            {/* Inline Comments Section Mock */}
            {isExpanded && (
                <div className="comments-thread" style={{ marginTop: '16px', borderTop: '1px solid #e3e6e8', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e6f0ff', color: '#0052cc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}>
                                U
                            </div>
                            <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                <input type="text" placeholder="Thêm bình luận..." className="comment-input-area" style={{ border: '1px solid #babfc4', borderRadius: '12px', padding: '8px 12px', height: 'auto', flex: 1, outline: 'none' }} />
                                <button className="btn-primary" style={{ padding: '8px 16px', height: 'auto', whiteSpace: 'nowrap', border: 'none', borderRadius: '12px', background: '#0066FF', color: 'white', cursor: 'pointer' }}>Gửi</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
                            <label style={{ fontSize: '12px', color: '#6a737c', fontWeight: '500' }}>Sắp xếp:</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                style={{ padding: '6px 12px', borderRadius: '12px', border: '1px solid #babfc4', fontSize: '12px', cursor: 'pointer', outline: 'none' }}
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: sortOrder === 'newest' ? 'column' : 'column-reverse' }}>
                        <div className="comment-item" style={{ marginTop: '16px', order: 2, display: 'flex', gap: '12px' }}>
                            <div className="comment-user-avatar">
                                <img src="/images/download (3).png" alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                            </div>
                            <div className="comment-content-wrapper" style={{ flex: 1 }}>
                                <span className="comment-username" style={{ fontWeight: 'bold', fontSize: '13px' }}>DevGuy</span>
                                <div className="comment-bubble" style={{ fontSize: '14px', marginTop: '4px' }}>
                                    <p style={{ margin: 0 }}>Bài viết rất hay, cảm ơn bạn đã chia sẻ!</p>
                                    <div className="comment-actions" style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                                        <button style={{ background: 'none', border: 'none', color: '#6a737c', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}><svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M2 7v7h3V7H2zm4 7h6.5c.6 0 1.2-.4 1.4-1l1.5-4.5c.1-.2.1-.4.1-.5V7c0-.6-.4-1-1-1H9.8L11 3.2c.1-.2.1-.5 0-.8-.1-.2-.4-.4-.7-.4H9.5L6 6v8z" /></svg> 2</button>
                                        <button style={{ background: 'none', border: 'none', color: '#6a737c', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }} onClick={() => setReplyingTo(replyingTo === post.id + '_c1' ? null : post.id + '_c1')}><svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 3h10v7H5l-3 3V3z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> Phản hồi</button>
                                        <span style={{ fontSize: '11px', color: '#6a737c', marginLeft: 'auto' }}>1 giờ trước</span>
                                    </div>
                                    {replyingTo === post.id + '_c1' && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
                                            <input type="text" placeholder={`Phản hồi DevGuy...`} style={{ border: '1px solid #babfc4', borderRadius: '12px', padding: '6px 10px', flex: 1, outline: 'none', fontSize: '13px' }} autoFocus />
                                            <button style={{ background: '#0066FF', color: 'white', border: 'none', borderRadius: '12px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Gửi</button>
                                            <button style={{ background: 'none', border: 'none', color: '#6a737c', cursor: 'pointer', fontSize: '12px' }} onClick={() => setReplyingTo(null)}>Hủy</button>
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
    );
};

export default PostCard;
