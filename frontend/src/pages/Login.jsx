import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import Header from '../components/Header';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        otp: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        // OTP validation if showing
        if (showOTP && !formData.otp.trim()) {
            newErrors.otp = 'Vui lòng nhập mã OTP';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Google login
    const handleGoogleLogin = () => {
        console.log('Google login clicked');
        // TODO: Implement Google OAuth
    };

    // Handle send OTP
    const handleSendOTP = () => {
        if (!formData.email.trim()) {
            setErrors({ email: 'Vui lòng nhập email để nhận OTP' });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setErrors({ email: 'Email không hợp lệ' });
            return;
        }

        setShowOTP(true);
        setSuccessMessage('Mã OTP đã được gửi đến email của bạn');
        setTimeout(() => setSuccessMessage(''), 3000);
        console.log('Send OTP to:', formData.email);
        // TODO: Call API to send OTP
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // TODO: Call login API
            console.log('Login data:', formData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccessMessage('Đăng nhập thành công!');

            // Redirect after success
            setTimeout(() => {
                navigate('/');
            }, 1500);

        } catch (error) {
            setErrors(prev => ({
                ...prev,
                submit: error.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header hideAuth />
            <div className="login-container">
                <div className="login-content">
                    {/* Left side - Branding */}
                    <div className="login-branding">
                        <h1>SkillForum</h1>
                        <ul className="feature-list">
                            <li>Get unstuck - ask a question!</li>
                            <li>Save your favorite posts, tags and filters</li>
                            <li>Answer questions and earn reputation</li>
                        </ul>
                    </div>

                    {/* Right side - Login Form */}
                    <div className="login-form-wrapper">
                        <div className="login-card">
                            {/* Google Login Button */}
                            <button
                                type="button"
                                className="google-login-btn"
                                onClick={handleGoogleLogin}
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                                    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853" />
                                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                                </svg>
                                Đăng nhập bằng Google
                            </button>

                            <div className="divider">
                                <span>ĐĂNG NHẬP</span>
                            </div>

                            {successMessage && (
                                <div className="success-message">
                                    {successMessage}
                                </div>
                            )}

                            {errors.submit && (
                                <div className="error-message" style={{ marginBottom: '16px', justifyContent: 'center' }}>
                                    {errors.submit}
                                </div>
                            )}

                            <form className="login-form" onSubmit={handleSubmit}>
                                {/* Email */}
                                <div className={`form-group ${errors.email ? 'error' : ''}`}>
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        disabled={isSubmitting}
                                    />
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>

                                {/* Password */}
                                <div className={`form-group ${errors.password ? 'error' : ''}`}>
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        disabled={isSubmitting}
                                    />
                                    {errors.password && <span className="error-message">{errors.password}</span>}
                                </div>

                                {/* OTP Field */}
                                <div className="otp-row">
                                    <div className={`form-group ${errors.otp ? 'error' : ''}`}>
                                        <label htmlFor="otp">Nhập OTP</label>
                                        <input
                                            type="text"
                                            id="otp"
                                            name="otp"
                                            value={formData.otp}
                                            onChange={handleChange}
                                            placeholder="123456"
                                            disabled={isSubmitting}
                                            maxLength="6"
                                        />
                                        {errors.otp && <span className="error-message">{errors.otp}</span>}
                                    </div>
                                    <button
                                        type="button"
                                        className="send-otp-btn"
                                        onClick={handleSendOTP}
                                        disabled={isSubmitting}
                                    >
                                        Gửi
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? '' : 'Đăng Nhập'}
                                </button>

                                {/* Register Link */}
                                <div className="register-link">
                                    Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
