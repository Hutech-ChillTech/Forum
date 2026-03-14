Backend Refactoring — Summary of Changes

1. Security & Authentication

Sửa / thêm ở:

SecurityConfig

JwtTokenProvider

JwtAuthenticationFilter

UserPrincipal

AccountService

SecurityContextHelper

Thay đổi chính:

Chuyển sang JWT stateless authentication

Thêm Redis blacklist để logout token

Loại bỏ userId spoofing (lấy userId từ JWT thay vì request body)

Thêm helper lấy user từ SecurityContext

2. API Consistency

Sửa / thêm ở:

Routes.java

tất cả Controllers

Thay đổi chính:

Tạo Routes constants để thay thế hardcode URL

Chuẩn hóa mapping API toàn hệ thống

3. Exception Handling

Sửa / thêm ở:

ErrorCode

AppException

GlobalExceptionHandler

ApiResponses

Thay đổi chính:

Centralized error handling

Chuẩn hóa response format cho toàn bộ API

4. Middleware & Security Filters

Thêm ở:

RateLimitFilter

XssFilter

RequestLoggingFilter

ValidationInterceptor

Thay đổi chính:

Rate limiting theo IP (Bucket4j)

XSS sanitization bằng Jsoup

Request logging + latency tracking

Kiểm tra Content-Type cho request

5. Real-time Chat

Thêm ở:

WebSocketConfig

WebSocketAuthInterceptor

ChatWebSocketController

PresenceService

Thay đổi chính:

Triển khai WebSocket STOMP chat

JWT authentication cho WebSocket

Theo dõi online/offline user bằng Redis

6. Social Features

Thêm modules mới:

Reaction

Share

Notification

Tag

Follow

Moderation

Files chính:

ReactionService / Controller

ShareService / Controller

NotificationService

TagService

FollowService

7. Message System Upgrade

Sửa ở:

Communication

CommunicationRepository

CommunicationService

Thay đổi chính:

Thêm MessageStatus:

DIRECT
PENDING

Tin nhắn được phân loại dựa trên follow relationship

Khi user reply → auto upgrade PENDING → DIRECT

8. Rate Limit Fix

Sửa ở:

RateLimitFilter

FilterConfig

application.properties

Thay đổi chính:

Fix bug @Value không inject

Thêm 3 tầng rate limit

FREE
STRICT
DEFAULT

9. SOLID Refactoring

Sửa ở:

PostService

TagService

SecurityConfig

Thay đổi chính:

Tách logic tag khỏi PostService

Thêm service interfaces (DIP)

Controllers phụ thuộc vào interface thay vì concrete class

10. Frontend Proxy & API Client

Sửa ở:

vite.config.js

apiClient.js

các service.js

Thay đổi chính:

Proxy API qua Vite để ẩn backend URL

Tạo fetch wrapper tự động attach JWT và refresh token
