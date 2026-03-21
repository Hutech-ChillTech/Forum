const API_BASE_URL = 'http://localhost:8080/api';

let refreshTokenPromise = null;

/**
 * Hàm thực hiện gọi API Refresh Token
 */
const performRefreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        const response = await fetch(`${API_BASE_URL}/v1/auth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken })
        });

        const data = await response.json();

        if (response.ok && data.result?.accessToken) {
            const newToken = data.result.accessToken;
            const newRT = data.result.refreshToken;
            const tokenType = data.result.tokenType || "Bearer";

            localStorage.setItem("token", newToken);
            localStorage.setItem("refreshToken", newRT);
            localStorage.setItem("tokenType", tokenType);

            return newToken;
        } else {
            throw new Error("Refresh session failed");
        }
    } catch (error) {
        localStorage.clear();
        window.location.href = "/login";
        throw error;
    } finally {
        refreshTokenPromise = null;
    }
};

/**
 * Hàm Wrapper cho fetch - Tự động xử lý xác thực
 */
export const authenticatedFetch = async (url, options = {}) => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    const getHeaders = () => {
        const token = localStorage.getItem("token");
        const tokenType = localStorage.getItem("tokenType") || "Bearer";
        return {
            "Content-Type": "application/json",
            ...options.headers,
            ...(token ? { "Authorization": `${tokenType} ${token}` } : {})
        };
    };

    try {
        let response = await fetch(fullUrl, { ...options, headers: getHeaders() });

        if (response.status === 401) {
            const errorData = await response.clone().json();

            if (errorData.message === "ACCESS_TOKEN_EXPIRED") {

                if (!refreshTokenPromise) {
                    refreshTokenPromise = performRefreshToken();
                }

                const newToken = await refreshTokenPromise;

                const tokenType = localStorage.getItem("tokenType") || "Bearer";
                return fetch(fullUrl, {
                    ...options,
                    headers: {
                        ...getHeaders(),
                        "Authorization": `${tokenType} ${newToken}`
                    }
                });
            }
        }

        return response;
    } catch (err) {
        return Promise.reject(err);
    }
};

export const api = {
    get: (url, options) => authenticatedFetch(url, { ...options, method: 'GET' }),
    post: (url, body, options) => authenticatedFetch(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body)
    }),
    put: (url, body, options) => authenticatedFetch(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    delete: (url, options) => authenticatedFetch(url, { ...options, method: 'DELETE' }),
};

export default api;
