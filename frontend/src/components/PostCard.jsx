import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageGrid from './ImageGrid';
import postService from '../service/postService';
import commentService from '../service/commentService';
import authService from '../service/authService';
import shareService from '../service/shareService';
import savedPostService from '../service/savedPostService';
import { API_BASE_URL } from '../utils/apiFetch.js';

const PostCard = ({ post, hideFollowButton = false, onOpenModal, reviewMode = false, onApprove, onReject }) => {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [submittingSave, setSubmittingSave] = useState(false);
    // Map backend fields to local variables
    const id = post.postId || post.id || post.postID;
    const author = post.userName || post.author;
    const avatar = post.userAvatarURL || post.avatar;
    const isSavedInitial = post.isSaved || false;
    useEffect(() => {
        setIsSaved(isSavedInitial);
    }, [isSavedInitial]);
    const time = post.createdAt || post.timestamp || post.time || post.askedTime;
    const commentCount = post.commentCount !== undefined ? post.commentCount : 0;
    const content = post.content || post.excerpt || "";
    const title = post.title;

    const [localCommentCount, setLocalCommentCount] = useState(commentCount);

    // Parse raw content into blocks if contentBlocks doesn't exist
    const contentBlocks = post.contentBlocks || (() => {
        if (!content) return [];
        const blocks = [];
        // Regex to match images and code blocks anywhere in text
        const parts = content.split(/(!\[image\]\(.*?\)|```[\s\S]*?(?:```|$))/g);

        parts.forEach((part, index) => {
            if (!part) return;

            if (index % 2 !== 0) { // Regex matched groups
                if (part.startsWith('![')) {
                    const url = part.match(/\((.*?)\)/)?.[1];
                    if (url) blocks.push({ type: 'image', content: url });
                } else if (part.startsWith('```')) {
                    const code = part.replace(/^```[^\n]*\n?|```$/g, '');
                    if (code.trim() !== '') {
                        blocks.push({ type: 'code', content: code });
                    }
                }
            } else {
                if (part.trim()) {
                    blocks.push({ type: 'text', content: part }); // Keep original spacing for text
                }
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

    const handleDeletePost = async (e) => {
        e.stopPropagation();
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;

        try {
            setIsDeleting(true);
            await postService.deletePost(id);
            // After success, we can either hide the card or refresh
            // For now, let's just make the card disappear by modifying its state if we had a list,
            // but since this is a child component, we should ideally inform the parent.
            // A simple way is to hide it locally for now if we can't refresh easily.
            setIsDeleted(true);

            // Set flag to force fresh data from server and clear all caches
            sessionStorage.setItem('FORCE_REFRESH_POSTS', 'true');
            sessionStorage.removeItem('home_posts_cache');
            sessionStorage.removeItem('home_page_cache');
            sessionStorage.removeItem('home_scroll_pos');
            sessionStorage.removeItem('posts_page_cache');
            sessionStorage.removeItem('posts_page_num');
            sessionStorage.removeItem('posts_scroll_pos');

            window.location.reload(); // Refresh to update list
        } catch (err) {
            console.error('Failed to delete post:', err);
            // If the post is already gone (404), we should still refresh the UI
            if (err.message?.includes('404') || err.status === 404) {
                sessionStorage.removeItem('home_posts_cache');
                sessionStorage.removeItem('home_page_cache');
                sessionStorage.removeItem('home_scroll_pos');
                sessionStorage.removeItem('posts_page_cache');
                sessionStorage.removeItem('posts_page_num');
                sessionStorage.removeItem('posts_scroll_pos');
                window.location.reload();
            } else {
                alert("Lỗi khi xóa bài viết: " + err.message);
            }
        } finally {
            setIsDeleting(false);
            setShowMenu(false);
        }
    };

    if (isDeleted) return null;

    const handleToggleSave = async (e) => {
        e.stopPropagation();
        if (!authService.isLoggedIn()) {
            navigate('/login');
            return;
        }
        if (submittingSave) return;

        try {
            setSubmittingSave(true);
            if (isSaved) {
                await savedPostService.unbookmarkPost(id);
                setIsSaved(false);
            } else {
                await savedPostService.bookmarkPost(id);
                setIsSaved(true);
            }
        } catch (err) {
            console.error('Lỗi khi lưu bài viết:', err);
            // Optionally, we could show a toast here instead of an alert
        } finally {
            setSubmittingSave(false);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        if (!showMenu && !showShareMenu) return;
        const closeMenu = () => {
            setShowMenu(false);
            setShowShareMenu(false);
        };
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, [showMenu, showShareMenu]);

    const handleShare = async (platform) => {
        const urlToShare = window.location.origin + '/posts/' + (id || '');
        setShowShareMenu(false);

        try {
            if (platform !== 'COPY') {
                await shareService.sharePost(id, { platform });
            }

            if (platform === 'COPY') {
                navigator.clipboard.writeText(urlToShare);
                alert('Đã sao chép liên kết bài viết!');
            } else if (platform === 'FACEBOOK') {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlToShare)}`, '_blank', 'width=600,height=400');
            } else if (platform === 'MESSENGER') {
                window.open(`fb-messenger://share?link=${encodeURIComponent(urlToShare)}`, '_blank', 'width=600,height=400'); // Note: web messenger sharing might differ
            } else if (platform === 'LINKEDIN') {
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlToShare)}`, '_blank', 'width=600,height=400');
            } else if (platform === 'INSTAGRAM') {
                navigator.clipboard.writeText(urlToShare);
                alert('Đã sao chép liên kết. Mở ứng dụng Instagram để chia sẻ!');
            }
        } catch (err) {
            console.error('Lỗi khi chia sẻ:', err);
            // Optionally silently fail or show alert
            alert('Lỗi khi chia sẻ: ' + err.message);
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

    const userId = post.userId;

    const handleAuthorClick = (e) => {
        e.stopPropagation();
        if (userId) {
            navigate(`/profile?id=${userId}`);
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
                <div className="post-avatar-small" onClick={handleAuthorClick} style={{ marginRight: '12px', cursor: 'pointer' }}>
                    {avatar ? (
                        <img src={avatar} alt={author} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <span className="post-avatar-initials-small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                            {author ? author.charAt(0).toUpperCase() : 'U'}
                        </span>
                    )}
                </div>
                <div className="post-author-info" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span
                            className="post-author-name"
                            onClick={handleAuthorClick}
                            style={{
                                marginRight: '8px',
                                fontWeight: 'bold',
                                color: 'var(--text-color)',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-color)'}
                        >
                            {author}
                        </span>
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

                {/* Actions Menu (Three Dots) */}
                {(userProfile?.userId === post.userId || userProfile?.role === 'ADMIN' || userProfile?.role === 'MODERATOR') && (
                    <div className="post-menu-container" style={{ marginLeft: 'auto', position: 'relative' }}>
                        <button
                            className="post-menu-trigger"
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-bg)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                        </button>

                        {showMenu && (
                            <div
                                className="post-dropdown-menu"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    backgroundColor: 'var(--card-bg)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    borderRadius: '8px',
                                    padding: '8px 0',
                                    zIndex: 100,
                                    minWidth: '150px',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                {userProfile?.userId === post.userId && (
                                    <button
                                        className="menu-item"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                            window.dispatchEvent(new CustomEvent('openEditPost', { detail: post }));
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            background: 'none',
                                            border: 'none',
                                            textAlign: 'left',
                                            color: 'var(--text-color)',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontWeight: '500'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-bg)'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                        Chỉnh sửa
                                    </button>
                                )}
                                <button
                                    className="menu-item"
                                    onClick={handleDeletePost}
                                    disabled={isDeleting}
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px',
                                        textAlign: 'left',
                                        background: 'none',
                                        border: 'none',
                                        color: '#ff4d4f',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: '500'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-bg)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                    {isDeleting ? "Đang xóa..." : "Xóa"}
                                </button>
                                {/* Future: Edit post could go here */}
                            </div>
                        )}
                    </div>
                )}
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
            {reviewMode ? (
                <div className="review-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <button
                        className="btn-approve"
                        onClick={(e) => { e.stopPropagation(); onApprove && onApprove(id); }}
                        style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 5 11"></polyline></svg>
                        Duyệt bài
                    </button>
                    <button
                        className="btn-reject"
                        onClick={(e) => { e.stopPropagation(); onReject && onReject(id); }}
                        style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        Từ chối
                    </button>
                </div>
            ) : (
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
                    <div style={{ position: 'relative' }}>
                        <button className="post-action-btn" onClick={(e) => {
                            e.stopPropagation();
                            setShowShareMenu(!showShareMenu);
                        }} style={{ color: 'var(--text-secondary)', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>
                            </svg>
                            <span>Chia sẻ</span>
                        </button>

                        {showShareMenu && (
                            <div
                                className="post-dropdown-menu"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: 'absolute',
                                    bottom: 'calc(100% + 8px)',
                                    left: '0',
                                    backgroundColor: 'var(--card-bg)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    borderRadius: '8px',
                                    padding: '8px 0',
                                    zIndex: 100,
                                    minWidth: '200px',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                <button
                                    className="menu-item"
                                    onClick={(e) => { e.stopPropagation(); handleShare('FACEBOOK'); }}
                                    style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-color)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-bg)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                    Chia sẻ lên Facebook
                                </button>
                                <button
                                    className="menu-item"
                                    onClick={(e) => { e.stopPropagation(); handleShare('MESSENGER'); }}
                                    style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-color)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-bg)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                    Gửi qua Messenger
                                </button>
                                <button
                                    className="menu-item"
                                    onClick={(e) => { e.stopPropagation(); handleShare('LINKEDIN'); }}
                                    style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-color)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-bg)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                    Chia sẻ lên LinkedIn
                                </button>
                                <button
                                    className="menu-item"
                                    onClick={(e) => { e.stopPropagation(); handleShare('INSTAGRAM'); }}
                                    style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-color)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-bg)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                    Đăng lên Instagram
                                </button>
                                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }}></div>
                                <button
                                    className="menu-item"
                                    onClick={(e) => { e.stopPropagation(); handleShare('COPY'); }}
                                    style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-color)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-bg)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    Sao chép liên kết
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        className="post-action-btn"
                        onClick={handleToggleSave}
                        disabled={submittingSave}
                        style={{ marginLeft: 'auto', color: isSaved ? 'var(--primary-color)' : 'var(--text-secondary)', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>{isSaved ? 'Đã lưu' : 'Lưu Bài'}</span>
                    </button>
                </div>
            )}

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
                                                <div
                                                    className="comment-user-avatar"
                                                    onClick={() => navigate(`/profile?id=${comment.userId}`)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {comment.userAvatarURL ? (
                                                        <img src={comment.userAvatarURL} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                                                            {(comment.userName || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="comment-content-wrapper" style={{ flex: 1 }}>
                                                    <span
                                                        className="comment-username"
                                                        onClick={() => navigate(`/profile?id=${comment.userId}`)}
                                                        style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-color)', cursor: 'pointer' }}
                                                        onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
                                                        onMouseLeave={(e) => e.target.style.color = 'var(--text-color)'}
                                                    >
                                                        {comment.userName}
                                                    </span>
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
                                                                    <div
                                                                        className="reply-user-avatar"
                                                                        onClick={() => navigate(`/profile?id=${reply.userId}`)}
                                                                        style={{ cursor: 'pointer' }}
                                                                    >
                                                                        {reply.userAvatarURL ? (
                                                                            <img src={reply.userAvatarURL} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                                                        ) : (
                                                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                                                                                {(reply.userName || 'U').charAt(0).toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="reply-content-wrapper" style={{ flex: 1 }}>
                                                                        <span
                                                                            className="reply-username"
                                                                            onClick={() => navigate(`/profile?id=${reply.userId}`)}
                                                                            style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-color)', cursor: 'pointer' }}
                                                                            onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
                                                                            onMouseLeave={(e) => e.target.style.color = 'var(--text-color)'}
                                                                        >
                                                                            {reply.userName}
                                                                        </span>
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
