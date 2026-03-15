import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageGrid from './ImageGrid';
import commentService from '../service/commentService';
import authService from '../service/authService';
import { API_BASE_URL } from '../utils/apiFetch.js';

const PostCard = ({ post, hideFollowButton = false, onOpenModal }) => {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    // Map backend fields to local variables
    const id = post.postId || post.id || post.postID;
    const author = post.userName || post.author;
    const avatar = post.userAvatarURL || post.avatar;
    const time = post.createdAt || post.timestamp || post.time || post.askedTime;
    const commentCount = post.commentCount !== undefined ? post.commentCount : (post.comments !== undefined ? post.comments : 0);
    const content = post.content || post.excerpt || "";
    const title = post.title;

    const [localCommentCount, setLocalCommentCount] = useState(commentCount);

    // Parse raw content into blocks if contentBlocks doesn't exist
    const contentBlocks = post.contentBlocks || (() => {
        if (!content) return [];
        const blocks = [];
        // Regex to match images and code blocks anywhere in text
        const parts = content.split(/(!\[image\]\(.*?\)|```[\s\S]*?```)/g);

        parts.forEach(part => {
            if (!part) return;

            const trimmedPart = part.trim();
            if (trimmedPart.startsWith('![image](')) {
                const url = trimmedPart.match(/\((.*?)\)/)?.[1];
                if (url) blocks.push({ type: 'image', content: url });
            } else if (trimmedPart.startsWith('```')) {
                const code = trimmedPart.replace(/^```\w*\n?|```$/g, '');
                blocks.push({ type: 'code', content: code });
            } else if (trimmedPart) {
                blocks.push({ type: 'text', content: part }); // Keep original spacing for text
            }
        });
        return blocks.length > 0 ? blocks : [{ type: 'text', content: content }];
    })();

    // Helper function to format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return 'vừa xong';

        let date;
        if (Array.isArray(timestamp)) {
            // Handle [year, month, day] format from Jackson if applicable
            date = new Date(timestamp[0], timestamp[1] - 1, timestamp[2]);
        } else {
            date = new Date(timestamp);
        }

        if (isNaN(date.getTime())) return typeof timestamp === 'string' ? timestamp : 'vừa xong';

        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return `${Math.floor(diff / 86400)} ngày trước`;
    };

    // Fetch comments when expanded
    useEffect(() => {
        if (isExpanded && id) {
            const fetchComments = async () => {
                try {
                    setCommentLoading(true);
                    const data = await commentService.getCommentsByPost(id);
                    // Backend returns list in 'comments' field based on buildPageResponse in CommentController
                    setComments(data.comments || []);
                } catch (err) {
                    console.error('Failed to fetch comments:', err);
                } finally {
                    setCommentLoading(false);
                }
            };
            fetchComments();
        }
    }, [isExpanded, id]);

    const [replyingToCommentId, setReplyingToCommentId] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const userProfile = authService.getUser();

    // Listen for comments added anywhere (especially in the Pop-up modal)
    useEffect(() => {
        const onCommentCreated = (e) => {
            if (String(e.detail.postId) === String(id)) {
                setLocalCommentCount(prev => prev + 1);
            }
        };
        window.addEventListener('commentCreated', onCommentCreated);
        return () => window.removeEventListener('commentCreated', onCommentCreated);
    }, [id]);

    const handleCommentSubmit = async (e, parentId = null) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const contentToPost = parentId ? replyContent : newComment;
        if (!contentToPost.trim() || !userProfile?.userId || submitting) return;

        try {
            setSubmitting(true);
            const createdComment = await commentService.createComment({
                postId: id,
                userId: userProfile.userId,
                content: contentToPost.trim(),
                parentId: parentId
            });

            if (parentId) {
                // Find parent and add to its replies
                setComments(prev => prev.map(c => {
                    if (c.commentId === parentId) {
                        return {
                            ...c,
                            replies: [createdComment, ...(c.replies || [])],
                            replyCount: (c.replyCount || 0) + 1
                        };
                    }
                    return c;
                }));
                setReplyContent('');
                setReplyingToCommentId(null);
            } else {
                setComments(prev => [createdComment, ...prev]);
                setNewComment('');
            }

            // Increment local comment count
            setLocalCommentCount(prev => prev + 1);
        } catch (err) {
            console.error('Failed to post comment:', err);
            alert('Lỗi: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };


    // Regroup blocks to bundle consecutive images
    const groupedBlocks = (() => {
        const result = [];
        let currentImageGroup = [];

        contentBlocks.forEach((block) => {
            if (block.type === 'image') {
                currentImageGroup.push(block.content.startsWith('/uploads/') ? `${API_BASE_URL}${block.content}` : block.content);
            } else {
                if (currentImageGroup.length > 0) {
                    result.push({ type: 'image_grid', images: currentImageGroup });
                    currentImageGroup = [];
                }
                result.push(block);
            }
        });

        if (currentImageGroup.length > 0) {
            result.push({ type: 'image_grid', images: currentImageGroup });
        }
        return result;
    })();

    const handleCardClick = () => {
        if (id) {
            if (onOpenModal) {
                onOpenModal(id);
            } else {
                navigate(`/posts/${id}`);
            }
        }
    };

    return (
        <div
            className="user-post-card"
            onClick={handleCardClick}
            style={{
                backgroundColor: 'var(--card-bg)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--border-color)',
                marginBottom: '16px',
                cursor: 'pointer',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = 'var(--primary-color)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
        >
            <div className="post-header" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div className="post-avatar-small" style={{ marginRight: '12px' }}>
                    {avatar ? (
                        <img src={avatar} alt={author} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <span className="post-avatar-initials-small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                            {author ? author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                        </span>
                    )}
                </div>
                <div className="post-author-info" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="post-author-name" style={{ marginRight: '8px', fontWeight: 'bold', color: 'var(--text-color)' }}>{author}</span>
                        {!hideFollowButton && (
                            <button onClick={(e) => { e.stopPropagation(); setIsFollowed(!isFollowed); }} style={{ background: 'none', border: 'none', color: isFollowed ? 'var(--text-secondary)' : 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', padding: '0', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2 }}>
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
                    <span className="post-time" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatTime(time)}</span>
                </div>
            </div>

            {title && (
                <h3 className="question-title" style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                    <span style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>{title}</span>
                </h3>
            )}

            <div className="post-content-blocks" style={{ margin: '12px 0' }}>
                {groupedBlocks.map((block, i) => {
                    if (block.type === 'text') return <p key={i} style={{ whiteSpace: 'pre-wrap', margin: '8px 0', fontSize: '15px', color: 'var(--text-color)' }}>{block.content}</p>;
                    if (block.type === 'code') return <pre key={i} style={{ background: '#1e1e1e', color: '#e6e6e6', padding: '16px', borderRadius: '12px', overflowX: 'auto', fontFamily: "Consolas, Monaco, monospace", margin: '8px 0', fontSize: '14px' }}><code>{block.content}</code></pre>;
                    if (block.type === 'image' || block.type === 'image_grid') {
                        const images = block.images || [block.content.startsWith('/uploads/') ? `${API_BASE_URL}${block.content}` : block.content];
                        return <ImageGrid key={i} images={images} />;
                    }
                    return null;
                })}
            </div>

            {
                post.tags && post.tags.length > 0 && (
                    <div className="question-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <div className="question-tags" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {post.tags.map((tag, index) => (
                                <span key={index} onClick={(e) => e.stopPropagation()} className="tag" style={{ fontSize: '12px', color: 'var(--primary-color)', backgroundColor: 'var(--secondary-bg)', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer' }}>{tag}</span>
                            ))}
                        </div>
                    </div>
                )
            }

            <div className="post-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button className="post-action-btn" onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }} style={{ color: isLiked ? 'var(--primary-color)' : 'var(--text-secondary)', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span>{(post.likes || 0) + (isLiked ? 1 : 0)}</span>
                </button>
                <button className="post-action-btn" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} style={{ color: 'var(--text-secondary)', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                    </svg>
                    <span>{localCommentCount}</span>
                </button>
                <button className="post-action-btn" onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(window.location.origin + '/posts/' + (id || ''));
                    alert('Đã sao chép liên kết bài viết!');
                }} style={{ color: 'var(--text-secondary)', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    <span>Chia sẻ</span>
                </button>
                <button className="post-action-btn" onClick={(e) => { e.stopPropagation(); setIsSaved(!isSaved); }} style={{ marginLeft: 'auto', color: isSaved ? 'var(--primary-color)' : 'var(--text-secondary)', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>{isSaved ? 'Đã lưu' : 'Lưu Bài'}</span>
                </button>
            </div>

            {/* Inline Comments Section */}
            {
                isExpanded && (
                    <div className="comments-thread" onClick={(e) => e.stopPropagation()} style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', cursor: 'default' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                                <div className="post-avatar-extra-small" style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', flexShrink: 0, overflow: 'hidden' }}>
                                    {userProfile?.avatar ? (
                                        <img src={userProfile.avatar} alt="Me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (userProfile?.fullName || 'U').charAt(0).toUpperCase()
                                    )}
                                </div>
                                <form onSubmit={handleCommentSubmit} style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="Thêm bình luận..."
                                        className="comment-input-area"
                                        style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '8px 12px', height: 'auto', flex: 1, outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        disabled={submitting}
                                    />
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        style={{ padding: '8px 16px', height: 'auto', whiteSpace: 'nowrap', border: 'none', borderRadius: '12px', background: 'var(--primary-color)', color: 'white', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
                                        disabled={submitting || !newComment.trim()}
                                    >
                                        {submitting ? '...' : 'Gửi'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {commentLoading ? (
                            <div style={{ textAlign: 'center', padding: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>Đang tải bình luận...</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {comments.length > 0 ? (
                                    comments.map(comment => (
                                        <div key={comment.commentId} className="comment-group" style={{ marginTop: '16px' }}>
                                            {/* Parent Comment */}
                                            <div className="comment-item" style={{ display: 'flex', gap: '12px' }}>
                                                <div className="comment-user-avatar">
                                                    {comment.userAvatarURL ? (
                                                        <img src={comment.userAvatarURL} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                                                            {(comment.userName || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="comment-content-wrapper" style={{ flex: 1 }}>
                                                    <span className="comment-username" style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-color)' }}>{comment.userName}</span>
                                                    <div className="comment-bubble" style={{ fontSize: '14px', marginTop: '4px' }}>
                                                        <p style={{ margin: 0, color: 'var(--text-color)' }}>{comment.content}</p>
                                                        <div className="comment-actions" style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                                                            <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                                                <svg width="14" height="14" viewBox="0 0 16 16"><path fill="currentColor" d="M2 7v7h3V7H2zm4 7h6.5c.6 0 1.2-.4 1.4-1l1.5-4.5c.1-.2.1-.4.1-.5V7c0-.6-.4-1-1-1H9.8L11 3.2c.1-.2.1-.5 0-.8-.1-.2-.4-.4-.7-.4H9.5L6 6v8z" /></svg> Thích
                                                            </button>
                                                            <button
                                                                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                                                                onClick={() => setReplyingToCommentId(replyingToCommentId === comment.commentId ? null : comment.commentId)}
                                                            >
                                                                Phản hồi
                                                            </button>
                                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>{formatTime(comment.createdAt)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Reply Input */}
                                                    {replyingToCommentId === comment.commentId && (
                                                        <form onSubmit={(e) => handleCommentSubmit(e, comment.commentId)} style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
                                                            <input
                                                                type="text"
                                                                placeholder={`Phản hồi ${comment.userName}...`}
                                                                style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '6px 10px', flex: 1, outline: 'none', fontSize: '13px', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
                                                                value={replyContent}
                                                                onChange={(e) => setReplyContent(e.target.value)}
                                                                autoFocus
                                                                disabled={submitting}
                                                            />
                                                            <button
                                                                type="submit"
                                                                style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', opacity: submitting ? 0.7 : 1 }}
                                                                disabled={submitting || !replyContent.trim()}
                                                            >
                                                                {submitting ? '...' : 'Gửi'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
                                                                onClick={() => setReplyingToCommentId(null)}
                                                            >
                                                                Hủy
                                                            </button>
                                                        </form>
                                                    )}

                                                    {/* Child Replies */}
                                                    {comment.replies && comment.replies.length > 0 && (
                                                        <div className="replies-list" style={{ marginTop: '12px', borderLeft: '2px solid var(--border-color)', paddingLeft: '16px' }}>
                                                            {comment.replies.map(reply => (
                                                                <div key={reply.commentId} className="reply-item" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                                                    <div className="reply-user-avatar">
                                                                        {reply.userAvatarURL ? (
                                                                            <img src={reply.userAvatarURL} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                                                        ) : (
                                                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                                                                                {(reply.userName || 'U').charAt(0).toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="reply-content-wrapper" style={{ flex: 1 }}>
                                                                        <span className="reply-username" style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-color)' }}>{reply.userName}</span>
                                                                        <div className="reply-bubble" style={{ fontSize: '13px', marginTop: '2px' }}>
                                                                            <p style={{ margin: 0, color: 'var(--text-color)' }}>{reply.content}</p>
                                                                            <div className="reply-actions" style={{ display: 'flex', gap: '10px', marginTop: '4px', alignItems: 'center' }}>
                                                                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{formatTime(reply.createdAt)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>Chưa có bình luận nào.</div>
                                )}
                            </div>
                        )}

                        {comments.length > 0 && (
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <span onClick={(e) => { e.stopPropagation(); navigate(`/posts/${id}`); }} style={{ fontSize: '13px', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>Xem tất cả bình luận ở trang chi tiết</span>
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
};

export default PostCard;
