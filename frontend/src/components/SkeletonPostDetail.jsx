import React from 'react';

const SkeletonPostDetail = () => {
    return (
        <div className="post-detail-card-premium skeleton-pulse" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e1e4e8', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div className="skeleton skeleton-avatar" style={{ width: '48px', height: '48px' }}></div>
                <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '150px', height: '18px' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '100px', height: '12px' }}></div>
                </div>
            </div>

            <div className="skeleton skeleton-text" style={{ width: '80%', height: '32px', marginBottom: '16px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '100%', height: '16px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '95%', height: '16px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '90%', height: '16px', marginBottom: '24px' }}></div>

            <div className="skeleton skeleton-image" style={{ width: '100%', height: '400px', borderRadius: '12px' }}></div>
        </div>
    );
};

export default SkeletonPostDetail;
