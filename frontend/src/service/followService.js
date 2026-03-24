import { apiFetch, API_BASE_URL } from "../utils/apiFetch.js";

const followService = {
  // ── Follow / Unfollow ──────────────────────────────────────────────────────
  async follow(userId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/${userId}/follow`,
      {
        method: "POST",
      },
    );
    // 409 (Conflict) = already following — treat as success so UI can correct itself
    if (response.status === 409) return { alreadyFollowing: true };
    const data = await response.json();
    // Also detect "already following" via error code 11001 in body (fallback)
    if (!response.ok) {
      if (data.code === 11001) return { alreadyFollowing: true };
      throw new Error(data.message || "Failed to follow user");
    }
    return data.result ?? data;
  },

  async unfollow(userId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/${userId}/follow`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to unfollow user");
    }
  },

  // ── Trạng thái follow ──────────────────────────────────────────────────────
  async getFollowStatus(userId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/${userId}/follow/status`,
    );
    if (!response.ok) throw new Error("Failed to get follow status");
    const data = await response.json();
    const raw = data.result ?? data;
    // Normalize: Java @Getter on boolean isXxx produces getter isXxx() which
    // Jackson serializes as "xxx" (stripping the "is" prefix). We apply
    // @JsonProperty on the backend but also handle both shapes here.
    return {
      isFollowing: raw.isFollowing ?? raw.following ?? false,
      isFollowedBy: raw.isFollowedBy ?? raw.followedBy ?? false,
      isMutual: raw.isMutual ?? raw.mutual ?? false,
    };
  },

  // ── Danh sách ──────────────────────────────────────────────────────────────
  async getFollowers(userId, page = 0, size = 20) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/${userId}/followers?page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch followers");
    const data = await response.json();
    return data.result ?? data;
  },

  async getFollowing(userId, page = 0, size = 20) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/${userId}/following?page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch following");
    const data = await response.json();
    return data.result ?? data;
  },

  async getFriends(userId, page = 0, size = 20) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/${userId}/friends?page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch friends");
    const data = await response.json();
    return data.result ?? data;
  },

  // ── Thống kê ──────────────────────────────────────────────────────────────
  async getFollowStats(userId) {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/users/${userId}/following/count`,
    );
    if (!response.ok) throw new Error("Failed to get follow stats");
    const data = await response.json();
    return data.result ?? data; // { followers, following, friends }
  },
};

export default followService;
