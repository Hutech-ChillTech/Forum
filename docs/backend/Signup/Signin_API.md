# API Documentation: Sign In & Sign Up

## 1. Sign Up (Đăng ký)

**Endpoint:** `POST /api/v1/auth/register`

### Request Payload (Body - JSON)
```json
{
  "userName": "johndoe",           // Bắt buộc (3 - 100 ký tự)
  "email": "johndoe@example.com",  // Bắt buộc (Định dạng email hợp lệ)
  "password": "password123",       // Bắt buộc (Ít nhất 6 ký tự)
  "fullName": "John Doe",          // Tùy chọn
  "gender": "MALE",                // Tùy chọn (MALE, FEMALE, OTHER)
  "phone": "0123456789",           // Tùy chọn
  "dateOfBirth": "2000-01-01"      // Tùy chọn (Định dạng yyyy-MM-dd)
}
```

### Response (Thành công)
Trạng thái HTTP: `200 OK`
```json
{
  "code": 1000,
  "timstamp": 1708680000000,
  "result": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOi...",
    "tokenType": "Bearer",
    "authenticated": true
  }
}
```


---

## 2. Sign In (Đăng nhập)

**Endpoint:** `POST /api/v1/auth/login`

### Request Payload (Body - JSON)
```json
{
  "email": "johndoe@example.com",  // Bắt buộc (Định dạng email hợp lệ)
  "password": "password123"        // Bắt buộc
}
```

### Response (Thành công)
Trạng thái HTTP: `200 OK`
```json
{
  "code": 1000,
  "timstamp": 1708680000000,
  "result": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOi...",
    "tokenType": "Bearer",
    "authenticated": true
  }
}
```

---

## 3. Cấu trúc Token (Payload đã mã hóa trong accessToken)
Front-end sẽ cần tự `base64 decode` phần payload của JWT token (gọi tắt là `jwt-decode`) để lấy thông tin chi tiết user mà không cần gọi API lần nữa.

```json
{
  "sub": "johndoe@example.com",          // Định danh Subject
  "userId": "550e8400-e29b-41d4-a716",   // UUID
  "userName": "johndoe",
  "email": "johndoe@example.com",
  "fullName": "John Doe",
  "role": "USER",
  "avatarURL": null,
  "verifyStatus": "ACTIVE",
  "status": "OFFLINE",
  "iat": 1708693200,                     // Thời gian cấp (Issued At)
  "exp": 1708779600                      // Thời gian hết hạn (Expiration Time)
}
```

## 4. Các lỗi định dạng chuẩn (Tham khảo)
Trạng thái HTTP: `400 Bad Request` hoặc các HTTP Status tương ứng
```json
{
  "code": 1008,
  "message": "Email already exists"
}
```
*(Các mã lỗi được định nghĩa sẵn trong hệ thống `ErrorCode` như: `1008` (Email exists), `1009` (Username exists), `1010` (Account not found), `1011` (Invalid password), `1004` (Unauthorized), v.v.)*

---

## 5. Tổng hợp các thay đổi gần đây (Sau khi Pull Code)

### 📁 Các folder mới bổ sung
Dựa vào tình trạng Source Code hiện tại (`git status`), các folder sau (cùng với các file cấu hình tương ứng) đã được thêm mới vào dự án:
- `backend/src/main/java/com/forum/it/contants/` *(Chứa các khai báo hằng số hệ thống, ví dụ: Route API)*
- `backend/src/main/java/com/forum/it/sercurites/` *(Chứa các module phân quyền JWT, Security Config)*
- `docs/backend/Signup/Signin_API.md` *(Chứa tài liệu kịch bản test API, Markdown cho dự án)*
- `Prompt AI/` *(Folder quy ước Contract base AI)*

### 🔄 Các Datatype đã thay đổi (Sửa lỗi parse thời gian)
Do xuất hiện lỗi Format `java.time.format.ParsedDateTimeParseException` không thể Resolve được giá trị `LocalDateTime`, hệ thống đã đồng loạt tìm và thay thế sang **`LocalDate`** trên toàn bộ 14 file có sử dụng:
- **Tầng Entities:** `User`, `Account`, `Post`, `Comment`, `Reaction`, `SavedPost`, `Share`, `Communication`, `ModerationLog`, `Notification`
- **Tầng Data Transfer Objects (DTO):** `CreateUserRequest`, `UpdateUserRequest`, `UserResponse`
- **Tầng Database (Repository):** Khắc phục lỗi Syntax query ngày tháng ở `UserRepository`.
