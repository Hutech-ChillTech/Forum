import React, { useState } from 'react';
import PostCard from '../components/PostCard';
import '../styles/Home.css'; // Reusing Home styles for consistency

const Saved = () => {
    const [likedPosts, setLikedPosts] = useState({});
    const [savedPosts, setSavedPosts] = useState({
        'saved_1': true,
        'saved_2': true
    });

    // Mock saved data
    const savedPostData = [
        {
            id: 1,
            title: "Làm thế nào để tối ưu hóa truy vấn SQL trong Spring Boot?",
            excerpt: "Tôi đang gặp vấn đề về hiệu năng khi load dữ liệu lớn từ database. Có ai có kinh nghiệm về việc sử dụng Specification hoặc QueryDSL không?",
            author: "hoangminh",
            reputation: 154,
            likes: 42,
            comments: 15,
            tags: ["java", "spring-boot", "sql"],
            time: "3 giờ trước",
            images: ["/images/java-logo.png"]
        },
        {
            id: 2,
            title: "Sự khác biệt giữa useEffect và useLayoutEffect trong React?",
            excerpt: "Khi nào thì chúng ta nên sử dụng useLayoutEffect thay vì useEffect? Tôi thấy trong tài liệu nói nó có thể gây chậm UI.",
            author: "tech_guru",
            reputation: 2500,
            likes: 128,
            comments: 34,
            tags: ["javascript", "reactjs", "frontend"],
            time: "1 ngày trước",
            images: ["/images/react-logo.png"]
        }
    ];

    return (
        <>
            {/* Main Content */}
            <main className="home-main">
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-color)' }}>Bài viết đã lưu</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Danh sách các bài viết bạn đã đánh dấu để xem lại sau.</p>
                </div>

                <div className="posts-container">
                    {savedPostData.filter(post => savedPosts['saved_' + post.id]).length > 0 ? (
                        savedPostData.map((post) => (
                            savedPosts['saved_' + post.id] && (
                                <PostCard key={post.id} post={post} />
                            )
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ marginBottom: '20px', opacity: 0.3 }}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <h3 style={{ color: 'var(--text-color)', marginBottom: '8px' }}>Chưa có bài viết nào được lưu</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Hãy đánh dấu các bài viết thú vị để xem lại tại đây.</p>
                            <a href="/posts" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '20px', padding: '10px 20px' }}>Khám phá ngay</a>
                        </div>
                    )}
                </div>
            </main>

            {/* Right Sidebar */}
            <aside className="home-right-sidebar">
                <div className="sidebar-widget" style={{ backgroundColor: 'var(--secondary-bg)', border: '1px solid var(--border-color)' }}>
                    <h3 className="widget-title">Mẹo nhỏ</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-color)', lineHeight: '1.4' }}>
                        Bạn có thể lưu bất kỳ bài viết nào bằng cách nhấn vào nút <strong>Lưu Bài</strong> ở cuối mỗi bài đăng.
                    </p>
                </div>
            </aside>
        </>
    );
};

export default Saved;
