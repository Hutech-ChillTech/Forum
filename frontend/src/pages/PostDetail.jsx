import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import postService from '../service/postService';
import commentService from '../service/commentService';
import authService from '../service/authService';
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
    const [upvoteState, setUpvoteState] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    const userProfile = authService.getUser();

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                setLoading(true);
                const postData = await postService.getPostById(id);
                setPost(postData);

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
        <div className="post-detail-layout">
            <Header />
            <div className="post-detail-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div className="loader">Đang tải bài viết...</div>
            </div>
            <Footer />
        </div>
    );

    if (error || !post) return (
        <div className="post-detail-layout">
            <Header />
            <div className="post-detail-container">
                <div style={{ padding: '40px', textAlign: 'center', width: '100%', background: 'var(--card-bg)', borderRadius: '12px' }}>
                    <h2>Rất tiếc! Không tìm thấy bài viết.</h2>
                    <p>{error || 'Thông tin bài viết không khả dụng.'}</p>
                    <Link to="/posts" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>Quay lại danh sách</Link>
                </div>
            </div>
            <Footer />
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

    return (
        <>
            {/* Main Content */}
            <main className="post-detail-main">
                <div className="question-header-top">
                    <h1 className="question-header-title">{post.title}</h1>
                    <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('openCreatePost'))}>Tạo bài viết</button>
                </div>

                <div className="question-meta-bar">
                    <div className="meta-info">
                        <span className="meta-label">Tác giả:</span>
                        <span className="meta-value">{authorName}</span>
                    </div>
                    <div className="meta-info">
                        <span className="meta-label">Đã đăng:</span>
                        <span className="meta-value">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>

                <div className="post-content-layout">
                    {/* Vote Column */}
                    <div className="vote-col">
                        <button className="vote-btn" onClick={() => setUpvoteState(upvoteState === 1 ? 0 : 1)}>
                            <svg width="36" height="36" viewBox="0 0 36 36" style={{ color: upvoteState === 1 ? 'var(--primary-color)' : 'currentColor' }}><path d="M2 25h32L18 9 2 25Z" fill="currentColor"></path></svg>
                        </button>
                        <div className="vote-count">{post.votes + upvoteState || 0}</div>
                        <button className="vote-btn" onClick={() => setUpvoteState(upvoteState === -1 ? 0 : -1)}>
                            <svg width="36" height="36" viewBox="0 0 36 36" style={{ color: upvoteState === -1 ? 'var(--primary-color)' : 'currentColor' }}><path d="M2 11h32L18 27 2 11Z" fill="currentColor"></path></svg>
                        </button>
                    </div>

                    {/* Content Cell */}
                    <div className="post-cell">
                        <div className="post-author-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '10px' }}>
                            <div className="author-avatar">
                                {authorAvatar ? <img src={authorAvatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : authorName[0].toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{authorName}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Thành viên</span>
                            </div>
                        </div>

                        <div className="post-body">
                            {contentBlocks.map((block, i) => {
                                if (block.type === 'text') return <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{block.content}</p>;
                                if (block.type === 'code') return <pre key={i}><code>{block.content}</code></pre>;
                                if (block.type === 'image') {
                                    const src = block.content.startsWith('/uploads/') ? `${API_BASE_URL}${block.content}` : block.content;
                                    return (
                                        <div key={i} className="post-vertical-image" style={{ margin: '20px 0' }}>
                                            <img src={src} alt="" style={{ width: '100%', borderRadius: '12px', display: 'block' }} />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>

                        {post.tags && post.tags.length > 0 && (
                            <div className="post-tags-container" style={{ marginTop: '24px' }}>
                                {post.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                            </div>
                        )}

                        <div className="post-actions" style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                            <button className="post-action-link" onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Đã copy link!'); }}>Chia sẻ</button>
                            <button className="post-action-link" onClick={() => setIsSaved(!isSaved)} style={{ color: isSaved ? 'var(--primary-color)' : 'inherit' }}>{isSaved ? 'Đã lưu' : 'Lưu'}</button>
                        </div>
                    </div>
                </div>

                {/* Comments */}
                <div className="comments-section-container">
                    <h3 style={{ marginBottom: '20px' }}>{comments.length} Bình luận</h3>

                    <div className="comment-editor" style={{ marginBottom: '30px' }}>
                        <textarea
                            className="comment-input-area"
                            placeholder="Viết bình luận của bạn..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows="3"
                            style={{ borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '10px' }}
                        />
                        <button className="btn-primary" onClick={() => handleCommentSubmit()} disabled={!newComment.trim() || submittingComment}>
                            {submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                        </button>
                    </div>

                    <div className="comments-thread">
                        {comments.map(comment => (
                            <div key={comment.commentId} className="comment-item" style={{ marginBottom: '20px' }}>
                                <div className="comment-user-avatar">
                                    {comment.userAvatarURL ? <img src={comment.userAvatarURL} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--secondary-bg)' }}>{comment.userName?.[0] || 'U'}</div>}
                                </div>
                                <div className="comment-content-wrapper">
                                    <span className="comment-username">{comment.userName}</span>
                                    <div className="comment-bubble">
                                        <p>{comment.content}</p>
                                        <div className="comment-actions">
                                            <button onClick={() => setReplyingTo(replyingTo === comment.commentId ? null : comment.commentId)}>Phản hồi</button>
                                        </div>
                                        {replyingTo === comment.commentId && (
                                            <div style={{ marginTop: '12px' }}>
                                                <textarea
                                                    className="comment-input-area"
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    placeholder="Viết phản hồi..."
                                                    rows="2"
                                                    style={{ borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '8px' }}
                                                />
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="btn-primary" style={{ padding: '4px 12px' }} onClick={(e) => handleCommentSubmit(e, comment.commentId)}>Gửi</button>
                                                    <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Hủy</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {comment.replies && comment.replies.map(reply => (
                                        <div key={reply.commentId} className="comment-item nested" style={{ marginTop: '12px' }}>
                                            <div className="comment-user-avatar" style={{ scale: '0.8' }}>
                                                {reply.userAvatarURL ? <img src={reply.userAvatarURL} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--secondary-bg)' }}>{reply.userName?.[0] || 'U'}</div>}
                                            </div>
                                            <div className="comment-content-wrapper">
                                                <span className="comment-username">{reply.userName}</span>
                                                <div className="comment-bubble">
                                                    <p>{reply.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
};

export default PostDetail;
