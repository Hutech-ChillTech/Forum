import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import postService from '../service/postService';
import commentService from '../service/commentService';
import authService from '../service/authService';
import shareService from '../service/shareService';
import likeService from '../service/likeService';
import savedPostService from '../service/savedPostService';
import { API_BASE_URL } from '../utils/apiFetch.js';
import '../styles/PostDetailModal.css';

const PostDetailModal = ({ postId, onClose, isFullPage = false }) => {
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [localCommentCount, setLocalCommentCount] = useState(0);

    const userProfile = authService.getUser();

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const postData = await postService.getPostById(postId);
                setPost(postData);
                setIsSaved(postData.isSaved || false);
                setLikesCount(postData.countLike || postData.likes || 0);

                // Set like status - in a real app you might need a separate API call 
                // but checking postData initial state for now
                if (postData.isLiked !== undefined) {
                    setIsLiked(postData.isLiked);
                }

                setCommentLoading(true);
                const commentData = await commentService.getCommentsByPost(postId);
                const fetchedComments = commentData.content || commentData.comments || (Array.isArray(commentData) ? commentData : []);
                setComments(fetchedComments);

                // Calculate total comments for initialization
                const initialCommentCount = fetchedComments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
                setLocalCommentCount(initialCommentCount);
            } catch (err) {
                console.error('Failed to fetch post modal data:', err);
            } finally {
                setLoading(false);
                setCommentLoading(false);
            }
        };

        if (postId) fetchData();
    }, [postId]);

    // Handle synchronization from background
    useEffect(() => {
        const onLikeToggled = (e) => {
            if (String(e.detail.postId) === String(postId)) {
                setIsLiked(e.detail.isLiked);
                setLikesCount(e.detail.likeCount);
            }
        };

        const onCommentCreatedExternal = (e) => {
            // Check if it's the same post but from external dispatch
            // If it's already handled locally in handleCommentSubmit, we don't want to double count
            // but usually events are for other components.
            // Let's just update local count if the event came from outside this component's handleCommentSubmit.
            if (String(e.detail.postId) === String(postId)) {
                // If it's a new comment being added to the list, we might already have updated localCommentCount
                // However, PostCard listens to this. We mainly want to synchronize Home -> Modal.
                // Let's check if the comment matches any in our list if needed? 
                // Simple version: refresh total count
            }
        };

        window.addEventListener('likeToggled', onLikeToggled);
        return () => window.removeEventListener('likeToggled', onLikeToggled);
    }, [postId]);

    const handleCommentSubmit = async (e, parentId = null) => {
        if (e) e.preventDefault();

        const contentToPost = parentId ? replyContent : newComment;
        if (!contentToPost.trim() || !userProfile?.userId || submittingComment) return;

        try {
            setSubmittingComment(true);
            const createdComment = await commentService.createComment({
                postId: postId,
                userId: userProfile.userId,
                content: contentToPost.trim(),
                parentId: parentId
            });

            if (parentId) {
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
            const newTotalCount = localCommentCount + 1;
            setLocalCommentCount(newTotalCount);

            // Notify other components
            window.dispatchEvent(new CustomEvent('commentCreated', {
                detail: { postId: postId, comment: createdComment, totalCount: newTotalCount }
            }));
        } catch (err) {
            console.error('Comment failed:', err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const timeAgo = (date) => {
        if (!date) return 'vừa xong';
        const now = new Date();
        const past = new Date(date);
        const seconds = Math.floor((now - past) / 1000);

        if (isNaN(seconds)) return 'vừa xong';

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " năm trước";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " tháng trước";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " ngày trước";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " giờ trước";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " phút trước";
        return Math.floor(seconds) + " giây trước";
    };

    const handleToggleLike = async () => {
        if (!userProfile) return;
        const previousLiked = isLiked;
        const previousCount = likesCount;

        try {
            const newLiked = !isLiked;
            const newCount = newLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

            setIsLiked(newLiked);
            setLikesCount(newCount);

            // Dispatch for synchronization
            window.dispatchEvent(new CustomEvent('likeToggled', {
                detail: { postId: postId, isLiked: newLiked, likeCount: newCount }
            }));

            await likeService.toggleLike(postId);
        } catch (err) {
            console.error('Failed to toggle like:', err);
            setIsLiked(previousLiked);
            setLikesCount(previousCount);
            window.dispatchEvent(new CustomEvent('likeToggled', {
                detail: { postId: postId, isLiked: previousLiked, likeCount: previousCount }
            }));
        }
    };

    const handleToggleSave = async () => {
        if (!userProfile) return;
        try {
            if (isSaved) {
                await savedPostService.unbookmarkPost(postId);
                setIsSaved(false);
            } else {
                await savedPostService.bookmarkPost(postId);
                setIsSaved(true);
            }
        } catch (err) {
            console.error('Failed to save post:', err);
        }
    };

    const totalCommentsCount = localCommentCount;

    const handleDeletePost = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;

        try {
            await postService.deletePost(postId);

            // Set flag and clear possible post list caches to ensure fresh data after reload
            sessionStorage.setItem('FORCE_REFRESH_POSTS', 'true');
            sessionStorage.removeItem('home_posts_cache');
            sessionStorage.removeItem('home_page_cache');
            sessionStorage.removeItem('home_scroll_pos');
            sessionStorage.removeItem('posts_page_cache');
            sessionStorage.removeItem('posts_page_num');
            sessionStorage.removeItem('posts_scroll_pos');

            onClose();
            window.location.reload();
        } catch (err) {
            console.error('Failed to delete post:', err);
            // If the post is already gone (404), refresh the current state
            if (err.message?.includes('404') || err.status === 404) {
                sessionStorage.removeItem('home_posts_cache');
                sessionStorage.removeItem('home_page_cache');
                sessionStorage.removeItem('home_scroll_pos');
                sessionStorage.removeItem('posts_page_cache');
                sessionStorage.removeItem('posts_page_num');
                sessionStorage.removeItem('posts_scroll_pos');
                onClose();
                window.location.reload();
            } else {
                alert("Lỗi khi xóa bài viết: " + err.message);
            }
        }
    };

    const [showMenu, setShowMenu] = useState(false);

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
        const urlToShare = window.location.origin + '/posts/' + (postId || '');
        setShowShareMenu(false);

        try {
            if (platform !== 'COPY') {
                await shareService.sharePost(postId, { platform });
            }

            if (platform === 'COPY') {
                navigator.clipboard.writeText(urlToShare);
                alert('Đã sao chép liên kết bài viết!');
            } else if (platform === 'FACEBOOK') {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlToShare)}`, '_blank', 'width=600,height=400');
            } else if (platform === 'MESSENGER') {
                window.open(`fb-messenger://share?link=${encodeURIComponent(urlToShare)}`, '_blank', 'width=600,height=400');
            } else if (platform === 'LINKEDIN') {
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlToShare)}`, '_blank', 'width=600,height=400');
            } else if (platform === 'INSTAGRAM') {
                navigator.clipboard.writeText(urlToShare);
                alert('Đã sao chép liên kết. Mở ứng dụng Instagram để chia sẻ!');
            }
        } catch (err) {
            console.error('Lỗi khi chia sẻ:', err);
            alert('Lỗi khi chia sẻ: ' + err.message);
        }
    };

    if (loading || !post) {
        return (
            <div className="post-modal-overlay" onClick={onClose}>
                <div className="post-modal-container" onClick={e => e.stopPropagation()} style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div className="loader">Đang tải...</div>
                </div>
            </div>
        );
    }

    // Extract all images from content
    const images = (() => {
        const foundImages = [];
        const content = post.content || "";
        const regex = /!\[image\]\((.*?)\)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const url = match[1];
            foundImages.push(url.startsWith('/uploads/') ? `${API_BASE_URL}${url}` : url);
        }
        return foundImages.length > 0 ? foundImages : (post.imageURL ? [post.imageURL.startsWith('/uploads/') ? `${API_BASE_URL}${post.imageURL}` : post.imageURL] : []);
    })();

    // Parse text and code blocks
    const contentBlocks = (() => {
        const content = post.content || "";
        const blocks = [];
        const parts = content.split(/(!\[image\]\(.*?\)|```[\s\S]*?(?:```|$))/g);

        parts.forEach((part, index) => {
            if (!part) return;

            if (index % 2 !== 0) {
                if (part.startsWith('![')) {
                    // Ignore images here as they are shown on the left theater container
                } else if (part.startsWith('```')) {
                    const code = part.replace(/^```[^\n]*\n?|```$/g, '');
                    if (code.trim() !== '') {
                        blocks.push({ type: 'code', content: code });
                    }
                }
            } else {
                if (part.trim()) {
                    blocks.push({ type: 'text', content: part });
                }
            }
        });
        return blocks;
    })();

    const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);

    const authorName = post.userName || "Người dùng";
    const authorAvatar = post.userAvatarURL;

    return (
        <div className="post-modal-overlay" onClick={onClose}>
            <div className="post-modal-container" onClick={e => e.stopPropagation()}>
                <button className="post-modal-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                {/* Left: Theater Mode */}
                <div className="post-modal-theater">
                    {images.length > 0 ? (
                        <div className="post-modal-image-wrapper">
                            <img src={images[currentImageIndex]} alt="" className="post-modal-main-image" />
                            {images.length > 1 && (
                                <>
                                    <button className="post-modal-nav post-modal-prev" onClick={prevImage}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                    </button>
                                    <button className="post-modal-nav post-modal-next" onClick={nextImage}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="post-modal-no-media" style={{ color: 'white' }}>Không có hình ảnh</div>
                    )}
                </div>

                {/* Right: Info & Comments */}
                <div className="post-modal-details">
                    <div className="post-modal-details-scroll">
                        <div className="post-modal-header">
                            <div
                                className="post-modal-author"
                                onClick={() => { navigate(`/profile?id=${post.userId}`); onClose(); }}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(e) => e.currentTarget.querySelector('.post-modal-author-name').style.color = 'var(--primary-color)'}
                                onMouseLeave={(e) => e.currentTarget.querySelector('.post-modal-author-name').style.color = ''}
                            >
                                {authorAvatar ? (
                                    <img src={authorAvatar} alt="" className="post-modal-avatar" />
                                ) : (
                                    <div className="post-modal-avatar" style={{ backgroundColor: 'var(--secondary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                        {authorName[0]}
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className="post-modal-author-name">{authorName}</span>
                                    <span className="post-modal-time">
                                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>

                            {/* Actions Menu (Three Dots) */}
                            {(userProfile?.userId === post.userId || userProfile?.role === 'ADMIN' || userProfile?.role === 'MODERATOR') && (
                                <div className="post-modal-menu" style={{ marginLeft: 'auto', position: 'relative' }}>
                                    <button
                                        className="post-modal-menu-trigger"
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
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="1"></circle>
                                            <circle cx="12" cy="5" r="1"></circle>
                                            <circle cx="12" cy="19" r="1"></circle>
                                        </svg>
                                    </button>

                                    {showMenu && (
                                        <div
                                            className="post-modal-dropdown"
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowMenu(false);
                                                        onClose();
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
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                    Chỉnh sửa bài viết
                                                </button>
                                            )}
                                            <button
                                                onClick={handleDeletePost}
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
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                                Xóa bài viết
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <h2 className="post-modal-title" style={{ color: 'var(--primary-color)', fontSize: '20px', fontWeight: 'bold', margin: '15px 0 10px 0' }}>{post.title}</h2>
                        <div className="post-modal-content-blocks" style={{ marginBottom: '20px' }}>
                            {contentBlocks.map((block, i) => {
                                if (block.type === 'text') {
                                    return <p key={i} style={{ whiteSpace: 'pre-wrap', margin: '8px 0', fontSize: '15px', color: 'var(--text-color)', lineHeight: '1.5' }}>{block.content}</p>;
                                }
                                if (block.type === 'code') {
                                    return <pre key={i} style={{ background: '#1e1e1e', color: '#e6e6e6', padding: '16px', borderRadius: '12px', overflowX: 'auto', fontFamily: "Consolas, Monaco, monospace", margin: '8px 0', fontSize: '14px' }}><code>{block.content}</code></pre>;
                                }
                                return null;
                            })}
                        </div>

                        {post.tags && post.tags.length > 0 && (
                            <div className="post-modal-tags">
                                {post.tags.map(tag => (
                                    <span key={tag} className="post-modal-tag">#{tag}</span>
                                ))}
                            </div>
                        )}

                        <div className="post-modal-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center', width: '100%' }}>
                            <button className="post-modal-action-btn" onClick={handleToggleLike} style={{ color: isLiked ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                </svg>
                                <span>{likesCount}</span>
                            </button>
                            <button className="post-action-btn-p btn-animate" style={{ cursor: 'default' }}>
                                <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor">
                                    <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                                </svg>
                                <span>{totalCommentsCount}</span>
                            </button>
                            <div style={{ position: 'relative' }}>
                                <button className="post-modal-action-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    setShowShareMenu(!showShareMenu);
                                }} style={{ color: 'var(--text-secondary)' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>
                                    </svg>
                                    <span>Chia sẻ</span>
                                </button>

                                {showShareMenu && (
                                    <div
                                        className="post-modal-dropdown"
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
                                            onClick={(e) => { e.stopPropagation(); handleShare('FACEBOOK'); }}
                                            style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-color)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                            Chia sẻ lên Facebook
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleShare('MESSENGER'); }}
                                            style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-color)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                            Gửi qua Messenger
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleShare('LINKEDIN'); }}
                                            style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-color)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                            Chia sẻ lên LinkedIn
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleShare('INSTAGRAM'); }}
                                            style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-color)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                            Đăng lên Instagram
                                        </button>
                                        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }}></div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleShare('COPY'); }}
                                            style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-color)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            Sao chép liên kết
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button className="post-modal-action-btn" onClick={handleToggleSave} style={{ marginLeft: 'auto', color: isSaved ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span>{isSaved ? 'Đã lưu' : 'Lưu'}</span>
                            </button>
                        </div>

                        <div className="post-modal-comments-section">
                            <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Bình luận ({totalCommentsCount})</h3>

                            <form className="post-modal-comment-input" onSubmit={handleCommentSubmit}>
                                <div className="post-modal-avatar" style={{ width: '32px', height: '32px', backgroundColor: 'var(--secondary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                                    {userProfile ? (userProfile.fullName || 'U')[0] : 'U'}
                                </div>
                                <input
                                    type="text"
                                    className="post-modal-comment-field"
                                    placeholder="Viết bình luận..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    disabled={submittingComment}
                                />
                                <button type="submit" className="post-modal-comment-submit" disabled={!newComment.trim() || submittingComment}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </form>

                            <div className="post-modal-comments-list">
                                {comments.length > 0 ? (isFullPage ? comments : comments.slice(0, 10)).map(comment => (
                                    <div key={comment.commentId} className="post-modal-comment-item">
                                        <div
                                            className="post-modal-avatar"
                                            style={{ width: '32px', height: '32px', flexShrink: 0, cursor: 'pointer' }}
                                            onClick={() => { navigate(`/profile?id=${comment.userId}`); onClose(); }}
                                        >
                                            {comment.userAvatarURL ? (
                                                <img src={comment.userAvatarURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                                                    {comment.userName?.[0] || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="post-modal-comment-wrapper" style={{ flex: 1 }}>
                                            <div className="comment-bubble-p" style={{ position: 'relative' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                                    <span
                                                        className="post-modal-comment-user"
                                                        style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                                                        onClick={() => { navigate(`/profile?id=${comment.userId}`); onClose(); }}
                                                    >
                                                        {comment.userName}
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-gray)' }}>{timeAgo(comment.createdAt)}</span>
                                                </div>
                                                <div style={{ fontSize: '14px', lineHeight: '1.4', color: 'var(--text-color)' }}>{comment.content}</div>

                                                <div className="comment-actions" style={{ display: 'flex', gap: '12px', marginTop: '6px', alignItems: 'center' }}>
                                                    <button className="btn-animate" style={{ background: 'none', border: 'none', color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px' }}>
                                                        <svg width="12" height="12" viewBox="0 0 16 16"><path fill="currentColor" d="M2 7v7h3V7H2zm4 7h6.5c.6 0 1.2-.4 1.4-1l1.5-4.5c.1-.2.1-.4.1-.5V7c0-.6-.4-1-1-1H9.8L11 3.2c.1-.2.1-.5 0-.8-.1-.2-.4-.4-.7-.4H9.5L6 6v8z" /></svg> Thích
                                                    </button>
                                                    <button
                                                        className="btn-animate"
                                                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '11px', fontWeight: '500' }}
                                                        onClick={() => setReplyingToCommentId(replyingToCommentId === comment.commentId ? null : comment.commentId)}
                                                    >
                                                        Phản hồi
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Reply Input Box */}
                                            {replyingToCommentId === comment.commentId && (
                                                <form onSubmit={(e) => handleCommentSubmit(e, comment.commentId)} style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
                                                    <input
                                                        type="text"
                                                        placeholder={`Phản hồi ${comment.userName}...`}
                                                        style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '6px 10px', flex: 1, outline: 'none', fontSize: '12px', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
                                                        value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="submit"
                                                        className="btn-primary btn-animate"
                                                        style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', cursor: 'pointer' }}
                                                        disabled={submittingComment || !replyContent.trim()}
                                                    >
                                                        Gửi
                                                    </button>
                                                </form>
                                            )}

                                            {/* Child Replies */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="replies-list" style={{ marginTop: '10px', borderLeft: '1.5px solid var(--border-color)', paddingLeft: '12px' }}>
                                                    {comment.replies.map(reply => (
                                                        <div key={reply.commentId} className="reply-item-modal" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                            <div className="post-modal-avatar" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                                                {reply.userAvatarURL ? (
                                                                    <img src={reply.userAvatarURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                                                ) : (
                                                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                                                                        {reply.userName?.[0] || 'U'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="reply-content-wrapper" style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                                    <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{reply.userName}</span>
                                                                    <span style={{ fontSize: '10px', color: 'var(--text-gray)' }}>{timeAgo(reply.createdAt)}</span>
                                                                </div>
                                                                <div className="reply-bubble" style={{ fontSize: '12px', marginTop: '2px', color: 'var(--text-color)' }}>
                                                                    <p style={{ margin: 0, lineHeight: '1.4' }}>{reply.content}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-secondary)', fontSize: '14px' }}>Chưa có bình luận nào.</div>
                                )}
                                {(!isFullPage && comments.length > 10) && (
                                    <button
                                        onClick={() => { navigate(`/posts/${postId}`); onClose(); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', padding: '0' }}
                                    >
                                        Xem thêm bình luận...
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;
