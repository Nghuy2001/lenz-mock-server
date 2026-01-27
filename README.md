# NestJS Application

Ứng dụng NestJS với các tính năng:
- User Authentication (Login/Register)
- Mock Response System (Upload và tự động trả mock response theo user)

## Table of Contents

- [Postman Collection](#postman-collection)
- [Mock Response Upload](#mock-response-upload)
- [User Registration](#user-registration)
- [User Login](#user-login)
- [Project Setup](#project-setup)

## Postman Collection

Để test API dễ dàng hơn, project đã cung cấp Postman Collection với tất cả các endpoint đã được cấu hình sẵn.

### Import Collection

1. Mở Postman application
2. Click **Import** button (góc trên bên trái)
3. Chọn file `postman-collection/My Collection.postman_collection.json`
4. Collection sẽ được import vào workspace của bạn

### Collection Structure

Collection bao gồm các request sau:

- **User Registration** (`POST /app/user_register/member`)
  - Đăng ký user mới
  - Không cần authentication

- **User Login** (`POST /app/user_login/member`)
  - Đăng nhập và nhận token
  - Headers: `x-app-device-type`, `x-app-version`

- **Upload Mock Response** (`POST /app/upload_json_file`)
  - Upload file JSON để tạo mock response
  - Content-Type: `multipart/form-data`
  - Form field: `file`

- **Test API với Mock** (các endpoint khác)
  - Gọi API bất kỳ với Bearer token
  - Nếu có mock response trong DB → trả về mock
  - Nếu không có → chạy controller thật

### Environment Variables

Để sử dụng collection hiệu quả, bạn nên tạo Postman Environment với các biến sau:

- `base_url`: Base URL của API (ví dụ: `http://localhost:3000`)
- `token`: Bearer token (sẽ được set tự động sau khi login)

### Cách sử dụng

1. **Set Environment:**
   - Tạo environment mới trong Postman
   - Set `base_url` = `http://localhost:3000` (hoặc port bạn đang dùng)

2. **Register User:**
   - Chạy request "User Registration"
   - Điền thông tin user mới

3. **Login:**
   - Chạy request "User Login"
   - Token sẽ được lưu tự động vào environment variable `token`

4. **Upload Mock Response:**
   - Chạy request "Upload Mock Response"
   - Chọn file JSON từ thư mục `samples/`

5. **Test API:**
   - Gọi bất kỳ API nào với Bearer token
   - Nếu đã upload mock → sẽ nhận mock response
   - Nếu chưa có mock → sẽ chạy controller thật

### Collection File Location

```
postman-collection/My Collection.postman_collection.json
```

## Mock Response Upload

Hệ thống hỗ trợ upload mock response để test API. Mock response được lưu trong database và sẽ được trả về tự động khi gọi API với token hợp lệ.

### Format File Upload

Upload file JSON với format sau:

```json
{
  "method": "POST",
  "userId": "73a67f04547f4",
  "path": "/app/abc/member",
  "statusCode": 201,
  "response": {
    "user": {
      "id": "73a67f04547f4",
      "type": 2
    },
    "status": { "timestamp": 1769415617 }
  }
}
```

**Lưu ý:**
- `fileName` sẽ được lấy từ **tên file upload** (không cần có trong JSON)
- `method`, `userId`, `path` là **bắt buộc**
- `statusCode` là optional (mặc định 200)
- `response` là **bắt buộc** và chứa toàn bộ JSON response sẽ được trả về

### Upsert Logic

Mock response được upsert theo điều kiện: **`method + userId + path`** (không dùng `fileName` làm điều kiện).

- Nếu đã có record với cùng `method + userId + path` → **update** record đó
- Nếu chưa có → **create** record mới

### Upload Endpoint

```bash
POST /app/upload_json_file
Content-Type: multipart/form-data

# Form field: file
# File: your-mock-file.json
```

### Ví dụ

```bash
curl -X POST http://localhost:3000/app/upload_json_file \
  -F "file=@post_login_member.json;type=application/json"
```

File `post_login_member.json`:
```json
{
  "method": "POST",
  "userId": "73a67f04547f4",
  "path": "/app/user_login/member",
  "statusCode": 201,
  "response": {
    "token": "mock-token",
    "user": { "id": "73a67f04547f4" }
  }
}
```

Khi gọi API `POST /app/user_login/member` với Bearer token chứa `userId=73a67f04547f4`, hệ thống sẽ tự động trả về mock response từ database.

## User Registration

Hệ thống hỗ trợ đăng ký user mới thông qua API register.

### Register Endpoint

```bash
POST /app/user_register/member
Content-Type: application/json
```

### Request Body

```json
{
  "user": {
    "id": "73a67f04547f4",
    "type": 2
  },
  "result": {
    "user_identifier": "huynq",
    "user_name": "Huy Nguyen",
    "email": "huy@example.com",
    "application_status": "3",
    "setting": {
      "push": "1"
    }
  },
  "password": "your-password"
}
```

### Field Requirements

**Required fields:**
- `user.id`: User ID (string)
- `user.type`: User type (number)
- `result.user_identifier`: User identifier (string)
- `result.user_name`: User name (string)
- `result.email`: Email address (must be valid email format)
- `result.application_status`: Application status (string)
- `result.setting.push`: Push notification setting (string, "1" for enabled, "0" for disabled)
- `password`: Password (string, will be hashed before storing)

**Note:** Token sẽ được tạo tự động khi user login sau khi register thành công.

### Example Request

```bash
curl -X POST http://localhost:3000/app/user_register/member \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "id": "73a67f04547f4",
      "type": 2
    },
    "result": {
      "user_identifier": "huynq",
      "user_name": "Huy Nguyen",
      "email": "huy@example.com",
      "application_status": "3",
      "setting": {
        "push": "1"
      }
    },
    "password": "secure-password-123"
  }'
```

### Response

Success response:
```json
{
  "message": "Registration successful!"
}
```

**Lưu ý:** Sau khi register thành công, user cần login qua endpoint `/app/user_login/member` để nhận token.

### Error Responses

Khi register thất bại, API sẽ trả về các lỗi sau:

- **400 Bad Request - User ID already exists**: User ID đã tồn tại trong hệ thống
- **400 Bad Request - User identifier already exists**: User identifier đã tồn tại
- **400 Bad Request - Email already exists**: Email đã được sử dụng bởi user khác

## User Login

Hệ thống hỗ trợ đăng nhập user và nhận token để sử dụng các API khác.

### Login Endpoint

```bash
POST /app/user_login/member
Content-Type: application/json
Headers:
  x-app-device-type: <device-type> (optional)
  x-app-version: <app-version> (optional)
```

### Request Body

```json
{
  "login_name": "huynq",
  "password": "your-password"
}
```

### Field Requirements

**Required fields:**
- `login_name`: Email hoặc user identifier (string)
- `password`: Password (string)

### Example Request

```bash
curl -X POST http://localhost:3000/app/user_login/member \
  -H "Content-Type: application/json" \
  -H "x-app-device-type: mobile" \
  -H "x-app-version: 1.0.0" \
  -d '{
    "login_name": "huynq",
    "password": "secure-password-123"
  }'
```

### Response

Success response:
```json
{
  "user": {
    "id": "73a67f04547f4",
    "type": 2
  },
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user_identifier": "huynq",
    "user_name": "Huy Nguyen",
    "email": "huy@example.com",
    "application_status": 3,
    "setting": {
      "push": "1"
    }
  },
  "status": {
    "timestamp": 1769415617
  }
}
```

### Error Responses

- **401 Unauthorized - Invalid login_name or password**: Tên đăng nhập hoặc mật khẩu không đúng
- **401 Unauthorized - Invalid credentials**: Thông tin đăng nhập không hợp lệ
- **401 Unauthorized - Incorrect password**: Mật khẩu không đúng
- **401 Unauthorized - User email not found**: Không tìm thấy email của user

## Project Setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```