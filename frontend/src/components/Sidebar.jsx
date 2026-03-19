import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const pathname = location.pathname;

    const getActivePage = () => {
        if (pathname === '/') return 'home';
        if (pathname.startsWith('/posts')) return 'posts';
        if (pathname.startsWith('/tags')) return 'tags';
        if (pathname.startsWith('/users')) return 'users';
        if (pathname.startsWith('/chat')) return 'chat';
        if (pathname.startsWith('/saved')) return 'saved';
        if (pathname.startsWith('/admin')) return 'admin';
        return '';
    };

    const activePage = getActivePage();
    const userProfile = (() => { try { return JSON.parse(localStorage.getItem('userProfile') || '{}'); } catch (e) { return {}; } })();
    const isAdmin = userProfile.role === 'ADMIN';

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <Link to="/" className={`nav-item ${activePage === 'home' ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M9 1L1 6v9h5V9h6v6h5V6L9 1z" />
                    </svg>
                    Trang chủ
                </Link>
                <Link to="/posts" className={`nav-item ${activePage === 'posts' ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="3" y1="15" x2="21" y2="15"></line>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                    Bài viết
                </Link>
                <Link to="/tags" className={`nav-item ${activePage === 'tags' ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M2 4.5A2.5 2.5 0 014.5 2h5.086a1 1 0 01.707.293l6.414 6.414a1 1 0 010 1.414l-5.086 5.086a1 1 0 01-1.414 0L4.293 9.293A1 1 0 014 8.586V4.5zM6 6a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    Thẻ
                </Link>
                <Link to="/users" className={`nav-item ${activePage === 'users' ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Người dùng
                </Link>
                <Link to="/chat" className={`nav-item ${activePage === 'chat' ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                    </svg>
                    Trò chuyện
                </Link>
                <Link to="/saved" className={`nav-item ${activePage === 'saved' ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Đã lưu
                </Link>
                {isAdmin && (
                    <Link to="/admin" className={`nav-item ${activePage === 'admin' ? 'active' : ''}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        Quản trị
                    </Link>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
