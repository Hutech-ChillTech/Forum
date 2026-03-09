import { useState } from 'react';
import '../styles/CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
    const [blocks, setBlocks] = useState([{ id: Date.now(), type: 'text', content: '' }]);

    // Mock user data
    const mockUser = {
        name: "Alex",
        avatar: null
    };

    const handleAddCode = () => {
        setBlocks([...blocks, { id: Date.now(), type: 'code', content: '' }, { id: Date.now() + 1, type: 'text', content: '' }]);
    };

    const handleAddImage = () => {
        const mockImages = ['/images/download.jpg', '/images/download.png', '/images/download (2).png', '/images/download (3).png'];
        const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
        setBlocks([...blocks, { id: Date.now(), type: 'image', content: randomImage }, { id: Date.now() + 1, type: 'text', content: '' }]);
    };

    const handleBlockChange = (id, newContent) => {
        setBlocks(blocks.map(block => block.id === id ? { ...block, content: newContent } : block));
    };

    const handleRemoveBlock = (id) => {
        setBlocks(blocks.filter(block => block.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Filter out empty text and code blocks
        const validBlocks = blocks.filter(b => b.type === 'image' || b.content.trim() !== '');
        if (validBlocks.length === 0) return;

        // Create post object
        const newPost = {
            id: Date.now(),
            author: mockUser.name,
            avatar: mockUser.avatar,
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: 0,
            contentBlocks: validBlocks
        };

        // Call parent callback to add post
        if (onPostCreated) {
            onPostCreated(newPost);
        }

        // Reset and close
        setBlocks([{ id: Date.now(), type: 'text', content: '' }]);
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

                        <div className="post-action-buttons">
                            <button type="button" className="btn-add-image" onClick={handleAddImage}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M14.5 2h-13C.67 2 0 2.67 0 3.5v9c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5zM1 12.5v-9c0-.28.22-.5.5-.5h13c.28 0 .5.22.5.5v6.97l-2.22-2.22a.5.5 0 00-.71 0L9 11.32 6.85 9.17a.5.5 0 00-.71 0L1 14.31v-1.81zM4 6a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                                Thêm ảnh
                            </button>
                            <button type="button" className="btn-add-code" onClick={handleAddCode}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.72 3.22a.75.75 0 011.06 1.06L2.06 8l3.72 3.72a.75.75 0 11-1.06 1.06L.47 8.53a.75.75 0 010-1.06l4.25-4.25zm6.56 0a.75.75 0 10-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 101.06 1.06l4.25-4.25a.75.75 0 000-1.06l-4.25-4.25z" />
                                </svg>
                                Thêm code
                            </button>
                        </div>
                    </div>

                    <div className="post-content-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {blocks.map((block, index) => {
                            if (block.type === 'text') {
                                return (
                                    <textarea
                                        key={block.id}
                                        className="post-textarea"
                                        placeholder={index === 0 ? "Hãy chia sẻ gì đó nhé!" : "Viết tiếp bình luận..."}
                                        value={block.content}
                                        onChange={(e) => handleBlockChange(block.id, e.target.value)}
                                        rows={blocks.length > 1 ? 2 : 8}
                                        style={{ minHeight: blocks.length > 1 ? '60px' : '200px' }}
                                    />
                                );
                            } else if (block.type === 'code') {
                                return (
                                    <div key={block.id} style={{ position: 'relative' }}>
                                        <textarea
                                            className="code-textarea"
                                            placeholder="Dán mã code code của bạn vào đây..."
                                            value={block.content}
                                            onChange={(e) => handleBlockChange(block.id, e.target.value)}
                                            spellCheck={false}
                                            style={{ marginTop: 0 }}
                                        />
                                        <button type="button" onClick={() => handleRemoveBlock(block.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '12px' }}>✕ Xóa code</button>
                                    </div>
                                );
                            } else if (block.type === 'image') {
                                return (
                                    <div key={block.id} style={{ position: 'relative' }}>
                                        <img src={block.content} alt="Preview" style={{ width: '100%', borderRadius: '12px', objectFit: 'contain', maxHeight: '300px', backgroundColor: '#e3e6e8' }} />
                                        <button type="button" onClick={() => handleRemoveBlock(block.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', padding: '6px 12px', borderRadius: '12px', fontSize: '12px' }}>✕ Xóa ảnh</button>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>

                    <button
                        type="submit"
                        className="btn-submit-post"
                        disabled={blocks.every(b => b.type === 'text' && !b.content.trim()) && !blocks.some(b => b.type === 'image' || b.type === 'code')}
                    >
                        ĐĂNG BÀI
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
