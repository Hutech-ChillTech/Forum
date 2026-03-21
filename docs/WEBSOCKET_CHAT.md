# WebSocket & Real-time Chat — Documentation

> **Project:** SkillForum  
> **Stack:** Spring Boot 3 · STOMP · SockJS · React 19 · Redis  
> **Last updated:** 2025

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [WebSocket Configuration (Backend)](#2-websocket-configuration-backend)
3. [Authentication](#3-authentication)
4. [Connection Flow](#4-connection-flow)
5. [Message Routing — NORMAL vs PENDING](#5-message-routing--normal-vs-pending)
6. [Presence System](#6-presence-system)
7. [Notification Push](#7-notification-push)
8. [All WebSocket Destinations (Reference Table)](#8-all-websocket-destinations-reference-table)
9. [Frontend Integration](#9-frontend-integration)
   - [Chat Page (Chat.jsx)](#chat-page-chatjsx)
   - [Notification Bell (Header.jsx)](#notification-bell-headerjsx)
10. [REST APIs Used Alongside WebSocket](#10-rest-apis-used-alongside-websocket)
11. [Common Errors & Debugging](#11-common-errors--debugging)

---

## 1. Architecture Overview

```
Browser (React)
    │
    │  SockJS (HTTP upgrade → WS)
    ▼
Spring Boot  ──  STOMP message broker (/topic, /queue)
    │                    │
    │                    ├── /user/{id}/queue/messages  ← normal inbox
    │                    ├── /user/{id}/queue/pending   ← message requests
    │                    ├── /user/{id}/queue/notifications ← follow/like alerts
    │                    └── /topic/presence            ← online/offline broadcast
    │
    └── Redis (online_users set)
```

**Key protocols:**

| Layer          | Protocol                               |
| -------------- | -------------------------------------- |
| Transport      | WebSocket (via SockJS fallback)        |
| Messaging      | STOMP 1.2                              |
| Auth           | JWT — validated on every CONNECT frame |
| Presence store | Redis Set `online_users`               |

---

## 2. WebSocket Configuration (Backend)

File: `backend/src/main/java/com/forum/it/configs/WebSocketConfig.java`

```java
registry.enableSimpleBroker("/topic", "/queue");  // in-memory broker
registry.setApplicationDestinationPrefixes("/app"); // client → server
registry.setUserDestinationPrefix("/user");          // server → user
```

**Endpoint:** `ws://localhost:8080/ws` (SockJS fallback at `/ws`)  
**Allowed origins:** `*` (configured via `.setAllowedOriginPatterns("*")`)

---

## 3. Authentication

File: `WebSocketAuthInterceptor.java`

- Intercepts every STOMP **CONNECT** frame.
- Reads `Authorization: Bearer <JWT>` from the STOMP connect headers.
- Validates the JWT and injects the authenticated `UserPrincipal` into the Spring `SecurityContext`.
- Frames without a valid token are rejected.

**Frontend — how to connect with auth:**

```js
const client = new Client({
  webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
  connectHeaders: { Authorization: `Bearer ${token}` },
  reconnectDelay: 5000,
});
client.activate();
```

---

## 4. Connection Flow

```
1. Client calls client.activate()
2. SockJS performs HTTP handshake → upgrades to WebSocket
3. STOMP CONNECT frame sent with Authorization header
4. Server (WebSocketAuthInterceptor) validates JWT
5. On success: STOMP CONNECTED frame returned
6. Server fires SessionConnectEvent → markOnline(userId) + broadcast to /topic/presence
7. Client subscribes to personal queues and topic channels
8. On disconnect: SessionDisconnectEvent → markOffline(userId) + broadcast to /topic/presence
```

---

## 5. Message Routing — NORMAL vs PENDING

File: `ChatWebSocketController.java`, `CommunicationService.java`

When a user sends a message via `/app/chat.send`, the backend checks **mutual follow status** between sender and receiver:

### NORMAL (mutual follow — they are "friends")

Both users follow each other.

```
Sender  ──→ /app/chat.send
                │
                ▼ CommunicationService.sendMessage() → status = NORMAL
                │
                ├── convertAndSendToUser(receiverId, /queue/messages, msg)
                └── convertAndSendToUser(senderId,   /queue/messages, msg)  ← echo
```

- Message is delivered to the receiver's **main inbox** (`/user/{receiverId}/queue/messages`).
- Message is also echoed back to the sender so they see it in their view immediately.
- Frontend (Chat.jsx) subscribes to `/user/queue/messages` (Spring's user destination resolution handles the routing via the JWT principal).

### PENDING (no mutual follow — stranger)

At least one side does not follow the other.

```
Sender  ──→ /app/chat.send
                │
                ▼ CommunicationService.sendMessage() → status = PENDING
                │
                ├── convertAndSendToUser(receiverId, /queue/pending, msg)
                └── convertAndSendToUser(senderId,   /queue/messages, msg)  ← echo
```

- Message is delivered to the receiver's **pending queue** (`/user/{receiverId}/queue/pending`).
- The receiver sees it in the "Tin nhắn chờ" tab but it is **not** in their main inbox.
- Echo goes to the sender's messages so they still see the conversation.

### Accepting a Pending Request

REST: `POST /api/v1/communication/pending/{senderId}/accept`

After acceptance, future messages between these users are routed as **NORMAL**.

---

## 6. Presence System

Files: `PresenceService.java`, `ChatWebSocketController.java`

### Storage

Redis Set name: `online_users`  
Each element is a user UUID string.

```java
// Add on connect
redisTemplate.opsForSet().add("online_users", userId.toString());

// Remove on disconnect
redisTemplate.opsForSet().remove("online_users", userId.toString());
```

### Broadcast

On every connect/disconnect, a presence update is broadcast to **all subscribers**:

```
/topic/presence  →  { "userId": "<uuid>", "online": true/false }
```

### Frontend subscription

```js
client.subscribe("/topic/presence", (frame) => {
  const { userId, online } = JSON.parse(frame.body);
  // update conversations list + selected contact
});
```

### REST endpoint

`GET /api/v1/users/{userId}/online` — returns `{ "online": true }` for on-demand checks.

---

## 7. Notification Push

File: `FollowService.java`, `NotificationService.java`

Notifications are pushed in real-time when a user is **followed**. Other notification triggers (like, comment) only persist to DB currently.

### Follow notification flow

```
User A follows User B
    │
    ▼ FollowService.follow()
    ├── Save Notification to DB
    └── convertAndSendToUser(userB_id, /queue/notifications, NotificationResponse)
```

**Destination:** `/user/{userId}/queue/notifications`

**Payload (`NotificationResponse`):**

```json
{
  "notificationId": "uuid",
  "userId": "uuid",
  "postId": "uuid or null",
  "type": "FOLLOW | LIKE | COMMENT | ...",
  "message": "Nguyễn Văn A đã bắt đầu theo dõi bạn.",
  "status": "UNREAD",
  "createdAt": "2025-01-15T10:30:00"
}
```

### Frontend subscription (Header.jsx)

```js
client.subscribe("/user/queue/notifications", (frame) => {
  const notif = JSON.parse(frame.body);
  setUnreadCount((prev) => prev + 1);
  setNotifications((prev) => [notif, ...prev]);
});
```

---

## 8. All WebSocket Destinations (Reference Table)

| Direction       | Destination                 | Triggered by                 | Payload                   | Subscriber       |
| --------------- | --------------------------- | ---------------------------- | ------------------------- | ---------------- |
| Client → Server | `/app/chat.send`            | User sends a message         | `{ receiverId, message }` | n/a              |
| Server → User   | `/user/queue/messages`      | Normal message sent/received | `MessageResponse`         | Chat.jsx         |
| Server → User   | `/user/queue/pending`       | Pending (stranger) message   | `MessageResponse`         | Chat.jsx         |
| Server → User   | `/user/queue/notifications` | Follow event                 | `NotificationResponse`    | Header.jsx       |
| Server → All    | `/topic/presence`           | WS connect/disconnect        | `{ userId, online }`      | Chat.jsx, anyone |

> **Note on user destinations:** Spring resolves `/user/queue/X` to `/user/{principalName}/queue/X` server-side.  
> The frontend always subscribes to `/user/queue/X` — Spring maps it to the correct user via the authenticated principal.

---

## 9. Frontend Integration

### Chat Page (`Chat.jsx`)

```
frontend/src/pages/Chat.jsx
```

**State:**

| State             | Type                      | Purpose                                    |
| ----------------- | ------------------------- | ------------------------------------------ |
| `conversations`   | array                     | Normal conversations list (sidebar)        |
| `pendingSenders`  | array                     | Users with pending message requests        |
| `selectedContact` | object                    | Currently open chat                        |
| `messages`        | array                     | Messages in the active conversation        |
| `isPendingConv`   | boolean                   | Whether the open chat is a pending request |
| `activeTab`       | `"normal"` \| `"pending"` | Sidebar tab selection                      |

**WebSocket subscriptions established:**

```js
// Normal inbox
client.subscribe("/user/queue/messages", handler);

// Pending message requests notification
client.subscribe("/user/queue/pending", handler);

// Presence updates for all users
client.subscribe("/topic/presence", handler);
```

**Auto-select from URL:**  
Navigating to `/chat?userId=<uuid>` automatically opens the conversation with that user.  
Used by the "Nhắn tin" button on Profile pages.

---

### Notification Bell (`Header.jsx`)

```
frontend/src/components/Header.jsx
```

**What it does:**

1. On login, `GET /api/v1/notifications/unread/count` is called to seed the badge count.
2. A WebSocket connection is established and subscribes to `/user/queue/notifications`.
3. When a new notification arrives via WebSocket, `unreadCount` increments and the notification is prepended to the list.
4. When the notification panel is opened, `GET /api/v1/notifications` fetches the full list.
5. "Đánh dấu đã đọc" calls `PATCH /api/v1/notifications/read-all` and resets the badge.

---

## 10. REST APIs Used Alongside WebSocket

| Method   | Endpoint                                          | Purpose                            |
| -------- | ------------------------------------------------- | ---------------------------------- |
| `GET`    | `/api/v1/communication/conversations`             | Load conversations sidebar         |
| `GET`    | `/api/v1/communication/conversation/{userId}`     | Load messages for a normal chat    |
| `GET`    | `/api/v1/communication/pending/senders`           | Load pending message senders       |
| `GET`    | `/api/v1/communication/pending/{senderId}`        | Load pending conversation messages |
| `POST`   | `/api/v1/communication/pending/{senderId}/accept` | Accept a message request           |
| `DELETE` | `/api/v1/communication/pending/{senderId}/reject` | Reject a message request           |
| `GET`    | `/api/v1/notifications`                           | Get notification list              |
| `GET`    | `/api/v1/notifications/unread/count`              | Get unread badge count             |
| `PATCH`  | `/api/v1/notifications/read-all`                  | Mark all notifications as read     |
| `GET`    | `/api/v1/users/{userId}/online`                   | Check if a specific user is online |

---

## 11. Common Errors & Debugging

### Connection fails immediately

- Check that the JWT token in `localStorage` is valid and not expired.
- Confirm the backend is running on port 8080.
- Confirm CORS / allowed origins are configured correctly in `WebSocketConfig`.

### Messages not delivered

- Ensure the recipient is connected (their session must be active for Spring's user destination to work).
- Check `CommunicationService` mutual-follow logic — a non-follow relationship will route to `/queue/pending`, not `/queue/messages`.

### Presence not updating

- Confirm Redis is running and `StringRedisTemplate` is connected.
- Check `PresenceService.markOnline/markOffline` are being called in `SessionConnectEvent`/`SessionDisconnectEvent` listeners.

### Notification badge doesn't increment

- Verify `FollowService` has `SimpMessagingTemplate` injected and the `convertAndSendToUser` call is after `notificationRepository.save()`.
- Confirm the frontend WebSocket `useEffect` checks `isLoggedIn` and has a valid token.

### Token format

The STOMP connect headers must include the **full** `Bearer ` prefix:

```js
connectHeaders: {
  Authorization: `Bearer ${localStorage.getItem("token")}`;
}
```
