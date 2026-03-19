import api from "./api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const searchService = {
    async globalSearch(keyword) {
        const response = await api.get(`${API_BASE_URL}/api/v1/search?keyword=${encodeURIComponent(keyword)}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Tìm kiếm thất bại");
        }
        return data.result;
    },

    async getSearchHistory() {
        const response = await api.get(`${API_BASE_URL}/api/v1/search/history`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Lấy lịch sử tìm kiếm thất bại");
        }
        return data.result;
    },

    async clearSearchHistory() {
        const response = await api.delete(`${API_BASE_URL}/api/v1/search/history/clear`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Xóa lịch sử tìm kiếm thất bại");
        }
        return data.result;
    },

    async removeSearchHistoryItem(keyword) {
        const response = await api.delete(`${API_BASE_URL}/api/v1/search/history/remove?keyword=${encodeURIComponent(keyword)}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Xóa mục lịch sử thất bại");
        }
        return data.result;
    }
};

export default searchService;
