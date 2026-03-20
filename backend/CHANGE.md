# Backend Changes for Share Post Feature

This document describes the backend-related changes and considerations for the Share Post functionality.

## 1. WebSocket Infrastructure
- **Endpoint**: `/ws/websocket` (SockJS/STOMP)
- **Destination**: `/app/chat.send`
- **Purpose**: Facilitate real-time sharing of post links between users without persisting the share event in the database, ensuring high performance and zero overhead on the persistent storage.

## 2. Message Format
Shared posts are sent as JSON messages with the following structure:
```json
{
  "type": "SHARE_POST",
  "content": "/posts/{postId}",
  "receiverId": "uuid-of-recipient"
}
```

## 3. Rationale
- **High Performance**: Using WebSocket directly avoids unnecessary database writes for ephemeral "Share" actions.
- **Privacy**: Sharing occurs as a direct message (DM) context, maintaining user privacy.
- **Scalability**: By not saving every share action, we reduce database load and focus on post visibility via existing detail pages.
