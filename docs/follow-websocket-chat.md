# Tài liệu: Follow System + WebSocket Chat

> Ngày cập nhật: 2026-03-19  
> Phiên bản: 2.0 (thêm Follow System + Pending Messages)

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Follow System](#2-follow-system)
   - [Entity & DB](#21-entity--db)
   - [API endpoints](#22-api-endpoints)
   - [Logic "Bạn bè" (Mutual Follow)](#23-logic-bạn-bè-mutual-follow)
3. [WebSocket — Cấu hình & Xác thực](#3-websocket--cấu-hình--xác-thực)
4. [Chat: Luồng gửi tin nhắn](#4-chat-luồng-gửi-tin-nhắn)
   - [NORMAL messages (bạn bè)](#41-normal-messages-bạn-bè)
   - [PENDING messages (người lạ)](#42-pending-messages-người-lạ)
5. [REST API — Chat](#5-rest-api--chat)
6. [Presence (Online/Offline)](#6-presence-onlineoffline)
7. [Địa chỉ STOMP queue client cần subscribe](#7-địa-chỉ-stomp-queue-client-cần-subscribe)
8. [Hướng dẫn test](#8-hướng-dẫn-test)
9. [Sơ đồ luồng đầy đủ](#9-sơ-đồ-luồng-đầy-đủ)

---

## 1. Tổng quan kiến trúc

```
Client (React + SockJS/STOMP)
        │
        │  HTTP REST          WebSocket (STOMP over SockJS)
        │                             │
        ▼                             ▼
 Spring Boot Backend          /ws endpoint
        │                      │
        ├── FollowController    ├── WebSocketAuthInterceptor (JWT)
        ├── CommunicationController   ├── ChatWebSocketController
        ├── FollowService        │         ├─ /app/chat.send
        ├── CommunicationService │         └─ SessionConnect/Disconnect
        ├── PresenceService ◄────┤
        └── [PostgreSQL + Redis] └─ SimpMessagingTemplate
```

**Stack:**
| Component | Công nghệ |
|---|---|
| Framework | Spring Boot 3.5.10 |
| Real-time | Spring WebSocket + STOMP |
| SockJS fallback | ✅ |
| Auth trên WS | JWT (kiểm tra mỗi CONNECT frame) |
| Presence | Redis Set `online_users` |
| DB | PostgreSQL |

---

## 2. Follow System

### 2.1 Entity & DB

**Bảng `follows`** (V2 migration):

```sql
follow_id    UUID  PK
follower_id  UUID  FK → users(user_id)   -- người đi follow
following_id UUID  FK → users(user_id)   -- người được follow
created_at   TIMESTAMP
UNIQUE (follower_id, following_id)
```

**Entity:** `com.forum.it.entities.user.Follow`

### 2.2 API Endpoints

Base: `/api/v1/users/{userId}`

| Method   | Path                                     | Auth      | Mô tả                                   |
| -------- | ---------------------------------------- | --------- | --------------------------------------- |
| `POST`   | `/api/v1/users/{userId}/follow`          | ✅ JWT    | Follow userId                           |
| `DELETE` | `/api/v1/users/{userId}/follow`          | ✅ JWT    | Unfollow userId                         |
| `GET`    | `/api/v1/users/{userId}/follow/status`   | ✅ JWT    | Trạng thái follow với userId            |
| `GET`    | `/api/v1/users/{userId}/followers`       | 🔓 Public | Ai đang follow userId                   |
| `GET`    | `/api/v1/users/{userId}/following`       | 🔓 Public | userId đang follow ai                   |
| `GET`    | `/api/v1/users/{userId}/friends`         | 🔓 Public | Mutual follow (bạn bè)                  |
| `GET`    | `/api/v1/users/{userId}/following/count` | ✅ JWT    | Thống kê số followers/following/friends |

**Params phân trang** (GET lists): `?page=0&size=20`

#### Response mẫu — Follow status

```json
GET /api/v1/users/{userId}/follow/status
{
  "isFollowing": true,
  "isFollowedBy": false,
  "isMutual": false
}
```

#### Response mẫu — Followers list

```json
GET /api/v1/users/{userId}/followers
{
  "followers": [
    {
      "followId": "uuid",
      "userId": "uuid",
      "userName": "alice",
      "fullName": "Alice Nguyen",
      "avatarURL": "https://...",
      "followedAt": "2026-03-19"
    }
  ],
  "totalItems": 1,
  "totalPages": 1
}
```

#### Response mẫu — Friends (mutual follow)

```json
GET /api/v1/users/{userId}/friends
{
  "friends": [
    {
      "followId": null,
      "userId": "uuid",
      "userName": "bob",
      "fullName": "Bob Tran",
      "avatarURL": "https://...",
      "followedAt": null
    }
  ],
  "totalItems": 1,
  "totalPages": 1
}
```

### 2.3 Logic "Bạn bè" (Mutual Follow)

```
A follow B  +  B follow A  =  Mutual Follow (Bạn bè) ✅
A follow B  +  B KHÔNG follow A  =  Chưa phải bạn bè ❌
```

- **Notification:** Khi A follow B → B nhận notification type `FOLLOW`
- **Chat routing:** Mutual follow quyết định tin nhắn vào `NORMAL` hay `PENDING`

---

## 3. WebSocket — Cấu hình & Xác thực

### Cấu hình

**File:** `configs/WebSocketConfig.java`

```
STOMP Endpoint:  /ws  (SockJS enabled)
Broker prefix:   /topic, /queue  (in-memory)
App prefix:      /app              (client → server)
User prefix:     /user             (server → một user cụ thể)
```

### Xác thực JWT trên WebSocket

**File:** `sercurites/WebSocketAuthInterceptor.java`

Mỗi STOMP `CONNECT` frame phải có JWT. Có **2 cách** truyền token:

#### Cách 1 — STOMP header (khuyến nghị)

```javascript
const headers = { Authorization: "Bearer <access_token>" };
stompClient.connect(headers, onConnected, onError);
```

#### Cách 2 — URL query param (SockJS fallback)

```javascript
const socket = new SockJS("http://localhost:8080/ws?token=<access_token>");
```

**Kiểm tra khi CONNECT:**

1. Trích token từ header `Authorization` hoặc STOMP native header `token`
2. `jwtTokenProvider.isTokenExpired(token)` — hết hạn → từ chối
3. `redisService.hasKey("blacklist:" + token)` — bị revoke → từ chối
4. Build `UserPrincipal` → set vào `accessor.setUser(auth)` → Spring dùng để route `/user/{userId}/...`

---

## 4. Chat: Luồng gửi tin nhắn

### 4.1 NORMAL messages (bạn bè)

**Điều kiện:** A và B đều follow nhau (mutual follow)

```
A (client)                    Server                     B (client)
    │                            │                            │
    │─── STOMP /app/chat.send ──►│                            │
    │    { receiverId: B.id,      │                            │
    │      message: "Hello" }     │                            │
    │                            │── CommunicationService ──►│
    │                            │   status = NORMAL         │
    │                            │   save to DB              │
    │                            │                            │
    │◄── /user/A.id/queue/messages│  (echo on sender side)   │
    │                            │──► /user/B.id/queue/messages│
    │                            │                            │◄─ nhận tin
```

**MessageResponse:**

```json
{
  "communicationId": "uuid",
  "senderId": "A-uuid",
  "senderName": "alice",
  "senderAvatarURL": "https://...",
  "receiverId": "B-uuid",
  "receiverName": "bob",
  "message": "Hello",
  "status": "NORMAL",
  "createdAt": "2026-03-19"
}
```

### 4.2 PENDING messages (người lạ)

**Điều kiện:** A và B CHƯA mutual follow

```
A (client)                    Server                     B (client)
    │                            │                            │
    │─── STOMP /app/chat.send ──►│                            │
    │    { receiverId: B.id,      │                            │
    │      message: "Hi stranger" }                          │
    │                            │── CommunicationService    │
    │                            │   status = PENDING        │
    │                            │   save to DB              │
    │                            │                            │
    │◄── /user/A.id/queue/messages│  (echo – A thấy ngay)    │
    │                            │──► /user/B.id/queue/pending│
    │                            │                  (Message Requests)◄─ B nhận
```

**B xử lý Message Request:**

```
B nhận event trên /user/B.id/queue/pending
    ↓
B gọi: GET /api/v1/messages/pending/conversation/{A.id}
    → Xem trước nội dung
    ↓
Lựa chọn:
  ✅ Chấp nhận: POST /api/v1/messages/pending/{A.id}/accept
     → Tất cả PENDING → NORMAL, hiện trong inbox chính
  ❌ Từ chối:  DELETE /api/v1/messages/pending/{A.id}/reject
     → Xoá toàn bộ tin nhắn PENDING từ A đến B
```

---

## 5. REST API — Chat

Base: `/api/v1/messages` _(tất cả cần JWT trừ công khai)_

### 5.1 Gửi tin nhắn

```
POST /api/v1/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "uuid",
  "message": "Hello!"
}

Response 200:
{
  "communicationId": "...",
  "senderId": "...",
  "senderName": "alice",
  "senderAvatarURL": "...",
  "receiverId": "...",
  "receiverName": "bob",
  "message": "Hello!",
  "status": "NORMAL",   // hoặc "PENDING"
  "createdAt": "2026-03-19"
}
```

### 5.2 Danh sách conversations (sidebar)

```
GET /api/v1/messages/conversations
Response 200: [
  {
    "userId": "...",
    "userName": "bob",
    "fullName": "Bob Tran",
    "avatarURL": "...",
    "online": true
  }
]
```

### 5.3 Lịch sử hội thoại

```
GET /api/v1/messages/conversation/{userId}?page=0&size=30
Response 200: {
  "messages": [...],
  "totalItems": 50,
  "totalPages": 2
}
```

### 5.4 Inbox / Sent (NORMAL only)

```
GET /api/v1/messages/inbox?page=0&size=20
GET /api/v1/messages/sent?page=0&size=20
```

### 5.5 Message Requests (PENDING)

```
// Danh sách người gửi request
GET /api/v1/messages/pending
Response 200: [{ userId, userName, fullName, avatarURL, online }]

// Xem trước nội dung từ senderId
GET /api/v1/messages/pending/conversation/{senderId}
Response 200: [{ communicationId, senderId, message, status: "PENDING", ... }]

// Chấp nhận
POST /api/v1/messages/pending/{senderId}/accept
Response 200: { "accepted": 3 }   // số tin nhắn được chuyển sang NORMAL

// Từ chối
DELETE /api/v1/messages/pending/{senderId}/reject
Response 204
```

### 5.6 Xoá tin nhắn

```
DELETE /api/v1/messages/{communicationId}
Response 204   // chỉ người gửi mới được xoá
```

---

## 6. Presence (Online/Offline)

Lưu trong Redis Set `online_users`.

| Sự kiện          | Hành động                                        |
| ---------------- | ------------------------------------------------ |
| STOMP CONNECT    | `markOnline(userId)` → SADD online_users userId  |
| STOMP DISCONNECT | `markOffline(userId)` → SREM online_users userId |

**API check:** Không có endpoint riêng — trạng thái `online: true/false` được nhúng vào `ConversationSummaryResponse` và `FollowResponse`.

---

## 7. Địa chỉ STOMP queue client cần subscribe

Sau khi connect thành công, client subscribe vào:

| Queue                  | Mô tả                                             |
| ---------------------- | ------------------------------------------------- |
| `/user/queue/messages` | Tin nhắn NORMAL (inbox chính của current user)    |
| `/user/queue/pending`  | Tin nhắn PENDING mới đến (Message Requests alert) |

> **Lưu ý:** Spring tự thêm session-id prefix vào `/user/...` đích, nhưng client chỉ cần subscribe `/user/queue/messages` — framework tự xử lý routing theo `Principal.getName()` = `userId`.

**Ví dụ JavaScript (SockJS + StompJS):**

```javascript
const socket = new SockJS("http://localhost:8080/ws");
const stompClient = Stomp.over(socket);

stompClient.connect({ Authorization: `Bearer ${accessToken}` }, (frame) => {
  // Nhận tin nhắn bình thường
  stompClient.subscribe("/user/queue/messages", (msg) => {
    const message = JSON.parse(msg.body);
    handleNewMessage(message); // { status: "NORMAL", ... }
  });

  // Nhận cảnh báo có tin nhắn chờ (Message Request)
  stompClient.subscribe("/user/queue/pending", (msg) => {
    const pending = JSON.parse(msg.body);
    showPendingRequestBadge(pending); // { status: "PENDING", senderName, ... }
  });
});

// Gửi tin nhắn
stompClient.send(
  "/app/chat.send",
  {},
  JSON.stringify({
    receiverId: "target-user-uuid",
    message: "Hello!",
  }),
);
```

---

## 8. Hướng dẫn test

### Test Follow system

#### Case 1: A follow B

```
POST /api/v1/users/{B.id}/follow
Authorization: Bearer <A_token>

→ Response 200: { followId, userId: B.id, userName: "B", ... }
→ B nhận notification type FOLLOW
```

#### Case 2: Kiểm tra trạng thái follow

```
GET /api/v1/users/{B.id}/follow/status
Authorization: Bearer <A_token>

→ { isFollowing: true, isFollowedBy: false, isMutual: false }

// Sau khi B cũng follow A:
→ { isFollowing: true, isFollowedBy: true, isMutual: true }
```

#### Case 3: Xem bạn bè

```
GET /api/v1/users/{A.id}/friends
→ Danh sách users mutual follow với A
```

---

### Test Chat — Pending Message Flow

#### Bước 1: A nhắn B khi chưa mutual follow

```
POST /api/v1/messages            (hoặc STOMP /app/chat.send)
Authorization: Bearer <A_token>
{ "receiverId": "B.id", "message": "Hey B!" }

→ status: "PENDING"
→ B nhận event trên /user/queue/pending (WebSocket)
```

#### Bước 2: B xem danh sách Message Requests

```
GET /api/v1/messages/pending
Authorization: Bearer <B_token>

→ [{ userId: A.id, userName: "A", online: false }]
```

#### Bước 3: B xem preview tin nhắn từ A

```
GET /api/v1/messages/pending/conversation/{A.id}
Authorization: Bearer <B_token>

→ [{ message: "Hey B!", status: "PENDING", ... }]
```

#### Bước 4a: B chấp nhận

```
POST /api/v1/messages/pending/{A.id}/accept
Authorization: Bearer <B_token>

→ { "accepted": 1 }
→ Tất cả tin PENDING từ A → NORMAL
→ Hiện trong inbox chính của B
```

#### Bước 4b: B từ chối

```
DELETE /api/v1/messages/pending/{A.id}/reject
Authorization: Bearer <B_token>

→ 204 No Content
→ Tất cả tin PENDING từ A bị xoá
```

---

### Test Chat — Normal Message Flow

#### Kịch bản: A và B mutual follow, nhắn tin qua WebSocket

1. Cả hai connect WebSocket với token hợp lệ
2. Cả hai subscribe `/user/queue/messages`
3. A gửi STOMP `/app/chat.send` với `{ receiverId: B.id, message: "Hi!" }`
4. Server xác nhận mutual follow → `status = NORMAL`
5. B nhận event trên `/user/queue/messages`
6. A nhận echo trên `/user/queue/messages` (thấy tin mình gửi)

---

### Test Errors

| Case                                | Expected                        |
| ----------------------------------- | ------------------------------- |
| Follow chính mình                   | `400 FOLLOW_SELF`               |
| Follow lại người đã follow          | `400 ALREADY_FOLLOWING`         |
| Unfollow người chưa follow          | `404 FOLLOW_NOT_FOUND`          |
| Nhắn tin cho chính mình             | `400 CANNOT_MESSAGE_SELF`       |
| Accept pending khi không có pending | `404 PENDING_REQUEST_NOT_FOUND` |
| Kết nối WebSocket không có token    | `AccessDeniedException`         |
| Kết nối WebSocket token hết hạn     | `AccessDeniedException`         |
| Xoá tin nhắn của người khác         | `403 FORBIDDEN`                 |

---

## 9. Sơ đồ luồng đầy đủ

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         FOLLOW SYSTEM FLOW                                 │
│                                                                            │
│  User A                    Backend                       User B           │
│    │                          │                             │              │
│    │── POST /users/B/follow ──►│                             │              │
│    │                          │── save Follow(A→B) → DB    │              │
│    │                          │── Notification → B         │              │
│    │◄── FollowResponse ───────│                             │              │
│    │                          │                             │              │
│    │                          │◄── POST /users/A/follow ───│              │
│    │                          │── save Follow(B→A) → DB    │              │
│    │                          │── Notification → A         │              │
│    │                          │──► FollowResponse ─────────►│              │
│    │                          │                             │              │
│    │  [Now mutual follow ✅]   │                             │              │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                      CHAT MESSAGE ROUTING                                  │
│                                                                            │
│  isMutualFollow(A, B)?                                                     │
│       │                                                                    │
│   YES ├──► status = NORMAL                                                 │
│       │    Push /user/B.id/queue/messages  ✓ inbox chính                   │
│       │    Echo /user/A.id/queue/messages  ✓                               │
│       │                                                                    │
│    NO └──► status = PENDING                                                │
│            Push /user/B.id/queue/pending  ⚠ Message Requests              │
│            Echo /user/A.id/queue/messages ✓                               │
│                                                                            │
│  B xử lý Pending:                                                          │
│    Accept → PENDING → NORMAL (tin cũ + tương lai từ A bình thường)         │
│    Reject → DELETE tất cả PENDING từ A                                     │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                     WEBSOCKET AUTH FLOW                                    │
│                                                                            │
│  Client                  WebSocketAuthInterceptor          Spring STOMP    │
│    │                              │                              │          │
│    │── CONNECT (Bearer JWT) ──────►│                              │          │
│    │                              │── isTokenExpired? → reject  │          │
│    │                              │── inBlacklist?   → reject  │          │
│    │                              │── buildPrincipal           │          │
│    │                              │── accessor.setUser(auth) ──►│          │
│    │◄── CONNECTED ────────────────│                              │          │
│    │                              │                              │          │
│    │── SUBSCRIBE /user/queue/messages ──────────────────────────►│          │
│    │── SUBSCRIBE /user/queue/pending  ──────────────────────────►│          │
│    │                              │                              │          │
│    │── SEND /app/chat.send ───────────────────────────────────── ►          │
│    │                              │                   ChatWebSocketController │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## File thay đổi trong phiên bản này

| File                                                  | Loại | Mô tả                            |
| ----------------------------------------------------- | ---- | -------------------------------- |
| `entities/user/Follow.java`                           | MỚI  | Follow entity                    |
| `entities/system/MessageStatus.java`                  | MỚI  | Enum NORMAL/PENDING              |
| `repositories/FollowRepository.java`                  | MỚI  | Queries follow + mutual          |
| `services/FollowService.java`                         | MỚI  | Follow/unfollow logic            |
| `controllers/FollowController.java`                   | MỚI  | REST endpoints follow            |
| `dtos/response/FollowResponse.java`                   | MỚI  | DTO follow                       |
| `dtos/response/FollowStatusResponse.java`             | MỚI  | DTO follow status                |
| `dtos/response/ConversationSummaryResponse.java`      | MỚI  | DTO sidebar chat                 |
| `db/migration/V2__add_follow_and_pending_message.sql` | MỚI  | Flyway migration                 |
| `entities/system/Communication.java`                  | SỬA  | Thêm `status` field              |
| `entities/system/NotificationType.java`               | SỬA  | Thêm `FOLLOW`                    |
| `dtos/response/MessageResponse.java`                  | SỬA  | Thêm `status`, `senderAvatarURL` |
| `repositories/CommunicationRepository.java`           | SỬA  | Thêm pending queries             |
| `services/CommunicationService.java`                  | SỬA  | Pending logic + conversations    |
| `controllers/CommunicationController.java`            | SỬA  | Thêm pending endpoints           |
| `websocket/ChatWebSocketController.java`              | SỬA  | Routing by status                |
| `exceptions/ErrorCode.java`                           | SỬA  | Thêm FOLLOW + PENDING errors     |
| `contants/Routes.java`                                | SỬA  | Thêm Follow + pending routes     |
| `configs/SecurityConfig.java`                         | SỬA  | Allow GET follow endpoints       |
