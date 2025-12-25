import jwt from 'jsonwebtoken';
import Coach from '../models/Coach.js'; // Assuming Coach model exists and has a matchPassword method

/**
 * Middleware bảo vệ các tuyến đường dành cho Coach (Authentication)
 * Kiểm tra Token và xác thực quyền truy cập của Coach
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

            // 3. Tìm Coach trong Database
            // Chỉ lấy các thông tin cần thiết, loại bỏ mật khẩu
            req.coach = await Coach.findById(decoded.id).select('-password');

            if (!req.coach) {
                return res.status(401).json({
                    success: false,
                    message: '❌ Không tìm thấy thông tin huấn luyện viên hoặc phiên đăng nhập đã hết hạn',
                });
            }

            // 4. Kiểm tra trạng thái tài khoản (Status: 1 là ACTIVE)
            // Assuming ACCOUNT_STATUS.ACTIVE is 1 as per other middlewares
            if (Number(req.coach.status) !== 1) { // Assuming status is a number (1 for ACTIVE)
                return res.status(403).json({
                    success: false,
                    message: '🚫 Tài khoản huấn luyện viên của bạn hiện đang bị khóa hoặc chưa kích hoạt',
                });
            }

            // Cho phép đi tiếp vào Controller
            next();
        } catch (error) {
            console.error(`❌ [COACH AUTH ERROR]:`, error.message);

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