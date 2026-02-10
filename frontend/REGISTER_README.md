# 🎨 Trang Đăng Ký SkillForum

## ✨ Tính năng

Trang đăng ký đẹp mắt với:
- ✅ Gradient xanh dương chuyên nghiệp
- ✅ Hiệu ứng Glassmorphism hiện đại
- ✅ Animations mượt mà
- ✅ Form validation đầy đủ
- ✅ Tích hợp API backend
- ✅ Responsive design
- ✅ Loading states & error handling

## 🚀 Cách chạy

### 1. Khởi động Frontend
```bash
cd e:\Work-space\S5_J2EE_Forum\forum-frontend\Forum\frontend
npm run dev
```

Server sẽ chạy tại: **http://localhost:5173/**

### 2. Khởi động Backend (nếu chưa chạy)
Backend cần chạy tại `http://localhost:8080` để API hoạt động.

## 📋 Thông tin Form

### Các trường bắt buộc:
1. **Email** - Định dạng email hợp lệ
2. **Username** - Ít nhất 3 ký tự, chỉ chứa chữ, số và dấu gạch dưới
3. **Fullname** - Ít nhất 2 ký tự
4. **Password** - Ít nhất 6 ký tự, phải có chữ hoa, chữ thường và số
5. **Confirm Password** - Phải khớp với mật khẩu
6. **Gender** - Chọn: Nam/Nữ/Khác
7. **Phone** - 10-11 chữ số
8. **Date of Birth** - Phải ít nhất 13 tuổi

### Validation tự động:
- ✅ Kiểm tra email đã tồn tại
- ✅ Kiểm tra username đã tồn tại
- ✅ Validation real-time khi nhập
- ✅ Hiển thị lỗi rõ ràng

## 🎨 Màu sắc Gradient

Gradient từ trên xuống dưới:
```css
#BCD6FF → #8CB8FF → #5A9AFF → #2B7CFF → #0066FF → #0052CC → #003D99 → #002966
```

## 📡 API Endpoints được sử dụng

### Đăng ký User
```
POST /api/users
Content-Type: application/json

{
  "userName": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "gender": "MALE",
  "phone": "0123456789",
  "dateOfBirth": "1990-01-01T00:00:00"
}
```

### Kiểm tra Email
```
GET /api/users/check-email/{email}
```

### Kiểm tra Username
```
GET /api/users/check-username/{userName}
```

## 📁 Cấu trúc Files

```
frontend/
├── .env                          # Cấu hình API URL
├── src/
│   ├── pages/
│   │   ├── Register.jsx         # Component trang đăng ký
│   │   └── Register.css         # Styles với gradient đẹp
│   ├── service/
│   │   └── userService.js       # Service xử lý API calls
│   └── App.jsx                  # Main app component
```

## 🔧 Cấu hình

File `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080
```

Nếu backend chạy ở port khác, cập nhật URL trong file `.env`.

## 🎯 User Experience

1. **Form Validation**: Kiểm tra real-time khi người dùng nhập
2. **Error Messages**: Hiển thị lỗi rõ ràng cho từng trường
3. **Loading State**: Button hiển thị loading khi đang submit
4. **Success Message**: Thông báo thành công và tự động chuyển hướng
5. **Responsive**: Hoạt động tốt trên mọi kích thước màn hình

## 🌟 Tính năng nổi bật

### Glassmorphism Effect
```css
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

### Smooth Animations
- Fade in từ trái (branding)
- Fade in từ phải (form)
- Hover effects trên inputs
- Loading spinner animation

### Micro-interactions
- Input focus effects
- Button hover với gradient shift
- Shake animation cho errors
- Slide down cho success message

## 📱 Responsive Breakpoints

- **Desktop**: > 968px - Layout 2 cột
- **Tablet**: 600px - 968px - Layout 1 cột
- **Mobile**: < 600px - Form fields stack vertically

## 🔒 Security Features

- Password strength validation
- Email format validation
- Phone number format validation
- Age verification (minimum 13 years old)
- XSS protection through React

## 🎨 Design Inspiration

Thiết kế lấy cảm hứng từ:
- Modern web applications
- Glassmorphism trend
- Premium SaaS platforms
- Material Design principles

## 📝 Notes

- Backend API phải chạy trước khi test form submit
- Kiểm tra console để debug API calls
- Success message sẽ tự động redirect sau 2 giây (cần implement routing)

## 🚧 TODO

- [ ] Thêm React Router cho navigation
- [ ] Tạo trang Login
- [ ] Thêm forgot password
- [ ] Thêm email verification
- [ ] Thêm social login (Google, Facebook)
- [ ] Thêm avatar upload
- [ ] Dark/Light mode toggle

---

**Developed with ❤️ for SkillForum**
