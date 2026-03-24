# Tài liệu giải thích: Tất cả các lỗi đã sửa — Chat, WebSocket, Follow, Auth

> Ngày cập nhật: 2026-03-23  
> Phiên bản: 3.0

---

## Mục lục

1. [Tổng quan kiến trúc Auth + WebSocket](#1-tổng-quan-kiến-trúc-auth--websocket)
2. [BUG #1 — 401 ACCESS_TOKEN_EXPIRED liên tục trong console](#2-bug-1--401-access_token_expired-liên-tục-trong-console)
3. [BUG #2 — 409 "Data integrity violation" khi follow](#3-bug-2--409-data-integrity-violation-khi-follow)
4. [BUG #3 — Jackson serialize sai tên field `isFollowing` → `following`](#4-bug-3--jackson-serialize-sai-tên-field-isfollowing--following)
5. [BUG #4 — Follow trả 400 thay vì 409 khi đã follow rồi](#5-bug-4--follow-trả-400-thay-vì-409-khi-đã-follow-rồi)
6. [BUG #5 — WebSocket SecurityContext rỗng trong ChatWebSocketController](#6-bug-5--websocket-securitycontext-rỗng-trong-chatwebsocketcontroller)
7. [BUG #6 — WebSocket token cũ khi reconnect](#7-bug-6--websocket-token-cũ-khi-reconnect)
8. [BUG #7 — Token refresh race condition (nhiều request cùng lúc)](#8-bug-7--token-refresh-race-condition-nhiều-request-cùng-lúc)
9. [BUG #8 — Nút Follow hiện sai trạng thái → nhấn gây 409](#9-bug-8--nút-follow-hiện-sai-trạng-thái--nhấn-gây-409)
10. [BUG #9 — Chat message thứ tự ngược](#10-bug-9--chat-message-thứ-tự-ngược)
11. [Sơ đồ tổng hợp luồng xử lý](#11-sơ-đồ-tổng-hợp-luồng-xử-lý)

---

## 1. Tổng quan kiến trúc Auth + WebSocket

### Request lifecycle (mọi API call)

```
Browser (React)
    │
    │  fetch() với header "Authorization: Bearer <JWT>"
    ▼
┌─────────────────────────────────────────────────┐
│          JwtAuthenticationFilter.java            │
│  (OncePerRequestFilter — chạy TRƯỚC mọi thứ)   │
│                                                  │
│  1. Đọc header Authorization                     │
│  2. Parse JWT → extract email, userId, role      │
│  3. Kiểm tra token bị revoke (Redis)             │
│  4. Validate chữ ký + hạn                        │
│                                                  │
│  ✅ Hợp lệ → set SecurityContext → cho qua       │
│  ❌ Hết hạn → catch ExpiredJwtException           │
│     → write401(response, "ACCESS_TOKEN_EXPIRED") │
│     → DỪNG request (không gọi filterChain)       │
│  ❌ Sai chữ ký → write401("ACCESS_TOKEN_INVALID")│
└─────────────────────────────────────────────────┘
    │ (nếu hợp lệ)
    ▼
┌─────────────────────────────────────────────────┐
│       Spring Security FilterChain                │
│  SecurityConfig.java                             │
│                                                  │
│  .authorizeHttpRequests(auth -> auth             │
│     .requestMatchers("/api/v1/auth/**").permitAll│
│     .requestMatchers("/ws/**").permitAll         │
│     .requestMatchers(GET, "/api/v1/posts/**")... │
│     .anyRequest().authenticated()                │
│  )                                               │
└─────────────────────────────────────────────────┘
    │
    ▼
  Controller → Service → Repository → Response
```

### Các file chính

| File                            | Đường dẫn                    | Vai trò                                       |
| ------------------------------- | ---------------------------- | --------------------------------------------- |
| `JwtAuthenticationFilter.java`  | `backend/.../sercurites/`    | Filter chặn mọi request, validate JWT         |
| `SecurityConfig.java`           | `backend/.../configs/`       | Cấu hình route nào public, route nào cần auth |
| `WebSocketAuthInterceptor.java` | `backend/.../sercurites/`    | Validate JWT trên STOMP CONNECT frame         |
| `ChatWebSocketController.java`  | `backend/.../websocket/`     | Xử lý tin nhắn chat real-time                 |
| `FollowService.java`            | `backend/.../services/`      | Logic follow/unfollow/check trạng thái        |
| `FollowStatusResponse.java`     | `backend/.../dtos/response/` | DTO trả về trạng thái follow                  |
| `ErrorCode.java`                | `backend/.../exceptions/`    | Enum chứa mã lỗi + HTTP status                |
| `GlobalExceptionHandler.java`   | `backend/.../exceptions/`    | Bắt exception, trả response chuẩn             |
| `apiFetch.js`                   | `frontend/.../utils/`        | Wrapper fetch() với auto-refresh token        |
| `followService.js`              | `frontend/.../service/`      | Gọi API follow từ frontend                    |
| `Users.jsx`                     | `frontend/.../pages/`        | Trang danh sách users + nút Follow            |
| `Header.jsx`                    | `frontend/.../components/`   | Thanh header + notification bell + WebSocket  |

---

## 2. BUG #1 — 401 ACCESS_TOKEN_EXPIRED liên tục trong console

### Triệu chứng

```
GET http://localhost:8080/api/v1/notifications?page=0&size=20 401 (Unauthorized)
POST http://localhost:8080/api/v1/presence/heartbeat 401 (Unauthorized)
```

Console hiện 401 mặc dù có refresh token và app vẫn hoạt động bình thường.

### Nguyên nhân gốc

**Access token hết hạn** (expiry: 1 giờ = 3600000ms). Khi hết hạn:

```
apiFetch() gọi fetch(url, { Authorization: "Bearer <TOKEN_HẾT_HẠN>" })
    │
    ▼
JwtAuthenticationFilter bắt ExpiredJwtException
    → write401(response, "ACCESS_TOKEN_EXPIRED")
    → Trả HTTP 401 về browser
    → Browser LOG 401 VÀO CONSOLE (không tắt được)
    │
    ▼
apiFetch() thấy response.status === 401
    → Gọi tryRefresh() → POST /api/v1/auth/token
    → Nhận access token mới → lưu localStorage
    → Retry request với token mới → THÀNH CÔNG
```

**Vấn đề:** Dù retry thành công, browser đã log cái 401 đầu tiên rồi → bạn tưởng lỗi.

### Cách sửa

**File:** `frontend/src/utils/apiFetch.js`

**Thêm `isTokenExpired()`** — decode JWT payload, kiểm tra `exp`. Nếu token sắp hết hạn (trong 30 giây), **refresh TRƯỚC khi gọi request**:

```javascript
// ═══════════════ TRƯỚC (lỗi) ═══════════════
export async function apiFetch(url, options = {}) {
  const token = getToken();
  // ← Gửi token hết hạn → 401 → refresh → retry
  // ← Browser vẫn log cái 401 đầu tiên
  let response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    // refresh ở đây = quá muộn, 401 đã log rồi
  }
}

// ═══════════════ SAU (đã sửa) ═══════════════
function isTokenExpired() {
  const token = getToken();
  if (!token) return false;
  try {
    // JWT có 3 phần: header.payload.signature
    // payload chứa { exp: <unix_timestamp_giây> }
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Refresh 30 giây trước khi hết hạn thật → tránh race condition
    return Date.now() >= payload.exp * 1000 - 30000;
  } catch {
    return false;
  }
}

export async function apiFetch(url, options = {}) {
  // ✅ Kiểm tra TRƯỚC khi gọi → refresh ngay → không bao giờ gửi token hết hạn
  if (isTokenExpired()) {
    const refreshed = await tryRefresh();
    if (!refreshed) {
      clearSession();
      window.location.href = "/login";
      throw new Error("Phiên đăng nhập hết hạn");
    }
  }
  // Giờ token luôn mới → không bao giờ 401 trong console
  const token = getToken();
  let response = await fetch(url, { ...options, headers });
  // Vẫn giữ fallback 401 handler đề phòng
}
```

**Giải thích từng dòng:**

| Dòng code                   | Giải thích                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `atob(token.split(".")[1])` | JWT = 3 phần ngăn bằng `.` → lấy phần 2 (payload) → base64 decode                       |
| `payload.exp * 1000`        | `exp` trong JWT là giây (Unix), JavaScript dùng millisecond → nhân 1000                 |
| `- 30000`                   | Refresh sớm 30 giây trước hạn thật → tránh trường hợp token hết hạn giữa check và fetch |
| `tryRefresh()`              | Gọi `POST /api/v1/auth/token` với refresh token → nhận access token mới                 |
| `clearSession()`            | Xóa token, refreshToken, user, userProfile khỏi localStorage                            |

---

## 3. BUG #2 — 409 "Data integrity violation" khi follow

### Triệu chứng

```json
{
  "code": 409,
  "message": "Data integrity violation — duplicate or constraint error",
  "timstamp": 1774210492172
}
```

### Nguyên nhân gốc

**Bảng `follows` có unique constraint:**

```sql
UNIQUE (follower_id, following_id)  -- constraint tên: uq_follow_pair
```

**`FollowService.follow()` KHÔNG có `@Transactional`:**

```java
// TRƯỚC (lỗi) — 2 implicit transactions riêng biệt
public FollowResponse follow(UUID targetUserId) {
    // Transaction 1: SELECT (check tồn tại)
    if (followRepository.existsBy...()) { throw ALREADY_FOLLOWING; }
    // ← Khoảng trống ở đây = race window ←
    // Transaction 2: INSERT
    Follow saved = followRepository.save(follow); // ← CRASH nếu request khác xen vào
}
```

**Race condition:**

```
Thời gian ──────────────────────────────────────────►

Request A: existsBy... = false ──────────── save() ✅ INSERT thành công
Request B: existsBy... = false ─── save() ❌ Unique constraint violation!
                                            ↓
                           DataIntegrityViolationException
                                            ↓
                           GlobalExceptionHandler bắt
                                            ↓
                           409 "Data integrity violation"
                           (KHÔNG phải message ALREADY_FOLLOWING)
```

### Cách sửa

**File:** `backend/.../services/FollowService.java`

```java
// ═══════════════ SAU (đã sửa) ═══════════════
@Transactional  // ← THÊM: đảm bảo atomicity
public FollowResponse follow(UUID targetUserId) {
    UUID currentUserId = securityContextHelper.getCurrentUserId();

    if (currentUserId.equals(targetUserId)) {
        throw new AppException(ErrorCode.FOLLOW_SELF);
    }
    if (followRepository.existsBy...()) {
        throw new AppException(ErrorCode.ALREADY_FOLLOWING);  // code 11001, HTTP 409
    }

    // ... tạo Follow entity ...

    Follow saved;
    try {
        saved = followRepository.saveAndFlush(follow);  // ← saveAndFlush thay vì save
    } catch (DataIntegrityViolationException e) {
        // ← BẮT race condition: nếu unique constraint vi phạm
        throw new AppException(ErrorCode.ALREADY_FOLLOWING);  // ← Trả lỗi sạch sẽ
    }

    // ... gửi notification ...
    return new FollowResponse(saved, false);
}
```

**Giải thích:**

| Thay đổi                                | Tại sao                                                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `@Transactional`                        | Toàn bộ method chạy trong 1 transaction → `existsBy` + `save` atomic                                 |
| `saveAndFlush()`                        | Force flush ngay để constraint violation xảy ra NGAY trong try-catch (không đợi commit)              |
| `catch DataIntegrityViolationException` | Bắt lỗi duplicate từ DB → convert thành `ALREADY_FOLLOWING` (code 11001) thay vì message chung chung |

**Trước vs Sau:**

| Trường hợp                          | Trước                                 | Sau                          |
| ----------------------------------- | ------------------------------------- | ---------------------------- |
| Follow lần đầu                      | ✅ 200 OK                             | ✅ 200 OK                    |
| Follow khi đã follow                | 409 + `ALREADY_FOLLOWING`             | 409 + `ALREADY_FOLLOWING`    |
| Race condition (2 request cùng lúc) | 409 + `"Data integrity violation"` ❌ | 409 + `ALREADY_FOLLOWING` ✅ |

---

## 4. BUG #3 — Jackson serialize sai tên field `isFollowing` → `following`

### Triệu chứng

Backend trả JSON:

```json
{ "following": true, "followedBy": false, "mutual": false }
```

Frontend expect:

```json
{ "isFollowing": true, "isFollowedBy": false, "isMutual": false }
```

→ `followStates[userId].isFollowing` luôn `undefined` → nút luôn hiện "Theo dõi".

### Nguyên nhân gốc

**Lombok `@Getter` trên `boolean isXxx`** sinh ra getter `isXxx()`. Jackson thấy getter `isXxx()` → strip prefix `is` → serialize thành key `"xxx"` thay vì `"isXxx"`.

```
Java field: boolean isFollowing
Lombok @Getter → method: isFollowing()
Jackson → thấy isFollowing() → strip "is" → JSON key: "following"
```

### Cách sửa

**File:** `backend/.../dtos/response/FollowStatusResponse.java`

```java
// ═══════════════ SAU (đã sửa) ═══════════════
@Getter
@AllArgsConstructor
public class FollowStatusResponse {
    @JsonProperty("isFollowing")   // ← Buộc Jackson dùng tên "isFollowing"
    private final boolean isFollowing;

    @JsonProperty("isFollowedBy")  // ← Buộc Jackson dùng tên "isFollowedBy"
    private final boolean isFollowedBy;

    @JsonProperty("isMutual")      // ← Buộc Jackson dùng tên "isMutual"
    private final boolean isMutual;
}
```

**File:** `frontend/src/service/followService.js` — thêm normalize đề phòng:

```javascript
async getFollowStatus(userId) {
    const response = await apiFetch(...);
    const raw = data.result ?? data;
    // Xử lý cả 2 shape: "isFollowing" (đúng) hoặc "following" (cũ)
    return {
      isFollowing:  raw.isFollowing  ?? raw.following  ?? false,
      isFollowedBy: raw.isFollowedBy ?? raw.followedBy ?? false,
      isMutual:     raw.isMutual     ?? raw.mutual     ?? false,
    };
}
```

---

## 5. BUG #4 — Follow trả 400 thay vì 409 khi đã follow rồi

### Triệu chứng

Nhấn "Theo dõi" khi đã follow → response `400 Bad Request` → frontend không nhận ra là "đã follow" → UI lộn xộn.

### Nguyên nhân gốc

**File:** `backend/.../exceptions/ErrorCode.java`

```java
// TRƯỚC
ALREADY_FOLLOWING(11001, "You are already following this user", HttpStatus.BAD_REQUEST),
//                                                               ^^^^^^^^^^^^^^^^^^
//                                                               Sai! Phải là 409 CONFLICT
```

### Cách sửa

```java
// SAU
ALREADY_FOLLOWING(11001, "You are already following this user", HttpStatus.CONFLICT),
//                                                               ^^^^^^^^^^^^^^^^
//                                                               409 = semantic đúng
```

**Frontend detect 409:**

```javascript
// followService.js
async follow(userId) {
    const response = await apiFetch(..., { method: "POST" });
    // ✅ Detect 409 Conflict = already following
    if (response.status === 409) return { alreadyFollowing: true };
    const data = await response.json();
    // ✅ Fallback: detect via error code 11001
    if (!response.ok) {
      if (data.code === 11001) return { alreadyFollowing: true };
      throw new Error(data.message);
    }
    return data.result ?? data;
}
```

---

## 6. BUG #5 — WebSocket SecurityContext rỗng trong ChatWebSocketController

### Triệu chứng

`CommunicationService.sendMessage()` gọi `securityContextHelper.getCurrentUserId()` → `null` → NullPointerException hoặc tin nhắn không gửi được.

### Nguyên nhân gốc

WebSocket threads **không tự động có SecurityContext** (không giống HTTP request threads). Spring Security filter (`JwtAuthenticationFilter`) chỉ chạy cho HTTP requests, không chạy cho STOMP message handler.

```
HTTP Request:
  JwtAuthenticationFilter → set SecurityContext → Controller có auth ✅

WebSocket STOMP message (/app/chat.send):
  WebSocketAuthInterceptor → set Principal trên STOMP session
  Nhưng KHÔNG set SecurityContextHolder → Controller không có auth ❌
```

### Cách sửa

**File:** `backend/.../websocket/ChatWebSocketController.java`

```java
@MessageMapping("/chat.send")
public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
    // ✅ Copy Principal từ STOMP session vào SecurityContext
    // để SecurityContextHelper.getCurrentUserId() hoạt động
    if (principal instanceof UsernamePasswordAuthenticationToken auth) {
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    MessageResponse saved = communicationService.sendMessage(request);
    // ... routing logic ...
}
```

**Giải thích:**

| Bước                                                         | Chi tiết                                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| STOMP CONNECT                                                | `WebSocketAuthInterceptor` parse JWT → tạo `UserPrincipal` → `accessor.setUser(auth)` |
| `/app/chat.send`                                             | Spring inject `Principal principal` parameter = auth từ STOMP session                 |
| `SecurityContextHolder.getContext().setAuthentication(auth)` | Copy auth vào thread-local SecurityContext                                            |
| `securityContextHelper.getCurrentUserId()`                   | Đọc từ SecurityContext → giờ có giá trị ✅                                            |

---

## 7. BUG #6 — WebSocket token cũ khi reconnect

### Triệu chứng

WebSocket mất kết nối → reconnect → dùng token cũ (đã hết hạn) → `WebSocketAuthInterceptor` reject → reconnect fail mãi mãi.

### Nguyên nhân gốc

`connectHeaders` được set **một lần** khi tạo `Client`. Khi reconnect, `@stomp/stompjs` dùng lại headers cũ → token hết hạn → reject.

```javascript
// TRƯỚC — token bị "đóng băng" lúc tạo client
const client = new Client({
  connectHeaders: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    // ← Giá trị này không thay đổi khi reconnect!
  },
});
```

### Cách sửa

**File:** `frontend/src/components/Header.jsx` (và `Chat.jsx`)

```javascript
// SAU — đọc token tươi mỗi lần reconnect
const client = new Client({
  webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
  // ✅ beforeConnect chạy MỖI LẦN trước khi connect/reconnect
  beforeConnect: () => {
    const freshToken = localStorage.getItem("token");
    if (freshToken) {
      client.connectHeaders = {
        Authorization: `Bearer ${freshToken}`,
      };
    }
  },
  reconnectDelay: 5000,
});
```

**Giải thích `beforeConnect`:**

```
Lần connect đầu:
  beforeConnect() → đọc token A (còn hạn) → connect headers = token A → ✅

Token A hết hạn → apiFetch refresh → token B mới

WebSocket mất kết nối → 5s → reconnect:
  beforeConnect() → đọc token B (mới, còn hạn) → connect headers = token B → ✅
```

---

## 8. BUG #7 — Token refresh race condition (nhiều request cùng lúc)

### Triệu chứng

Trang Users.jsx load → gọi 10+ `getFollowStatus()` cùng lúc → tất cả 401 → mỗi request đều gọi refresh → refresh token bị dùng 2 lần → server reject → redirect login.

### Nguyên nhân gốc

Refresh token **rotate** mỗi lần dùng (server tạo refresh token mới, xóa cũ). Nếu 2 request gọi refresh cùng lúc:

```
Request A: POST /auth/token { refreshToken: "RT_1" } → ✅ nhận RT_2
Request B: POST /auth/token { refreshToken: "RT_1" } → ❌ RT_1 đã bị xóa → INVALID
```

### Cách sửa

**File:** `frontend/src/utils/apiFetch.js`

```javascript
// Singleton lock — chỉ 1 refresh chạy tại mọi thời điểm
let refreshPromise = null;

async function tryRefresh() {
  // Nếu đang có refresh đang chạy → đợi nó, không tạo request mới
  if (refreshPromise) return refreshPromise;
  // Nếu chưa có → tạo 1 lần duy nhất
  refreshPromise = doRefresh();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null; // Reset sau khi xong
  }
}
```

**Giải thích flow:**

```
10 requests cùng 401:

Request 1: tryRefresh() → refreshPromise = null → tạo doRefresh()
Request 2: tryRefresh() → refreshPromise = doRefresh() → ĐỰƠI (await)
Request 3: tryRefresh() → refreshPromise = doRefresh() → ĐỢI
...
Request 10: tryRefresh() → refreshPromise = doRefresh() → ĐỢI

doRefresh() hoàn thành → return true
  → Request 1 nhận true → getToken() = token mới → retry ✅
  → Request 2 nhận true → getToken() = token mới → retry ✅
  → ...
  → Request 10 nhận true → getToken() = token mới → retry ✅

refreshPromise = null (reset)
```

**Kết hợp với proactive refresh (BUG #1):**

```
Proactive refresh (trước khi gửi request):
  isTokenExpired() → true → tryRefresh() → refresh 1 lần → tất cả request dùng token mới

→ KHÔNG CÒN 401, KHÔNG CÒN RACE CONDITION
```

---

## 9. BUG #8 — Nút Follow hiện sai trạng thái → nhấn gây 409

### Triệu chứng

Trang Users hiện "Theo dõi" cho user đã follow → nhấn → server trả 409 ALREADY_FOLLOWING.

### Nguyên nhân gốc

Khi load trang, `Users.jsx` gọi `getFollowStatus()` cho mỗi user. Nếu token hết hạn, tất cả đều 401 → `Promise.allSettled` → `status: "rejected"` → `followStates` rỗng → nút mặc định "Theo dõi" (sai).

```javascript
// Users.jsx — load follow states
const statuses = await Promise.allSettled(
  otherUsers.map((u) => followService.getFollowStatus(u.userId)),
);
// Nếu API trả 401 → status = "rejected" → KHÔNG thêm vào newStates
otherUsers.forEach((u, i) => {
  if (statuses[i].status === "fulfilled") {
    newStates[u.userId] = statuses[i].value; // ← Chỉ fulfilled mới được thêm
  }
});
// → followStates[userId] = undefined → isFollowing = undefined → hiện "Theo dõi"
```

### Cách sửa (nhiều tầng)

**Tầng 1 — Proactive refresh (BUG #1):** Refresh token TRƯỚC khi gọi → tất cả `getFollowStatus` dùng token mới → fulfilled → `followStates` đúng.

**Tầng 2 — Follow loading guard:**

```javascript
// Users.jsx
const [followLoading, setFollowLoading] = useState({});

const handleFollowToggle = async (user) => {
  if (followLoading[user.userId]) return; // ← Chặn double-click
  setFollowLoading((prev) => ({ ...prev, [user.userId]: true }));
  // ... toggle logic ...
  setFollowLoading((prev) => ({ ...prev, [user.userId]: false }));
};
```

**Tầng 3 — followService.js detect "already following":**

```javascript
async follow(userId) {
  const response = await apiFetch(..., { method: "POST" });
  if (response.status === 409) return { alreadyFollowing: true };  // ← Không throw
  // ...
}
```

**Tầng 4 — Users.jsx xử lý `alreadyFollowing`:**

```javascript
const result = await followService.follow(user.userId);
if (result?.alreadyFollowing) {
  // Server nói đã follow → sửa lại UI cho đúng
  setFollowStates((prev) => ({
    ...prev,
    [user.userId]: { isFollowing: true },
  }));
}
```

**Tầng 5 — Error recovery: fetch real state:**

```javascript
} catch (e) {
  // Lỗi bất kỳ → hỏi server trạng thái thật
  try {
    const realStatus = await followService.getFollowStatus(user.userId);
    setFollowStates((prev) => ({ ...prev, [user.userId]: realStatus }));
  } catch {
    // Server cũng lỗi → revert về giá trị cũ
    setFollowStates((prev) => ({ ...prev, [user.userId]: { isFollowing } }));
  }
}
```

---

## 10. BUG #9 — Chat message thứ tự ngược

### Triệu chứng

Tin nhắn hiện đảo ngược — tin mới nhất ở trên, tin cũ ở dưới.

### Nguyên nhân gốc

Backend query tin nhắn **ORDER BY created_at DESC** (mới nhất trước) để phân trang. Frontend nhận mảng theo thứ tự DESC nhưng render trực tiếp → ngược.

### Cách sửa

**File:** `frontend/src/pages/Chat.jsx`

```javascript
// Sau khi nhận messages từ API:
const reversed = [...data.messages].reverse();
// data.messages = [newest, ..., oldest] (DESC từ backend)
// reversed      = [oldest, ..., newest] (đúng thứ tự hiển thị)
setMessages(reversed);
```

---

## 11. Sơ đồ tổng hợp luồng xử lý

### Luồng Follow + Chat hoàn chỉnh

```
┌──────────────── User A (React) ────────────────────────────────────────┐
│                                                                        │
│  1. Users.jsx load → gọi getFollowStatus(B.id)                        │
│     │                                                                  │
│     ▼                                                                  │
│  apiFetch.js:                                                          │
│     isTokenExpired()? → Có → tryRefresh() → token mới                  │
│                        → Không → dùng token hiện tại                   │
│     │                                                                  │
│     ▼                                                                  │
│  GET /api/v1/users/{B.id}/follow/status                                │
│     │                                                                  │
│     ▼ JwtAuthenticationFilter → OK                                     │
│     ▼ FollowService.getFollowStatus()                                  │
│     ▼ { isFollowing: false, isFollowedBy: false, isMutual: false }     │
│                                                                        │
│  2. Nhấn "Theo dõi"                                                    │
│     │                                                                  │
│     ▼ handleFollowToggle(B) → followLoading[B] = true                  │
│     ▼ Optimistic update: isFollowing = true (UI update ngay)           │
│     ▼ POST /api/v1/users/{B.id}/follow                                 │
│     │                                                                  │
│     ▼ FollowService.follow():                                          │
│        - @Transactional                                                │
│        - existsBy... → false → INSERT                                  │
│        - saveAndFlush() → success                                      │
│        - Tạo Notification → save DB                                    │
│        - convertAndSendToUser(B.id, /queue/notifications, notif)       │
│     ▼ Response 200: { followId, userId, ... }                          │
│     ▼ followLoading[B] = false                                         │
│                                                                        │
│  3. Nhấn "Nhắn tin"                                                    │
│     │                                                                  │
│     ▼ Navigate /chat?userId=B.id                                       │
│     ▼ Chat.jsx → STOMP connect (beforeConnect → fresh token)           │
│     ▼ Subscribe /user/queue/messages, /user/queue/pending              │
│     ▼ STOMP /app/chat.send { receiverId: B.id, message: "Hello" }      │
│        │                                                               │
│        ▼ ChatWebSocketController.sendMessage():                        │
│           SecurityContextHolder.set(principal)                         │
│           CommunicationService.sendMessage():                          │
│             isMutualFollow(A, B)? → No (B chưa follow A)              │
│             → status = PENDING                                         │
│             → convertAndSendToUser(B.id, /queue/pending, msg)          │
│             → convertAndSendToUser(A.id, /queue/messages, msg) (echo)  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌──────────────── User B (React) ────────────────────────────────────────┐
│                                                                        │
│  Header.jsx nhận notification: "A đã theo dõi bạn"                     │
│  Chat.jsx nhận pending message: "Hello" (tab Tin nhắn chờ)             │
│                                                                        │
│  4. B nhấn "Chấp nhận" → POST /messages/pending/{A.id}/accept          │
│     → Tất cả PENDING messages A→B chuyển thành NORMAL                  │
│     → Hiện trong inbox chính                                           │
│                                                                        │
│  5. B follow A → POST /api/v1/users/{A.id}/follow                      │
│     → Giờ A↔B mutual follow → bạn bè                                  │
│     → Tin nhắn tiếp theo đi qua /queue/messages (NORMAL)              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Tóm tắt tất cả các fix

| #   | Lỗi                                    | File sửa                        | Thay đổi                                                                           |
| --- | -------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | 401 ACCESS_TOKEN_EXPIRED trong console | `apiFetch.js`                   | Thêm `isTokenExpired()` + proactive refresh trước request                          |
| 2   | 409 Data integrity violation           | `FollowService.java`            | Thêm `@Transactional` + `saveAndFlush()` + catch `DataIntegrityViolationException` |
| 3   | Jackson sai tên field                  | `FollowStatusResponse.java`     | Thêm `@JsonProperty("isFollowing")` etc.                                           |
| 4   | 400 thay vì 409                        | `ErrorCode.java`                | `ALREADY_FOLLOWING` → `HttpStatus.CONFLICT`                                        |
| 5   | WebSocket SecurityContext rỗng         | `ChatWebSocketController.java`  | Copy Principal vào SecurityContextHolder                                           |
| 6   | WebSocket token cũ khi reconnect       | `Header.jsx`, `Chat.jsx`        | Dùng `beforeConnect` callback                                                      |
| 7   | Token refresh race condition           | `apiFetch.js`                   | Singleton `refreshPromise` lock                                                    |
| 8   | Nút Follow sai trạng thái              | `Users.jsx`, `followService.js` | Loading guard + detect 409 + error recovery                                        |
| 9   | Chat messages ngược                    | `Chat.jsx`                      | `.reverse()` mảng DESC từ backend                                                  |
