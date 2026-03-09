import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import '../styles/Users.css';

const Users = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('reputation'); // reputation, new, voters, editors, moderators

    // Mock data for users
    const [users, setUsers] = useState([
        {
            id: 1,
            name: "Jon Skeet",
            location: "Reading, United Kingdom",
            reputation: 1464320,
            tags: ["c#", "java", ".net", "datetime"],
            avatarUrl: null,
            isFollowing: false
        },
        {
            id: 2,
            name: "Gordon Linoff",
            location: "New York, NY",
            reputation: 1256345,
            tags: ["sql", "mysql", "sql-server", "postgresql"],
            avatarUrl: null,
            isFollowing: true
        },
        {
            id: 3,
            name: "VonC",
            location: "France",
            reputation: 1112450,
            tags: ["git", "github", "docker", "docker-compose"],
            avatarUrl: null,
            isFollowing: false
        },
        {
            id: 4,
            name: "BalusC",
            location: "Willemstad, Curaçao",
            reputation: 987654,
            tags: ["java", "jsf", "servlets", "jakarta-ee"],
            avatarUrl: null,
            isFollowing: false
        },
        {
            id: 5,
            name: "1731_Trần Khánh Linh",
            location: "Vietnam",
            reputation: 154,
            tags: ["reactjs", "javascript", "css", "html"],
            avatarUrl: null,
            isFollowing: false
        },
        {
            id: 6,
            name: "T.J. Crowder",
            location: "United Kingdom",
            reputation: 854321,
            tags: ["javascript", "html", "jquery", "dom"],
            avatarUrl: null,
            isFollowing: true
        },
        {
            id: 7,
            name: "Martijn Pieters",
            location: "Cambridge, UK",
            reputation: 765432,
            tags: ["python", "python-3.x", "list", "dictionary"],
            avatarUrl: null,
            isFollowing: false
        },
        {
            id: 8,
            name: "Quentin",
            location: "United Kingdom",
            reputation: 654321,
            tags: ["javascript", "html", "css", "jquery"],
            avatarUrl: null,
            isFollowing: false
        }
    ]);

    // Format number with commas
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Get initials for avatar fallback
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Handle Follow/Unfollow toggle
    const handleFollowToggle = (userId) => {
        setUsers(users.map(user =>
            user.id === userId
                ? { ...user, isFollowing: !user.isFollowing }
                : user
        ));
    };

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort users based on active tab (mock logic)
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (activeTab === 'reputation') {
            return b.reputation - a.reputation;
        } else if (activeTab === 'new') {
            // Mock sort for 'new'
            return b.id - a.id;
        }
        return 0; // default for other tabs not implemented in mock
    });

    return (
        <div className="users-layout">
            <Header />

            <div className="users-container">
                {/* Left Sidebar Layout */}
                <aside className="users-sidebar">
                    <Sidebar activePage="users" />
                </aside>

                <main className="users-main">
                    <div className="users-header">
                        <h1 className="users-title">Users</h1>
                    </div>

                    <div className="users-controls">
                        <div className="search-bar">
                            <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16 16L12.65 12.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Filter by user"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="users-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'reputation' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reputation')}
                            >
                                Reputation
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
                                onClick={() => setActiveTab('new')}
                            >
                                New users
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'voters' ? 'active' : ''}`}
                                onClick={() => setActiveTab('voters')}
                            >
                                Voters
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'editors' ? 'active' : ''}`}
                                onClick={() => setActiveTab('editors')}
                            >
                                Editors
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'moderators' ? 'active' : ''}`}
                                onClick={() => setActiveTab('moderators')}
                            >
                                Moderators
                            </button>
                        </div>
                    </div>

                    {/* Users Grid */}
                    <div className="user-browser">
                        <div className="user-grid">
                            {sortedUsers.map(user => (
                                <div key={user.id} className="user-card">
                                    <div className="user-card-header">
                                        <div className="user-avatar-medium">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.name} />
                                            ) : (
                                                <span className="avatar-initials-medium">{getInitials(user.name)}</span>
                                            )}
                                        </div>
                                        <div className="user-details">
                                            <a href="/profile" className="user-name-link">{user.name}</a>
                                            <span className="user-location">{user.location}</span>
                                            <div className="user-reputation">
                                                <span className="reputation-score" title="reputation score">{formatNumber(user.reputation)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="user-tags">
                                        {user.tags.map(tag => (
                                            <a key={tag} href={`/tags/${tag}`} className="user-tag">{tag}</a>
                                        ))}
                                    </div>

                                    <div className="user-card-actions">
                                        <button
                                            className={`btn-follow ${user.isFollowing ? 'following' : ''}`}
                                            onClick={() => handleFollowToggle(user.id)}
                                        >
                                            {user.isFollowing ? (
                                                <>
                                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                                                        <path d="M5.5 11.5L2 8l1.5-1.5L5.5 8.5 10.5 3.5 12 5z" />
                                                    </svg>
                                                    Following
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                                                        <path d="M7 1v6h6v2H7v6H5V9H-1V7h6V1h2z" />
                                                    </svg>
                                                    Follow
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination - Dummy */}
                    <div className="pagination">
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <button className="page-btn">4</button>
                        <button className="page-btn">5</button>
                        <span className="page-dots">...</span>
                        <button className="page-btn">286,281</button>
                        <button className="page-btn next">Next</button>
                    </div>

                </main>
            </div>

            <Footer />
        </div>
    );
};

export default Users;
