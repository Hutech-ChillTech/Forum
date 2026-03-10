import { useState } from 'react';
import '../styles/ChatBox.css';

const ChatBox = ({ isOpen, onClose, onMinimize, title = "Trợ lý AI", avatar = "AI", status = "Đang hoạt động", initialMessages = [] }) => {
    const [messages, setMessages] = useState(initialMessages.length > 0 ? initialMessages : [
        { id: 1, text: 'Xin chào! Bạn cần hỗ trợ gì không?', sender: 'bot', timestamp: new Date() },
    ]);
    const [inputMessage, setInputMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const newMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');

        // Simulate bot response
        setTimeout(() => {
            const botResponse = {
                id: Date.now() + 1,
                text: 'Cảm ơn bạn đã nhắn tin! Chúng tôi sẽ phản hồi sớm nhất có thể.',
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="chatbox-container fb-style">
            <div className="chatbox-header">
                <div className="header-left">
                    <div className="header-user-info">
                        <div className="contact-avatar online">
                            {typeof avatar === 'string' && avatar.length <= 2 ? (
                                <span className="avatar-initials">{avatar}</span>
                            ) : (
                                <img src={avatar} alt={title} className="avatar-img" />
                            )}
                        </div>
                        <div className="user-text-info">
                            <h3 className="chatbox-title">{title} <span className="dropdown-arrow">▾</span></h3>
                            <span className="user-status">{status}</span>
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="header-icon-btn" title="Bắt đầu gọi thoại">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.72 11.72 0 003.7.59 1 1 0 011 1V20a1 1 0 01-1 1A16 16 0 013 5a1 1 0 011-1h3.41a1 1 0 011 1 11.72 11.72 0 00.59 3.7 1 1 0 01-.27 1.11l-2.11 2.08z" />
                        </svg>
                    </button>
                    <button className="header-icon-btn" title="Bắt đầu gọi video">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
                        </svg>
                    </button>
                    <button className="header-icon-btn" onClick={onMinimize} title="Thu nhỏ">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    <button className="header-icon-btn close" onClick={onClose} title="Đóng">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="chatbox-messages">
                <div className="messages-scroll-area">
                    {messages.map((message, index) => {
                        const isBot = message.sender === 'bot';
                        // Only show avatar if it's the last message in a bot sequence
                        const nextMessageSameSender = index < messages.length - 1 && messages[index + 1].sender === message.sender;
                        const showAvatar = isBot && !nextMessageSameSender;

                        return (
                            <div
                                key={message.id}
                                className={`chat-message ${isBot ? 'bot-message' : 'user-message'} ${showAvatar ? 'with-avatar' : ''} ${nextMessageSameSender ? 'same-sender' : 'last-in-group'}`}
                            >
                                {isBot && (
                                    <div className="message-avatar-container">
                                        <div className={`message-avatar ${showAvatar ? 'visible' : 'hidden'}`}>
                                            {typeof avatar === 'string' && avatar.length <= 2 ? avatar : <img src={avatar} alt="" />}
                                        </div>
                                    </div>
                                )}
                                <div className="message-bubble-container">
                                    <div className="message-bubble" title={message.timestamp?.toLocaleTimeString()}>
                                        {message.text}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="chatbox-footer">
                <div className="footer-actions-left">
                    <button className="footer-icon-btn" title="Mở tính năng khác"><svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary-color)"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg></button>
                    <button className="footer-icon-btn" title="Gửi ảnh"><svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary-color)"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg></button>
                    <button className="footer-icon-btn" title="Stickers"><svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary-color)"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z" /><path d="M12 7a5 5 0 00-5 5h2a3 3 0 016 0h2a5 5 0 00-5-5z" /></svg></button>
                    <button className="footer-icon-btn" title="Gửi GIF"><svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary-color)"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><text x="7" y="15" fontSize="8" fontWeight="bold" fill="white">GIF</text></svg></button>
                </div>

                <form onSubmit={handleSendMessage} className="chatbox-input-container">
                    <input
                        type="text"
                        className="chatbox-input-field"
                        placeholder="Aa"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                    />
                    <button type="button" className="input-emoji-btn">😊</button>
                </form>

                <div className="footer-actions-right">
                    {inputMessage.trim() ? (
                        <button onClick={handleSendMessage} className="footer-icon-btn send" title="Gửi">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary-color)">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    ) : (
                        <button className="footer-icon-btn like" title="Thích">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--primary-color)">
                                <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
