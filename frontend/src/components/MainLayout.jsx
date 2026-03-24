import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import ChatBox from "./ChatBox";
import PostDetailModal from "./PostDetailModal";
import Toast from "./Toast";
import "../styles/Home.css";

const MainLayout = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userProfile = (() => {
    try {
      return JSON.parse(localStorage.getItem("userProfile") || "{}");
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    const handleOpenModal = (e) => {
      setSelectedPostId(e.detail.postId || e.detail.id);
    };
    const handleToggleMobileMenu = () => {
      setIsMobileMenuOpen((prev) => {
        const newState = !prev;
        window.dispatchEvent(
          new CustomEvent("mobileMenuStateChanged", {
            detail: { isOpen: newState },
          }),
        );
        return newState;
      });
    };
    window.addEventListener("openPostModal", handleOpenModal);
    window.addEventListener("toggleMobileMenu", handleToggleMobileMenu);
    return () => {
      window.removeEventListener("openPostModal", handleOpenModal);
      window.removeEventListener("toggleMobileMenu", handleToggleMobileMenu);
    };
  }, []);

  // Reset mobile menu on screen resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        window.dispatchEvent(
          new CustomEvent("mobileMenuStateChanged", {
            detail: { isOpen: false },
          }),
        );
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  if (userProfile.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="home-layout">
      <Header />
      <div className="home-container">
        {/* Mobile overlay backdrop */}
        {isMobileMenuOpen && (
          <div
            className="mobile-menu-backdrop"
            onClick={() => {
              setIsMobileMenuOpen(false);
              window.dispatchEvent(
                new CustomEvent("mobileMenuStateChanged", {
                  detail: { isOpen: false },
                }),
              );
            }}
          ></div>
        )}

        <aside className={`home-sidebar ${isMobileMenuOpen ? "open" : ""}`}>
          <Sidebar />
        </aside>

        <Outlet context={{ setSelectedPostId }} />
      </div>

      <button
        className="ai-chat-fab"
        onClick={() => setIsChatOpen(!isChatOpen)}
        title="Chat với AI"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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
      <Toast />
    </div>
  );
};

export default MainLayout;
