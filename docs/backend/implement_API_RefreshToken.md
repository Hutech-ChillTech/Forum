Client (Web/Mobile)
   ↓
Spring Boot API
   ├─ JWT Filter (Access Token)
   ├─ Auth Controller (/login, /refresh, /logout)
   ├─ RefreshTokenService
   └─ Database / Redis (Refresh Token)