import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import '../styles/Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('edit-profile');

    // Initialize profile data from localStorage or use defaults
    const [profile, setProfile] = useState(() => {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                return JSON.parse(savedProfile);
            } catch (e) {
                console.error('Error parsing saved profile:', e);
            }
        }
        return {
            displayName: '1731_Trần Khánh Linh',
            fullName: 'Trần Khánh Linh',
            username: 'khanhlinh_1731',
            email: 'linh.tran@example.com',
            phone: '0987654321',
            gender: '1',
            dateOfBirth: '2002-10-15',
            status: 'Active',
            location: 'Vietnam',
            title: 'Frontend Developer',
            aboutMe: 'Yêu thích React và thiết kế UI/UX.',
            websiteLink: 'https://github.com/linh-tran',
            twitterLink: '',
            githubLink: 'linh-tran'
        };
    });

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        // Dispatch custom event to notify App.jsx
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }, [isDarkMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(profile));
        // Dispatch custom event to notify other components (like Header)
        window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: profile }));
        alert('Hồ sơ đã được lưu thành công!');
    };

    return (
        <div className="settings-layout">
            <Header />

            <div className="settings-container">
                {/* Left Sidebar */}
                <aside className="settings-main-sidebar">
                    <Sidebar activePage="" />
                </aside>

                {/* Main Content Structure */}
                <main className="settings-main">
                    <h1 className="settings-page-title">Chỉnh sửa hồ sơ</h1>
                    <div className="settings-content-wrapper">
                        {/* Settings Sidebar Nav */}
                        <div className="settings-sidebar">
                            <h3 className="settings-sidebar-title">Thông tin cá nhân</h3>
                            <nav className="settings-nav">
                                <button
                                    className={`settings-nav-item ${activeTab === 'edit-profile' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('edit-profile')}
                                >
                                    Sửa hồ sơ
                                </button>
                                <button
                                    className={`settings-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('preferences')}
                                >
                                    Cài đặt ưu tiên
                                </button>
                            </nav>

                            <h3 className="settings-sidebar-title">Quyền truy cập</h3>
                            <nav className="settings-nav">
                                <button
                                    className={`settings-nav-item ${activeTab === 'password' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('password')}
                                >
                                    Mật khẩu
                                </button>
                            </nav>
                        </div>

                        {/* Settings Form Area */}
                        <div className="settings-form-area">
                            {activeTab === 'edit-profile' && (
                                <form className="settings-form" onSubmit={handleSave}>
                                    <div className="settings-section">
                                        <h2 className="settings-section-title">Thông tin công khai</h2>

                                        <div className="form-group profile-image-group">
                                            <label className="form-label">Ảnh đại diện</label>
                                            <div className="profile-image-container">
                                                <div className="profile-image-preview">
                                                    <span className="avatar-initials-large">TL</span>
                                                </div>
                                                <button type="button" className="btn-secondary">Thay đổi ảnh</button>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group half-width">
                                                <label className="form-label" htmlFor="displayName">Tên hiển thị</label>
                                                <input
                                                    type="text"
                                                    id="displayName"
                                                    name="displayName"
                                                    className="form-input"
                                                    value={profile.displayName}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="form-group half-width">
                                                <label className="form-label" htmlFor="fullName">Họ và tên</label>
                                                <input
                                                    type="text"
                                                    id="fullName"
                                                    name="fullName"
                                                    className="form-input"
                                                    value={profile.fullName}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group half-width">
                                                <label className="form-label" htmlFor="username">Tên người dùng</label>
                                                <input
                                                    type="text"
                                                    id="username"
                                                    name="username"
                                                    className="form-input"
                                                    value={profile.username}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="form-group half-width">
                                                <label className="form-label" htmlFor="title">Chức danh</label>
                                                <input
                                                    type="text"
                                                    id="title"
                                                    name="title"
                                                    className="form-input"
                                                    placeholder="VD: Sinh viên..."
                                                    value={profile.title}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="location">Vị trí</label>
                                            <input
                                                type="text"
                                                id="location"
                                                name="location"
                                                className="form-input"
                                                value={profile.location}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="settings-section">
                                        <h2 className="settings-section-title">Thông tin riêng tư</h2>

                                        <div className="form-row">
                                            <div className="form-group half-width">
                                                <label className="form-label" htmlFor="email">Email</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    className="form-input"
                                                    value={profile.email}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="form-group half-width">
                                                <label className="form-label" htmlFor="phone">Số điện thoại</label>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    className="form-input"
                                                    value={profile.phone}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group half-width">
                                                <label className="form-label" htmlFor="gender">Giới tính</label>
                                                <select
                                                    id="gender"
                                                    name="gender"
                                                    className="form-input"
                                                    value={profile.gender}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="1">Nam</option>
                                                    <option value="2">Nữ</option>
                                                    <option value="3">Khác</option>
                                                </select>
                                            </div>
                                            <div className="form-group half-width">
                                                <label className="form-label" htmlFor="dateOfBirth">Ngày sinh</label>
                                                <input
                                                    type="date"
                                                    id="dateOfBirth"
                                                    name="dateOfBirth"
                                                    className="form-input"
                                                    value={profile.dateOfBirth}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="status">Trạng thái (Status)</label>
                                            <input
                                                type="text"
                                                id="status"
                                                name="status"
                                                className="form-input"
                                                value={profile.status}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="settings-section">
                                        <h2 className="settings-section-title">Về bản thân</h2>
                                        <div className="form-group">
                                            <textarea
                                                id="aboutMe"
                                                name="aboutMe"
                                                className="form-textarea"
                                                placeholder="Giới thiệu một chút về bạn..."
                                                rows="10"
                                                value={profile.aboutMe}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="settings-section">
                                        <h2 className="settings-section-title">Liên kết</h2>
                                        <p className="form-description">Thêm các liên kết đến trang web, blog hoặc hồ sơ mạng xã hội của bạn.</p>

                                        <div className="form-row">
                                            <div className="form-group half-width">
                                                <label className="form-label" htmlFor="websiteLink">Liên kết website</label>
                                                <input
                                                    type="url"
                                                    id="websiteLink"
                                                    name="websiteLink"
                                                    className="form-input"
                                                    value={profile.websiteLink}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="form-group half-width">
                                                <label className="form-label" htmlFor="twitterLink">Liên kết hoặc tên Twitter</label>
                                                <input
                                                    type="text"
                                                    id="twitterLink"
                                                    name="twitterLink"
                                                    className="form-input"
                                                    value={profile.twitterLink}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="form-group half-width">
                                                <label className="form-label" htmlFor="githubLink">Liên kết hoặc tên GitHub</label>
                                                <input
                                                    type="text"
                                                    id="githubLink"
                                                    name="githubLink"
                                                    className="form-input"
                                                    value={profile.githubLink}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="settings-actions">
                                        <button type="submit" className="btn-primary">Lưu hồ sơ</button>
                                        <button type="button" className="btn-transparent">Hủy</button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'preferences' && (
                                <div className="settings-form">
                                    <h2 className="settings-section-title">Cài đặt ưu tiên</h2>
                                    <p className="form-description">Tùy chỉnh trải nghiệm của bạn trên diễn đàn.</p>

                                    <div className="form-group checkbox-group">
                                        <input
                                            type="checkbox"
                                            id="darkTheme"
                                            className="form-checkbox"
                                            checked={isDarkMode}
                                            onChange={(e) => setIsDarkMode(e.target.checked)}
                                        />
                                        <label htmlFor="darkTheme" className="checkbox-label">
                                            Bật giao diện tối
                                            <span className="checkbox-description">Chuyển sang bảng màu tối hơn.</span>
                                        </label>
                                    </div>

                                    <div className="form-group checkbox-group">
                                        <input type="checkbox" id="emailNotif" defaultChecked className="form-checkbox" />
                                        <label htmlFor="emailNotif" className="checkbox-label">
                                            Thông báo qua email
                                            <span className="checkbox-description">Nhận email khi có người trả lời hoặc bình luận vào bài viết của bạn.</span>
                                        </label>
                                    </div>

                                    <div className="settings-actions">
                                        <button className="btn-primary">Lưu cài đặt</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'password' && (
                                <div className="settings-form">
                                    <h2 className="settings-section-title">Đổi mật khẩu</h2>
                                    <div className="settings-card warning-card">
                                        <p>Bạn có thể cần phải đăng nhập lại sau khi thay đổi mật khẩu.</p>
                                    </div>

                                    <div className="form-group max-width-300">
                                        <label className="form-label" htmlFor="currentPassword">Mật khẩu hiện tại</label>
                                        <input type="password" id="currentPassword" className="form-input" />
                                    </div>

                                    <div className="form-group max-width-300">
                                        <label className="form-label" htmlFor="newPassword">Mật khẩu mới</label>
                                        <input type="password" id="newPassword" className="form-input" />
                                        <div className="form-description">Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm ít nhất 1 chữ cái và 1 chữ số.</div>
                                    </div>

                                    <div className="form-group max-width-300">
                                        <label className="form-label" htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                                        <input type="password" id="confirmPassword" className="form-input" />
                                    </div>

                                    <div className="settings-actions">
                                        <button className="btn-primary">Đổi mật khẩu</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default Settings;
