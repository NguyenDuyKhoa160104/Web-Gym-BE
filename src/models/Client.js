import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ACCOUNT_STATUS } from '../utils/constants.js';

/**
 * Schema dành cho khách hàng (Hội viên)
 */
const clientSchema = new mongoose.Schema(
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
            select: false,
        },
        phone: {
            type: String,
            required: [true, 'Số điện thoại là bắt buộc'],
        },
        avatar_url: {
            type: String,
            default: 'default-avatar.png',
        },
        // Thông tin sức khỏe cá nhân
        health_info: {
            height: { type: Number, default: 0 }, // cm
            weight: { type: Number, default: 0 }, // kg
            target: { type: String, default: '' }, // Mục tiêu (giảm cân, tăng cơ...)
        },
        status: {
            type: Number,
            enum: Object.values(ACCOUNT_STATUS),
            default: ACCOUNT_STATUS.ACTIVE,
        },
    },
    {
        timestamps: true,
        collection: 'Clients',
    }
);

/**
 * Middleware: Mã hóa mật khẩu trước khi lưu
 */
clientSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Phương thức: Kiểm tra mật khẩu khớp
 */
clientSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Client', clientSchema);