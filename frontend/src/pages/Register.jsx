import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";
import authService from "../service/authService";
import Header from "../components/Header";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    gender: "",
    phone: "",
    dateOfBirth: "",
  });

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const otpInputsRef = useRef([]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.userName.trim()) {
      newErrors.userName = "Tên đăng nhập không được để trống";
    } else if (formData.userName.length < 3) {
      newErrors.userName = "Tên đăng nhập phải có ít nhất 3 ký tự";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.userName)) {
      newErrors.userName = "Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải chứa chữ hoa, chữ thường và số";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh không được để trống";
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = "Bạn phải ít nhất 13 tuổi để đăng ký";
      } else if (age > 120) {
        newErrors.dateOfBirth = "Ngày sinh không hợp lệ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
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

    if (value && index < 5) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  // Handle form submit (Step 1 or final if OTP included)
  const handleSubmit = async (e, otpCode = "") => {
    if (e) e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        gender: formData.gender || null,
        phone: formData.phone || null,
        dateOfBirth: formData.dateOfBirth || null,
        otp: otpCode
      };

      await authService.register(userData);

      setSuccessMessage(
        "Đăng ký thành công! Chuyển hướng đến trang đăng nhập...",
      );
      setShowOtpModal(false);

      setFormData({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        gender: "",
        phone: "",
        dateOfBirth: "",
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      if (error.message.includes("OTP is required")) {
        setShowOtpModal(true);
        setSuccessMessage("Một mã OTP đã được gửi đến email của bạn.");
      } else {
        setErrors((prev) => ({
          ...prev,
          submit: error.message || "Đăng ký thất bại. Vui lòng thử lại.",
          otp: otpCode ? (error.message || "Mã OTP không chính xác") : ""
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = () => {
    const otpCode = otpDigits.join("");
    if (otpCode.length !== 6) {
      setErrors(prev => ({ ...prev, otp: "Vui lòng nhập đủ 6 chữ số" }));
      return;
    }
    handleSubmit(null, otpCode);
  };

  const handleResendOtp = async () => {
    try {
      await authService.requestOtp(formData.email);
      setSuccessMessage("Mã OTP mới đã được gửi!");
    } catch (error) {
      setErrors(prev => ({ ...prev, otp: error.message || "Gửi lại OTP thất bại" }));
    }
  };

  return (
    <>
      <Header hideAuth />
      <div className="register-container">
        <div className="register-content">
          {/* Left side - Branding */}
          <div className="register-branding">
            <h1>SkillForum</h1>
            <ul className="feature-list">
              <li>Get unstuck - ask a question!</li>
              <li>Save your favorite posts, tags and filters</li>
              <li>Answer questions and earn reputation</li>
            </ul>
          </div>

          {/* Right side - Register Form */}
          <div className="register-form-wrapper">
            <div className="register-form-card">
              <h2>Đăng Ký</h2>

              {successMessage && !showOtpModal && (
                <div className="success-message">{successMessage}</div>
              )}

              {errors.submit && (
                <div
                  className="error-message"
                  style={{ marginBottom: "20px", justifyContent: "center" }}
                >
                  {errors.submit}
                </div>
              )}

              <form className="register-form" onSubmit={handleSubmit}>
                {/* Email */}
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
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                {/* Username */}
                <div className={`form-group ${errors.userName ? "error" : ""}`}>
                  <label htmlFor="userName">Username</label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="johndoe"
                    disabled={isSubmitting}
                  />
                  {errors.userName && (
                    <span className="error-message">{errors.userName}</span>
                  )}
                </div>

                {/* Full Name */}
                <div className={`form-group ${errors.fullName ? "error" : ""}`}>
                  <label htmlFor="fullName">Fullname</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    disabled={isSubmitting}
                  />
                  {errors.fullName && (
                    <span className="error-message">{errors.fullName}</span>
                  )}
                </div>

                {/* Password */}
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
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                {/* Confirm Password */}
                <div
                  className={`form-group ${errors.confirmPassword ? "error" : ""}`}
                >
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                  {errors.confirmPassword && (
                    <span className="error-message">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                {/* Gender and Phone */}
                <div className="form-row">
                  <div className={`form-group ${errors.gender ? "error" : ""}`}>
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                    {errors.gender && (
                      <span className="error-message">{errors.gender}</span>
                    )}
                  </div>

                  <div className={`form-group ${errors.phone ? "error" : ""}`}>
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0123456789"
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <span className="error-message">{errors.phone}</span>
                    )}
                  </div>
                </div>

                {/* Date of Birth */}
                <div
                  className={`form-group ${errors.dateOfBirth ? "error" : ""}`}
                >
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {errors.dateOfBirth && (
                    <span className="error-message">{errors.dateOfBirth}</span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`submit-button ${isSubmitting ? "loading" : ""}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "" : "Đăng Ký"}
                </button>

                {/* Login Link */}
                <div className="login-link">
                  Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <h2>Xác thực Email</h2>
            <p>Vui lòng nhập mã 6 số đã được gửi tới <strong>{formData.email}</strong> để hoàn tất đăng ký.</p>

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
            {successMessage && <p style={{ color: "#4CD964", fontSize: "12px", marginBottom: "20px", textAlign: "center" }}>{successMessage}</p>}

            <div className="otp-actions">
              <button
                className={`verify-btn ${isSubmitting ? "loading" : ""}`}
                onClick={handleVerifyOtp}
                disabled={isSubmitting}
              >
                {isSubmitting ? "" : "Xác nhận đăng ký"}
              </button>
              <button className="resend-btn" onClick={handleResendOtp} disabled={isSubmitting}>
                Gửi lại mã OTP
              </button>
              <button
                className="resend-btn"
                style={{ textDecoration: "none", opacity: 0.6 }}
                onClick={() => setShowOtpModal(false)}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
