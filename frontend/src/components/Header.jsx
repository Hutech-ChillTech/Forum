import { useState, useEffect, useRef } from 'react';
import CreatePostModal from './CreatePostModal';
import '../styles/Header.css';

const Header = ({ hideAuth = false }) => {
    // Mock login state - change to true to see avatar
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Get user data from localStorage or use defaults
    const [userData, setUserData] = useState(() => {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                const parsed = JSON.parse(savedProfile);
                return {
                    name: parsed.fullName || "Trần Khánh Linh",
                    username: parsed.username || "khanhlinh_1731",
                    avatar: parsed.avatar || null
                };
            } catch (e) {
                console.error('Error parsing user profile in Header:', e);
            }
        }
        return {
            name: "Trần Khánh Linh",
            username: "khanhlinh_1731",
            avatar: null
        };
    });

    // Close dropdown when clicking outside and listen for profile updates
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        const handleOpenCreatePost = () => {
            setIsCreateOpen(true);
        };

        const handleProfileUpdate = (e) => {
            const profile = e.detail;
            setUserData({
                name: profile.fullName || profile.displayName || "Trần Khánh Linh",
                username: profile.username || "khanhlinh_1731",
                avatar: profile.avatar || null
            });
        };

        window.addEventListener('openCreatePost', handleOpenCreatePost);
        window.addEventListener('userProfileUpdated', handleProfileUpdate);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('openCreatePost', handleOpenCreatePost);
            window.removeEventListener('userProfileUpdated', handleProfileUpdate);
        };
    }, []);

    const handleLogout = () => {
        setIsLoggedIn(false);
        setShowDropdown(false);
    };

    // Get user initials for avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-left">
                    <a href="/" className="logo">SkillForum</a>
                </div>

                <div className="header-center">
                    <div className="search-bar">
                        <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 16L12.65 12.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    window.location.href = `/search?q=${encodeURIComponent(e.target.value)}`;
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="header-right">
                    {!hideAuth && isLoggedIn ? (
                        <>
                            <div className="header-icons">
                                <button className="icon-btn" title="Thông báo">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                    </svg>
                                    <span className="badge">3</span>
                                </button>
                                <button className="icon-btn" title="Tin nhắn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                    <span className="badge">1</span>
                                </button>
                                <button className="btn-create-header" title="Tạo bài viết mới" onClick={() => setIsCreateOpen(true)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                    <span>Tạo bài</span>
                                </button>
                            </div>
                            <div className="user-menu" ref={dropdownRef}>
                                <button
                                    className="user-avatar-btn"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <div className="user-avatar">
                                        {userData.avatar ? (
                                            <img src={userData.avatar} alt={userData.name} />
                                        ) : (
                                            <span className="avatar-initials">
                                                {getInitials(userData.name)}
                                            </span>
                                        )}
                                    </div>
                                </button>

                                {showDropdown && (
                                    <div className="user-dropdown">
                                        <div className="dropdown-header">
                                            <div className="dropdown-user-info">
                                                <div className="dropdown-user-name">{userData.username}</div>
                                            </div>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <a href="/profile" className="dropdown-item">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm-5 7a5 5 0 0110 0H3z" />
                                            </svg>
                                            Profile
                                        </a>
                                        <a href="/settings" className="dropdown-item">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M8 4.754a3.246 3.246 0 100 6.492 3.246 3.246 0 000-6.492zM5.754 8a2.246 2.246 0 114.492 0 2.246 2.246 0 01-4.492 0z" />
                                                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 01-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 01-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 01.52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 011.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 011.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 01.52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 01-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 01-1.255-.52l-.094-.319z" />
                                            </svg>
                                            Settings
                                        </a>
                                        <div className="dropdown-divider"></div>
                                        <button onClick={handleLogout} className="dropdown-item">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M10 12.5a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v2a.5.5 0 001 0v-2A1.5 1.5 0 009.5 2h-8A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h8a1.5 1.5 0 001.5-1.5v-2a.5.5 0 00-1 0v2z" />
                                                <path d="M15.854 8.354a.5.5 0 000-.708l-3-3a.5.5 0 00-.708.708L14.293 7.5H5.5a.5.5 0 000 1h8.793l-2.147 2.146a.5.5 0 00.708.708l3-3z" />
                                            </svg>
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : !hideAuth ? (
                        <>
                            <a href="/login" className="btn-login">Log In</a>
                            <a href="/register" className="btn-signup">Sign up</a>
                        </>
                    ) : null}
                </div>
            </div>

            <CreatePostModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onPostCreated={(newPost) => {
                    const event = new CustomEvent('globalPostCreated', { detail: newPost });
                    window.dispatchEvent(event);
                }}
            />
        </header>
    );
};

export default Header;
