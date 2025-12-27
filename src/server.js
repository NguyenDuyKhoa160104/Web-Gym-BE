import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';

// 1. Tải cấu hình từ tệp .env
dotenv.config();

// 2. Kết nối tới cơ sở dữ liệu MongoDB
connectDB();

const app = express();

// 3. Cấu hình các Middleware hệ thống
app.use(helmet()); // Bảo mật các HTTP headers
app.use(cors()); // Cho phép truy cập từ các domain khác (Frontend)
app.use(express.json()); // Xử lý dữ liệu định dạng JSON
app.use(express.urlencoded({ extended: true })); // Xử lý dữ liệu từ form

// Hiển thị log các yêu cầu API trong môi trường phát triển
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Serve static files from the 'public' folder
app.use(express.static('public'));

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
    📡 Truy cập: http://localhost:${PORT}/api
    ================================================
    `);
});

// Xử lý lỗi khi không thể kết nối hoặc lỗi hệ thống nghiêm trọng
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Lỗi nghiêm trọng: ${err.message}`);
    // Đóng server và thoát tiến trình
    server.close(() => process.exit(1));
});
