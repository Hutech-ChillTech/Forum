import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import ImageGrid from '../components/ImageGrid';
import '../styles/Home.css'; // Reusing Home styles for consistency

const Saved = () => {
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
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

    const toggleLike = (id) => {
        setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSave = (id) => {
        setSavedPosts(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="home-layout">
            <Header />

            <div className="home-container">
                {/* Left Sidebar */}
                <aside className="home-sidebar">
                    <Sidebar activePage="saved" />
                </aside>

                {/* Main Content */}
                <main className="home-main">
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#232629' }}>Bài viết đã lưu</h1>
                        <p style={{ color: '#6a737c', marginTop: '8px' }}>Danh sách các bài viết bạn đã đánh dấu để xem lại sau.</p>
                    </div>

                    <div className="posts-container">
                        {savedPostData.filter(post => savedPosts['saved_' + post.id]).length > 0 ? (
                            savedPostData.map((post) => (
                                savedPosts['saved_' + post.id] && (
                                    <div key={post.id} className="featured-card" style={{ marginBottom: '16px' }}>
                                        <div className="featured-card-content">
                                            <div className="featured-user-block">
                                                <div className="featured-user-avatar">
                                                    <img src="/images/download.png" alt="avatar" />
                                                </div>
                                                <div className="featured-user-info">
                                                    <span className="featured-author">{post.author}</span>
                                                    <span className="featured-reputation">{post.reputation} reputation</span>
                                                    <span className="featured-time">{post.time}</span>
                                                </div>
                                            </div>

                                            <h3 className="question-title" style={{ margin: '15px 0 10px 0', fontSize: '18px', fontWeight: '600' }}>
                                                <a href={`/posts/${post.id}`} style={{ color: '#0052cc', textDecoration: 'none' }}>{post.title}</a>
                                            </h3>
                                            <p style={{ fontSize: '14px', color: '#3b4045', lineHeight: '1.5', margin: '0 0 15px 0' }}>{post.excerpt}</p>

                                            {post.images && (
                                                <ImageGrid images={post.images} />
                                            )}

                                            <div className="question-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                                <div className="question-tags" style={{ display: 'flex', gap: '8px' }}>
                                                    {post.tags.map((tag, idx) => (
                                                        <span key={idx} className="tag" style={{ fontSize: '12px', color: '#0052cc', backgroundColor: '#e6f0ff', padding: '4px 10px', borderRadius: '15px' }}>{tag}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="post-actions" style={{ marginTop: '20px', display: 'flex', gap: '20px', borderTop: '1px solid #f1f2f3', paddingTop: '15px' }}>
                                                <button className="post-action-btn" onClick={() => toggleLike('saved_' + post.id)} style={{ color: likedPosts['saved_' + post.id] ? '#0066FF' : '#6a737c' }}>
                                                    <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor">
                                                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                    </svg>
                                                    <span>Thích</span>
                                                </button>
                                                <button className="post-action-btn">
                                                    <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor">
                                                        <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                                                    </svg>
                                                    <span>Bình luận</span>
                                                </button>
                                                <button className="post-action-btn" onClick={() => toggleSave('saved_' + post.id)} style={{ marginLeft: 'auto', color: '#0066FF' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                                    </svg>
                                                    <span>Bỏ lưu</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', border: '1px solid #e3e6e8' }}>
                                <div style={{ marginBottom: '20px', opacity: 0.3 }}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                </div>
                                <h3 style={{ color: '#3b4045', marginBottom: '8px' }}>Chưa có bài viết nào được lưu</h3>
                                <p style={{ color: '#6a737c' }}>Hãy đánh dấu các bài viết thú vị để xem lại tại đây.</p>
                                <a href="/posts" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '20px', padding: '10px 20px' }}>Khám phá ngay</a>
                            </div>
                        )}
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside className="home-right-sidebar">
                    <div className="sidebar-widget" style={{ backgroundColor: '#fdf7e2', border: '1px solid #f1e5bc' }}>
                        <h3 className="widget-title" style={{ borderBottomColor: '#f1e5bc' }}>Mẹo nhỏ</h3>
                        <p style={{ fontSize: '13px', color: '#3b4045', lineHeight: '1.4' }}>
                            Bạn có thể lưu bất kỳ bài viết nào bằng cách nhấn vào nút <strong>Lưu Bài</strong> ở cuối mỗi bài đăng.
                        </p>
                    </div>
                </aside>
            </div>

            <button
                className="ai-chat-fab"
                onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Chat AI</span>
            </button>

            <ChatBox
                isOpen={isAIChatOpen}
                onClose={() => setIsAIChatOpen(false)}
            />

            <Footer />
        </div>
    );
};

export default Saved;
