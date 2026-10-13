# Vui học tiếng Anh

Ứng dụng HTML/CSS/JavaScript tĩnh, mở `index.html` qua máy chủ web để sử dụng.

## Học và ôn từ

- Chọn chủ đề để vào màn hình học từ vựng: lật thẻ, nghe phát âm, chuyển thẻ và đánh dấu đã thuộc.
- Chọn **Chơi hứng chữ** hoặc **Chơi bắn từ** trên màn hình học khi sẵn sàng.
- **Từ cần ôn** có trên trang chủ, màn hình học và màn hình kết quả.
- Hứng sai, bỏ qua từ, gõ sai khi xác định được từ mục tiêu, hoặc để từ rơi xuống trong trò bắn từ sẽ lưu từ cần ôn ngay lập tức.
- Khi có nhiều từ đang rơi và chưa xác định được từ bé đang gõ, ứng dụng không đoán từ sai. Từ rơi xuống vẫn được lưu.
- Sổ ôn lưu theo chủ đề, đếm số lần sai và giữ lại lịch sử đã ôn đúng. Gõ đúng trong bài ôn để đánh dấu đã ôn đúng; sai lại trong game sẽ đưa từ trở lại danh sách cần ôn.
- Tiến độ lưu trong `localStorage` trên trình duyệt/thiết bị hiện tại; không đồng bộ giữa thiết bị. Khi trình duyệt chặn lưu, ứng dụng hiển thị thông báo và vẫn giữ dữ liệu trong phiên đang mở.

## Kiểm tra

Chạy `npm test` với Node.js. Bộ kiểm tra bao gồm logic lưu từ, khôi phục dữ liệu, phân biệt chủ đề, ôn đúng/sai, và luồng ứng dụng trong môi trường DOM mô phỏng.

## Triển khai

Đưa `index.html`, `style.css`, `app.js`, `game-core.js`, `review-core.js` và thư mục `assets/` lên cùng một thư mục trên hosting tĩnh. Không cần bước build.
