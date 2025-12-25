import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

/**
 * Middleware bảo vệ các tuyến đường (Authentication)
 * Chỉ dành riêng cho Admin
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

            // 2. Giải mã Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Tìm Admin trong Database
            req.admin = await Admin.findById(decoded.id).select('-password');

            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: '❌ Không tìm thấy thông tin người dùng hoặc Token không hợp lệ',
                });
            }

            // 4. Kiểm tra trạng thái tài khoản (Status: 1 là ACTIVE)
            if (req.admin.status !== 1) {
                return res.status(403).json({
                    success: false,
                    message: '🚫 Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt',
                });
            }

            next();
        } catch (error) {
            // Kiểm tra nếu là lỗi do Token hết hạn hoặc sai lệch thì báo cụ thể, 
            // nếu là lỗi xử lý hệ thống (DB treo,...) thì báo lỗi chung theo yêu cầu
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: '❌ Phiên làm việc đã hết hạn, vui lòng đăng nhập lại',
                });
            }

            console.error(`❌ [ADMIN AUTH ERROR]: ${error.message}`);
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống, vui lòng thử lại sau',
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: '🔑 Quyền truy cập bị từ chối, vui lòng cung cấp Token',
        });
    }
};

/**
 * Middleware kiểm tra quyền Super Admin (role_level = 0)
 */
export const authorizeSuperAdmin = (req, res, next) => {
    try {
        if (req.admin && req.admin.role_level === 0) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: '⛔ Bạn không có quyền thực hiện hành động này (Yêu cầu Super Admin)',
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau',
        });
    }
};