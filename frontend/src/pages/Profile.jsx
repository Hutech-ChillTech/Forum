import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Profile.css';

const Profile = () => {
    // Mock user data
    const mockUser = {
        name: "1731_Trần Khánh Linh",
        memberSince: "1 year, 1 month",
        lastSeen: "this week",
        reputation: 1,
        questions: 0,
        answers: 0,
        solutions: 0,
        communities: [
            {
                name: "Stack Overflow",
                count: 1
            }
        ],
        badges: []
    };

    return (
        <div className="profile-layout">
            <Header />

            <div className="profile-container">
                {/* Main Content */}
                <main className="profile-main">
                    {/* User Header */}
                    <div className="profile-header">
                        <div className="profile-avatar-large">
                            <span className="avatar-initials-large">TK</span>
                        </div>
                        <div className="profile-header-info">
                            <h1 className="profile-name">{mockUser.name}</h1>
                            <div className="profile-meta">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                                    <path d="M7 7a3 3 0 100-6 3 3 0 000 6zm0 1a5 5 0 00-5 5h10a5 5 0 00-5-5z" />
                                </svg>
                                <span>Member for {mockUser.memberSince}</span>
                                <span className="meta-separator">•</span>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                                    <path d="M7 0a7 7 0 100 14A7 7 0 007 0zm0 11.667A4.667 4.667 0 1111.667 7 4.667 4.667 0 017 11.667zm.5-7.334h-1v4.5l3.5 2.1.5-.817-3-1.783V4.333z" />
                                </svg>
                                <span>Last seen {mockUser.lastSeen}</span>
                            </div>
                        </div>
                        <button className="btn-network-profile">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M1 3.5A1.5 1.5 0 012.5 2h11A1.5 1.5 0 0115 3.5v9a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 12.5v-9zM2 4v8h12V4H2z" />
                                <path d="M4 6h8v1H4V6zm0 3h6v1H4V9z" />
                            </svg>
                            Network profile
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="profile-tabs">
                        <button className="tab-btn active">Profile</button>
                        <button className="tab-btn">Activity</button>
                    </div>

                    {/* Stats Section */}
                    <div className="profile-section">
                        <h2 className="section-title">Stats</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">{mockUser.reputation}</div>
                                <div className="stat-label">reputation</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{mockUser.questions}</div>
                                <div className="stat-label">questions</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{mockUser.answers}</div>
                                <div className="stat-label">answers</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{mockUser.solutions}</div>
                                <div className="stat-label">solutions</div>
                            </div>
                        </div>
                    </div>

                    {/* Badges Section */}
                    <div className="profile-section">
                        <h2 className="section-title">
                            Badges
                            <span className="badge-count">{mockUser.badges.length}</span>
                        </h2>
                        <div className="empty-state">
                            <p>This user has not earned any badges.</p>
                        </div>
                    </div>

                    {/* Communities Section */}
                    <div className="profile-section">
                        <h2 className="section-title">Communities</h2>
                        <div className="communities-list">
                            {mockUser.communities.map((community, index) => (
                                <a key={index} href="#" className="community-item">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="community-icon">
                                        <path d="M9 1l2.5 6.5L18 9l-6.5 1.5L9 17l-2.5-6.5L0 9l6.5-1.5L9 1z" />
                                    </svg>
                                    <div className="community-info">
                                        <div className="community-name">{community.name}</div>
                                    </div>
                                    <div className="community-count">{community.count}</div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Posts Section */}
                    <div className="profile-section">
                        <h2 className="section-title">Posts</h2>
                        <div className="empty-state">
                            <div className="empty-illustration">
                                <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
                                    <rect x="12" y="20" width="72" height="56" rx="2" stroke="#C8CCCF" strokeWidth="2" />
                                    <line x1="24" y1="32" x2="72" y2="32" stroke="#C8CCCF" strokeWidth="2" />
                                    <line x1="24" y1="44" x2="60" y2="44" stroke="#C8CCCF" strokeWidth="2" />
                                    <line x1="24" y1="56" x2="48" y2="56" stroke="#C8CCCF" strokeWidth="2" />
                                </svg>
                            </div>
                            <p className="empty-text">This user hasn't posted yet.</p>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
