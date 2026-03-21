import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import postService from "../service/postService";
import userService from "../service/userService";
import "../styles/Profile.css";

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

  // Own-profile: listen for profile update events
  useEffect(() => {
    if (!isOwnProfile) return;
    const handleProfileUpdate = (e) => {
      const profile = e.detail;
      setUserData((prev) => ({
        ...prev,
        name: profile.fullName || profile.displayName,
      }));
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
  }, [isOwnProfile]);

  // Other-user profile: fetch user data + online status
  useEffect(() => {
    if (isOwnProfile) return;
    const fetchOtherUser = async () => {
      try {
        const [user, statusRes] = await Promise.all([
          userService.getUserById(userId),
          userService.getOnlineStatus(userId),
        ]);
        setUserData((prev) => ({
          ...prev,
          name: user.fullName || user.username || "User",
          online: statusRes.online ?? false,
        }));
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };
    fetchOtherUser();
  }, [isOwnProfile, userId]);

  // Fetch posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const targetId = isOwnProfile
          ? (() => {
              try {
                return JSON.parse(localStorage.getItem("userProfile") || "{}")
                  .userId;
              } catch {
                return null;
              }
            })()
          : userId;
        if (!targetId) return;
        setLoading(true);
        const data = await postService.getPostsByUser(targetId);
        const posts = data.posts || [];
        setUserPosts(posts);
        setUserData((prev) => ({ ...prev, questions: posts.length }));
      } catch (err) {
        console.error("Failed to fetch user posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserPosts();
  }, [isOwnProfile, userId]);

  return (
    <>
      {/* Main Content */}
      <main className="profile-main">
        {/* User Header */}
        <div className="profile-header">
          <div className="profile-avatar-large">
            {/* The pattern is handled by CSS background */}
          </div>
          <div className="profile-header-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{userData.name}</h1>
              {isOwnProfile ? (
                <a
                  href="/settings"
                  className="btn-network-profile"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Chỉnh sửa hồ sơ
                </a>
              ) : (
                <button
                  className="btn-network-profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    border: "none",
                    background: "none",
                  }}
                  onClick={() => navigate(`/chat?userId=${userId}`)}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Nhắn tin
                </button>
              )}
            </div>
            <div className="profile-meta">
              <svg viewBox="0 0 18 18">
                <path d="M14 6V3h2v11h-2v-3H4v3H2V3h2v3h10zM6 6h6V4H6v2z"></path>
              </svg>
              <span>Thành viên từ {userData.memberSince}</span>
              <span className="meta-separator">•</span>
              {!isOwnProfile ? (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: userData.online ? "#22c55e" : "#9ca3af",
                      display: "inline-block",
                    }}
                  ></span>
                  {userData.online ? "Đang hoạt động" : "Ngoại tuyến"}
                </span>
              ) : (
                <>
                  <svg viewBox="0 0 18 18">
                    <path d="M9 16A7 7 0 119 2a7 7 0 010 14zm0-2A5 5 0 109 4a5 5 0 000 10zM8 7h2v5H8V7zm0-2h2v1H8V5z"></path>
                  </svg>
                  <span>Truy cập lần cuối {userData.lastSeen}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs — only on own profile */}
        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn${activeTab === "profile" ? " active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Hồ sơ
          </button>
          {isOwnProfile ? (
            <button
              className={`tab-btn${activeTab === "activity" ? " active" : ""}`}
              onClick={() => setActiveTab("activity")}
            >
              Hoạt động
            </button>
          ) : (
            <button
              className="tab-btn"
              onClick={() => navigate(`/chat?userId=${userId}`)}
            >
              Nhắn tin
            </button>
          )}
        </div>

        {/* Activity tab view */}
        {activeTab === "activity" && isOwnProfile && (
          <div className="profile-section" style={{ marginTop: 24 }}>
            <h2 className="section-title">Hoạt động của bạn</h2>
            <div className="profile-posts-list" style={{ marginTop: "16px" }}>
              {loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Đang tải bài viết...
                </div>
              ) : userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <PostCard
                    key={post.postId || post.id}
                    post={post}
                    hideFollowButton={true}
                  />
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--secondary-bg)",
                    borderRadius: "12px",
                  }}
                >
                  Bạn chưa có bài viết nào.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile content grid - shown when profile tab is active */}
        {activeTab === "profile" && (
          <div className="profile-content-grid">
            {/* Left Column */}
            <div className="profile-left-col">
              {/* Stats Section */}
              <div className="profile-section">
                <h2 className="section-title">Thống kê</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{userData.reputation}</div>
                    <div className="stat-label">Reputation</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{userData.reached}</div>
                    <div className="stat-label">Lượt tiếp cận</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{userData.answers}</div>
                    <div className="stat-label">Answers</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{userData.questions}</div>
                    <div className="stat-label">Posts</div>
                  </div>
                </div>
              </div>

              {/* Communities Section */}
              <div className="profile-section">
                <h2 className="section-title">Cộng đồng</h2>
                <div className="communities-list">
                  {userData.communities.map((community, index) => (
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
                <h2 className="section-title">Danh hiệu</h2>
                <div className="empty-state">
                  <p>
                    Người dùng này chưa nhận được <a href="#">danh hiệu</a> nào.
                  </p>
                </div>
              </div>

              {/* Posts Section */}
              <div className="profile-section">
                <h2 className="section-title">Bài viết gần đây</h2>
                <div
                  className="profile-posts-list"
                  style={{ marginTop: "16px" }}
                >
                  {loading ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Đang tải bài viết...
                    </div>
                  ) : userPosts.length > 0 ? (
                    userPosts.map((post) => (
                      <PostCard
                        key={post.postId || post.id}
                        post={post}
                        hideFollowButton={true}
                      />
                    ))
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "var(--text-secondary)",
                        backgroundColor: "var(--secondary-bg)",
                        borderRadius: "12px",
                      }}
                    >
                      {isOwnProfile
                        ? "Bạn chưa có bài viết nào."
                        : "Người dùng này chưa có bài viết nào."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Profile;
