import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS } from '../utils/constants.js';

/**
 * Order Schema - Quản lý các đơn đặt gói tập của khách hàng
 */
const OrderSchema = new mongoose.Schema({
    // Khách hàng đặt gói tập
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'Thông tin khách hàng là bắt buộc']
    },
    
    // Ngày đặt hàng
    orderDate: {
        type: Date,
        default: Date.now
    },
    
    // Tổng số tiền của đơn hàng
    totalAmount: {
        type: Number,
        required: [true, 'Tổng số tiền là bắt buộc'],
        min: [0, 'Tổng số tiền không thể âm']
    },
    
    // Trạng thái đơn hàng (PENDING: Đang chờ xử lý, COMPLETED: Hoàn thành, CANCELLED: Đã hủy)
    status: {
        type: Number,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.PENDING
    },

    // Phương thức thanh toán (Ví dụ: Cash, Card, Transfer)
    paymentMethod: {
        type: String,
        trim: true,
        default: 'Cash' // Mặc định là thanh toán tiền mặt
    },

    // Trạng thái thanh toán (PENDING: Đang chờ, PAID: Đã thanh toán, FAILED: Thất bại)
    paymentStatus: {
        type: Number,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING
    }
}, {
    timestamps: true, // Tự động tạo createdAt và updatedAt
    collection: 'Orders' // Tên bảng trong MongoDB
});

export default mongoose.model('Order', OrderSchema);