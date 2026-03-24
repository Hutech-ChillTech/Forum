import { useState, useEffect, useRef, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import PostCard from "../components/PostCard";
import postService from "../service/postService";
import { showToast } from "../components/Toast";
import "../styles/Home.css";

const ModeratorReview = () => {
  const { setSelectedPostId } = useOutletContext();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  const fetchPosts = async (pageNum) => {
    try {
      if (pageNum === 0) setInitialLoading(true);
      else setLoading(true);

      const size = 10;
      const data = await postService.getPostsByStatus("PENDING", pageNum, size);

      let newPosts = [];
      if (data && data.posts) {
        newPosts = data.posts;
      } else if (Array.isArray(data)) {
        newPosts = data;
      }

      if (pageNum === 0) {
        setUserPosts(newPosts);
      } else {
        setUserPosts((prev) => {
          const existingIds = new Set(
            prev.map((p) => String(p.postId || p.id || p.postID)),
          );
          const uniqueNewPosts = newPosts.filter(
            (p) => !existingIds.has(String(p.postId || p.id || p.postID)),
          );
          return [...prev, ...uniqueNewPosts];
        });
      }

      setHasMore(newPosts.length >= size);
    } catch (err) {
      console.error("Failed to fetch pending posts:", err);
      showToast("Không thể tải bài viết chờ duyệt.", "Lỗi", "info");
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleApprove = async (postId) => {
    try {
      await postService.updatePostStatus(postId, "PUBLISHED");
      setUserPosts((prev) => prev.filter((p) => (p.postId || p.id) !== postId));
      showToast("Đã duyệt bài viết thành công!", "Thành công", "info");
    } catch (err) {
      showToast("Duyệt bài thất bại: " + err.message, "Lỗi", "info");
    }
  };

  const handleReject = async (postId) => {
    if (
      !window.confirm(
        "Bạn chắc chắn muốn từ chối và xóa vĩnh viễn bài viết này?",
      )
    )
      return;
    try {
      await postService.updatePostStatus(postId, "REJECTED");
      setUserPosts((prev) => prev.filter((p) => (p.postId || p.id) !== postId));
      showToast(
        "Đã từ chối và xóa bài viết khỏi hệ thống.",
        "Thành công",
        "info",
      );
    } catch (err) {
      showToast("Từ chối bài thất bại: " + err.message, "Lỗi", "info");
    }
  };

  return (
    <>
      <main className="home-main">
        <div
          className="section-header"
          style={{ marginBottom: "20px", padding: "0 16px" }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "var(--text-color)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--primary-color)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 11 15 1 5"></polyline>
            </svg>
            Danh sách bài viết chờ duyệt
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              marginTop: "4px",
            }}
          >
            Nội dung sẽ hiển thị trên trang chủ sau khi được phê duyệt.
          </p>
        </div>

        {initialLoading && userPosts.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div className="loader" style={{ margin: "0 auto" }}>
              Đang tải bài viết...
            </div>
          </div>
        ) : (
          <div className="user-posts-section">
            {userPosts.map((post, index) => (
              <div
                key={post.postId || post.id || index}
                ref={index === userPosts.length - 1 ? lastPostElementRef : null}
              >
                <PostCard
                  post={post}
                  reviewMode={true}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onOpenModal={(id) => setSelectedPostId(id)}
                />
              </div>
            ))}

            {loading && (
              <div style={{ padding: "20px", textAlign: "center" }}>
                <div className="loader" style={{ margin: "0 auto" }}>
                  Đang tải thêm...
                </div>
              </div>
            )}

            {!hasMore && userPosts.length > 0 && (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                }}
              >
                Đã hiển thị toàn bộ bài viết chờ duyệt.
              </div>
            )}
          </div>
        )}

        {!initialLoading && userPosts.length === 0 && (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--text-secondary)",
              backgroundColor: "var(--card-bg)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              margin: "0 16px",
            }}
          >
            🎉 Tuyệt vời! Không có bài viết nào đang chờ duyệt.
          </div>
        )}
      </main>

      <aside className="home-right-sidebar">
        <div className="tags-widget">
          <h3 className="widget-title">Quy tắc duyệt bài</h3>
          <div
            className="widget-content"
            style={{
              padding: "16px",
              fontSize: "14px",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            <p>
              • <b>Chấp nhận</b>: Bài viết sẽ được xuất hiện trên trang chủ cho
              mọi người.
            </p>
            <p style={{ marginTop: "8px" }}>
              • <b>Từ chối</b>: Bài viết sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.
            </p>
            <p
              style={{
                marginTop: "12px",
                fontSize: "12px",
                fontStyle: "italic",
              }}
            >
              * Vui lòng kiểm tra kỹ nội dung trước khi phê duyệt.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ModeratorReview;
