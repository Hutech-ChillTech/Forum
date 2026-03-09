import React from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ activePage }) => {
    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <a href="/" className={`nav-item ${activePage === 'home' ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M9 1L1 6v9h5V9h6v6h5V6L9 1z" />
                    </svg>
                    Trang chủ
                </a>
                <a href="/posts" className={`nav-item ${activePage === 'posts' ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                    Video
                </a>
                <a href="/tags" className={`nav-item ${activePage === 'tags' ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M2 4.5A2.5 2.5 0 014.5 2h5.086a1 1 0 01.707.293l6.414 6.414a1 1 0 010 1.414l-5.086 5.086a1 1 0 01-1.414 0L4.293 9.293A1 1 0 014 8.586V4.5zM6 6a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    Tags
                </a>
                <a href="/users" className={`nav-item ${activePage === 'users' ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Người dùng
                </a>
                <a href="/chat" className={`nav-item ${activePage === 'chat' ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M2 4a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V4z" />
                    </svg>
                    Chat
                </a>
                <a href="/saved" className={`nav-item ${activePage === 'saved' ? 'active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Đã lưu
                </a>
            </nav>
        </aside>
    );
};

export default Sidebar;
