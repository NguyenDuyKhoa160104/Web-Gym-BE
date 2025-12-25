import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ADMIN_ROLES, ACCOUNT_STATUS } from '../utils/constants.js';

/**
 * Schema dành cho quản trị viên hệ thống
 */
const adminSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: [true, 'Họ tên là bắt buộc'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không đúng định dạng'],
        },
        password: {
            type: String,
            required: [true, 'Mật khẩu là bắt buộc'],
            minlength: 6,
            select: false, // Không trả về mật khẩu trong các truy vấn mặc định
        },
        role_level: {
            type: Number,
            enum: Object.values(ADMIN_ROLES),
            default: ADMIN_ROLES.MANAGER,
        },
        status: {
            type: Number,
            enum: Object.values(ACCOUNT_STATUS),
            default: ACCOUNT_STATUS.ACTIVE,
        },
        last_login: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: 'Admins',
    }
);

/**
 * Middleware: Mã hóa mật khẩu trước khi lưu
 */
adminSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Phương thức: Kiểm tra mật khẩu khớp
 */
adminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Admin', adminSchema);