# API Documentation: Saved Post (Lưu Bài Viết / Bookmark)

Tính năng này cho phép người dùng đăng nhập lưu trữ lại các bài viết yêu thích để xem lại sau. 

## 1. Cấu trúc files & Mô hình hoạt động
Mã nguồn cho tính năng này được mô-đun hóa độc lập tại `com.forum.it.*.savedpost`, cụ thể:

- **Entity**: `SavedPost.java` (Tại `entities/post/` bảng trung gian, lưu trữ liên kết giữa `postId` và `userId` người đã lưu). 
- **DTO**: `SavedPostResponse.java` (Tại `dtos` chứa dữ liệu trả về cho Frontend).
- **Controller**: `SavedPostController.java` (Đón nhận Request API trực tiếp từ HTTP Postman, gọi JWT để tra ra danh tính của user ẩn sau token).
- **Service**: `SavedPostService.java` (Thực thi các luật Logic: kiểm tra trùng lặp lượt lưu, gọi Repository để thay đổi DB, bọc lại lỗi nếu có).
- **Repository**: `SavedPostRepository.java` (Giao tiếp trực tiếp với bảng `saved_posts` trong PostgreSQL).

### Luồng Hoạt Động (Flow)
1. User gửi HTTP request lên, trên header có kẹp `Bearer Token`.
2. Lớp `JwtAuthenticationFilter` hoạt động trước, nó túm cổ token đó giải mã ra Email và gắn vào `SecurityContextHolder`.
3. Request được thả cho qua để chui vào tới `SavedPostController`.
4. `SavedPostController` moi cái hộp `SecurityContextHolder` ra, kiếm cái Email ban nãy và đổi nó thành mã `UUID` người dùng. 
5. Controller thảy mảnh `UUID` người dùng và `UUID` bài viết xuống `SavedPostService`.
6. Service kiểm tra xem có hợp lý không -> Gọi `SavedPostRepository` để lưu, xóa, hoặc truy vấn danh sách tùy vào tác vụ lúc đó.

---

## 2. API Lưu bài viết (Bookmark Post)

Đánh dấu bài viết và cho vào danh sách Đã Lưu của người dùng hiện tại (lấy theo Token).

**Endpoint:** `POST /api/v1/posts/{postId}/bookmarks`

### Tham số đường dẫn (Path Variables)
- `postId` (UUID): Mã ID của bài viết muốn lưu.

### Headers (Bắt buộc)
- `Authorization`: `Bearer <Your_Access_Token>`

### Request Body
*Không cần truyền (None)*

### Response (Thành công - Lưu lần đầu)
Trạng thái HTTP: `201 Created`
```text
Saved post successfully
```

### Lỗi thường gặp 
Trạng thái HTTP: `400 / 500 lỗi RuntimeException`
```json
{
    "code": 9999,
    "message": "Bài viết này đã được lưu trước đó.",
    "timstamp": 1772338169793
}
```

---

## 3. API Bỏ lưu bài viết (Unbookmark Post)

Xóa bài viết ra khỏi danh sách yêu thích của người dùng hiện hành.

**Endpoint:** `DELETE /api/v1/posts/{postId}/bookmarks`

> 💡 **Lý do dùng postId:** Khi thiết kế tính năng này ở Frontend, màn hình chi tiết bài viết chỉ có sẵn biến `postId`. Bằng cách truyền `postId`, máy chủ sẽ tự động kết hợp với định danh `userId` trong Token để truy dò và xóa lượt lưu chính xác nhất. Ngăn ngừa việc truyền Hardcode sai khóa ngoại `saved_post_id`.

### Tham số đường dẫn (Path Variables)
- `postId` (UUID): Mã ID của bài viết muốn XÓA khỏi mục Đã Lưu.

### Headers (Bắt buộc)
- `Authorization`: `Bearer <Your_Access_Token>`

### Request Body
*Không cần truyền (None)*

### Response (Thành công - Xóa thành công)
Trạng thái HTTP: `200 OK`
```text
Unsaved post successfully
```

### Lỗi thường gặp
Trạng thái HTTP: `400 / 500 lỗi RuntimeException`
```json
{
    "code": 9999,
    "message": "Không tìm thấy bài lưu này để xóa.",
    "timstamp": 1772338209607
}
```

---

## 4. API Xem danh sách đã lưu (Get My Saved Posts)

Hiển thị toàn bộ lịch sử bài đã Bookmark của User đăng nhập, sắp xếp theo thời gian lưu mới nhất lên đầu. Chế độ phân trang tự động.

**Endpoint:** `GET /api/v1/users/me/bookmarks`

### Headers (Bắt buộc)
- `Authorization`: `Bearer <Your_Access_Token>`

### Query Params (Tùy chọn cho phân trang)
- `page` (Integer): Số trang (Mặc định `0`)
- `size` (Integer): Giới hạn lượng kết quả mỗi trang (Mặc định `20`)

*URL Test Postman mẫu:* `http://localhost:8080/api/v1/users/me/bookmarks?page=0&size=10`

### Response (Thành công)
Trạng thái HTTP: `200 OK`
Hệ thống trả JSON bao bọc quanh cấu trúc thẻ `Page` của Spring Boot:

```json
{
    "content": [
        {
            "postId": "46b5839d-9ecd-4a42-8d54-8e85e5cbfae5",
            "savedAt": "2026-03-01T00:00:00"
        }
    ],
    "pageable": {
        "pageNumber": 0,
        "pageSize": 20,
        "sort": {
            "empty": true,
            "sorted": false,
            "unsorted": true
        },
        "offset": 0,
        "paged": true,
        "unpaged": false
    },
    "last": true,
    "totalPages": 1,
    "totalElements": 1,
    "size": 20,
    "number": 0,
    "first": true,
    "numberOfElements": 1,
    "sort": {
        "empty": true,
        "sorted": false,
        "unsorted": true
    },
    "empty": false
}