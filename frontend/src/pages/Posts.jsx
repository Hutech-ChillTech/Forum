import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import PostCard from '../components/PostCard';
import SkeletonPost from '../components/SkeletonPost';
import postService from '../service/postService';
import '../styles/Posts.css';

const POSTS_CACHE_KEY = 'posts_page_cache';
const POSTS_PAGE_KEY = 'posts_page_num';
const POSTS_SCROLL_KEY = 'posts_scroll_pos';

const Posts = () => {
  const { setSelectedPostId } = useOutletContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(initialLoadingInitially);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [sortFilter, setSortFilter] = useState('createdAt,desc');

  // Helper for initialLoading state determination
  function initialLoadingInitially() {
    const forceRefresh = sessionStorage.getItem('FORCE_REFRESH_POSTS') === 'true';
    if (forceRefresh) {
      sessionStorage.removeItem('FORCE_REFRESH_POSTS'); // Clear it
      return true;
    }
    const cachedPosts = sessionStorage.getItem(POSTS_CACHE_KEY);
    return !(cachedPosts && JSON.parse(cachedPosts).length > 0);
  }

  const observer = useRef();
  // ... (rest of search/fetch logic remains)
  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchPosts = async (pageNum, isInitial = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
        setPage(0);
      } else {
        setLoading(true);
      }

      setError(null);
      const size = 10;
      const data = await postService.getPublishedPosts(pageNum, size, sortFilter);

      let newPosts = [];
      if (data && data.posts) {
        newPosts = data.posts;
      } else if (Array.isArray(data)) {
        newPosts = data;
      }

      if (isInitial) {
        setPosts(newPosts);
      } else {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => String(p.postId || p.id || p.postID)));
          const uniqueNewPosts = newPosts.filter(p => !existingIds.has(String(p.postId || p.id || p.postID)));
          return [...prev, ...uniqueNewPosts];
        });
      }

      setHasMore(newPosts.length >= size);
      setTotalItems(data.totalItems || (isInitial ? newPosts.length : totalItems + newPosts.length));
    } catch (e) {
      setError('Không thể tải bài viết. Vui lòng thử lại.');
      console.error(e);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Track if it's the first render using a ref to prevent double-firing
  const isFirstRender = useRef(true);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const cachedPosts = sessionStorage.getItem(POSTS_CACHE_KEY);
    const cachedPage = sessionStorage.getItem(POSTS_PAGE_KEY);
    const cachedScroll = sessionStorage.getItem(POSTS_SCROLL_KEY);

    const forceRefresh = sessionStorage.getItem('FORCE_REFRESH_POSTS') === 'true';

    if (!forceRefresh && cachedPosts && cachedPage && JSON.parse(cachedPosts).length > 0) {
      setPosts(JSON.parse(cachedPosts));
      setPage(parseInt(cachedPage));
      setInitialLoading(false);

      // Restore scroll position
      const timer = setTimeout(() => {
        if (cachedScroll) {
          window.scrollTo({
            top: parseInt(cachedScroll),
            behavior: 'instant'
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      fetchPosts(0, true);
    }
  }, [sortFilter]);

  // Continuous scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!initialLoading) {
        sessionStorage.setItem(POSTS_SCROLL_KEY, window.scrollY.toString());
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initialLoading]);

  // Save state before navigating away
  useEffect(() => {
    const handleSave = () => {
      const forceRefresh = sessionStorage.getItem('FORCE_REFRESH_POSTS') === 'true';
      if (forceRefresh) return; // Don't cache stale state during deletion reload

      if (posts.length > 0) {
        sessionStorage.setItem(POSTS_CACHE_KEY, JSON.stringify(posts));
        sessionStorage.setItem(POSTS_PAGE_KEY, page.toString());
      }
    };
    window.addEventListener('beforeunload', handleSave);
    return () => {
      handleSave();
      window.removeEventListener('beforeunload', handleSave);
    };
  }, [posts, page]);

  // Adjust page-based fetching
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (page > 0) {
      const cachedPage = sessionStorage.getItem(POSTS_PAGE_KEY);
      if (!cachedPage || page > parseInt(cachedPage)) {
        fetchPosts(page);
      }
    }
  }, [page]);

  // Listen for new posts created anywhere in the app
  useEffect(() => {
    const onPostCreated = (e) => {
      const newPost = e.detail;
      setPosts(prev => {
        const id = String(newPost.postId || newPost.id || newPost.postID);
        if (prev.some(p => String(p.postId || p.id || p.postID) === id)) return prev;
        const updated = [newPost, ...prev];
        sessionStorage.setItem(POSTS_CACHE_KEY, JSON.stringify(updated));
        return updated;
      });
      setTotalItems(prev => prev + 1);
    };

    window.addEventListener('globalPostCreated', onPostCreated);
    return () => window.removeEventListener('globalPostCreated', onPostCreated);
  }, []);

  return (
    <>
      <main className="posts-main">
        <div className="questions-header">
          <h1>Bài viết</h1>
          <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('openCreatePost'))}>
            Tạo bài viết
          </button>
        </div>

        <div className="questions-toolbar">
          <div className="questions-count">{totalItems} bài viết</div>
          <div className="questions-filters">
            {[
              ['createdAt,desc', 'Mới nhất'],
              ['createdAt,asc', 'Cũ nhất'],
            ].map(([val, label]) => (
              <button
                key={val}
                className={"filter-btn" + (sortFilter === val ? ' active' : '')}
                onClick={() => {
                  setSortFilter(val);
                  setPage(0);
                  sessionStorage.removeItem(POSTS_CACHE_KEY);
                  sessionStorage.removeItem(POSTS_PAGE_KEY);
                  sessionStorage.removeItem(POSTS_SCROLL_KEY);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {initialLoading && posts.length === 0 ? (
          <div className="questions-list">
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </div>
        ) : error ? (
          <div style={{ padding: '20px', color: 'red' }}>{error}</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--card-bg)', borderRadius: '12px' }}>
            Chưa có bài viết nào.
          </div>
        ) : (
          <div className="questions-list">
            {posts.map((post, index) => (
              <div key={post.postId || post.id || index} ref={index === posts.length - 1 ? lastPostElementRef : null}>
                <PostCard
                  post={post}
                  onOpenModal={(id) => setSelectedPostId(id)}
                />
              </div>
            ))}

            {loading && (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div className="loader" style={{ margin: '0 auto' }}>Đang tải thêm...</div>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Bạn đã xem hết bài viết rồi!
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default Posts;
