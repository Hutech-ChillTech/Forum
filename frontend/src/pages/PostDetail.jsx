import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostDetailModal from '../components/PostDetailModal';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
            <PostDetailModal
                postId={id}
                onClose={() => navigate('/posts')}
                isFullPage={true}
            />
        </div>
    );
};

export default PostDetail;
