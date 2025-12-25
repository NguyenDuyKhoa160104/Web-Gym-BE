import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { ACCOUNT_STATUS } from '../utils/constants.js';

/**
 * @desc    Xử lý đăng nhập hệ thống cho Admin
 * @route   POST /api/admin/login
 * @access  Public
 */
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ email và mật khẩu',
            });
        }

        // Tìm Admin và lấy thêm trường password
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Thông tin đăng nhập không chính xác',
            });
        }

        // Kiểm tra trạng thái tài khoản
        if (admin.status !== ACCOUNT_STATUS.ACTIVE) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị khóa hoặc chưa kích hoạt',
            });
        }

        // So khớp mật khẩu
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Thông tin đăng nhập không chính xác',
            });
        }

        // Cập nhật thời gian đăng nhập cuối
        admin.last_login = new Date();
        await admin.save();

        // Tạo JWT Token
        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            data: {
                id: admin._id,
                fullname: admin.fullname,
                email: admin.email,
                role_level: admin.role_level
            }
        });

    } catch (error) {
        console.error(`❌ [ADMIN LOGIN ERROR]: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau',
        });
    }
};

/**
 * @desc    Kiểm tra trạng thái đăng nhập (Check Login)
 * @route   GET /api/admin/check-login
 * @access  Private
 */
export const checkLogin = async (req, res) => {
    try {
        // Dữ liệu req.admin đã được đính kèm từ Middleware Protect
        res.status(200).json({
            success: true,
            data: req.admin,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi xác thực phiên đăng nhập',
        });
    }
};

/**
 * @desc    Lấy thông tin cá nhân Admin (Alias của checkLogin)
 * @route   GET /api/admin/me
 * @access  Private
 */
export const getAdminMe = async (req, res) => {
    return checkLogin(req, res);
};