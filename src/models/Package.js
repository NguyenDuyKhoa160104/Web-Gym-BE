import mongoose from 'mongoose';
import { ACCOUNT_STATUS } from '../utils/constants.js';

/**
 * Package Schema - Quản lý các gói tập trong hệ thống Gym
 */
const PackageSchema = new mongoose.Schema({
    // Tên gói tập (Ví dụ: Gold - 1 Năm, VIP - PT 1:1)
    packageName: {
        type: String,
        required: [true, 'Tên gói tập là bắt buộc'],
        trim: true,
        unique: true
    },
    
    // Mô tả chi tiết về quyền lợi của gói
    description: {
        type: String,
        required: [true, 'Mô tả gói tập là bắt buộc']
    },
    
    // Giá tiền của gói tập
    price: {
        type: Number,
        required: [true, 'Giá tiền là bắt buộc'],
        min: [0, 'Giá tiền không thể âm']
    },
    
    // Thời hạn của gói (tính theo ngày) - Ví dụ: 30, 180, 365
    durationInDays: {
        type: Number,
        required: [true, 'Thời hạn gói tập là bắt buộc'],
        min: [1, 'Thời hạn tối thiểu là 1 ngày']
    },
    
    // Danh sách các tính năng/quyền lợi (Ví dụ: ["Free khăn", "Xông hơi", "PT 1:1"])
    features: [{
        type: String,
        trim: true
    }],
    
    // Liên kết với danh mục gói tập (ví dụ: Gói tập thông thường, Gói PT cá nhân)
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PackageCategory',
        required: [true, 'Danh mục gói tập là bắt buộc']
    },
    
    // Trạng thái gói tập (ACTIVE: Đang kinh doanh, INACTIVE: Ngừng kinh doanh)
    status: {
        type: Number,
        enum: [ACCOUNT_STATUS.INACTIVE, ACCOUNT_STATUS.ACTIVE],
        default: ACCOUNT_STATUS.ACTIVE
    },
    
    // Thứ tự hiển thị trên bảng giá (tùy chọn)
    displayOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true, // Tự động tạo createdAt và updatedAt
    collection: 'Packages' // Tên bảng trong MongoDB
});

// Index để tìm kiếm gói tập nhanh hơn theo tên
PackageSchema.index({ packageName: 'text' });

export default mongoose.model('Package', PackageSchema);