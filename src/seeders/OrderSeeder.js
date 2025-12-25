import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Client from '../models/Client.js'; // To get client IDs
import Order from '../models/Order.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../utils/constants.js';

// Cấu hình biến môi trường
dotenv.config({ path: './.env' });

const seedOrders = async () => {
    try {
        console.log('⚙️ [ORDER SEEDER] Bắt đầu quá trình nạp dữ liệu...');
        await connectDB();

        // Lấy danh sách các Client để tạo Order
        const clients = await Client.find({});
        if (clients.length === 0) {
            console.warn('⚠️ [ORDER SEEDER] Không tìm thấy Client nào. Vui lòng seed Client trước.');
            process.exit();
        }
        console.log('🔗 [ORDER SEEDER] Liên kết với dữ liệu Clients...');

        // Dữ liệu mẫu Order
        const orders = [
            {
                client: clients[0]._id, // Liên kết với client đầu tiên
                orderDate: new Date(),
                totalAmount: 1200000,
                status: ORDER_STATUS.COMPLETED,
                paymentMethod: 'Chuyển khoản',
                paymentStatus: PAYMENT_STATUS.PAID
            },
            {
                client: clients[1]._id, // Liên kết với client thứ hai
                orderDate: new Date(Date.now() - 86400000), // Một ngày trước
                totalAmount: 500000,
                status: ORDER_STATUS.PENDING,
                paymentMethod: 'Tiền mặt',
                paymentStatus: PAYMENT_STATUS.PENDING
            },
            {
                client: clients[0]._id, // Liên kết lại với client đầu tiên
                orderDate: new Date(Date.now() - (86400000 * 5)), // Năm ngày trước
                totalAmount: 2500000,
                status: ORDER_STATUS.COMPLETED,
                paymentMethod: 'Chuyển khoản',
                paymentStatus: PAYMENT_STATUS.PAID
            }
        ];

        // Xóa dữ liệu cũ
        await Order.deleteMany();
        console.log('🗑️  [ORDER SEEDER] Dọn dẹp dữ liệu cũ...');

        // Nạp dữ liệu mới
        await Order.create(orders);
        console.log('🌱 [ORDER SEEDER] Nạp dữ liệu Orders mới...');
        
        console.log('🎉 [ORDER SEEDER] Hoàn tất!');
        process.exit();
    } catch (error) {
        console.error(`💀 [ORDER SEEDER] Lỗi kinh hoàng: ${error.message}`);
        process.exit(1);
    }
};

const destroyOrders = async () => {
    try {
        console.log('⚙️ [ORDER SEEDER] Bắt đầu quá trình HỦY DIỆT dữ liệu...');
        await connectDB();
        await Order.deleteMany();
        console.log('🔥 [ORDER SEEDER] Hủy diệt toàn bộ dữ liệu Orders...');
        console.log('✨ [ORDER SEEDER] Đã xóa sạch!');
        process.exit();
    } catch (error) {
        console.error(`💀 [ORDER SEEDER] Lỗi kinh hoàng: ${error.message}`);
        process.exit(1);
    }
};

// Điều hướng dựa trên tham số dòng lệnh
if (process.argv[2] === '-d') {
    destroyOrders();
} else {
    seedOrders();
}