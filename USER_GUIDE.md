# Hướng Dẫn Sử Dụng API

## Bắt Đầu

1. Import Postman Collection: `postman-collection/My Collection.postman_collection.json`
2. Tạo Environment với biến:
   - `base_url`: `https://lenz.bunbu.tech`

## Đăng Ký User

**Endpoint:** `POST /app/user_register/member`

**Request Body:**
```json
{
  "user": {
    "id": "user-id-unique",
    "type": 2
  },
  "result": {
    "user_identifier": "username",
    "user_name": "Tên Người Dùng",
    "email": "user@example.com",
    "application_status": "3",
    "setting": {
      "push": "1"
    }
  },
  "password": "password123"
}
```

**Lưu ý:** `id`, `user_identifier`, `email` phải là duy nhất.

## Đăng Nhập

**Endpoint:** `POST /app/user_login/member`

**Request Body:**
```json
{
  "login_name": "username",
  "password": "password123"
}
```

**Response:** Nhận token và refresh_token. Token tự động lưu vào environment.

## Upload Mock Response

**Endpoint:** `POST /app/upload_json_file`

**Cách làm:**
1. Tạo file JSON (ví dụ: `test.json`):
```json
{
  "method": "POST",
  "userId": "user-id-unique",
  "path": "/app/abc/member",
  "statusCode": 201,
  "response": {
    "message": "Success",
    "data": { "id": "123" }
  }
}
```

2. Trong Postman:
   - Body → form-data
   - Key: `file`, Type: File
   - Chọn file JSON
   - Send

**Lưu ý:** 
- `userId` phải khớp với user ID trong token
- Nếu đã có mock cùng `method + userId + path` → sẽ update

## Sử Dụng Mock Response

Sau khi upload mock, khi gọi API với:
- Đúng method (POST, GET, ...)
- Đúng path (`/app/abc/member`)
- Token chứa đúng userId

→ Hệ thống tự động trả mock response thay vì chạy logic thật.

**Ví dụ:**
1. Upload mock với `userId: "user-123"`, `path: "/app/test"`, `method: "POST"`
2. Gọi `POST /app/test` với token của user-123
3. Nhận mock response đã upload

## Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `401 - The incoming token has expired` | Token hết hạn | Đăng nhập lại |
| `401 - Unauthorized` | Chưa login hoặc token sai | Đăng nhập để lấy token mới |
| `400 - User already exists` | ID/username/email đã tồn tại | Đổi ID, username hoặc email |
| `401 - Invalid login_name or password` | Sai thông tin đăng nhập | Kiểm tra lại username/email và password |
| Mock không hoạt động | userId không khớp hoặc method/path sai | Kiểm tra userId trong token và mock response |

## Quy Trình Cơ Bản

1. **Đăng ký user** → Nhận thông báo thành công
2. **Đăng nhập** → Nhận token
3. **Upload mock** (nếu cần) → Tạo mock response
4. **Gọi API** với token → Nhận response
