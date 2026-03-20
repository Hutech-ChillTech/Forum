import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import postService from '../service/postService';
import commentService from '../service/commentService';
import authService from '../service/authService';
import reactionService from '../service/reactionService';
import chatService from '../service/chatService';
import userService from '../service/userService';
import ImageGrid from '../components/ImageGrid';
import { API_BASE_URL } from '../utils/apiFetch.js';
import '../styles/PostDetail.css';

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [isProcessingLike, setIsProcessingLike] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    
    const processingActionRef = useRef(false);
    const navigate = useNavigate();

    const userProfile = authService.getUser();

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                setLoading(true);
                const postData = await postService.getPostById(id);
                setPost(postData);
                setLikeCount(postData.likeCount || 0);
                setIsLiked(postData.isLiked || false);

                // Fetch comments
                setCommentLoading(true);
                const commentData = await commentService.getCommentsByPost(id);
                setComments(commentData.comments || []);
            } catch (err) {
                console.error('Error fetching post details:', err);
                setError(err.message);
            } finally {
                setLoading(false);
                setCommentLoading(false);
            }
        };

        if (id) fetchPostAndComments();
    }, [id]);

    const handleLike = async (e) => {
        if (e) e.stopPropagation();
        if (processingActionRef.current) return;
        if (!userProfile?.userId) {
            alert("Vui lòng đăng nhập để thích bài viết");
            return;
        }

        const originalIsLiked = isLiked;
        const originalLikeCount = likeCount;
        const newIsLiked = !isLiked;
        const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

        setIsLiked(newIsLiked);
        setLikeCount(newLikeCount);

        try {
            processingActionRef.current = true;
            setIsProcessingLike(true);
            await reactionService.toggleLike(id);
        } catch (err) {
            console.error('Failed to toggle like:', err);
            setIsLiked(originalIsLiked);
            setLikeCount(originalLikeCount);
        } finally {
            setIsProcessingLike(false);
            processingActionRef.current = false;
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers(0, 50);
            const usersList = data.result?.content || data.content || data.result || [];
            const filteredUsers = usersList.filter(u => u.userId !== userProfile?.userId);
            setUsers(filteredUsers);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleShareOpen = (e) => {
        if (e) e.stopPropagation();
        setIsShareModalOpen(true);
        if (users.length === 0) fetchUsers();
    };

    const handleCopyLink = (e) => {
        if (e) e.stopPropagation();
        const postLink = window.location.origin + '/posts/' + id;
        navigator.clipboard.writeText(postLink);
        alert('Đã sao chép liên kết bài viết!');
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(uid => uid !== userId) 
                : [...prev, userId]
        );
    };

    const handleSendShare = async () => {
        if (selectedUsers.length === 0) return;
        setIsSharing(true);
        try {
            for (const userId of selectedUsers) {
                chatService.sendPostLink(userId, `/posts/${id}`);
            }
            alert(`Đã chia sẻ bài viết tới ${selectedUsers.length} người dùng!`);
            setIsShareModalOpen(false);
            setSelectedUsers([]);
        } catch (err) {
            console.error('Failed to share post:', err);
            alert('Lỗi khi chia sẻ bài viết');
        } finally {
            setIsSharing(false);
        }
    };

    const handleCommentSubmit = async (e, parentId = null) => {
        if (e) e.preventDefault();
        const content = parentId ? replyContent : newComment;
        if (!content.trim() || !userProfile?.userId || submittingComment) return;

        try {
            setSubmittingComment(true);
            const createdComment = await commentService.createComment({
                postId: id,
                userId: userProfile.userId,
                content: content.trim(),
                parentId: parentId
            });

            if (parentId) {
                setComments(prev => prev.map(c => {
                    if (c.commentId === parentId) {
                        return { ...c, replies: [createdComment, ...(c.replies || [])] };
                    }
                    return c;
                }));
                setReplyContent('');
                setReplyingTo(null);
            } else {
                setComments(prev => [createdComment, ...prev]);
                setNewComment('');
            }
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) return (
        <div className="post-detail-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="loader">Đang tải bài viết...</div>
        </div>
    );

    if (error || !post) return (
        <div className="post-detail-container">
            <div style={{ padding: '40px', textAlign: 'center', width: '100%', background: 'var(--card-bg)', borderRadius: '12px' }}>
                <h2>Rất tiếc! Không tìm thấy bài viết.</h2>
                <p>{error || 'Thông tin bài viết không khả dụng.'}</p>
                <Link to="/posts" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>Quay lại danh sách</Link>
            </div>
        </div>
    );

    // Parse content into blocks for rendering (Vertical images)
    const contentBlocks = (() => {
        const content = post.content || "";
        const blocks = [];
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
                blocks.push({ type: 'text', content: part });
            }
        });
        return blocks.length > 0 ? blocks : [{ type: 'text', content: content }];
    })();

    const authorName = post.userName || "Người dùng";
    const authorAvatar = post.userAvatarURL;

    // Redo block grouping for image grid
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
        if (currentImageGroup.length > 0) result.push({ type: 'image_grid', images: currentImageGroup });
        return result;
    })();

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return `${Math.floor(diff / 86400)} ngày trước`;
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <main className="post-detail-main" 
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                }}
            >
                <div className="post-header" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div className="post-avatar-small" style={{ marginRight: '12px' }}>
                        {authorAvatar ? (
                            <img src={authorAvatar} alt={authorName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '24px', backgroundColor: 'var(--secondary-bg)', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '18px' }}>
                                {authorName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="post-author-info" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--text-color)', fontSize: '16px', marginRight: '8px' }}>{authorName}</span>
                                <button onClick={() => setIsFollowed(!isFollowed)} style={{ background: 'none', border: 'none', color: isFollowed ? 'var(--text-secondary)' : 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', padding: '0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {isFollowed ? (
                                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"></path></svg> Đang theo dõi</>
                                    ) : (
                                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> Theo dõi</>
                                    )}
                                </button>
                            </div>
                            <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={() => window.dispatchEvent(new CustomEvent('openCreatePost'))}>Tạo bài viết</button>
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{formatTime(post.createdAt)}</span>
                    </div>
                </div>

                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0', color: 'var(--text-color)', lineHeight: '1.3' }}>{post.title}</h1>

                <div className="post-body" style={{ margin: '20px 0' }}>
                    {groupedBlocks.map((block, i) => {
                        if (block.type === 'text') return <p key={i} style={{ whiteSpace: 'pre-wrap', fontSize: '16px', color: 'var(--text-color)', lineHeight: '1.6', margin: '12px 0' }}>{block.content}</p>;
                        if (block.type === 'code') return <pre key={i} style={{ background: '#1e1e1e', color: '#e6e6e6', padding: '16px', borderRadius: '12px', overflowX: 'auto', margin: '16px 0' }}><code>{block.content}</code></pre>;
                        if (block.type === 'image_grid') return <ImageGrid key={i} images={block.images} />;
                        return null;
                    })}
                </div>

                {post.tags && post.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '20px 0' }}>
                        {post.tags.map(tag => <span key={tag} className="tag" style={{ border: 'none', background: 'var(--secondary-bg)', color: 'var(--primary-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>#{tag}</span>)}
                    </div>
                )}

                <div className="post-actions" style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '30px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
                    <button onClick={handleLike} disabled={isProcessingLike} style={{ color: isLiked ? 'var(--primary-color)' : 'var(--text-secondary)', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>
                        <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span>{likeCount} Thích</span>
                    </button>
                    <button style={{ color: 'var(--text-secondary)', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>
                        <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor">
                            <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                        </svg>
                        <span>{comments.length} Bình luận</span>
                    </button>
                    <button onClick={handleShareOpen} style={{ color: 'var(--text-secondary)', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>
                        </svg>
                        <span>Chia sẻ</span>
                    </button>
                    <button onClick={() => setIsSaved(!isSaved)} style={{ marginLeft: 'auto', color: isSaved ? 'var(--primary-color)' : 'var(--text-secondary)', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>{isSaved ? 'Đã lưu' : 'Lưu Bài'}</span>
                    </button>
                </div>

                {/* Comments Section */}
                <div className="comments-section-container" style={{ marginTop: '30px', paddingTop: '20px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>{comments.length} Bình luận</h3>

                    <div className="comment-editor" style={{ marginBottom: '30px' }}>
                        <textarea
                            className="comment-input-area"
                            placeholder="Viết bình luận của bạn..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows="3"
                            style={{ 
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px', 
                                border: '1px solid var(--border-color)', 
                                marginBottom: '12px',
                                boxSizing: 'border-box',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-color)',
                                fontSize: '14px',
                                resize: 'vertical'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn-primary" onClick={() => handleCommentSubmit()} disabled={!newComment.trim() || submittingComment}>
                                {submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                            </button>
                        </div>
                    </div>

                    <div className="comments-thread" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {comments.length > 0 ? comments.map(comment => (
                            <div key={comment.commentId} className="comment-item" style={{ display: 'flex', gap: '12px' }}>
                                <div className="comment-user-avatar" style={{ flexShrink: 0 }}>
                                    {comment.userAvatarURL ? (
                                        <img src={comment.userAvatarURL} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--secondary-bg)', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                            {comment.userName?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="comment-content-wrapper" style={{ flex: 1 }}>
                                    <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '12px 16px', borderRadius: '16px', position: 'relative' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: 'var(--text-color)' }}>{comment.userName}</div>
                                        <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5', color: 'var(--text-color)' }}>{comment.content}</p>
                                    </div>
                                    
                                    <div className="comment-actions" style={{ display: 'flex', gap: '16px', marginTop: '6px', paddingLeft: '8px' }}>
                                        <button 
                                            onClick={() => setReplyingTo(replyingTo === comment.commentId ? null : comment.commentId)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
                                        >
                                            Phản hồi
                                        </button>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{formatTime(comment.createdAt)}</span>
                                    </div>

                                    {replyingTo === comment.commentId && (
                                        <div style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '2px solid var(--border-color)' }}>
                                            <textarea
                                                className="comment-input-area"
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="Viết phản hồi..."
                                                rows="2"
                                                style={{ 
                                                    width: '100%',
                                                    padding: '10px',
                                                    borderRadius: '8px', 
                                                    border: '1px solid var(--border-color)', 
                                                    marginBottom: '8px',
                                                    boxSizing: 'border-box',
                                                    backgroundColor: 'var(--input-bg)',
                                                    color: 'var(--text-color)',
                                                    fontSize: '14px'
                                                }}
                                            />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={(e) => handleCommentSubmit(e, comment.commentId)}>Gửi</button>
                                                <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}>Hủy</button>
                                            </div>
                                        </div>
                                    )}

                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="comment-replies" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {comment.replies.map(reply => (
                                                <div key={reply.commentId} className="comment-item nested" style={{ display: 'flex', gap: '10px' }}>
                                                    <div className="comment-user-avatar" style={{ flexShrink: 0 }}>
                                                        {reply.userAvatarURL ? (
                                                            <img src={reply.userAvatarURL} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--secondary-bg)', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '12px' }}>
                                                                {reply.userName?.[0]?.toUpperCase() || 'U'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="comment-content-wrapper" style={{ flex: 1 }}>
                                                        <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '10px 14px', borderRadius: '16px' }}>
                                                            <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px', color: 'var(--text-color)' }}>{reply.userName}</div>
                                                            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4', color: 'var(--text-color)' }}>{reply.content}</p>
                                                        </div>
                                                        <div style={{ marginTop: '4px', paddingLeft: '8px' }}>
                                                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{formatTime(reply.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Share Modal */}
            {isShareModalOpen && (
                <div 
                    className="share-modal-overlay" 
                    onClick={() => setIsShareModalOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        cursor: 'default'
                    }}
                >
                    <div 
                        className="share-modal-content" 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderRadius: '12px',
                            padding: '24px',
                            width: '400px',
                            maxWidth: '90%',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Chia sẻ bài viết</h3>
                            <button 
                                onClick={() => setIsShareModalOpen(false)}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                            >
                                &times;
                            </button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Liên kết bài viết</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={window.location.origin + '/posts/' + id}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--secondary-bg)',
                                        color: 'var(--text-color)',
                                        fontSize: '14px'
                                    }}
                                />
                                <button 
                                    onClick={handleCopyLink}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: 'var(--primary-color)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Sao chép
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Gửi cho bạn bè</label>
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm người dùng..."
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    marginBottom: '12px',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--text-color)'
                                }}
                            />
                            <div style={{ 
                                maxHeight: '200px', 
                                overflowY: 'auto', 
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '4px'
                            }}>
                                {users
                                    .filter(u => u.fullName?.toLowerCase().includes(searchUser.toLowerCase()) || u.userName?.toLowerCase().includes(searchUser.toLowerCase()))
                                    .map(user => (
                                    <div 
                                        key={user.userId} 
                                        onClick={() => toggleUserSelection(user.userId)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '8px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            backgroundColor: selectedUsers.includes(user.userId) ? 'var(--secondary-bg)' : 'transparent',
                                            marginBottom: '2px'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--primary-color)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '12px',
                                            marginRight: '12px'
                                        }}>
                                            {user.avatar ? <img src={user.avatar} style={{width: '100%', height: '100%', borderRadius: '50%'}} /> : (user.fullName || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{user.fullName}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>@{user.userName}</div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedUsers.includes(user.userId)}
                                            readOnly
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                ))}
                                {users.length === 0 && <div style={{padding: '20px', textAlign: 'center', color: 'var(--text-secondary)'}}>Đang tải danh sách người dùng...</div>}
                            </div>
                        </div>

                        <button 
                            onClick={handleSendShare}
                            disabled={selectedUsers.length === 0 || isSharing}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: 'var(--primary-color)',
                                color: 'white',
                                cursor: (selectedUsers.length === 0 || isSharing) ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                opacity: (selectedUsers.length === 0 || isSharing) ? 0.6 : 1
                            }}
                        >
                            {isSharing ? 'Đang gửi...' : `Gửi cho ${selectedUsers.length} người`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostDetail;
