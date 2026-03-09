import { useState } from 'react';
import '../styles/ChatBox.css';

const ChatBox = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
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
        <div className="chatbox-container">
            <div className="chatbox-header">
                <div className="header-user-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="contact-avatar online" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                        AI
                    </div>
                    <div>
                        <h3 className="chatbox-title" style={{ fontSize: '15px' }}>Trợ lý AI</h3>
                        <span style={{ fontSize: '11px', color: '#6a737c', display: 'block' }}>Đang hoạt động</span>
                    </div>
                </div>
                <button className="chatbox-close-btn" onClick={onClose} style={{ border: 'none', background: 'none' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6a737c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div className="chatbox-messages">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`chat-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                    >
                        <div className="message-bubble">
                            {message.text}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSendMessage} className="chatbox-input-form">
                <input
                    type="text"
                    className="chatbox-input"
                    placeholder="Hỏi AI bất cứ điều gì..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                />
                <button type="submit" className="chatbox-send-btn" disabled={!inputMessage.trim()}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2 10l16-8-8 16-2-8-6-0z" fill="currentColor" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
