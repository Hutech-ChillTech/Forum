/* Toast.jsx */
import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Toast.css';

export const showToast = (message, title = 'Thông báo', type = 'info', duration = 5000) => {
    window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message, title, type, duration }
    }));
};

const Toast = () => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, fading: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 400);
    }, []);

    useEffect(() => {
        const handleToastEvent = (e) => {
            const { message, title, type, duration } = e.detail;
            const id = Date.now();
            const newToast = { id, message, title, type, duration };
            setToasts(prev => [newToast, ...prev].slice(0, 3));

            if (duration !== Infinity) {
                setTimeout(() => removeToast(id), duration);
            }
        };

        window.addEventListener('app-toast', handleToastEvent);
        return () => window.removeEventListener('app-toast', handleToastEvent);
    }, [removeToast]);

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast-${toast.type} ${toast.fading ? 'fade-out' : ''}`}>
                    <div className="toast-icon">
                        {toast.type === 'success' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 5 11"></polyline></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        )}
                    </div>
                    <div className="toast-content">
                        <div className="toast-title">{toast.title}</div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>✕</button>
                </div>
            ))}
        </div>
    );
};

export default Toast;
