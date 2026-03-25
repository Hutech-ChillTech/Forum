import { useState, useRef, useEffect } from 'react';
import postService from '../service/postService';
import authService from '../service/authService';
import fileService from '../service/fileService';
import { API_BASE_URL } from '../utils/apiFetch';
import '../styles/CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated, postToEdit = null }) => {
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState([{ id: Date.now(), type: 'text', content: '' }]);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const fileInputRef = useRef(null);

    // Get real user data
    const user = authService.getUser() || { fullName: "User", avatar: null };

    // Reset or load post on open
    useEffect(() => {
        if (!isOpen) return;

        if (postToEdit) {
            setIsEditMode(true);
            setTitle(postToEdit.title || '');

            // Basic parser for content blocks
            // This is a simplified version of the reverse of the block-to-string logic
            const content = postToEdit.content || '';
            const newBlocks = [];

            // Split by image and code markers
            const parts = content.split(/(!\[image\]\(.*?\)|```[\s\S]*?(?:```|$))/g);

            parts.forEach((part, index) => {
                if (!part) return;

                if (index % 2 !== 0) {
                    if (part.startsWith('![')) {
                        const url = part.match(/\((.*?)\)/)?.[1];
                        if (url) newBlocks.push({ id: Date.now() + index, type: 'image', content: url });
                    } else if (part.startsWith('```')) {
                        const code = part.replace(/^```[^\n]*\n?|```$/g, '');
                        // even if empty, we insert it so user can edit it
                        newBlocks.push({ id: Date.now() + index, type: 'code', content: code });
                    }
                } else {
                    const text = part.trim();
                    if (text || index === 0) {
                        newBlocks.push({ id: Date.now() + index, type: 'text', content: text });
                    }
                }
            });

            if (newBlocks.length === 0) {
                newBlocks.push({ id: Date.now(), type: 'text', content: '' });
            }
            setBlocks(newBlocks);
        } else {
            setIsEditMode(false);
            setTitle('');
            setBlocks([{ id: Date.now(), type: 'text', content: '' }]);
        }
    }, [isOpen, postToEdit]);

    const handleAddCode = () => {
        setBlocks([...blocks, { id: Date.now(), type: 'code', content: '' }, { id: Date.now() + 1, type: 'text', content: '' }]);
    };

    const handleAddImage = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setIsUploading(true);
                // 1. Show local preview while uploading (optional, but good for UX)
                const tempId = Date.now();
                const previewUrl = URL.createObjectURL(file);
                setBlocks([...blocks, { id: tempId, type: 'image', content: previewUrl, uploading: true }, { id: Date.now() + 1, type: 'text', content: '' }]);

                // 2. Upload to server
                const result = await fileService.uploadFile(file);

                // 3. Update block with server URL
                setBlocks(prev => prev.map(b => b.id === tempId ? { ...b, content: result.url, uploading: false } : b));
            } catch (err) {
                alert('Lỗi tải ảnh lên: ' + err.message);
                // Remove the failed block
                setBlocks(prev => prev.filter(b => !b.uploading));
            } finally {
                setIsUploading(false);
            }
        }
        e.target.value = null;
    };

    const handleBlockChange = (id, newContent) => {
        setBlocks(blocks.map(block => block.id === id ? { ...block, content: newContent } : block));
    };

    const handleRemoveBlock = (id) => {
        setBlocks(prevBlocks => {
            const index = prevBlocks.findIndex(b => b.id === id);
            if (index === -1) return prevBlocks;

            let newBlocks = [...prevBlocks];
            const nextBlock = newBlocks[index + 1];

            if (nextBlock && nextBlock.type === 'text' && nextBlock.content.trim() === '') {
                newBlocks.splice(index + 1, 1);
            }

            newBlocks.splice(index, 1);

            let cleanedBlocks = [];
            for (let i = 0; i < newBlocks.length; i++) {
                const current = newBlocks[i];
                const prev = cleanedBlocks[cleanedBlocks.length - 1];

                if (prev && prev.type === 'text' && current.type === 'text') {
                    let combinedContent = prev.content;
                    if (prev.content.trim() && current.content.trim()) {
                        combinedContent += '\n\n' + current.content;
                    } else if (current.content) {
                        combinedContent += current.content;
                    }
                    cleanedBlocks[cleanedBlocks.length - 1] = { ...prev, content: combinedContent };
                } else {
                    cleanedBlocks.push(current);
                }
            }

            if (cleanedBlocks.length === 0) {
                cleanedBlocks = [{ id: Date.now(), type: 'text', content: '' }];
            }
            return cleanedBlocks;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isUploading) {
            alert('Vui lòng đợi ảnh tải lên xong');
            return;
        }

        const validBlocks = blocks.filter(b => b.type === 'image' || b.content.trim() !== '');
        if (validBlocks.length === 0 || !title.trim()) {
            alert('Vui lòng nhập tiêu đề và nội dung');
            return;
        }

        const fullContent = validBlocks.map(block => {
            if (block.type === 'code') return `\n\`\`\`\n${block.content}\n\`\`\`\n`;
            if (block.type === 'image') return `\n![image](${block.content})\n`;
            return block.content;
        }).join('\n');

        const firstImage = validBlocks.find(b => b.type === 'image')?.content || null;

        try {
            const userProfile = authService.getUser();
            if (!userProfile || !userProfile.userId) {
                alert('Vui lòng đăng nhập lại');
                return;
            }

            const postData = {
                userId: userProfile.userId,
                title: title.trim(),
                content: fullContent,
                imageURL: firstImage,
                tagNames: []
            };

            let resultPost;
            if (isEditMode && postToEdit) {
                resultPost = await postService.updatePost(postToEdit.postId || postToEdit.id, postData);
            } else {
                resultPost = await postService.createPost(postData);
            }

            // Clear Home page cache so it fetches fresh data next time
            sessionStorage.removeItem('home_posts_cache');
            sessionStorage.removeItem('home_page_cache');
            sessionStorage.setItem('FORCE_REFRESH_POSTS', 'true');

            if (onPostCreated) onPostCreated(resultPost);

            setTitle('');
            setBlocks([{ id: Date.now(), type: 'text', content: '' }]);
            onClose();
            if (isEditMode) window.location.reload();
        } catch (err) {
            console.error('Post action error:', err);
            alert('Lỗi: ' + err.message);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{isEditMode ? 'CHỈNH SỬA BÀI VIẾT   ' : 'TẠO BÀI VIẾT MỚI'}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="post-form">
                    <div className="post-user-info">
                        <div className="post-avatar">
                            {user.avatar ? <img src={user.avatar} alt="" /> : <span className="post-avatar-initials">{getInitials(user.fullName)}</span>}
                        </div>
                        <span className="post-username">{user.username || user.username || "Người dùng"}</span>

                        <div className="post-action-buttons">
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                            <button type="button" className="btn-add-image" onClick={handleAddImage} disabled={isUploading}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M14.5 2h-13C.67 2 0 2.67 0 3.5v9c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5zM1 12.5v-9c0-.28.22-.5.5-.5h13c.28 0 .5.22.5.5v6.97l-2.22-2.22a.5.5 0 00-.71 0L9 11.32 6.85 9.17a.5.5 0 00-.71 0L1 14.31v-1.81zM4 6a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                                {isUploading ? 'Đang tải...' : 'Thêm ảnh'}
                            </button>
                            <button type="button" className="btn-add-code" onClick={handleAddCode}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M4.72 3.22a.75.75 0 011.06 1.06L2.06 8l3.72 3.72a.75.75 0 11-1.06 1.06L.47 8.53a.75.75 0 010-1.06l4.25-4.25zm6.56 0a.75.75 0 10-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 101.06 1.06l4.25-4.25a.75.75 0 000-1.06l-4.25-4.25z" />
                                </svg>
                                Thêm code
                            </button>
                        </div>
                    </div>

                    <div className="post-content-wrapper">
                        <input
                            className="post-title-input"
                            placeholder="Nhập tiêu đề bài viết..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', outline: 'none' }}
                        />

                        {blocks.map((block, index) => {
                            if (block.type === 'text') {
                                return (
                                    <div key={block.id} className="text-block-container" style={{ position: 'relative', marginBottom: '12px' }}>
                                        <textarea
                                            className="post-textarea"
                                            placeholder={index === 0 ? "Hãy chia sẻ gì đó nhé!" : "Viết tiếp..."}
                                            value={block.content}
                                            onChange={(e) => handleBlockChange(block.id, e.target.value)}
                                            rows={blocks.length > 1 ? 2 : 6}
                                        />
                                        {blocks.length > 1 && (
                                            <button type="button" className="remove-block-btn" onClick={() => handleRemoveBlock(block.id)}>✕</button>
                                        )}
                                    </div>
                                );
                            } else if (block.type === 'code') {
                                return (
                                    <div key={block.id} className="code-block-container" style={{ position: 'relative', marginBottom: '12px' }}>
                                        <textarea
                                            className="code-textarea"
                                            placeholder="Dán mã code code của bạn vào đây..."
                                            value={block.content}
                                            onChange={(e) => handleBlockChange(block.id, e.target.value)}
                                            spellCheck={false}
                                        />
                                        <button type="button" className="remove-block-btn" onClick={() => handleRemoveBlock(block.id)}>✕</button>
                                    </div>
                                );
                            } else if (block.type === 'image') {
                                return (
                                    <div key={block.id} className="image-block-container" style={{ position: 'relative', marginBottom: '12px', opacity: block.uploading ? 0.6 : 1 }}>
                                        <img src={block.content.startsWith('/uploads/') ? `${API_BASE_URL}${block.content}` : block.content} alt="Preview" style={{ width: '100%', borderRadius: '12px', objectFit: 'contain', maxHeight: '400px', background: '#2d2d2d' }} />
                                        {block.uploading && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white' }}>Đang tải lên...</div>}
                                        <button type="button" className="remove-block-btn" onClick={() => handleRemoveBlock(block.id)}>✕</button>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>

                    <div className="post-form-footer">
                        <button type="submit" className="btn-submit-post" disabled={isUploading || !title.trim()}>
                            {isUploading ? 'ĐANG TẢI...' : (isEditMode ? 'LƯU THAY ĐỔI' : 'ĐĂNG BÀI')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
