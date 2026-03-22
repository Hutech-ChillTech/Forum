import React from 'react';

const SkeletonPost = () => {
    return (
        <div className="post-card-premium" style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'var(--card-bg, #fff)', borderRadius: '12px', border: '1px solid var(--border-color, #e1e4e8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div className="skeleton skeleton-avatar"></div>
                <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '120px', height: '14px' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '80px', height: '10px' }}></div>
                </div>
            </div>

            <div className="skeleton skeleton-text" style={{ width: '70%', height: '24px', marginBottom: '12px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '100%', height: '14px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '90%', height: '14px', marginBottom: '16px' }}></div>

            <div className="skeleton skeleton-image" style={{ width: '100%', height: '300px', borderRadius: '12px', marginBottom: '16px' }}></div>

            <div style={{ display: 'flex', gap: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color, #e1e4e8)' }}>
                <div className="skeleton skeleton-text" style={{ width: '60px', height: '24px', borderRadius: '8px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '60px', height: '24px', borderRadius: '8px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '60px', height: '24px', borderRadius: '8px' }}></div>
            </div>
        </div>
    );
};

export default SkeletonPost;
