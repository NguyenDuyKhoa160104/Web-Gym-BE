import mongoose from 'mongoose';

/**
 * OrderDetail Schema - Chi tiết các gói tập trong một đơn hàng
 */
const OrderDetailSchema = new mongoose.Schema({
    // Tham chiếu đến đơn hàng cha
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Mã đơn hàng là bắt buộc']
    },
    
    // Tham chiếu đến gói tập được đặt
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: [true, 'Mã gói tập là bắt buộc']
    },
    
    // Giá của gói tập tại thời điểm mua (để tránh thay đổi giá sau này)
    priceAtPurchase: {
        type: Number,
        required: [true, 'Giá gói tập tại thời điểm mua là bắt buộc'],
        min: [0, 'Giá tiền không thể âm']
    },

    // Thời hạn của gói tập tại thời điểm mua (để tránh thay đổi sau này)
    durationAtPurchase: {
        type: Number,
        required: [true, 'Thời hạn gói tập tại thời điểm mua là bắt buộc'],
        min: [1, 'Thời hạn tối thiểu là 1 ngày']
    },
    
    // Số lượng gói tập này trong đơn hàng (thường là 1 cho gói tập)
    quantity: {
        type: Number,
        default: 1,
        min: [1, 'Số lượng tối thiểu là 1']
    }
}, {
    timestamps: true, // Tự động tạo createdAt và updatedAt
    collection: 'OrderDetails' // Tên bảng trong MongoDB
});

export default mongoose.model('OrderDetail', OrderDetailSchema);