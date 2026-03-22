import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import postService from '../service/postService';
import commentService from '../service/commentService';
import authService from '../service/authService';
import likeService from '../service/likeService';
import savedPostService from '../service/savedPostService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ShareModal from '../components/ShareModal';
import { API_BASE_URL } from '../utils/apiFetch.js';
import '../styles/PostDetail.css';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [comments, setComments] = useState([]);
    const [isFollowed, setIsFollowed] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Comment States
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);
    const [replyContent, setReplyContent] = useState("");

    const userProfile = authService.getUser();

    useEffect(() => {
        const fetchPostData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await postService.getPostById(id);
                if (!data) throw new Error('Post not found');

                setPost(data);
                setLikeCount(data.likeCount || data.countLike || 0);
                setIsSaved(data.isSaved || false);

                if (userProfile?.userId) {
                    try {
                        const likeStatus = await likeService.getLikeStatus(id);
                        setIsLiked(likeStatus);
                    } catch (err) {
                        console.error('LikeStatus error:', err);
                    }
                }

                const commentData = await commentService.getCommentsByPost(id);
                const fetchedComments = commentData.content || commentData.comments || (Array.isArray(commentData) ? commentData : []);
                setComments(fetchedComments);
            } catch (err) {
                console.error('Failed to fetch post details:', err);
                setError(err.message === 'Post not found' ? 'Bài viết này không tồn tại hoặc đã bị xóa.' : 'Đã có lỗi xảy ra khi tải bài viết.');
            } finally {
                setLoading(false);
            }
        };

        fetchPostData();
    }, [id, userProfile?.userId]);

    const handleToggleLike = async () => {
        if (!userProfile) {
            alert("Vui lòng đăng nhập để thích bài viết!");
            return;
        }

        const originalIsLiked = isLiked;
        const originalLikeCount = likeCount;

        try {
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            setLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
            await likeService.toggleLike(id);
        } catch (err) {
            console.error('Failed to toggle like:', err);
            // Revert on failure
            setIsLiked(originalIsLiked);
            setLikeCount(originalLikeCount);
        }
    };

    const handleToggleSave = async () => {
        if (!userProfile) {
            navigate('/login');
            return;
        }
        try {
            if (isSaved) {
                await savedPostService.unbookmarkPost(id);
                setIsSaved(false);
            } else {
                await savedPostService.bookmarkPost(id);
                setIsSaved(true);
            }
        } catch (err) {
            console.error('Error saving post:', err);
        }
    };

    const handleCommentSubmit = async (e, parentId = null) => {
        if (e && e.preventDefault) e.preventDefault();

        const contentToPost = parentId ? replyContent : newComment;
        if (!contentToPost.trim() || !userProfile?.userId || submittingComment) return;

        try {
            setSubmittingComment(true);
            const createdComment = await commentService.createComment({
                postId: id,
                userId: userProfile.userId,
                content: contentToPost.trim(),
                parentId: parentId
            });

            if (parentId) {
                // Find parent and add to its replies
                setComments(prev => (prev || []).map(c => {
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
                setComments(prev => [createdComment, ...(prev || [])]);
                setNewComment('');
            }
        } catch (err) {
            console.error('Comment error:', err);
            alert('Lỗi: ' + (err.message || 'Không thể đăng bình luận'));
        } finally {
            setSubmittingComment(false);
        }
    };

    const totalCommentsCount = (comments || []).reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

    const timeAgo = (date) => {
        if (!date) return 'Vừa xong';
        const now = new Date();
        const past = new Date(date);

        if (isNaN(past.getTime())) return 'Vừa xong';

        const diffInMs = now - past;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Vừa xong';
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        return past.toLocaleDateString('vi-VN');
    };

    if (loading) return (
        <div className="post-detail-layout">
            <Header />
            <div className="post-detail-container">
                <main className="post-detail-main">
                    <div className="loader-modern" style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div className="spinner"></div>
                        <p>Đang chuẩn bị nội dung cho bạn...</p>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );

    if (error || !post) return (
        <div className="post-detail-layout">
            <Header />
            <div className="post-detail-container">
                <main className="post-detail-main" style={{ alignItems: 'center', padding: '100px 0' }}>
                    <div className="error-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
                        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-color)' }}>{error || 'Không tìm thấy bài viết'}</h2>
                        <button className="btn-primary" onClick={() => navigate('/')}>Quay lại Trang chủ</button>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );

    const contentBlocks = (() => {
        if (!post || !post.content) return [];
        const content = post.content || "";
        const parts = content.split(/(!\[image\]\(.*?\)|```[\s\S]*? ```)/g);
        return parts.filter(p => p).map(part => {
            const trimmed = part.trim();
            if (trimmed.startsWith('![image](')) return { type: 'image', content: trimmed.match(/\((.*?)\)/)?.[1] };
            if (trimmed.startsWith('```')) return { type: 'code', content: trimmed.replace(/^```\w*\n?|```$/g, '') };
            return { type: 'text', content: part };
        });
    })();

    return (
        <div className="post-detail-layout">
            <Header />
            <div className="post-detail-container">
                <main className="post-detail-main">
                    <article className="post-detail-card-premium">
                        <header className="post-header-premium">
                            <Link to={`/profile?id=${post.userId}`} className="author-avatar-premium">
                                {post.userAvatarURL ? <img src={post.userAvatarURL} alt={post.userName} /> : (post.userName?.[0] || 'U').toUpperCase()}
                            </Link>
                            <div className="author-info-premium">
                                <div className="author-top-line">
                                    <Link to={`/profile?id=${post.userId}`} className="author-name-premium">{post.userName}</Link>
                                    <button className={`follow-btn-premium btn-animate ${isFollowed ? 'followed' : ''}`} onClick={() => setIsFollowed(!isFollowed)}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                                        {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
                                    </button>
                                </div>
                                <span className="post-time-premium">{timeAgo(post.createdAt)}</span>
                            </div>
                            <button className="post-more-options">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                            </button>
                        </header>

                        <h1 className="post-title-premium">{post.title}</h1>

                        <div className="post-content-premium">
                            {contentBlocks.map((block, i) => {
                                if (block.type === 'text') return <p key={i} className="post-text-premium">{block.content}</p>;
                                if (block.type === 'code') return <pre key={i} className="post-code-premium"><code>{block.content}</code></pre>;
                                if (block.type === 'image') {
                                    const src = block.content.startsWith('/uploads/') ? `${API_BASE_URL}${block.content}` : block.content;
                                    return (
                                        <div key={i} className="post-image-container-premium">
                                            <img src={src} alt="" />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>

                        {post.tags && post.tags.length > 0 && (
                            <div className="post-tags-premium">
                                {post.tags.map(tag => <Link key={tag} to={`/tags?name=${tag}`} className="tag-premium">{tag}</Link>)}
                            </div>
                        )}

                        <div className="post-actions-premium">
                            <button className={`post-action-btn-p btn-animate ${isLiked ? 'liked' : ''}`} onClick={handleToggleLike}>
                                <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor">
                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                </svg>
                                <span>{likeCount}</span>
                            </button>
                            <button className="post-action-btn-p btn-animate" style={{ cursor: 'default' }}>
                                <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor">
                                    <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                                </svg>
                                <span>{totalCommentsCount}</span>
                            </button>
                            <button className="post-action-btn-p btn-animate" onClick={() => setIsShareModalOpen(true)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>
                                </svg>
                                <span>Chia sẻ</span>
                            </button>
                            {userProfile?.userId !== post?.userId && (
                                <button className={`post-action-btn-p btn-animate ${isSaved ? 'saved' : ''}`} onClick={handleToggleSave} style={{ marginLeft: 'auto' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                    <span>{isSaved ? 'Đã lưu' : 'Lưu bài'}</span>
                                </button>
                            )}
                        </div>
                    </article>

                    <section className="comments-section-premium">
                        <h3 className="section-title-premium">Thảo luận</h3>

                        <div className="comment-create-premium" style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '12px', marginBottom: '32px' }}>
                            <div className="user-avatar-small" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                                {(userProfile?.userName?.[0] || 'U').toUpperCase()}
                            </div>
                            <div className="comment-input-wrapper" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="text"
                                    className="comment-input-p"
                                    placeholder="Viết bình luận..."
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '24px',
                                        border: '1px solid var(--border-light)',
                                        backgroundColor: '#ffffff',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(e)}
                                />
                                <button
                                    onClick={(e) => handleCommentSubmit(e)}
                                    disabled={!newComment.trim() || submittingComment}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--primary-blue)',
                                        color: 'white',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, opacity 0.2s',
                                        opacity: (!newComment.trim() || submittingComment) ? 0.6 : 1,
                                        flexShrink: 0
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px' }}>
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="comments-list-section" style={{ marginTop: '30px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                                Bình luận ({totalCommentsCount})
                            </h3>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải bình luận...</div>
                            ) : (
                                <div className="comments-thread-detail">
                                    {comments && comments.length > 0 ? (
                                        comments.map(comment => (
                                            <div key={comment.commentId} className="comment-group" style={{ marginBottom: '20px' }}>
                                                <div className="comment-item" style={{ display: 'flex', gap: '12px' }}>
                                                    <div className="comment-avatar" onClick={() => navigate(`/profile?id=${comment.userId}`)} style={{ cursor: 'pointer', flexShrink: 0 }}>
                                                        {comment.userAvatarURL ? (
                                                            <img src={comment.userAvatarURL} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                                                                {(comment.userName || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="comment-content-wrapper" style={{ flex: 1 }}>
                                                        <div className="comment-bubble" style={{ position: 'relative' }}>
                                                            <Link
                                                                to={`/profile?id=${comment.userId}`}
                                                                style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-color)', textDecoration: 'none' }}
                                                            >
                                                                {comment.userName}
                                                            </Link>
                                                            <p style={{ margin: '4px 0', fontSize: '14px', color: 'var(--text-color)', lineHeight: '1.4' }}>{comment.content}</p>
                                                            <div className="comment-actions" style={{ display: 'flex', gap: '12px', marginTop: '6px', alignItems: 'center' }}>
                                                                <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                                                    <svg width="14" height="14" viewBox="0 0 16 16"><path fill="currentColor" d="M2 7v7h3V7H2zm4 7h6.5c.6 0 1.2-.4 1.4-1l1.5-4.5c.1-.2.1-.4.1-.5V7c0-.6-.4-1-1-1H9.8L11 3.2c.1-.2.1-.5 0-.8-.1-.2-.4-.4-.7-.4H9.5L6 6v8z" /></svg> Thích
                                                                </button>
                                                                <button
                                                                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                                                                    onClick={() => setReplyingToCommentId(replyingToCommentId === comment.commentId ? null : comment.commentId)}
                                                                >
                                                                    Phản hồi
                                                                </button>
                                                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>{timeAgo(comment.createdAt)}</span>
                                                            </div>
                                                        </div>

                                                        {/* Reply Input */}
                                                        {replyingToCommentId === comment.commentId && (
                                                            <form onSubmit={(e) => handleCommentSubmit(e, comment.commentId)} style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
                                                                <input
                                                                    type="text"
                                                                    placeholder={`Phản hồi ${comment.userName}...`}
                                                                    style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '8px 12px', flex: 1, outline: 'none', fontSize: '13px', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
                                                                    value={replyContent}
                                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '12px', border: 'none', background: 'var(--primary-color)', color: 'white', cursor: 'pointer' }}
                                                                    disabled={submittingComment || !replyContent.trim()}
                                                                >
                                                                    Gửi
                                                                </button>
                                                            </form>
                                                        )}

                                                        {/* Child Replies */}
                                                        {comment.replies && comment.replies.length > 0 && (
                                                            <div className="replies-list" style={{ marginTop: '12px', borderLeft: '2px solid var(--border-color)', paddingLeft: '16px' }}>
                                                                {comment.replies.map(reply => (
                                                                    <div key={reply.commentId} className="reply-item" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                                                        <div className="reply-avatar" onClick={() => navigate(`/profile?id=${reply.userId}`)} style={{ cursor: 'pointer', flexShrink: 0 }}>
                                                                            {reply.userAvatarURL ? (
                                                                                <img src={reply.userAvatarURL} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                                                            ) : (
                                                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                                                                                    {(reply.userName || 'U').charAt(0).toUpperCase()}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="reply-content-wrapper" style={{ flex: 1 }}>
                                                                            <Link
                                                                                to={`/profile?id=${reply.userId}`}
                                                                                style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-color)', textDecoration: 'none' }}
                                                                            >
                                                                                {reply.userName}
                                                                            </Link>
                                                                            <div className="reply-bubble" style={{ fontSize: '13px', marginTop: '2px' }}>
                                                                                <p style={{ margin: 0, color: 'var(--text-color)', lineHeight: '1.4' }}>{reply.content}</p>
                                                                                <div className="reply-actions" style={{ display: 'flex', gap: '10px', marginTop: '4px', alignItems: 'center' }}>
                                                                                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{timeAgo(reply.createdAt)}</span>
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
                                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Chưa có bình luận nào.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
            <ShareModal
                post={post}
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />
            <Footer />
        </div>
    );
};

export default PostDetail;
