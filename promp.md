# Tài liệu Chức năng Tìm kiếm (Search Functionality)

Tài liệu này ghi lại cách tạo và cách hoạt động của hệ thống tìm kiếm trong dự án Forum.

## 1. Tổng quan
Hệ thống tìm kiếm cho phép người dùng tìm kiếm nội dung trên toàn bộ nền tảng bao gồm: **Bài viết (Posts)**, **Người dùng (Users)**, và **Thẻ (Tags)**. Ngoài ra, hệ thống còn hỗ trợ lưu lại **Lịch sử tìm kiếm** cho người dùng đã đăng nhập.

---

## 2. Cấu trúc Backend (Java Spring Boot)

### 2.1. Thực thể (Entity)
- **`SearchHistory`**: Lưu trữ lịch sử tìm kiếm của người dùng.
    - `id`: UUID.
    - `user`: Liên kết với thực thể `User` (ManyToOne).
    - `keyword`: Từ khóa tìm kiếm (String).
    - `searchedAt`: Thời điểm tìm kiếm (@CreationTimestamp).

### 2.2. Kho lưu trữ (Repository)
Các truy vấn tìm kiếm sử dụng `JPQL` với từ khóa `LIKE` và `LOWER` để tìm kiếm không phân biệt chữ hoa chữ thường.
- **`UserRepository`**: Tìm kiếm theo `userName`, `email`, hoặc `fullName`.
- **`TagRepository`**: Tìm kiếm theo `name` của thẻ.
- **`PostRepository`**: Tìm kiếm theo `title` hoặc `content` của các bài viết có trạng thái `PUBLISHED`.

### 2.3. Dịch vụ (SearchService)
- **`globalSearch(keyword, currentUser)`**: 
    - Thực hiện tìm kiếm đồng thời trên 3 bảng: Users, Tags, Posts.
    - Giới hạn số lượng kết quả trả về (Users: 5, Tags: 10, Posts: 10).
    - Nếu `currentUser` tồn tại, tự động gọi `saveSearchHistory` để lưu từ khóa.
- **`saveSearchHistory(user, keyword)`**: 
    - Nếu từ khóa đã tồn tại trong lịch sử của người dùng đó, cập nhật lại thời gian tìm kiếm (`searchedAt`).
    - Nếu chưa, tạo bản ghi mới.
- **`getSearchHistory(user)`**: Lấy 10 từ khóa tìm kiếm gần nhất của người dùng.
- **`clearHistory(user)`**: Xóa toàn bộ lịch sử tìm kiếm của người dùng.

### 2.4. Bộ điều khiển (SearchController)
Định nghĩa các API endpoints:
- `GET /api/v1/search`: Tìm kiếm toàn cục.
- `GET /api/v1/search/history`: Lấy lịch sử tìm kiếm.
- `DELETE /api/v1/search/history/clear`: Xóa lịch sử.

---

## 3. Cấu trúc Frontend (ReactJS)

### 3.1. Dịch vụ (searchService.js)
Sử dụng `apiFetch` để gọi các API từ backend.
- `globalSearch(keyword)`
- `getSearchHistory()`
- `clearSearchHistory()`

### 3.2. Thành phần (Components & Pages)
- **`Header.jsx`**:
    - Chứa ô nhập liệu (`search-bar`).
    - Hiển thị dropdown **Lịch sử tìm kiếm** khi người dùng focus vào ô nhập.
    - Khi nhấn `Enter`, chuyển hướng sang trang `/search?q=...`.
- **`Search.jsx` (Trang kết quả)**:
    - Lấy từ khóa từ URL params (`?q=`).
    - Gọi `globalSearch` để lấy dữ liệu.
    - Hiển thị kết quả theo 3 phân mục: Bài viết, Người dùng, Thẻ.
    - Hiển thị thanh bên (sidebar) chứa lịch sử tìm kiếm và nút xóa lịch sử.

---

## 4. Cách hoạt động (Workflow)

1.  **Người dùng nhập từ khóa** vào ô tìm kiếm ở Header và nhấn Enter.
2.  **Ứng dụng chuyển hướng** đến `/search?q=từ_khóa`.
3.  **Trang Search.jsx** nhận từ khóa, gọi `searchService.globalSearch(keyword)`.
4.  **Backend nhận yêu cầu**:
    - Tìm trong DB các User, Tag, Post khớp với từ khóa.
    - Nếu người dùng đã đăng nhập, lưu từ khóa vào bảng `search_histories`.
    - Trả về đối tượng `SearchResponseDTO` chứa 3 danh sách kết quả.
5.  **Frontend hiển thị dữ liệu**:
    - Nếu có kết quả, render ra các thẻ (cards) tương ứng.
    - Nếu không có, hiển thị thông báo "Không tìm thấy".
    - Cập nhật lại danh sách lịch sử tìm kiếm ở sidebar.

---

## 5. Các tính năng nổi bật
*   **Case-insensitive**: Tìm kiếm không phân biệt hoa thường nhờ `LOWER()` trong SQL.
*   **Search Summary**: Nội dung bài viết trong kết quả tìm kiếm được cắt ngắn xuống 200 ký tự để tối ưu hiển thị.
*   **Real-time History**: Cập nhật lịch sử ngay lập tức sau mỗi lần tìm kiếm thành công.
*   **Debounced History Dropdown**: Lịch sử chỉ hiển thị khi cần thiết (khi focus) để tránh làm rối giao diện.
