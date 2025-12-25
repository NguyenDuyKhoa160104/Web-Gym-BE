import mongoose from 'mongoose';

/**
 * Hàm khởi tạo kết nối tới MongoDB
 * Sử dụng async/await để đảm bảo tiến trình kết nối được hoàn tất
 */
const connectDB = async () => {
    try {
        // Kết nối tới cơ sở dữ liệu dựa trên MONGODB_URI trong file .env
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`🚀 [DATABASE] MongoDB đã kết nối thành công: ${conn.connection.host}`);
    } catch (error) {
        // Hiển thị lỗi chi tiết nếu kết nối thất bại
        console.error(`❌ [ERROR] Lỗi kết nối Database: ${error.message}`);

        // Dừng toàn bộ tiến trình ứng dụng nếu không thể kết nối DB
        process.exit(1);
    }
};

export default connectDB;