import React, { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import savedPostService from "../service/savedPostService";
import "../styles/Home.css"; // Reusing Home styles for consistency

const Saved = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const data = await savedPostService.getMyBookmarks(0, 50);
        // API may return array directly or wrapped in posts/items field
        setSavedPosts(
          Array.isArray(data) ? data : (data.posts ?? data.items ?? []),
        );
      } catch (err) {
        console.error("Failed to load bookmarks", err);
        setSavedPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  return (
    <>
      {/* Main Content */}
      <main className="home-main">
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "var(--text-color)",
            }}
          >
            Bài viết đã lưu
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
            Danh sách các bài viết bạn đã đánh dấu để xem lại sau.
          </p>
        </div>

        <div className="posts-container">
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-secondary)",
              }}
            >
              Đang tải...
            </div>
          ) : savedPosts.length > 0 ? (
            savedPosts.map((post) => (
              <PostCard key={post.postId ?? post.id} post={post} />
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "var(--card-bg)",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
              }}
            >
              <div style={{ marginBottom: "20px", opacity: 0.3 }}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 style={{ color: "var(--text-color)", marginBottom: "8px" }}>
                Chưa có bài viết nào được lưu
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Hãy đánh dấu các bài viết thú vị để xem lại tại đây.
              </p>
              <a
                href="/posts"
                className="btn-primary"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  marginTop: "20px",
                  padding: "10px 20px",
                }}
              >
                Khám phá ngay
              </a>
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="home-right-sidebar">
        <div
          className="sidebar-widget"
          style={{
            backgroundColor: "var(--secondary-bg)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h3 className="widget-title">Mẹo nhỏ</h3>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-color)",
              lineHeight: "1.4",
            }}
          >
            Bạn có thể lưu bất kỳ bài viết nào bằng cách nhấn vào nút{" "}
            <strong>Lưu Bài</strong> ở cuối mỗi bài đăng.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Saved;
