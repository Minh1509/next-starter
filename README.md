# Nest Starter Web

Giao diện đăng nhập và đăng ký Next.js kết nối với API của `nest-starter`.

## Chạy ứng dụng

1. Khởi động Nest backend (API hiện được cấu hình tại `http://localhost:3600/api`).
2. `.env.local` đã trỏ tới API trên. Cập nhật `NEXT_PUBLIC_API_URL` nếu dùng địa chỉ khác.
3. Chạy frontend:

   ```bash
   pnpm install
   pnpm dev
   ```

4. Mở [http://localhost:3000](http://localhost:3000).

Các endpoint sử dụng:

- `POST /auth/login`
- `POST /auth/sign-up`
- `POST /auth/logout`

Sau khi xác thực thành công, frontend lưu access token và refresh token trong
`sessionStorage` cho phiên trình duyệt hiện tại và chuyển tới `/home`. Trang chủ
chuyển về đăng nhập nếu không có access token; đăng xuất gọi API Nest để thu hồi
phiên.
