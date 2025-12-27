import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path'; // 1. Import thêm path
import { fileURLToPath } from 'url'; // 2. Import để xử lý đường dẫn trong ES Module
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';

// Cấu hình __dirname cho ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Tải cấu hình từ tệp .env
dotenv.config();

// 2. Kết nối tới cơ sở dữ liệu MongoDB
connectDB();

const app = express();

// 3. Cấu hình các Middleware hệ thống
// Lưu ý: Helmet có thể chặn load ảnh từ nguồn ngoài (như placehold.co) nếu cấu hình CSP quá chặt.
// Tạm thời tắt CSP của helmet nếu gặp lỗi chặn ảnh, hoặc cấu hình lại sau.
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors()); // Cho phép truy cập từ các domain khác (Frontend)
app.use(express.json()); // Xử lý dữ liệu định dạng JSON
app.use(express.urlencoded({ extended: true })); // Xử lý dữ liệu từ form

// --- QUAN TRỌNG: Cấu hình Static Files ---
// SỬA ĐỔI: Sử dụng process.cwd() để trỏ thẳng về thư mục gốc dự án
// Điều này giúp tránh lỗi nếu file server.js nằm trong thư mục con (ví dụ: src/server.js)
// Khi đó __dirname là src/ còn public lại nằm ngoài src/
app.use(express.static(path.join(process.cwd(), 'public')));

// 4. Tích hợp các tuyến đường (Routes) từ src/routes/index.js
app.use('/api', apiRoutes);

// 5. Tuyến đường kiểm tra trạng thái Server (Health Check)
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 HD Fitness API đang hoạt động ổn định',
        version: '1.0.0'
    });
});

// 6. Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
    console.error("🔥 Error Middleware:", err);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi máy chủ nội bộ',
        // Chỉ hiển thị chi tiết lỗi (stack) khi ở môi trường phát triển
        stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    });
});

// 7. Khởi động Server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
    ================================================
    🔥 Server đang chạy tại cổng: ${PORT}
    🛠️  Môi trường: ${process.env.NODE_ENV}
    📡 Truy cập: http://localhost:${PORT}
    📂 Static Folder: ${path.join(process.cwd(), 'public')}
    ================================================
    `);
});

// Xử lý lỗi khi không thể kết nối hoặc lỗi hệ thống nghiêm trọng
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Lỗi nghiêm trọng: ${err.message}`);
    // Đóng server và thoát tiến trình
    server.close(() => process.exit(1));
});