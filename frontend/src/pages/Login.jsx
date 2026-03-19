import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import Header from "../components/Header";
import authService from "../service/authService";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const otpInputsRef = useRef([]);

  // Handle input change for main form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle OTP digit change
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.substring(value.length - 1);
    setOtpDigits(newDigits);

    // Move to next input if value is entered
    if (value && index < 5) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  // Validate main form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle main login submit (Step 1)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await authService.login({
        email: formData.email,
        password: formData.password,
        otp: "", // First attempt with empty OTP
      });

      // If login succeeds directly (unlikely with our current 2FA logic)
      handleLoginSuccess(result);
    } catch (error) {
      if (error.message.includes("OTP is required")) {
        setShowOtpModal(true);
        setSuccessMessage("Một mã OTP đã được gửi đến email của bạn.");
      } else {
        setErrors({ submit: error.message || "Đăng nhập thất bại." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP verification (Step 2)
  const handleVerifyOtp = async () => {
    const otpCode = otpDigits.join("");
    if (otpCode.length !== 6) {
      setErrors({ otp: "Vui lòng nhập đủ 6 chữ số" });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authService.login({
        email: formData.email,
        password: formData.password,
        otp: otpCode,
      });
      handleLoginSuccess(result);
    } catch (error) {
      setErrors({ otp: error.message || "Mã OTP không chính xác" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSuccess = (result) => {
    authService.saveSession(result);
    setSuccessMessage("Đăng nhập thành công!");
    setTimeout(() => navigate("/"), 1000);
  };

  const handleResendOtp = async () => {
    try {
      await authService.requestOtp(formData.email);
      setSuccessMessage("Mã OTP mới đã được gửi!");
    } catch (error) {
      setErrors({ otp: error.message || "Gửi lại OTP thất bại" });
    }
  };

  return (
    <>
      <Header hideAuth />
      <div className="login-container">
        <div className="login-content">
          <div className="login-branding">
            <h1>SkillForum</h1>
            <ul className="feature-list">
              <li>Get unstuck - ask a question!</li>
              <li>Save your favorite posts, tags and filters</li>
              <li>Answer questions and earn reputation</li>
            </ul>
          </div>

          <div className="login-form-wrapper">
            <div className="login-card">
              <button type="button" className="google-login-btn">
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

              {successMessage && !showOtpModal && (
                <div className="success-message">{successMessage}</div>
              )}

              {errors.submit && (
                <div className="error-message" style={{ marginBottom: "16px", justifyContent: "center" }}>
                  {errors.submit}
                </div>
              )}

              <form className="login-form" onSubmit={handleSubmit}>
                <div className={`form-group ${errors.email ? "error" : ""}`}>
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

                <div className={`form-group ${errors.password ? "error" : ""}`}>
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

                <button
                  type="submit"
                  className={`submit-button ${isSubmitting ? "loading" : ""}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "" : "Đăng Nhập"}
                </button>

                <div className="register-link">
                  Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal Popup */}
      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <h2>Xác thực OTP</h2>
            <p>Vui lòng nhập mã 6 số chúng tôi đã gửi tới {formData.email}</p>

            <div className="otp-inputs">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength="1"
                  className="otp-digit"
                  value={digit}
                  ref={(el) => (otpInputsRef.current[idx] = el)}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            {errors.otp && <p className="error-message" style={{ justifyContent: "center", marginBottom: "20px" }}>{errors.otp}</p>}
            {successMessage && <p style={{ color: "#4CD964", fontSize: "12px", marginBottom: "20px" }}>{successMessage}</p>}

            <div className="otp-actions">
              <button
                className={`verify-btn ${isSubmitting ? "loading" : ""}`}
                onClick={handleVerifyOtp}
                disabled={isSubmitting}
              >
                {isSubmitting ? "" : "Xác nhận"}
              </button>
              <button className="resend-btn" onClick={handleResendOtp} disabled={isSubmitting}>
                Gửi lại mã OTP
              </button>
              <button
                className="resend-btn"
                style={{ textDecoration: "none", opacity: 0.6 }}
                onClick={() => setShowOtpModal(false)}
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
