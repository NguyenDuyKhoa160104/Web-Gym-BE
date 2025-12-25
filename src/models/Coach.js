import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ACCOUNT_STATUS } from '../utils/constants.js';

/**
 * Schema dành cho Huấn luyện viên (Coach)
 */
const coachSchema = new mongoose.Schema(
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
            select: false, // Ẩn mật khẩu khi truy vấn
        },
        phone: {
            type: String,
            required: [true, 'Số điện thoại là bắt buộc'],
        },
        avatar_url: {
            type: String,
            default: 'default-avatar.png',
        },
        specialty: { // Chuyên môn
            type: String,
            required: [true, 'Chuyên môn là bắt buộc'],
        },
        experience: { // Kinh nghiệm
            type: Number,
            required: [true, 'Năm kinh nghiệm là bắt buộc'],
            min: 0,
        },
        bio: { // Tiểu sử
            type: String,
            default: '',
        },
        status: {
            type: Number,
            enum: Object.values(ACCOUNT_STATUS),
            default: ACCOUNT_STATUS.PENDING,
        },
    },
    {
        timestamps: true,
        collection: 'Coaches',
    }
);

/**
 * Middleware: Mã hóa mật khẩu trước khi lưu
 */
coachSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT || 10));
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Phương thức: Kiểm tra mật khẩu khớp
 */
coachSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Coach', coachSchema);
