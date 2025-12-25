import mongoose from 'mongoose';
import { ACCOUNT_STATUS } from '../utils/constants.js';

/**
 * PackageCategory Schema - Quản lý các danh mục/loại gói tập
 */
const PackageCategorySchema = new mongoose.Schema({
    // Tên danh mục gói tập (Ví dụ: Gói tập thông thường, Gói tập cá nhân PT)
    name: {
        type: String,
        required: [true, 'Tên danh mục là bắt buộc'],
        trim: true,
        unique: true
    },
    
    // Mô tả về danh mục gói tập
    description: {
        type: String,
        required: [true, 'Mô tả danh mục là bắt buộc']
    },
    
    // Trạng thái danh mục (ACTIVE: Đang hoạt động, INACTIVE: Không hoạt động)
    status: {
        type: Number,
        enum: [ACCOUNT_STATUS.INACTIVE, ACCOUNT_STATUS.ACTIVE],
        default: ACCOUNT_STATUS.ACTIVE
    },

    // Thứ tự hiển thị trên giao diện (tùy chọn)
    displayOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true, // Tự động tạo createdAt và updatedAt
    collection: 'PackageCategories' // Tên bảng trong MongoDB
});

// Index để tìm kiếm danh mục nhanh hơn theo tên
PackageCategorySchema.index({ name: 'text' });

export default mongoose.model('PackageCategory', PackageCategorySchema);