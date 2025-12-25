import jwt from 'jsonwebtoken';
import Coach from '../models/Coach.js'; // Assuming Coach model exists
import { ACCOUNT_STATUS } from '../utils/constants.js';

/**
 * @desc    Xử lý đăng nhập hệ thống cho Coach
 * @route   POST /api/coach/login
 * @access  Public
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ email và mật khẩu',
            });
        }

        const coach = await Coach.findOne({ email }).select('+password');

        if (!coach) {
            return res.status(401).json({
                success: false,
                message: 'Thông tin đăng nhập không chính xác',
            });
        }

        if (coach.status !== ACCOUNT_STATUS.ACTIVE) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị khóa hoặc chưa kích hoạt',
            });
        }

        const isMatch = await coach.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Thông tin đăng nhập không chính xác',
            });
        }

        // Cập nhật thời gian đăng nhập cuối
        coach.last_login = new Date();
        await coach.save();

        const token = jwt.sign(
            { id: coach._id, role: 'coach' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            data: {
                id: coach._id,
                fullname: coach.fullname,
                email: coach.email,
                phone: coach.phone,
                specialization: coach.specialization, // Assuming specialization field
                avatar_url: coach.avatar_url
            }
        });

    } catch (error) {
        console.error(`❌ [COACH LOGIN ERROR]: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau',
        });
    }
};

/**
 * @desc    Kiểm tra trạng thái đăng nhập của Coach
 * @route   GET /api/coach/check-login
 * @access  Private (Yêu cầu CoachMiddleware.protect)
 */
export const checkLogin = async (req, res) => {
    try {
        // req.coach sẽ được middleware 'protectCoach' đính kèm vào
        if (!req.coach) {
            return res.status(401).json({
                success: false,
                message: 'Phiên đăng nhập đã hết hạn'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: req.coach._id,
                fullname: req.coach.fullname,
                email: req.coach.email,
                phone: req.coach.phone,
                specialization: req.coach.specialization,
                avatar_url: req.coach.avatar_url
            }
        });
    } catch (error) {
        console.error(`❌ [COACH CHECK LOGIN ERROR]: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi xác thực phiên đăng nhập',
        });
    }
};

/**
 * @desc    Lấy danh sách tất cả HLV (phân trang, tìm kiếm, lọc)
 * @route   GET /api/admin/all-coaches
 * @access  Private (Admin)
 */
export const getAllCoaches = async (req, res) => {
    try {
        // 1. Lấy các tham số query từ request
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search || '';
        const status = req.query.status;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // 2. Xây dựng query filter
        let query = {};

        // Tìm kiếm theo tên hoặc email (không phân biệt hoa, thường)
        if (search) {
            query.$or = [
                { fullname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Lọc theo trạng thái nếu có
        if (status) {
            query.status = status;
        }

        // 3. Thực thi truy vấn với phân trang và sắp xếp
        const coaches = await Coach.find(query)
            .select('-password') // Không trả về field password vì bảo mật
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();

        // 4. Đếm tổng số bản ghi
        const totalCoaches = await Coach.countDocuments(query);
        const totalPages = Math.ceil(totalCoaches / limit);

        // 5. Trả về kết quả
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách HLV thành công",
            data: coaches,
            pagination: {
                totalResults: totalCoaches,
                totalPages: totalPages,
                currentPage: page,
                limit: limit
            }
        });

    } catch (error) {
        // 6. Xử lý lỗi hệ thống
        console.error('Error in getAllCoaches:', error);
        return res.status(500).json({
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách HLV",
            error: error.message
        });
    }
};

/**
 * @desc    Helper function to update a coach's account status
 * @param   {string} coachId
 * @param   {number} newStatus
 * @param   {object} res
 * @returns {Promise<void>}
 */
const _updateCoachStatus = async (coachId, newStatus, res) => {
    try {
        // 1. Find coach
        const coach = await Coach.findById(coachId);

        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy HLV.',
            });
        }

        // 2. Prevent changing status if coach is already BANNED, unless the new status is also BANNED
        if (coach.status === ACCOUNT_STATUS.BANNED && newStatus !== ACCOUNT_STATUS.BANNED) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị cấm vĩnh viễn và không thể thay đổi trạng thái thành Mở hoặc Khóa.',
            });
        }

        // 3. Update status
        coach.status = newStatus;
        await coach.save();

        let message = '';
        if (newStatus === ACCOUNT_STATUS.ACTIVE) {
            message = 'Mở tài khoản HLV thành công.';
        } else if (newStatus === ACCOUNT_STATUS.INACTIVE) {
            message = 'Khóa tài khoản HLV thành công.';
        } else if (newStatus === ACCOUNT_STATUS.BANNED) {
            message = 'Cấm tài khoản HLV thành công.';
        }

        res.status(200).json({
            success: true,
            message: message,
            data: coach,
        });

    } catch (error) {
        console.error(`❌ [UPDATE COACH STATUS ERROR]: ${error.message}`);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID HLV không hợp lệ.',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau.',
        });
    }
};

/**
 * @desc    Admin khóa hoặc mở tài khoản HLV
 * @route   POST /api/admin/lock-open-coach/:id
 * @access  Private/Admin
 */
export const lockOpenCoach = async (req, res) => {
    const { id: coachId } = req.params;
    try {
        const coach = await Coach.findById(coachId);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy HLV.',
            });
        }

        let newStatus;
        if (coach.status === ACCOUNT_STATUS.ACTIVE) {
            newStatus = ACCOUNT_STATUS.INACTIVE; // If active, lock it
        } else if (coach.status === ACCOUNT_STATUS.INACTIVE) {
            newStatus = ACCOUNT_STATUS.ACTIVE; // If inactive, open it
        } else {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị cấm vĩnh viễn và không thể thay đổi trạng thái (Mở hoặc Khóa).',
            });
        }
        
        await _updateCoachStatus(coachId, newStatus, res);

    } catch (error) {
        console.error(`❌ [LOCK/OPEN COACH ERROR]: ${error.message}`);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID HLV không hợp lệ.',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau.',
        });
    }
};

/**
 * @desc    Admin cấm tài khoản HLV vĩnh viễn
 * @route   POST /api/admin/ban-coach/:id
 * @access  Private/Admin
 */
export const banCoach = async (req, res) => {
    const { id: coachId } = req.params;
    await _updateCoachStatus(coachId, ACCOUNT_STATUS.BANNED, res);
};