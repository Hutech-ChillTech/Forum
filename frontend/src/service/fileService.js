import { apiFetch, API_BASE_URL } from '../utils/apiFetch.js';

const fileService = {
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiFetch(`${API_BASE_URL}/api/v1/files/upload`, {
            method: 'POST',
            // Note: Do not set Content-Type header when using FormData, 
            // the browser will set it automatically with the correct boundary
            body: formData
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to upload image');
        }

        return await response.json(); // { url: "/uploads/..." }
    }
};

export default fileService;
