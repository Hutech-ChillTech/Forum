import React, { useState } from 'react';
import { API_BASE_URL } from '../utils/apiFetch.js';
import shareService from '../service/shareService';
import authService from '../service/authService';

const ShareModal = ({ post, isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState(false);
    const userProfile = authService.getUser();
    
    if (!isOpen || !post) return null;
    
    const id = post.postId || post.id || post.postID;
    const shareUrl = `${window.location.origin}/posts/${id || ''}`;
    
    const handleCopy = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareUrl);
            } else {
                // Fallback for non-secure contexts
                const textArea = document.createElement("textarea");
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            
            // Record share in background
            if (userProfile && id) {
                setSharing(true);
                try {
                    await shareService.sharePost(id, { platform: 'COPY_LINK' });
                } catch (err) {
                    console.error('Failed to record share:', err);
                } finally {
                    setSharing(false);
                }
            }
        } catch (err) {
            console.error('Copy failed:', err);
            alert('Không thể tự động copy. Vui lòng copy thủ công đường link bên dưới.');
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div className="modal-content" style={{
                backgroundColor: 'var(--card-bg)',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '450px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)',
                onClick: (e) => e.stopPropagation()
            }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Chia sẻ bài viết</h2>
                    <button onClick={onClose} style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: 'var(--text-secondary)',
                        fontSize: '24px'
                    }}>&times;</button>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Copy đường dẫn bên dưới để gửi cho bạn bè:</p>
                    <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        padding: '12px', 
                        backgroundColor: 'var(--secondary-bg)', 
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        alignItems: 'center'
                    }}>
                        <input 
                            readOnly 
                            value={shareUrl} 
                            style={{ 
                                flex: 1, 
                                background: 'transparent', 
                                border: 'none', 
                                color: 'var(--text-color)', 
                                outline: 'none',
                                fontSize: '14px'
                            }} 
                        />
                        <button 
                            onClick={handleCopy}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: copied ? '#10b981' : 'var(--primary-color)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            {copied ? 'Đã copy!' : 'Copy'}
                        </button>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button onClick={onClose} style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'transparent',
                        color: 'var(--text-color)',
                        cursor: 'pointer'
                    }}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
