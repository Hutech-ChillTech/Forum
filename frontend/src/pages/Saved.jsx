import React, { useState, useEffect, useRef, useCallback } from 'react';
import PostCard from '../components/PostCard';
import SkeletonPost from '../components/SkeletonPost';
import savedPostService from '../service/savedPostService';
import '../styles/Home.css';

const Saved = () => {
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchSavedPosts = async (pageNum, isInitial = false) => {
        try {
            setLoading(true);
            const size = 10;
            const data = await savedPostService.getMyBookmarks(pageNum, size);

            const content = data.content || [];
            const mappedPosts = content.map(sp => ({
                ...(sp.post || {}),
                isSaved: true
            }));

            if (isInitial) {
                setPosts(mappedPosts);
            } else {
                setPosts(prev => [...prev, ...mappedPosts]);
            }
            setHasMore(mappedPosts.length >= size);
        } catch (error) {
            console.error('Failed to fetch saved posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedPosts(0, true);
    }, []);

    useEffect(() => {
        if (page > 0) {
            fetchSavedPosts(page);
        }
    }, [page]);

    return (
        <>
            <main className="home-main">
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-color)' }}>Bài viết đã lưu</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Danh sách các bài viết bạn đã đánh dấu để xem lại sau.</p>
                </div>

                <div className="posts-container">
                    {loading && posts.length === 0 ? (
                        <div className="posts-list">
                            <SkeletonPost />
                            <SkeletonPost />
                            <SkeletonPost />
                        </div>
                    ) : posts.length > 0 ? (
                        <>
                            {posts.map((post, index) => (
                                <div key={post.postId || post.id || index} ref={index === posts.length - 1 ? lastPostElementRef : null}>
                                    <PostCard post={post} />
                                </div>
                            ))}

                            {loading && (
                                <div style={{ padding: '20px', textAlign: 'center' }}>
                                    <div className="loader" style={{ margin: '0 auto' }}>Đang tải thêm...</div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ marginBottom: '20px', opacity: 0.3 }}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <h3 style={{ color: 'var(--text-color)', marginBottom: '8px' }}>Chưa có bài viết nào được lưu</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Hãy đánh dấu các bài viết thú vị để xem lại tại đây.</p>
                            <a href="/" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '20px', padding: '10px 20px', borderRadius: '8px', color: 'white' }}>Khám phá ngay</a>
                        </div>
                    )}
                </div>
            </main>

            <aside className="home-right-sidebar">
                <div className="sidebar-widget" style={{ backgroundColor: 'var(--secondary-bg)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px' }}>
                    <h3 className="widget-title" style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Mẹo nhỏ</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-color)', lineHeight: '1.4' }}>
                        Bạn có thể lưu bất kỳ bài viết nào bằng cách nhấn vào nút <strong>Lưu bài</strong> ở cuối mỗi bài đăng.
                    </p>
                </div>
            </aside>
        </>
    );
};

export default Saved;
