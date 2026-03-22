import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import postService from '../service/postService';
import commentService from '../service/commentService';
import authService from '../service/authService';
import likeService from '../service/likeService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ShareModal from '../components/ShareModal';
import { API_BASE_URL } from '../utils/apiFetch.js';
import '../styles/PostDetail.css';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Interaction States
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);
    
    // Comment States
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    const userProfile = authService.getUser();

    useEffect(() => {
        const fetchPostAndData = async () => {
            try {
                setLoading(true);
                const postData = await postService.getPostById(id);
                setPost(postData);
                setLikeCount(postData.countLike || 0);

                // Fetch extra data in parallel
                const [commentData, likeStatus] = await Promise.all([
                    commentService.getCommentsByPost(id),
                    userProfile ? likeService.getLikeStatus(id) : Promise.resolve(false)
                ]);
                
                setComments(commentData.comments || []);
                setIsLiked(likeStatus);
            } catch (err) {
                console.error('DEBUG: Error details:', err);
                setError(err.message === 'Post not found' ? 'Bài viết này không tồn tại hoặc đã bị xóa.' : 'Đã có lỗi xảy ra khi tải bài viết.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPostAndData();
    }, [id, userProfile?.userId]);

    const handleToggleLike = async () => {
        if (!userProfile) {
            alert("Vui lòng đăng nhập để thích bài viết!");
            return;
        }

        try {
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            setLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
            await likeService.toggleLike(id);
        } catch (err) {
            console.error('Failed to toggle like:', err);
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1));
        }
    };

    const handleCommentSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!newComment.trim() || !userProfile?.userId || submittingComment) return;

        try {
            setSubmittingComment(true);
            const createdComment = await commentService.createComment({
                postId: id,
                userId: userProfile.userId,
                content: newComment.trim()
            });

            setComments(prev => [createdComment, ...prev]);
            setNewComment('');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) return (
        <div className="post-detail-layout">
            <Header />
            <div className="post-detail-container">
                <main className="post-detail-main">
                    <div className="loader-modern">
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
        const content = post.content || "";
        const parts = content.split(/(!\[image\]\(.*?\)|```[\s\S]*?```)/g);
        return parts.filter(p => p).map(part => {
            const trimmed = part.trim();
            if (trimmed.startsWith('![image](')) return { type: 'image', content: trimmed.match(/\((.*?)\)/)?.[1] };
            if (trimmed.startsWith('```')) return { type: 'code', content: trimmed.replace(/^```\w*\n?|```$/g, '') };
            return { type: 'text', content: part };
        });
    })();

    const timeAgo = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now - past;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Vừa xong';
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        return past.toLocaleDateString('vi-VN');
    };

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
                                    <button className={`follow-btn-premium ${isFollowed ? 'followed' : ''}`} onClick={() => setIsFollowed(!isFollowed)}>
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
                            <button className={`post-action-btn-p ${isLiked ? 'liked' : ''}`} onClick={handleToggleLike}>
                                <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor">
                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                </svg>
                                <span>{likeCount}</span>
                            </button>
                            <button className="post-action-btn-p" style={{ cursor: 'default' }}>
                                <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor">
                                    <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                                </svg>
                                <span>{comments.length}</span>
                            </button>
                            <button className="post-action-btn-p" onClick={() => setIsShareModalOpen(true)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>
                                </svg>
                                <span>Chia sẻ</span>
                            </button>
                            <button className={`post-action-btn-p ${isSaved ? 'saved' : ''}`} onClick={() => setIsSaved(!isSaved)} style={{ marginLeft: 'auto' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span>{isSaved ? 'Đã lưu' : 'Lưu Bài'}</span>
                            </button>
                        </div>
                    </article>

                    <section className="comments-section-premium">
                        <h3 className="section-title-premium">Thảo luận</h3>
                        
                        <div className="comment-create-premium">
                            <div className="user-avatar-small">
                                {(userProfile?.userName?.[0] || 'U').toUpperCase()}
                            </div>
                            <div className="comment-form-premium">
                                <textarea
                                    className="comment-textarea-premium"
                                    placeholder="Viết bình luận của bạn..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <div className="comment-form-footer">
                                    <button className="btn-primary" onClick={handleCommentSubmit} disabled={!newComment.trim() || submittingComment}>
                                        {submittingComment ? 'Đang gửi...' : 'Gửi'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="comments-list-premium">
                            {comments.map(comment => (
                                <div key={comment.commentId} className="comment-item-premium">
                                    <div className="comment-avatar-p">
                                        {comment.userAvatarURL ? <img src={comment.userAvatarURL} alt="" /> : (comment.userName?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <div className="comment-content-p">
                                        <div className="comment-header-p">
                                            <Link to={`/profile?id=${comment.userId}`} className="comment-author-p">{comment.userName}</Link>
                                            <span className="comment-time-p">• {timeAgo(comment.createdAt)}</span>
                                        </div>
                                        <div className="comment-bubble-p">
                                            <p>{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
            <ShareModal 
                post={post} 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
            />
        </div>
    );
};

export default PostDetail;
