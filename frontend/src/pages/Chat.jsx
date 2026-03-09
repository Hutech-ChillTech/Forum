import React, { useState } from 'react';
import Header from '../components/Header';
import ChatBox from '../components/ChatBox';
import '../styles/Chat.css';

const Chat = () => {
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatMessages, setChatMessages] = useState({});
    const [inputValue, setInputValue] = useState("");

    const users = [
        { id: 1, name: "Hoàng Nguyễn", status: "online", avatar: "H" },
        { id: 2, name: "Minh Anh", status: "offline", avatar: "M" },
        { id: 3, name: "Trần Tuấn", status: "online", avatar: "T" },
        { id: 4, name: "Linh Lan", status: "online", avatar: "L" },
        { id: 5, name: "Quốc Hưng", status: "busy", avatar: "Q" },
    ];

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        if (!chatMessages[user.id]) {
            setChatMessages(prev => ({
                ...prev,
                [user.id]: [
                    { id: 100, text: `Chào bạn, mình là ${user.name}. Rất vui được làm quen!`, sender: "other", time: "10:00" }
                ]
            }));
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !selectedUser) return;

        const date = new Date();
        const time = `${date.getHours()}:${date.getMinutes()}`;

        const newMessage = {
            id: Date.now(),
            text: inputValue,
            sender: "me",
            time: time
        };

        setChatMessages(prev => ({
            ...prev,
            [selectedUser.id]: [...prev[selectedUser.id], newMessage]
        }));
        setInputValue("");
    };

    return (
        <div className="chat-page-layout">
            <Header />

            <div className="chat-page-container">
                {/* Sidebar danh sách người dùng */}
                <div className="chat-contacts-sidebar">
                    <div className="sidebar-header">
                        <h2>Tin nhắn</h2>
                        <div className="search-contacts">
                            <input type="text" placeholder="Tìm kiếm hội thoại..." />
                        </div>
                    </div>

                    <div className="contacts-list">
                        {users.map(user => (
                            <div
                                key={user.id}
                                className={`contact-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                                onClick={() => handleSelectUser(user)}
                            >
                                <div className={`contact-avatar ${user.status}`}>
                                    {user.avatar}
                                </div>
                                <div className="contact-info">
                                    <div className="contact-name">{user.name}</div>
                                    <div className="contact-status">{user.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Khung chat chính */}
                <div className="chat-main-content">
                    {selectedUser ? (
                        <>
                            <div className="chat-header">
                                <div className="header-user-info">
                                    <div className={`contact-avatar ${selectedUser.status}`}>
                                        {selectedUser.avatar}
                                    </div>
                                    <div>
                                        <h3>{selectedUser.name}</h3>
                                        <span>{selectedUser.status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến'}</span>
                                    </div>
                                </div>
                                <div className="header-actions">
                                    <button className="action-circle-btn">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.19-2.19a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                        </svg>
                                    </button>
                                    <button className="action-circle-btn">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="chat-messages-area">
                                {chatMessages[selectedUser.id]?.map(msg => (
                                    <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                                        <div className="chat-bubble">
                                            {msg.text}
                                            <span className="chat-time">{msg.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form className="chat-input-row" onSubmit={handleSendMessage}>
                                <button type="button" className="input-action-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                    </svg>
                                </button>
                                <input
                                    type="text"
                                    placeholder="Viết tin nhắn..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                                <button type="submit" className="chat-send-pill" disabled={!inputValue.trim()}>
                                    Gửi
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="chat-placeholder">
                            <div className="placeholder-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#babfc4" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <h3>Bắt đầu cuộc trò chuyện</h3>
                            <p>Chọn một người bạn từ danh sách bên trái để bắt đầu nhắn tin.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Chat Bot floating button */}
            <button className="ai-chat-fab" onClick={() => setIsAIChatOpen(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Chat AI</span>
            </button>

            <ChatBox isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
        </div>
    );
};

export default Chat;
