import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import ChatBox from './ChatBox';
import PostDetailModal from './PostDetailModal';
import '../styles/Home.css';

const MainLayout = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);

    const userProfile = (() => {
        try { return JSON.parse(localStorage.getItem('userProfile') || '{}'); } 
        catch (e) { return {}; }
    })();

    if (userProfile.role === 'ADMIN') {
        return <Navigate to="/admin" replace />;
    }

    useEffect(() => {
        const handleOpenModal = (e) => {
            setSelectedPostId(e.detail.postId || e.detail.id);
        };
        window.addEventListener('openPostModal', handleOpenModal);
        return () => window.removeEventListener('openPostModal', handleOpenModal);
    }, []);

    return (
        <div className="home-layout">
            <Header />
            <div className="home-container">
                <aside className="home-sidebar">
                    <Sidebar />
                </aside>

                <Outlet context={{ setSelectedPostId }} />
            </div>

            <button className="ai-chat-fab" onClick={() => setIsChatOpen(!isChatOpen)} title="Chat với AI">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 012 2z" />
                </svg>
            </button>
            <ChatBox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            {selectedPostId && (
                <PostDetailModal
                    postId={selectedPostId}
                    onClose={() => setSelectedPostId(null)}
                />
            )}

            <Footer />
        </div>
    );
};

export default MainLayout;
