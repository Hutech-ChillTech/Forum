# Forum IT - Spring Boot REST API

## 📋 Mô tả dự án

Forum IT là một ứng dụng web backend RESTful API được xây dựng bằng Spring Boot, cung cấp các chức năng quản lý diễn đàn công nghệ thông tin. Dự án bao gồm các tính năng quản lý người dùng, bài viết, bình luận, reactions, tags, và nhiều chức năng khác.

## 🛠️ Công nghệ sử dụng

- **Java**: 21
- **Spring Boot**: 3.5.10
- **Spring Data JPA**: Quản lý persistence layer
- **Hibernate**: ORM framework
- **PostgreSQL**: 17.3 - Database
- **Maven**: Build tool & dependency management
- **Lombok**: Giảm boilerplate code
- **Spring Security Crypto**: BCrypt password encoding
- **Spring Validation**: Validation cho request DTOs

## 📦 Cấu trúc dự án

```
src/
├── main/
│   ├── java/com/forum/it/
│   │   ├── controller/          # REST API Controllers
│   │   │   └── UserController.java
│   │   ├── entity/               # JPA Entities
│   │   │   ├── post/            # Post, Comment, Reaction, Share, SavedPost
│   │   │   ├── system/          # Notification, Communication, ModerationLog
│   │   │   ├── tag/             # Tag, PostTag
│   │   │   └── user/            # User, Account, Role, AccountRole, RoleClaim
│   │   ├── model/                # DTOs
│   │   │   ├── request/         # Request DTOs (Create, Update)
│   │   │   └── response/        # Response DTOs
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   │   └── UserRepository.java
│   │   ├── service/              # Business Logic
│   │   │   └── UserService.java
│   │   └── ItApplication.java    # Main Application
│   └── resources/
│       ├── application.properties
│       └── db/migration/         # Flyway SQL scripts (disabled)
└── test/                         # Unit & Integration tests
```

## 🗄️ Sơ đồ Database

### Core Tables

#### Users & Authentication

- **users**: Thông tin người dùng cơ bản
- **accounts**: Tài khoản đăng nhập (hỗ trợ OAuth providers)
- **roles**: Vai trò người dùng
- **account_roles**: Bảng trung gian User-Role
- **role_claims**: Quyền hạn của từng vai trò

#### Posts & Interactions

- **posts**: Bài viết của người dùng
- **comments**: Bình luận trên bài viết
- **reactions**: Các loại reaction (Like, Love, Haha, Sad, Angry)
- **shares**: Chia sẻ bài viết ra các platform
- **saved_posts**: Bài viết được lưu

#### Tagging System

- **tags**: Các tag để phân loại bài viết
- **post_tags**: Bảng trung gian Post-Tag

#### System Features

- **notifications**: Thông báo cho người dùng
- **communications**: Tin nhắn giữa các user
- **moderation_logs**: Nhật ký hoạt động quản trị

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống

- Java JDK 21.0.10 trở lên
- PostgreSQL 17.3 trở lên
- Maven 3.6+ (hoặc sử dụng Maven Wrapper có sẵn)

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd it
```

### Bước 2: Cấu hình Database

1. Tạo database trong PostgreSQL:

```sql
CREATE DATABASE forumIT;
```

2. Cập nhật thông tin database trong `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/forumIT
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Bước 3: Build project

#### Windows:

```cmd
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.10
mvnw.cmd clean package
```

#### Linux/Mac:

```bash
export JAVA_HOME=/path/to/jdk-21
./mvnw clean package
```

### Bước 4: Chạy ứng dụng

#### Option 1: Chạy bằng Maven

```cmd
mvnw.cmd spring-boot:run
```

#### Option 2: Chạy file JAR

```cmd
java -jar target/it-0.0.1-SNAPSHOT.jar
```

Ứng dụng sẽ chạy tại: **http://localhost:8080**

## 📚 API Documentation

### User Management Endpoints

#### Create User

```http
POST /api/users
Content-Type: application/json

{
  "userName": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "gender": "MALE",
  "phone": "0123456789",
  "dateOfBirth": "1990-01-01T00:00:00"
}
```

#### Get All Users (Paginated)

```http
GET /api/users?page=0&size=20&sort=createdAt,desc
```

#### Get User by ID

```http
GET /api/users/{userId}
```

#### Get User by Email

```http
GET /api/users/email/{email}
```

#### Get User by Username

```http
GET /api/users/username/{userName}
```

#### Update User

```http
PUT /api/users/{userId}
Content-Type: application/json

{
  "fullName": "John Updated",
  "phone": "0987654321"
}
```

#### Update User Status

```http
PATCH /api/users/{userId}/status
Content-Type: application/json

{
  "status": "ONLINE"
}
```

#### Ban/Unban User

```http
PATCH /api/users/{userId}/ban
PATCH /api/users/{userId}/unban
```

#### Delete User

```http
DELETE /api/users/{userId}
```

#### Soft Delete User

```http
DELETE /api/users/{userId}/soft
```

#### Search Users

```http
GET /api/users/search?q=keyword
```

#### Statistics

```http
GET /api/users/statistics/total
GET /api/users/statistics/status/{status}
```

#### Validation

```http
GET /api/users/check-email/{email}
GET /api/users/check-username/{userName}
```

### Tag Management Endpoints

#### Create Tag

```http
POST /api/v1/tags
Content-Type: application/json

{
  "name": "Spring Boot",
  "slug": "spring-boot",
  "description": "Bài viết liên quan đến Spring Boot framework",
  "isActive": true
}
```

#### Get All Tags (Paginated)

```http
GET /api/v1/tags?page=0&size=20&sort=createdAt,desc
```

#### Get Tag by ID

```http
GET /api/v1/tags/{tagId}
```

#### Get Tag by Slug

```http
GET /api/v1/tags/slug/{slug}
```

#### Update Tag

```http
PUT /api/v1/tags/{tagId}
Content-Type: application/json

{
  "name": "Spring Framework",
  "slug": "spring-framework",
  "description": "Updated description",
  "isActive": true
}
```

#### Delete Tag

```http
DELETE /api/v1/tags/{tagId}
```

### Response Format

#### Success Response (200 OK)

```json
{
  "userId": "uuid",
  "userName": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "gender": "MALE",
  "phone": "0123456789",
  "avatarURL": null,
  "dateOfBirth": "1990-01-01T00:00:00",
  "status": "OFFLINE",
  "verifyStatus": "ACTIVE",
  "createdAt": "2026-02-04T10:00:00",
  "updatedAt": "2026-02-04T10:00:00"
}
```

#### Paginated Response

```json
{
  "users": [...],
  "currentPage": 0,
  "totalItems": 100,
  "totalPages": 5,
  "pageSize": 20
}
```

## 🔐 Security

- **Password Encryption**: Sử dụng BCryptPasswordEncoder để mã hóa mật khẩu
- **SQL Injection Protection**: Spring Data JPA tự động parameterize queries
- **Validation**: Bean Validation (@Valid) cho tất cả request inputs

## 🗂️ Database Schema Strategy

Dự án sử dụng **Code-First Approach**:

- Hibernate tự động tạo và cập nhật schema từ JPA Entities
- `spring.jpa.hibernate.ddl-auto=update`
- Không sử dụng Flyway migrations (đã disable)

## 📝 Enums

### AccountStatus

- `ONLINE`, `OFFLINE`, `HIDDEN`, `BANNED`

### UserStatus (VerifyStatus)

- `ACTIVE`, `INACTIVE`, `DELETED`

### Gender

- `MALE`, `FEMALE`, `OTHER`

### PostStatus

- `PENDING`, `PUBLISHED`, `REJECTED`

### ReactionType

- `LIKE`, `DISLIKE`, `LOVE`, `HAHA`, `SAD`, `ANGRY`

### NotificationType

- `COMMENT`, `SHARE`, `REACTION`, `SYSTEM`

### NotificationStatus

- `READ`, `UNREAD`

### SharePlatform

- `FACEBOOK`, `MESSENGER`, `INSTAGRAM`, `LINKEDIN`

## 🧪 Testing

Chạy tests:

```bash
mvnw.cmd test
```

## 🐛 Troubleshooting

### Lỗi: "java.lang.NoClassDefFoundError: com.sun.tools.javac.code.TypeTag"

- **Nguyên nhân**: Lombok không tương thích với JDK version
- **Giải pháp**: Đảm bảo sử dụng JDK 21 và Lombok version được quản lý bởi Spring Boot Parent

### Lỗi: "Database forumIT does not exist"

- **Nguyên nhân**: Chưa tạo database
- **Giải pháp**: Chạy `CREATE DATABASE forumIT;` trong PostgreSQL

### Lỗi: Flyway migration syntax error

- **Nguyên nhân**: SQL file có lỗi syntax
- **Giải pháp**: Đã disable Flyway, sử dụng Hibernate auto-schema

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Contributors

- **HaiDang** - Initial work

## 📞 Contact

- Email: ledang3916@example.com

---
