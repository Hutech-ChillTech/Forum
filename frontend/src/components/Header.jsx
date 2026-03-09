import { useState, useEffect, useRef } from 'react';
import '../styles/Header.css';

const Header = ({ hideAuth = false }) => {
    // Mock login state - change to true to see avatar
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Mock user data
    const mockUser = {
        name: "Trần Khánh Linh",
        username: "1731_Trần Khánh Linh",
        avatar: null // Will show initials
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

                    <nav className="header-nav">
                        <a href="/products" className="nav-link">Products</a>
                        <a href="/for-teams" className="nav-link">For Teams</a>
                    </nav>
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
                        <div className="user-menu" ref={dropdownRef}>
                            <button
                                className="user-avatar-btn"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <div className="user-avatar">
                                    {mockUser.avatar ? (
                                        <img src={mockUser.avatar} alt={mockUser.name} />
                                    ) : (
                                        <span className="avatar-initials">
                                            {getInitials(mockUser.name)}
                                        </span>
                                    )}
                                </div>
                            </button>

                            {showDropdown && (
                                <div className="user-dropdown">
                                    <div className="dropdown-header">
                                        <div className="dropdown-user-info">
                                            <div className="dropdown-user-name">{mockUser.username}</div>
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
                    ) : !hideAuth ? (
                        <>
                            <a href="/login" className="btn-login">Log In</a>
                            <a href="/register" className="btn-signup">Sign up</a>
                        </>
                    ) : null}
                </div>
            </div>
        </header>
    );
};

export default Header;
