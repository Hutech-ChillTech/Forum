import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="header-container">
                <div className="header-left">
                    <div className="logo">SkillForum</div>
                </div>

                <nav className="header-nav">
                    <a href="/products" className="nav-link">Products</a>
                    <a href="/for-teams" className="nav-link">For Teams</a>
                </nav>

                <div className="header-right">
                    <button className="search-btn">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 16L12.65 12.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
