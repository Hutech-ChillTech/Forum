import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import '../styles/Profile.css';

const Profile = () => {
    // Mock user data matching the screenshot
    const mockUser = {
        name: "1731_Trần Khánh Linh",
        memberSince: "1 year, 1 month",
        lastSeen: "this week",
        reputation: 1,
        reached: 0,
        answers: 0,
        questions: 0,
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
                {/* Left Sidebar Layout */}
                <aside className="profile-sidebar">
                    <Sidebar activePage="users" />
                </aside>

                {/* Main Content */}
                <main className="profile-main">
                    {/* User Header */}
                    <div className="profile-header">
                        <div className="profile-avatar-large">
                            {/* The pattern is handled by CSS background */}
                        </div>
                        <div className="profile-header-info">
                            <div className="profile-name-row">
                                <h1 className="profile-name">{mockUser.name}</h1>
                                <button className="btn-network-profile">
                                    <svg viewBox="0 0 18 18">
                                        <path d="M3 4c0-1.1.9-2 2-2h8a2 2 0 012 2H3zm11 10.59V6H4v8.59l4-4 4 4z"></path>
                                    </svg>
                                    Network profile
                                </button>
                            </div>
                            <div className="profile-meta">
                                <svg viewBox="0 0 18 18">
                                    <path d="M14 6V3h2v11h-2v-3H4v3H2V3h2v3h10zM6 6h6V4H6v2z"></path>
                                </svg>
                                <span>Member for {mockUser.memberSince}</span>
                                <span className="meta-separator">•</span>
                                <svg viewBox="0 0 18 18">
                                    <path d="M9 16A7 7 0 119 2a7 7 0 010 14zm0-2A5 5 0 109 4a5 5 0 000 10zM8 7h2v5H8V7zm0-2h2v1H8V5z"></path>
                                </svg>
                                <span>Last seen {mockUser.lastSeen}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="profile-tabs">
                        <button className="tab-btn active">Profile</button>
                        <button className="tab-btn">Activity</button>
                    </div>

                    {/* Content Grid (Two Columns) */}
                    <div className="profile-content-grid">
                        {/* Left Column */}
                        <div className="profile-left-col">
                            {/* Stats Section */}
                            <div className="profile-section">
                                <h2 className="section-title">Stats</h2>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-value">{mockUser.reputation}</div>
                                        <div className="stat-label">reputation</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{mockUser.reached}</div>
                                        <div className="stat-label">reached</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{mockUser.answers}</div>
                                        <div className="stat-label">answers</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{mockUser.questions}</div>
                                        <div className="stat-label">questions</div>
                                    </div>
                                </div>
                            </div>

                            {/* Communities Section */}
                            <div className="profile-section">
                                <h2 className="section-title">Communities</h2>
                                <div className="communities-list">
                                    {mockUser.communities.map((community, index) => (
                                        <a key={index} href="#" className="community-item">
                                            <svg className="community-icon" viewBox="0 0 18 18">
                                                <path d="M12.9 14.1l3 2.7-1.3 1.3-3.1-2.9c-.8.4-1.8.7-2.8.7-3.3 0-6-2.7-6-6s2.7-6 6-6c1.6 0 3 .6 4.1 1.6l-1.3 1.4c-.8-.7-1.8-1-2.8-1-2.2 0-4 1.8-4 4s1.8 4 4 4c.8 0 1.6-.3 2.2-.7v-1h-2.5v-1.8h4.5v3.3z"></path>
                                            </svg>
                                            <div className="community-info">
                                                <div className="community-name">{community.name}</div>
                                            </div>
                                            <div className="community-count">{community.count}</div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="profile-right-col">
                            {/* Badges Section */}
                            <div className="profile-section">
                                <h2 className="section-title">
                                    Badges
                                </h2>
                                <div className="empty-state">
                                    <p>This user has not earned any <a href="#">badges</a>.</p>
                                </div>
                            </div>

                            {/* Posts Section */}
                            <div className="profile-section">
                                <h2 className="section-title">Posts</h2>
                                <div className="empty-state posts-empty-state">
                                    <div className="empty-illustration">
                                        <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
                                            <rect x="14" y="24" width="40" height="32" rx="2" stroke="#e3e6e8" strokeWidth="2" fill="#f8f9f9" />
                                            <line x1="22" y1="34" x2="46" y2="34" stroke="#e3e6e8" strokeWidth="2" />
                                            <line x1="22" y1="42" x2="38" y2="42" stroke="#e3e6e8" strokeWidth="2" />
                                            <path d="M50 24v-4c0-1.1-.9-2-2-2H20c-1.1 0-2 .9-2 2v4" stroke="#e3e6e8" strokeWidth="2" fill="none" />
                                        </svg>
                                    </div>
                                    <p>This user hasn't posted yet.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;

