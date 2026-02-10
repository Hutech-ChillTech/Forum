import { useState } from 'react';
import './CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
    const [postContent, setPostContent] = useState('');

    // Mock user data
    const mockUser = {
        name: "Alex",
        avatar: null
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!postContent.trim()) return;

        // Create post object
        const newPost = {
            id: Date.now(),
            content: postContent,
            author: mockUser.name,
            avatar: mockUser.avatar,
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: 0
        };

        // Call parent callback to add post
        if (onPostCreated) {
            onPostCreated(newPost);
        }

        // Reset and close
        setPostContent('');
        onClose();
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">TẠO BÀI VIẾT</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="post-form">
                    <div className="post-user-info">
                        <div className="post-avatar">
                            {mockUser.avatar ? (
                                <img src={mockUser.avatar} alt={mockUser.name} />
                            ) : (
                                <span className="post-avatar-initials">
                                    {getInitials(mockUser.name)}
                                </span>
                            )}
                        </div>
                        <span className="post-username">{mockUser.name}</span>

                        <button type="button" className="btn-add-image">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M14.5 2h-13C.67 2 0 2.67 0 3.5v9c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5zM1 12.5v-9c0-.28.22-.5.5-.5h13c.28 0 .5.22.5.5v6.97l-2.22-2.22a.5.5 0 00-.71 0L9 11.32 6.85 9.17a.5.5 0 00-.71 0L1 14.31v-1.81zM4 6a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                            Thêm ảnh
                        </button>
                    </div>

                    <div className="post-content-wrapper">
                        <textarea
                            className="post-textarea"
                            placeholder="Hãy chia sẻ gì đó nhé!"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            rows={8}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-submit-post"
                        disabled={!postContent.trim()}
                    >
                        ĐĂNG BÀI
                    </button>
                </form>
            </div>
        </div>
    );
};



export default CreatePostModal;
