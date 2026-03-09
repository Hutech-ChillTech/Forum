import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import '../styles/Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('edit-profile');

    // Mock user profile data
    const [profile, setProfile] = useState({
        displayName: '1731_Trần Khánh Linh',
        location: 'Vietnam',
        title: 'Frontend Developer',
        aboutMe: 'Passionate about React and UI/UX design.',
        websiteLink: 'https://github.com/linh-tran',
        twitterLink: '',
        githubLink: 'linh-tran'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Mock save action
        alert('Profile saved successfully!');
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
                    <h1 className="settings-page-title">Edit your profile</h1>
                    <div className="settings-content-wrapper">
                        {/* Settings Sidebar Nav */}
                        <div className="settings-sidebar">
                            <h3 className="settings-sidebar-title">Personal information</h3>
                            <nav className="settings-nav">
                                <button
                                    className={`settings-nav-item ${activeTab === 'edit-profile' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('edit-profile')}
                                >
                                    Edit profile
                                </button>
                                <button
                                    className={`settings-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('preferences')}
                                >
                                    Preferences
                                </button>
                            </nav>

                            <h3 className="settings-sidebar-title">Access</h3>
                            <nav className="settings-nav">
                                <button
                                    className={`settings-nav-item ${activeTab === 'password' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('password')}
                                >
                                    Password
                                </button>
                            </nav>
                        </div>

                        {/* Settings Form Area */}
                        <div className="settings-form-area">
                            {activeTab === 'edit-profile' && (
                                <form className="settings-form" onSubmit={handleSave}>
                                    <div className="settings-section">
                                        <h2 className="settings-section-title">Public information</h2>

                                        <div className="form-group profile-image-group">
                                            <label className="form-label">Profile image</label>
                                            <div className="profile-image-container">
                                                <div className="profile-image-preview">
                                                    <span className="avatar-initials-large">1T</span>
                                                </div>
                                                <button type="button" className="btn-secondary">Change picture</button>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="displayName">Display name</label>
                                            <input
                                                type="text"
                                                id="displayName"
                                                name="displayName"
                                                className="form-input"
                                                value={profile.displayName}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="location">Location</label>
                                            <input
                                                type="text"
                                                id="location"
                                                name="location"
                                                className="form-input"
                                                value={profile.location}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="title">Title</label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                className="form-input"
                                                placeholder="e.g. Student, Full Stack Developer"
                                                value={profile.title}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="settings-section">
                                        <h2 className="settings-section-title">About me</h2>
                                        <div className="form-group">
                                            <textarea
                                                id="aboutMe"
                                                name="aboutMe"
                                                className="form-textarea"
                                                rows="10"
                                                value={profile.aboutMe}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="settings-section">
                                        <h2 className="settings-section-title">Links</h2>
                                        <p className="form-description">Add links to your website, blog, or social media profiles.</p>

                                        <div className="form-row">
                                            <div className="form-group half-width">
                                                <label className="form-label" htmlFor="websiteLink">Website link</label>
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
                                                <label className="form-label" htmlFor="twitterLink">Twitter link or username</label>
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
                                                <label className="form-label" htmlFor="githubLink">GitHub link or username</label>
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
                                        <button type="submit" className="btn-primary">Save profile</button>
                                        <button type="button" className="btn-transparent">Cancel</button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'preferences' && (
                                <div className="settings-form">
                                    <h2 className="settings-section-title">Preferences</h2>
                                    <p className="form-description">Customize your forum experience.</p>

                                    <div className="form-group checkbox-group">
                                        <input type="checkbox" id="darkTheme" className="form-checkbox" />
                                        <label htmlFor="darkTheme" className="checkbox-label">
                                            Enable dark theme
                                            <span className="checkbox-description">Switch to a dark color palette.</span>
                                        </label>
                                    </div>

                                    <div className="form-group checkbox-group">
                                        <input type="checkbox" id="emailNotif" defaultChecked className="form-checkbox" />
                                        <label htmlFor="emailNotif" className="checkbox-label">
                                            Email notifications
                                            <span className="checkbox-description">Receive emails when your posts get answers or comments.</span>
                                        </label>
                                    </div>

                                    <div className="settings-actions">
                                        <button className="btn-primary">Save preferences</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'password' && (
                                <div className="settings-form">
                                    <h2 className="settings-section-title">Change Password</h2>
                                    <div className="settings-card warning-card">
                                        <p>You may need to log in again after changing your password.</p>
                                    </div>

                                    <div className="form-group max-width-300">
                                        <label className="form-label" htmlFor="currentPassword">Current Password</label>
                                        <input type="password" id="currentPassword" className="form-input" />
                                    </div>

                                    <div className="form-group max-width-300">
                                        <label className="form-label" htmlFor="newPassword">New Password</label>
                                        <input type="password" id="newPassword" className="form-input" />
                                        <div className="form-description">Passwords must contain at least 8 characters, including at least 1 letter and 1 number.</div>
                                    </div>

                                    <div className="form-group max-width-300">
                                        <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
                                        <input type="password" id="confirmPassword" className="form-input" />
                                    </div>

                                    <div className="settings-actions">
                                        <button className="btn-primary">Change password</button>
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
