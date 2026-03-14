# FRONTEND CODE REVIEW — Forum IT (React + Vite)

> Ngày review: 11/03/2026  
> Stack: React 18 · Vite · React Router DOM · Vanilla CSS  
> **Lưu ý: Đây là tài liệu review thuần túy — KHÔNG sửa code.**

---

## 1. Nội dung từng file

### Root

| File         | Chức năng                                                              |
| ------------ | ---------------------------------------------------------------------- |
| `index.html` | Entry HTML, mount `<div id="root">`                                    |
| `main.jsx`   | Render `<App />` vào DOM với `StrictMode`                              |
| `App.jsx`    | Router chính, quản lý `theme` toàn cục qua localStorage + custom event |
| `App.css`    | Biến CSS global (màu, font), reset nhẹ                                 |
| `index.css`  | CSS normalize cơ bản                                                   |

---

### `pages/`

| File             | Mô tả                                                      | Kết nối API                                                         |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- |
| `Home.jsx`       | Feed, "Bài viết nổi bật", greeting card, tích hợp PostCard | ❌ Mock data hoàn toàn — `featuredPosts` và `userPosts` là hardcode |
| `Posts.jsx`      | Danh sách bài viết có phân trang                           | ⚠️ Cần kiểm tra (không đọc đầy đủ)                                  |
| `PostDetail.jsx` | Chi tiết bài viết, comments, trả lời, vote                 | ❌ Mock data hoàn toàn — không gọi API                              |
| `Tags.jsx`       | Danh sách tag, tab phổ biến/mới                            | ❌ Mock data                                                        |
| `Profile.jsx`    | Xem hồ sơ user                                             | ⚠️ Đọc một phần localStorage                                        |
| `Users.jsx`      | Danh sách user, follow                                     | ❌ Mock data                                                        |
| `Settings.jsx`   | Chỉnh sửa hồ sơ, đổi theme                                 | ❌ Chỉ lưu vào localStorage, không gọi `userService.updateUser`     |
| `Search.jsx`     | Tìm kiếm bài viết                                          | ⚠️ Có thể gọi API nhưng không rõ                                    |
| `Login.jsx`      | Form đăng nhập                                             | ✅ Gọi `authService.login`                                          |
| `Register.jsx`   | Form đăng ký                                               | ✅ Gọi `authService.register`                                       |
| `Chat.jsx`       | Giao diện chat                                             | ❌ Mock data — không có backend WebSocket/API                       |
| `Saved.jsx`      | Danh sách bài đã lưu                                       | ❌ Mock data — không gọi `/users/me/bookmarks`                      |

---

### `components/`

| File                  | Mô tả                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `Header.jsx`          | Thanh điều hướng trên, avatar, notification dropdown (mock), chat list (mock), tìm kiếm (mock), mở CreatePostModal |
| `Footer.jsx`          | Footer link tĩnh                                                                                                   |
| `Sidebar.jsx`         | Side nav trái, highlight `activePage` prop                                                                         |
| `PostCard.jsx`        | Card hiển thị 1 bài viết trong feed                                                                                |
| `CreatePostModal.jsx` | Modal tạo bài viết mới, dispatch event `globalPostCreated`                                                         |
| `ChatBox.jsx`         | Hộp chat nổi (floating), nhiều chat đồng thời                                                                      |
| `ImageGrid.jsx`       | Grid ảnh tự động layout theo số lượng ảnh                                                                          |

---

### `service/`

| File                | Mô tả                                                                             | Pattern        |
| ------------------- | --------------------------------------------------------------------------------- | -------------- |
| `authService.js`    | login, register, logout, refreshToken, getToken, getUser, isLoggedIn, saveSession | Object literal |
| `postService.js`    | CRUD post, search, recent, getTotalPosts                                          | Object literal |
| `commentService.js` | CRUD comment, getReplies, countComments                                           | Object literal |
| `userService.js`    | getAllUsers, getUserById, getUserByEmail, updateUser, deleteUser                  | Class (ES6)    |

---

### `styles/`

16 file CSS riêng cho từng trang/component. Không dùng CSS module, không dùng styled-components. Mỗi file ánh xạ 1-1 với component tương ứng.

---

## 2. Những gì Backend có mà Frontend chưa tích hợp

| Tính năng / Endpoint Backend                        | Trạng thái Frontend                                                                             |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Reactions** (like/dislike/love/haha/sad/angry)    | ❌ Không có service, không có UI thật. Nút like trong PostCard chỉ toggle state local           |
| **Saved/Bookmark** (`/users/me/bookmarks`)          | ❌ `Saved.jsx` dùng mock data hoàn toàn. Không có `savedService.js`                             |
| **Tags page** thực từ DB                            | ❌ `Tags.jsx` mock data. Backend có `TagRepository` + PostTag nhưng không expose Tag list API   |
| **Chat/Communication** (`Communication` entity)     | ❌ `Chat.jsx`, `ChatBox.jsx` mock data. Backend không có WS/REST chat                           |
| **Notification**                                    | ❌ `Header.jsx` dùng `dummyNotifications`. Backend có entity nhưng không có controller          |
| **Profile page thực**                               | ❌ `Profile.jsx` đọc localStorage thậm chí không gọi `userService.getUserById`                  |
| **Settings lưu lên server**                         | ❌ `Settings.jsx` lưu vào localStorage, không gọi `userService.updateUser`                      |
| **PostDetail thực từ API**                          | ❌ `PostDetail.jsx` mock data. Có `id` từ `useParams` nhưng không gọi `postService.getPostById` |
| **Comments trong PostDetail**                       | ❌ Comments hardcode. Không gọi `commentService.getCommentsByPost`                              |
| **Bộ lọc theo status** (`/posts/status/{status}`)   | ❌ Không dùng                                                                                   |
| **Admin: xóa post/comment**                         | ❌ Không có trang admin                                                                         |
| **Admin: cập nhật status post**                     | ❌ Không có trang admin                                                                         |
| **Statistics** (`/posts/statistics/…`)              | ⚠️ Chỉ `getTotalPosts` trong postService, không render UI                                       |
| **getAllPosts (admin)** (`/posts/all`)              | ❌ Không dùng                                                                                   |
| **getRecentPosts**                                  | ⚠️ Có trong `postService.js` nhưng không được gọi ở bất kỳ component nào                        |
| **Comments của 1 user** (`/comments/user/{userId}`) | ❌ Không có trong `commentService.js`                                                           |
| **`refreshToken`** trong authService                | ⚠️ Có implementation nhưng **không được gọi tự động** khi token hết hạn                         |
| **Home.jsx feed thực**                              | ❌ 100% mock, không gọi `postService.getPublishedPosts`                                         |
| **Users.jsx thực**                                  | ❌ Mock data, không gọi `userService.getAllUsers`                                               |
| **ModerationLog**                                   | ❌ Không có front-end                                                                           |
| **Share**                                           | ❌ Không có front-end                                                                           |

---

## 3. Code xử lý đúng yêu cầu chưa

### Vấn đề nghiêm trọng về nghiệp vụ

| Vấn đề                                                                    | File                  | Chi tiết                                                                                                   |
| ------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------- |
| ❌ **`isLoggedIn` luôn = `true`**                                         | `Header.jsx`          | `const [isLoggedIn, setIsLoggedIn] = useState(true)` — hardcode, không check thật                          |
| ❌ **Logout không redirect, không xóa token**                             | `Header.jsx`          | `handleLogout` chỉ set state local, không gọi `authService.logout()`                                       |
| ❌ **`PostDetail` không load dữ liệu thật**                               | `PostDetail.jsx`      | `useParams` lấy `id` nhưng không fetch API. Hiển thị 1 bài viết hardcode                                   |
| ❌ **`Home.jsx` feed không thật**                                         | `Home.jsx`            | `featuredPosts` và `userPosts` là dữ liệu cứng; không gọi backend khi load trang                           |
| ❌ **`Saved.jsx` không gọi API**                                          | `Saved.jsx`           | `savedPostData` là mock; không gọi `/users/me/bookmarks`                                                   |
| ⚠️ **`Settings.jsx` lưu localStorage, không đồng bộ server**              | `Settings.jsx`        | `handleSave` chỉ `localStorage.setItem`, không gọi `userService.updateUser`                                |
| ⚠️ **Token không tự động refresh**                                        | Toàn bộ service       | Khi API trả 401 (token hết hạn), không có interceptor gọi `refreshToken`                                   |
| ⚠️ **`saveSession` không lưu user từ JWT**                                | `authService.js`      | Chỉ lưu `accessToken`; `user` chỉ được lưu nếu response có `authResult.user` (backend không trả field này) |
| ⚠️ **`userService` trả raw response**                                     | `userService.js`      | Không unwrap `data.result` như các service khác; phía gọi phải tự handle                                   |
| ⚠️ **`commentService` không có `getAllCommentsByPost`**                   | `commentService.js`   | Backend có endpoint `/post/{postId}/all` nhưng service không implement                                     |
| ⚠️ **`CreatePostModal` dispatch `globalPostCreated` nhưng không gọi API** | `CreatePostModal.jsx` | Bài viết mới chỉ thêm vào state cục bộ, không lưu lên server                                               |

---

### Validation phía client

| Điểm                                                                 | Đánh giá                 |
| -------------------------------------------------------------------- | ------------------------ |
| ✅ Form Login/Register có validation cơ bản (required, email format) | Tốt                      |
| ⚠️ Không có debounce cho input tìm kiếm                              | Mỗi ký tự có thể gọi API |
| ⚠️ Form Settings không validate trước khi lưu                        | Lưu cả dữ liệu trống     |
| ❌ Không có feedback loading/spinner nhất quán khi gọi API           | UX kém                   |

---

## 4. OOP — Tái sử dụng, dễ hiểu, dễ scale

### Điểm tốt

- Tách service layer riêng (`service/`) — mọi call API tập trung, không viết `fetch` rải rác.
- Component hóa rõ ràng: `Header`, `Footer`, `Sidebar`, `PostCard` tái sử dụng ở nhiều trang.
- `Sidebar` nhận `activePage` prop — reusable, dễ highlight active.
- CSS dùng custom property (`var(--primary-color)`) — dễ theming.
- `ImageGrid` tự động layout theo số ảnh — logic tách biệt.

### Điểm yếu

| Vấn đề                                                                | Tác động                                                                                                                                                       |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`userService.js` dùng Class, các service khác dùng Object literal** | Không nhất quán. Class không cần thiết khi không có state                                                                                                      |
| **Logic đọc/parse `localStorage` lặp trong nhiều component**          | `Home.jsx`, `Header.jsx`, `PostDetail.jsx`, `Settings.jsx`, `Profile.jsx` đều có đoạn code `localStorage.getItem('userProfile')` + `JSON.parse` giống hệt nhau |
| **Không có custom hook**                                              | Logic như `useUserProfile()`, `useAuth()`, `usePosts()` có thể extract thành hook — hiện lặp trong từng page                                                   |
| **`handlePostCreated` logic rải rác**                                 | `Home.jsx` vừa có function `handlePostCreated`, vừa listen global event `globalPostCreated` — dư                                                               |
| **Mock data khổng lồ inline trong page**                              | `Home.jsx`, `PostDetail.jsx`, `Tags.jsx` chứa dữ liệu giả ngay trong component — khó đọc                                                                       |
| **Không có auth context/provider**                                    | Trạng thái đăng nhập quản lý qua localStorage một cách thủ công, không có `AuthContext`                                                                        |
| **Không có state management**                                         | Redux, Zustand, hay Context API đều không có — toàn bộ state là local hoặc qua localStorage                                                                    |

---

## 5. Logic chung (Common Patterns lặp lại)

| Logic                                                                       | Nơi xuất hiện                                                               | Trạng thái                                             |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------ |
| `localStorage.getItem('userProfile')` + `JSON.parse`                        | `Home.jsx`, `Header.jsx`, `PostDetail.jsx`, `Settings.jsx`, `Profile.jsx`   | **Lặp 5 lần**, nên extract thành `useUserProfile` hook |
| `authHeader()` function                                                     | `postService.js`, `commentService.js`, `userService.js`                     | **Lặp 3 lần**, cần dùng chung                          |
| `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL \|\| "..."`         | Tất cả 4 service files                                                      | **Lặp 4 lần**                                          |
| `data.result ?? data` (unwrap API response)                                 | `postService.js`, `commentService.js`                                       | Lặp, thiếu ở `userService.js`                          |
| Event listener pattern `window.addEventListener('userProfileUpdated', ...)` | `Home.jsx`, `Header.jsx`, `PostDetail.jsx`                                  | Lặp 3 lần                                              |
| `formatTime(timestamp)`                                                     | `Home.jsx` định nghĩa, các component khác không tái dụng                    | Cần utils                                              |
| 3-column layout (left sidebar + main + right sidebar)                       | `Home.jsx`, `Posts.jsx`, `Search.jsx`, `Tags.jsx`, `Users.jsx`, `Saved.jsx` | Layout giống nhau, không có wrapper component chung    |
| `useState(true)` cho `isLoggedIn`                                           | `Header.jsx`                                                                | Sai có chủ đích                                        |

---

## 6. Tổ chức code có hợp lý không

### Cấu trúc thư mục

```
frontend/src/
├── assets/          ✅ (rỗng — ảnh đặt trong public/)
├── components/      ✅ Components dùng lại
├── pages/           ✅ Page-level components
├── service/         ✅ API services
└── styles/          ⚠️ 16 file CSS riêng lẻ, không có tổ chức phụ
```

### Nhận xét

| Điểm                                                                                                      | Đánh giá                                                 |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| ⚠️ **Không có `utils/`**                                                                                  | `formatTime`, `authHeader`, parse localStorage nên ở đây |
| ⚠️ **Không có `hooks/`**                                                                                  | `useAuth`, `useUserProfile`, `usePosts` nên tách ra      |
| ⚠️ **Không có `context/`**                                                                                | AuthContext, ThemeContext nên tập trung                  |
| ⚠️ **`App.jsx` quản lý theme** nhưng theme state không pass xuống — dùng qua localStorage và custom event | Không nhất quán, khó debug                               |
| ⚠️ **CSS riêng từng file** — không có global design variables file riêng                                  | `App.css` có vars nhưng không đủ                         |
| ❌ **Không có `constants/`**                                                                              | API_BASE_URL, route names, event names nên tập trung     |
| ✅ **Mỗi trang có file CSS riêng**                                                                        | Tránh conflict styles                                    |
| ✅ **Service layer tách rời UI**                                                                          | Tốt cho maintainability                                  |
| ⚠️ **Tên thư mục `service/` (singular)**                                                                  | Convention thường dùng `services/`                       |

---

## 7. Design Patterns được sử dụng

| Pattern                             | Nơi áp dụng                                                        | Ghi chú                                        |
| ----------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| **Component Pattern**               | Toàn bộ — tất cả UI là React component                             | Cơ bản nhất                                    |
| **Container/Presentational (nhẹ)**  | Các page là "container", `PostCard`, `Sidebar` là "presentational" | Không rõ ràng do pages mix logic + UI          |
| **Service Layer Pattern**           | `service/*.js`                                                     | Tách API call ra khỏi UI                       |
| **Observer / Custom Event Pattern** | `window.dispatchEvent(new CustomEvent(...))` dùng ở nhiều nơi      | Giao tiếp giữa component không có chung parent |
| **Local Storage Pattern**           | Persist auth token, user profile, theme                            | Dùng xuyên suốt thay cho state management      |
| **Module Pattern**                  | Mỗi service là module export default                               | Object literal hoặc Class                      |
| **Prop Drilling (vấn đề)**          | `activePage` xuống `Sidebar`                                       | Không phải pattern tốt khi scale               |

**Pattern còn thiếu / nên dùng:**

- **Context API** — AuthContext cho trạng thái đăng nhập
- **Custom Hooks** — `useUserProfile`, `useAuth`, `usePosts`
- **Error Boundary** — Không có, lỗi render component sẽ crash cả ứng dụng
- **Compound Component** — Cho PostCard actions (like, save, comment)
- **Axios Interceptor / Fetch Wrapper** — Để auto-refresh token và xử lý lỗi 401

---

## 8. Hiệu năng

### Điểm tốt

- Vite build — tree-shaking, fast HMR.
- Code splitting có thể dùng `React.lazy` (hiện chưa dùng).
- CSS `var()` thay vì inline style nhiều nơi.
- `useEffect` cleanup đúng cách (removeEventListener) trong nhiều component.

### Điểm yếu / Rủi ro hiệu năng

| Vấn đề                                                        | File                                       | Mức độ                                                       |
| ------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| **Tất cả routes import tĩnh**                                 | `App.jsx`                                  | 🟠 12 page đều load khi app khởi động, không có lazy loading |
| **Không có debounce cho search**                              | `Search.jsx`, `Header.jsx` (search bar)    | 🟠 Có thể gây nhiều requests liên tiếp                       |
| **Mock data in-component rất lớn**                            | `Home.jsx` (~150 dòng JSX hardcode)        | 🟡 Bundle size tăng không cần thiết                          |
| **`window.addEventListener` trong `useEffect`** không memo    | `Home.jsx`, `Header.jsx`, `PostDetail.jsx` | 🟡 Tạo lại function listener mỗi render                      |
| **`[showNotifications, showChat, ...]` dependency array lớn** | `Header.jsx`                               | 🟡 Effect re-register nhiều                                  |
| **Inline SVG icons không tái sử dụng**                        | `Header.jsx`, `Sidebar.jsx`, `Saved.jsx`   | 🟡 Bundle SVG lặp lại                                        |
| **`localStorage.getItem` trong nhiều render**                 | Nhiều file                                 | 🟡 Đồng bộ, blocking I/O                                     |
| **Không có image optimization**                               | Toàn bộ ảnh dùng `/images/` trực tiếp      | 🟡 Không có lazy load ảnh                                    |

---

## 9. Bảo mật

### Điểm tốt

- Token lưu trong `localStorage` (không lý tưởng nhưng phổ biến).
- Không có `dangerouslySetInnerHTML` — kiểm tra thêm bên dưới.

### Vấn đề bảo mật

| Mức độ        | Vấn đề                                                                        | File                            | OWASP Category            |
| ------------- | ----------------------------------------------------------------------------- | ------------------------------- | ------------------------- |
| 🔴 **HIGH**   | **`dangerouslySetInnerHTML={{ __html: question.content }}`**                  | `PostDetail.jsx`                | A03 XSS Injection         |
| 🔴 **HIGH**   | **`dangerouslySetInnerHTML={{ __html: answer.content }}`**                    | `PostDetail.jsx`                | A03 XSS Injection         |
| 🔴 **HIGH**   | **Token lưu `localStorage`** — dễ bị XSS đánh cắp                             | `authService.js`                | A02 + A07                 |
| 🔴 **HIGH**   | **`isLoggedIn` hardcode `true`**                                              | `Header.jsx`                    | A01 Broken Access Control |
| 🔴 **HIGH**   | **Không có protected routes**                                                 | `App.jsx`                       | A01 Broken Access Control |
| 🟠 **MEDIUM** | **`userId` gửi từ localStorage lên API** không verify                         | `postService`, `commentService` | A01 Broken Access Control |
| 🟠 **MEDIUM** | **`userProfile` trong localStorage** có thể bị tamper                         | `Settings.jsx`                  | A08 Data Integrity        |
| 🟠 **MEDIUM** | **Token không tự refresh** khi hết hạn → user bị kick không rõ lý do          | `authService.js`                | A07 Auth Failures         |
| 🟡 **LOW**    | **API URL không dùng HTTPS** trong default fallback (`http://localhost:8080`) | Tất cả service                  | A02 Clear-text            |
| 🟡 **LOW**    | **`searchParams` không encode** đúng trong một vài trường hợp                 | `postService.js`                | A03 Injection             |

#### Chi tiết về XSS — `PostDetail.jsx`

```jsx
// Nguy hiểm — HTML từ server/mock render trực tiếp vào DOM
<div dangerouslySetInnerHTML={{ __html: question.content }} />
<div dangerouslySetInnerHTML={{ __html: answer.content }} />
```

Nếu `content` chứa `<script>`, `<img onerror=...>` hoặc event handler, **JavaScript độc hại sẽ thực thi**. Cần dùng thư viện sanitize (DOMPurify) trước khi render.

---

## 10. Bắt lỗi — Đánh giá độ đầy đủ

### Bắt lỗi hiện tại khi gọi API

| Pattern                                                       | Service                         | Đánh giá                                   |
| ------------------------------------------------------------- | ------------------------------- | ------------------------------------------ |
| `throw new Error(data.message \|\| "...")` khi `!response.ok` | Tất cả service                  | ✅ Tốt — throw rõ ràng                     |
| `data.result ?? data` unwrap                                  | `postService`, `commentService` | ⚠️ Không nhất quán — thiếu ở `userService` |
| Không có global error handler                                 | Toàn bộ                         | ❌ Mỗi component phải tự try-catch         |
| Không có loading/error state nhất quán                        | Toàn bộ                         | ❌ UX lỗi không nhất quán                  |

### Các lỗi có thể xảy ra chưa được xử lý

| Lỗi                                                   | Nguyên nhân                  | Hệ quả                                                 |
| ----------------------------------------------------- | ---------------------------- | ------------------------------------------------------ |
| Network error (fetch fails)                           | Không có internet, CORS      | Uncaught Promise rejection hoặc runtime crash          |
| 401 Unauthorized (token hết hạn)                      | Không có interceptor         | Component nhận `undefined`, có thể crash               |
| 403 Forbidden                                         | Không có handler             | Lỗi hiển thị không thân thiện                          |
| `JSON.parse(localStorage.getItem(...))` ném exception | Dữ liệu corrupt              | Bắt qua `try-catch` ✅ nhưng fallback về hardcode user |
| `undefined` từ API response                           | Backend thay đổi field name  | Crash runtime — không có optional chaining nhất quán   |
| `PostDetail` render với `id` không tồn tại            | Mock data không phản ánh API | Không có UI báo lỗi "Không tìm thấy bài viết"          |
| Render fail toàn component                            | Không có Error Boundary      | Toàn bộ trang trắng, không có fallback UI              |

### Không có file log lỗi

Hiện tại **không có cơ chế log lỗi** nào (Sentry, LogRocket, hay error tracking tự xây). Lỗi production sẽ âm thầm mất.

---

## 11. Tóm tắt chung Frontend

| Hạng mục               | Điểm (1-10) | Ghi chú ngắn                                                         |
| ---------------------- | ----------- | -------------------------------------------------------------------- |
| Cấu trúc tổng thể      | 6/10        | Rõ ràng nhưng thiếu hooks/, utils/, context/                         |
| Nghiệp vụ đúng         | 3/10        | Phần lớn trang dùng mock data, không gọi API                         |
| Bảo mật                | 3/10        | XSS, no protected routes, hardcoded login state                      |
| Error handling         | 3/10        | Service throw error nhưng không có global handler, no Error Boundary |
| Hiệu năng              | 5/10        | Không lazy load route, không debounce search                         |
| OOP / Reusability      | 5/10        | Service tách tốt, nhưng logic lặp nhiều, không có hooks              |
| Design patterns        | 5/10        | Component + Service tốt; thiếu Context, custom hooks                 |
| Hoàn thiện tính năng   | 3/10        | UI có nhưng đa số chưa kết nối backend                               |
| Documentation/Comment  | 2/10        | Rất ít comment có ý nghĩa                                            |
| Nhất quán (code style) | 5/10        | Mix class/object literal, inconsistent unwrapping                    |

---

## 12. Đối chiếu Frontend ↔ Backend

| Tính năng             | Backend | Frontend | Ghi chú                                       |
| --------------------- | ------- | -------- | --------------------------------------------- |
| Đăng nhập             | ✅      | ✅       | Kết nối đúng                                  |
| Đăng ký               | ✅      | ✅       | Kết nối đúng                                  |
| Logout                | ✅      | ❌       | FE không gọi API logout                       |
| Refresh token         | ✅      | ⚠️       | Service có nhưng không auto-gọi               |
| Danh sách post (feed) | ✅      | ❌       | FE dùng mock                                  |
| Chi tiết post         | ✅      | ❌       | FE dùng mock                                  |
| Tạo bài viết          | ✅      | ❌       | Modal tạo post không gọi API                  |
| Sửa bài viết          | ✅      | ❌       | Không có UI                                   |
| Xóa bài viết          | ✅      | ❌       | Không có UI                                   |
| Comments (xem)        | ✅      | ❌       | FE dùng mock                                  |
| Comments (tạo)        | ✅      | ❌       | FE chỉ local state                            |
| Saved/Bookmark        | ✅      | ❌       | FE dùng mock                                  |
| Hồ sơ user            | ✅      | ❌       | Đọc localStorage, không gọi API               |
| Cài đặt               | ✅      | ❌       | Lưu localStorage, không đồng bộ server        |
| Tags                  | ⚠️      | ❌       | Backend có DB nhưng không expose Tag list API |
| Chat                  | ❌      | ❌       | Cả 2 đều mock                                 |
| Notification          | ❌      | ❌       | Cả 2 đều mock                                 |
| Reaction              | ❌      | ❌       | Entity có, không có API                       |
| Admin panel           | ❌      | ❌       | Không có cả 2                                 |

---

_File này chỉ phục vụ mục đích review — không có thay đổi code nào được thực hiện._
