import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import PostDetailModal from '../components/PostDetailModal';
import postService from '../service/postService';
import userService from '../service/userService';
import savedPostService from '../service/savedPostService';
import authService from '../service/authService';
import fileService from '../service/fileService';
import { API_BASE_URL } from '../utils/apiFetch.js';
import '../styles/Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("userProfile") || "{}");
    } catch {
      return {};
    }
  })();

  const isOwnProfile = !userId || userId === currentUser.userId;
  const [activeTab, setActiveTab] = useState("profile");

  const [userData, setUserData] = useState(() => {
    if (isOwnProfile) {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          return {
            name: parsed.fullName || parsed.username || "User",
            memberSince: "1 năm, 1 tháng",
            lastSeen: "tuần này",
            reputation: 1,
            reached: 0,
            answers: 0,
            questions: 0,
            communities: [{ name: "Stack Overflow", count: 1 }],
            badges: [],
            online: false,
          };
        } catch (e) {
          console.error("Error parsing user profile in Profile:", e);
        }
      }
    }
    return {
      name: "User",
      memberSince: "1 năm, 1 tháng",
      lastSeen: "tuần này",
      reputation: 1,
      reached: 0,
      answers: 0,
      questions: 0,
      communities: [{ name: "Stack Overflow", count: 1 }],
      badges: [],
      online: false,
    };
  });

    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'comments', 'saved'

    // Fetch user info and posts
    // ... (rest of useEffects same)
    useEffect(() => {
        const fetchProfileData = async () => {
            // Only show loader for initial load or tab change (if we want)
            setLoading(true);
            try {
                let targetUser;
                let targetUserId;

                if (userId) {
                    targetUser = await userService.getUserById(userId);
                    targetUserId = userId;
                } else {
                    const savedProfile = localStorage.getItem('userProfile');
                    if (savedProfile) {
                        targetUser = JSON.parse(savedProfile);
                        targetUserId = targetUser.userId;
                    } else {
                        return;
                    }
                }

                if (targetUser && activeTab === 'posts') { // Only update name/avatar if on main tab load
                    setUserData(prev => ({
                        ...prev,
                        name: targetUser.fullName || targetUser.userName || targetUser.displayName || "User",
                        userName: targetUser.userName,
                        avatarURL: targetUser.avatarURL || targetUser.userAvatarURL,
                        memberSince: targetUser.createdAt ? new Date(targetUser.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' }) : "Recently",
                        reputation: targetUser.reputation || 1,
                    }));
                }

                if (targetUserId) {
                    let posts = [];
                    if (activeTab === 'posts') {
                        const postData = await postService.getPostsByUser(targetUserId);
                        posts = postData.posts || [];
                        setUserData(prev => ({ ...prev, questions: posts.length }));
                    } else if (activeTab === 'saved') {
                        const data = await savedPostService.getMyBookmarks(0, 50);
                        const content = data.content || (Array.isArray(data) ? data : []);
                        posts = content.map(sp => ({
                            ...(sp.post || {}),
                            isSaved: true
                        }));
                    } else if (activeTab === 'comments') {
                        // Placeholder for comments
                        posts = [];
                    }
                    setUserPosts(posts);
                }
            } catch (err) {
                console.error('Failed to fetch profile data:', err);
                setUserPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [userId, activeTab]);

    useEffect(() => {
        const handleProfileUpdate = (e) => {
            if (isOwnProfile) {
                const profile = e.detail;
                setUserData(prev => ({
                    ...prev,
                    name: profile.fullName || profile.displayName,
                    avatarURL: profile.avatarURL
                }));
            }
        };

        window.addEventListener('userProfileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    }, [isOwnProfile]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            // 1. Upload file
            const uploadRes = await fileService.uploadFile(file);
            const avatarURL = uploadRes.url.startsWith('http')
                ? uploadRes.url
                : `${API_BASE_URL}${uploadRes.url}`;

            // 2. Update user profile
            const updatedUser = await userService.updateUser(currentUser.userId, { avatarURL });

            // 3. Update local state
            setUserData(prev => ({ ...prev, avatarURL }));

            // 4. Update localStorage and notify app
            const storedUser = JSON.parse(localStorage.getItem('userProfile') || '{}');
            const newProfile = { ...storedUser, avatarURL };
            localStorage.setItem('userProfile', JSON.stringify(newProfile));

            window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: newProfile }));
            alert('Đổi ảnh đại diện thành công!');
        } catch (err) {
            console.error('Failed to update avatar:', err);
            alert('Không thể đổi ảnh đại diện. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    return (
        <>
            {/* Main Content */}
            <main className="profile-main">
                {/* User Header */}
                <div className="profile-hero">
                    <div className="profile-cover"></div>
                    <div className="profile-hero-content">
                        <div className="profile-avatar-wrapper">
                            {userData.avatarURL ? (
                                <img src={userData.avatarURL} alt={userData.name} className="profile-avatar-circle" />
                            ) : (
                                <div className="profile-avatar-circle initials">
                                    {getInitial(userData.name)}
                                </div>
                            )}

                            {isOwnProfile && (
                                <label htmlFor="avatar-upload" className="avatar-edit-overlay">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        hidden
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            )}
                        </div>

                        <div className="profile-actions-bar">
                            {isOwnProfile && (
                                <a href="/settings" className="edit-profile-button">
                                    Chỉnh sửa hồ sơ
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-info-section">
                    <h1 className="profile-display-name">{userData.name}</h1>
                    <p className="profile-username">@{userData.userName || 'user'}</p>

                    <p className="profile-bio">
                        {userData.bio || "Thành viên đam mê công nghệ và chia sẻ kiến thức tại SkillForum."}
                    </p>

                    <div className="profile-stats-row">
                        <div className="profile-stat-item">
                            <span className="stat-count">{userData.questions}</span>
                            <span className="stat-label">Bài viết</span>
                        </div>
                        <div className="profile-stat-item">
                            <span className="stat-count">0</span>
                            <span className="stat-label">Người theo dõi</span>
                        </div>
                        <div className="profile-stat-item">
                            <span className="stat-count">0</span>
                            <span className="stat-label">Đang theo dõi</span>
                        </div>
                    </div>

                    <div className="profile-details-grid">
                        <div className="detail-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>Tham gia {userData.memberSince}</span>
                        </div>
                        <div className="detail-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>Hoạt động cuối: {userData.lastSeen}</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="profile-tabs-bar">
                    <button
                        className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        Bài viết
                    </button>
                    <button
                        className={`profile-tab ${activeTab === 'comments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('comments')}
                    >
                        Bình luận
                    </button>
                    <button
                        className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('saved')}
                    >
                        Đã lưu
                    </button>
                </div>
              )}
            </div>
          </div>
        )}

                {/* Content Grid (Two Columns) */}
                <div className="profile-feed">
                    {loading ? (
                        <div className="profile-loading">Đang tải nội dung...</div>
                    ) : userPosts.length > 0 ? (
                        <div className="posts-container-inner">
                            {userPosts.map((post, idx) => (
                                <PostCard
                                    key={post.postId || post.id || idx}
                                    post={post}
                                    hideFollowButton={true}
                                    onOpenModal={(id) => setSelectedPostId(id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="profile-empty-feed">
                            <p>
                                {activeTab === 'saved'
                                    ? "Bạn chưa lưu bài viết nào."
                                    : activeTab === 'comments'
                                        ? "Chưa có bình luận nào."
                                        : isOwnProfile
                                            ? "Bạn chưa có bài viết nào."
                                            : "Người dùng này chưa có bài viết nào."}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {selectedPostId && (
                <PostDetailModal
                    postId={selectedPostId}
                    onClose={() => setSelectedPostId(null)}
                />
            )}
        </>
    );
};

export default Profile;
