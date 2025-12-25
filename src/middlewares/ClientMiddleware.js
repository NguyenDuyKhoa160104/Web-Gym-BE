import jwt from 'jsonwebtoken';
import Client from '../models/Client.js';

/**
 * Middleware bảo vệ các tuyến đường dành cho Hội viên (Authentication)
 * Kiểm tra Token và xác thực quyền truy cập của Client
 */
export const protect = async (req, res, next) => {
    let token;

    // 1. Kiểm tra Token trong Header Authorization (Bearer Token)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Lấy token từ chuỗi "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: '❌ Mã xác thực không hợp lệ',
                });
            }

            // 2. Giải mã Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Tìm Hội viên trong Database
            // Chỉ lấy các thông tin cần thiết, loại bỏ mật khẩu
            req.client = await Client.findById(decoded.id).select('-password');

            if (!req.client) {
                return res.status(401).json({
                    success: false,
                    message: '❌ Không tìm thấy thông tin hội viên hoặc phiên đăng nhập đã hết hạn',
                });
            }

            // 4. Kiểm tra trạng thái tài khoản (Status: 1 là ACTIVE)
            if (Number(req.client.status) !== 1) {
                return res.status(403).json({
                    success: false,
                    message: '🚫 Tài khoản hội viên của bạn hiện đang bị khóa hoặc chưa kích hoạt',
                });
            }

            // Cho phép đi tiếp vào Controller
            next();
        } catch (error) {
            console.error(`❌ [CLIENT AUTH ERROR]:`, error.message);

            // Phân loại lỗi Token
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: '❌ Phiên làm việc đã hết hạn, vui lòng đăng nhập lại để tiếp tục',
                });
            }

            // Lỗi hệ thống bất ngờ
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống, vui lòng thử lại sau',
            });
        }
    }

    // Trường hợp không gửi kèm Token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: '🔑 Vui lòng đăng nhập để truy cập tính năng này',
        });
    }
};

/**
 * Middleware kiểm tra nếu hội viên đã hoàn thành thông tin sức khỏe (Health Info)
 * Dùng cho các route yêu cầu dữ liệu thể chất để lên lịch tập
 */
export const checkHealthProfile = (req, res, next) => {
    if (req.client && req.client.health_info && req.client.health_info.height > 0) {
        next();
    } else {
        return res.status(400).json({
            success: false,
            message: '📝 Vui lòng cập nhật thông tin chiều cao/cân nặng trước khi thực hiện hành động này',
        });
    }
};