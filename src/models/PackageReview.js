import mongoose from 'mongoose';
import { PACKAGE_REVIEW_STATUS } from '../utils/constants.js';

/**
 * PackageReview Schema - Quản lý đánh giá của khách hàng cho các gói tập
 */
const PackageReviewSchema = new mongoose.Schema({
    // Gói tập được đánh giá
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: [true, 'Gói tập là bắt buộc']
    },
    
    // Khách hàng viết đánh giá
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'Khách hàng là bắt buộc']
    },
    
    // Điểm đánh giá (từ 1 đến 5 sao)
    rating: {
        type: Number,
        required: [true, 'Điểm đánh giá là bắt buộc'],
        min: [1, 'Điểm đánh giá tối thiểu là 1'],
        max: [5, 'Điểm đánh giá tối đa là 5']
    },
    
    // Nội dung bình luận
    comment: {
        type: String,
        trim: true
    },
    
    // Trạng thái của đánh giá, ví dụ: chờ duyệt, đã duyệt
    status: {
        type: String,
        enum: Object.values(PACKAGE_REVIEW_STATUS),
        default: PACKAGE_REVIEW_STATUS.PENDING
    }
}, {
    timestamps: true, // Tự động tạo createdAt và updatedAt
    collection: 'PackageReviews' // Tên bảng trong MongoDB
});

// Đảm bảo mỗi khách hàng chỉ có thể đánh giá một gói tập một lần
PackageReviewSchema.index({ package: 1, client: 1 }, { unique: true });

export default mongoose.model('PackageReview', PackageReviewSchema);
