import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import postService from '../service/postService';
import commentService from '../service/commentService';
import authService from '../service/authService';
import { API_BASE_URL } from '../utils/apiFetch.js';
import '../styles/PostDetailModal.css';

const PostDetailModal = ({ postId, onClose }) => {
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

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

                setCommentLoading(true);
                const commentData = await commentService.getCommentsByPost(postId);
                setComments(commentData.comments || []);
            } catch (err) {
                console.error('Failed to fetch post modal data:', err);
            } finally {
                setLoading(false);
                setCommentLoading(false);
            }
        };

        if (postId) fetchData();
    }, [postId]);

    const handleCommentSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!newComment.trim() || !userProfile?.userId || submittingComment) return;

        try {
            setSubmittingComment(true);
            const createdComment = await commentService.createComment({
                postId: postId,
                userId: userProfile.userId,
                content: newComment.trim()
            });
            setComments(prev => [createdComment, ...prev]);
            setNewComment('');

            // Notify other components (like PostCard) to update comment count
            window.dispatchEvent(new CustomEvent('commentCreated', {
                detail: { postId: postId, comment: createdComment }
            }));
        } catch (err) {
            console.error('Comment failed:', err);
        } finally {
            setSubmittingComment(false);
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
                            <div className="post-modal-author">
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
                        </div>

                        <h2 className="post-modal-title">{post.title}</h2>
                        <div className="post-modal-content">
                            {post.content.replace(/!\[image\]\(.*?\)/g, '')}
                        </div>

                        {post.tags && post.tags.length > 0 && (
                            <div className="post-modal-tags">
                                {post.tags.map(tag => (
                                    <span key={tag} className="post-modal-tag">#{tag}</span>
                                ))}
                            </div>
                        )}

                        <div className="post-modal-actions">
                            <button className="post-modal-action-btn" onClick={() => setIsLiked(!isLiked)} style={{ color: isLiked ? 'var(--primary-color)' : '' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                Thích
                            </button>
                            <button className="post-modal-action-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                Bình luận
                            </button>
                            <button className="post-modal-action-btn" onClick={() => { navigate(`/posts/${postId}`); onClose(); }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                Chi tiết
                            </button>
                        </div>

                        <div className="post-modal-comments-section">
                            <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Bình luận ({comments.length})</h3>

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
                                {comments.length > 0 ? comments.slice(0, 10).map(comment => (
                                    <div key={comment.commentId} className="post-modal-comment-item">
                                        <div className="post-modal-avatar" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                                            {comment.userAvatarURL ? (
                                                <img src={comment.userAvatarURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                                                    {comment.userName?.[0] || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="post-modal-comment-bubble">
                                            <span className="post-modal-comment-user">{comment.userName}</span>
                                            {comment.content}
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-secondary)', fontSize: '14px' }}>Chưa có bình luận nào.</div>
                                )}
                                {comments.length > 10 && (
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
