import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import PostCard from "../components/PostCard";
import postService from "../service/postService";
import "../styles/Home.css";
import "../styles/PostDetail.css";

const HOME_CACHE_KEY = "home_posts_cache";
const HOME_PAGE_KEY = "home_page_cache";
const HOME_SCROLL_KEY = "home_scroll_pos";

const Home = () => {
  const { setSelectedPostId } = useOutletContext();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(initialLoadingInitially);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Helper for initialLoading state determination
  function initialLoadingInitially() {
    const cachedPosts = sessionStorage.getItem(HOME_CACHE_KEY);
    return !(cachedPosts && JSON.parse(cachedPosts).length > 0);
  }
  // ... (rest of state logic remains similar)

  const [userData, setUserData] = useState(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        return {
          name: parsed.fullName || parsed.displayName || "Bạn",
          avatar: parsed.avatar || null,
        };
      } catch (e) {
        console.error("Error parsing user profile in Home:", e);
      }
    }
    return { name: "Bạn", avatar: null };
  });

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

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const cachedPosts = sessionStorage.getItem(HOME_CACHE_KEY);
    const cachedPage = sessionStorage.getItem(HOME_PAGE_KEY);
    const cachedScroll = sessionStorage.getItem(HOME_SCROLL_KEY);

    if (cachedPosts && cachedPage && JSON.parse(cachedPosts).length > 0) {
      setUserPosts(JSON.parse(cachedPosts));
      setPage(parseInt(cachedPage));
      setInitialLoading(false);

      // Wait longer for images and components to render
      const timer = setTimeout(() => {
        if (cachedScroll) {
          window.scrollTo({
            top: parseInt(cachedScroll),
            behavior: "instant",
          });
        }
      }, 300); // 300ms is usually enough for most of the layout to stabilize

      return () => clearTimeout(timer);
    } else {
      fetchPosts(0, true);
    }
  }, []);

  // Effect to continuously track scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Only save if we are not in initial loading
      if (!initialLoading) {
        sessionStorage.setItem(HOME_SCROLL_KEY, window.scrollY.toString());
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [initialLoading]);

  // Save full state to sessionStorage before navigating away
  useEffect(() => {
    const handleSave = () => {
      if (userPosts.length > 0 || (!initialLoading && page > 0)) {
        sessionStorage.setItem(HOME_CACHE_KEY, JSON.stringify(userPosts));
        sessionStorage.setItem(HOME_PAGE_KEY, page.toString());
      }
    };

    window.addEventListener("beforeunload", handleSave);
    return () => {
      handleSave();
      window.removeEventListener("beforeunload", handleSave);
    };
  }, [userPosts, page, initialLoading]);

  const fetchPosts = async (pageNum, isInitial = false) => {
    try {
      if (isInitial) setInitialLoading(true);
      else setLoading(true);

      const size = 10; // Load 10 posts per batch for a better balance
      const data = await postService.getPublishedPosts(pageNum, size);

      let newPosts = [];
      if (data && data.posts) {
        newPosts = data.posts;
      } else if (Array.isArray(data)) {
        newPosts = data;
      }

      if (isInitial) {
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

<<<<<<< HEAD
      setHasMore(newPosts.length >= size);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError("Không thể tải bài viết. Vui lòng thử lại sau.");
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  // Load more when page changes (only if it's not the first page which is handled by mount/restore)
  useEffect(() => {
    if (page > 0) {
      const cachedPage = sessionStorage.getItem(HOME_PAGE_KEY);
      // Only fetch if the page we are moving to is NOT already cached
      if (!cachedPage || page > parseInt(cachedPage)) {
        fetchPosts(page);
      }
    }
  }, [page]);

  useEffect(() => {
    const handleProfileUpdate = (e) => {
      const profile = e.detail;
      setUserData({
        name: profile.fullName || profile.displayName,
        avatar: profile.avatar || null,
      });
=======
    // Restore state from sessionStorage on mount
    useEffect(() => {
        const cachedPosts = sessionStorage.getItem(HOME_CACHE_KEY);
        const cachedPage = sessionStorage.getItem(HOME_PAGE_KEY);
        const cachedScroll = sessionStorage.getItem(HOME_SCROLL_KEY);
        const forceRefresh = sessionStorage.getItem('FORCE_REFRESH_POSTS') === 'true';

        if (!forceRefresh && cachedPosts && cachedPage && JSON.parse(cachedPosts).length > 0) {
            setUserPosts(JSON.parse(cachedPosts));
            setPage(parseInt(cachedPage));
            setInitialLoading(false);

            // Wait longer for images and components to render
            const timer = setTimeout(() => {
                if (cachedScroll) {
                    window.scrollTo({
                        top: parseInt(cachedScroll),
                        behavior: 'instant'
                    });
                }
            }, 300); // 300ms is usually enough for most of the layout to stabilize

            return () => clearTimeout(timer);
        } else {
            fetchPosts(0, true);
        }
    }, []);

    // Effect to continuously track scroll position
    useEffect(() => {
        const handleScroll = () => {
            // Only save if we are not in initial loading
            if (!initialLoading) {
                sessionStorage.setItem(HOME_SCROLL_KEY, window.scrollY.toString());
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [initialLoading]);

    // Save full state to sessionStorage before navigating away
    useEffect(() => {
        const handleSave = () => {
            const forceRefresh = sessionStorage.getItem('FORCE_REFRESH_POSTS') === 'true';
            if (forceRefresh) return; // Don't cache stale state during deletion reload

            if (userPosts.length > 0 || (!initialLoading && page > 0)) {
                sessionStorage.setItem(HOME_CACHE_KEY, JSON.stringify(userPosts));
                sessionStorage.setItem(HOME_PAGE_KEY, page.toString());
            }
        };

        window.addEventListener('beforeunload', handleSave);
        return () => {
            handleSave();
            window.removeEventListener('beforeunload', handleSave);
        };
    }, [userPosts, page, initialLoading]);

    const fetchPosts = async (pageNum, isInitial = false) => {
        try {
            if (isInitial) setInitialLoading(true);
            else setLoading(true);

            const size = 10; // Load 10 posts per batch for a better balance
            const data = await postService.getPublishedPosts(pageNum, size);

            let newPosts = [];
            if (data && data.posts) {
                newPosts = data.posts;
            } else if (Array.isArray(data)) {
                newPosts = data;
            }

            if (isInitial) {
                setUserPosts(newPosts);
            } else {
                setUserPosts(prev => {
                    const existingIds = new Set(prev.map(p => String(p.postId || p.id || p.postID)));
                    const uniqueNewPosts = newPosts.filter(p => !existingIds.has(String(p.postId || p.id || p.postID)));
                    return [...prev, ...uniqueNewPosts];
                });
            }

            setHasMore(newPosts.length >= size);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            setError('Không thể tải bài viết. Vui lòng thử lại sau.');
        } finally {
            setInitialLoading(false);
            setLoading(false);
        }
>>>>>>> e787e2f00f81ad9c35983768bd468eb6fc8ce456
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
  }, []);

  const handlePostCreated = (newPost) => {
    setUserPosts((prevPosts) => [newPost, ...prevPosts]);
    // Update cache immediately
    sessionStorage.setItem(
      HOME_CACHE_KEY,
      JSON.stringify([newPost, ...userPosts]),
    );
  };

  useEffect(() => {
    const onGlobalPostCreated = (e) => handlePostCreated(e.detail);
    window.addEventListener("globalPostCreated", onGlobalPostCreated);
    return () =>
      window.removeEventListener("globalPostCreated", onGlobalPostCreated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPosts]);

  return (
    <>
      <main className="home-main">
        <div
          className="greeting-card"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("openCreatePost"))
          }
        >
          <div className="avatar-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="greeting-input-mock">
            <h2 className="greeting-text">
              Xin chào {(userData.name || "bạn").split(" ").pop()}, chia sẻ gì
              đó nhé!
            </h2>
          </div>
        </div>

        {initialLoading && userPosts.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div className="loader" style={{ margin: "0 auto" }}>
              Đang tải bài viết...
            </div>
          </div>
        ) : (
          <div className="user-posts-section">
            <h2 className="section-title">Bài viết mới nhất</h2>
            {userPosts.map((post, index) => (
              <div
                key={post.postId || post.id || index}
                ref={index === userPosts.length - 1 ? lastPostElementRef : null}
              >
                <PostCard
                  post={post}
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
                Bạn đã xem hết bài viết rồi!
              </div>
            )}
          </div>
        )}

        {!initialLoading && userPosts.length === 0 && !error && (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--text-secondary)",
              backgroundColor: "var(--card-bg)",
              borderRadius: "12px",
            }}
          >
            Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!
          </div>
        )}

        {error && (
          <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
            {error}
          </div>
        )}
      </main>

      <aside className="home-right-sidebar">
        <div className="tags-widget">
          <h3 className="widget-title">Tags phổ biến</h3>
          <div className="tags-list">
            {["java", "react", "spring-boot", "javascript"].map((tag) => (
              <Link key={tag} to="/tags" className="tag-item">
                <span className="tag-name">#{tag}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Home;
