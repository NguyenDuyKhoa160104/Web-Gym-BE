import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Order from '../models/Order.js'; // To get order IDs
import Package from '../models/Package.js'; // To get package IDs
import OrderDetail from '../models/OrderDetail.js';

// Cấu hình biến môi trường
dotenv.config({ path: './.env' });

const seedOrderDetails = async () => {
    try {
        await connectDB();

        // Lấy danh sách các Order và Package để tạo OrderDetail
        const orders = await Order.find({});
        const packages = await Package.find({});

        if (orders.length === 0) {
            console.log('⚠️ [ORDER DETAIL SEEDER] Không tìm thấy Order nào. Vui lòng seed Order trước.');
            process.exit(1);
        }
        if (packages.length === 0) {
            console.log('⚠️ [ORDER DETAIL SEEDER] Không tìm thấy Package nào. Vui lòng seed Package trước.');
            process.exit(1);
        }

        // Dữ liệu mẫu OrderDetail
        const orderDetails = [
            {
                order: orders[0]._id,
                package: packages[0]._id,
                priceAtPurchase: packages[0].price,
                durationAtPurchase: packages[0].durationInDays,
                quantity: 1
            },
            {
                order: orders[0]._id,
                package: packages[1]._id,
                priceAtPurchase: packages[1].price,
                durationAtPurchase: packages[1].durationInDays,
                quantity: 1
            },
            {
                order: orders[1]._id,
                package: packages[0]._id,
                priceAtPurchase: packages[0].price,
                durationAtPurchase: packages[0].durationInDays,
                quantity: 1
            }
        ];

        // Xóa dữ liệu cũ
        await OrderDetail.deleteMany();
        console.log('🗑️ [ORDER DETAIL SEEDER] Đã dọn dẹp bảng OrderDetails.');

        // Nạp dữ liệu mới
        await OrderDetail.create(orderDetails);
        console.log('✅ [ORDER DETAIL SEEDER] Nạp dữ liệu OrderDetails thành công!');

        process.exit();
    } catch (error) {
        console.error(`❌ [ORDER DETAIL SEEDER] Lỗi: ${error.message}`);
        process.exit(1);
    }
};

const destroyOrderDetails = async () => {
    try {
        await connectDB();
        await OrderDetail.deleteMany();
        console.log('🧹 [ORDER DETAIL SEEDER] Đã xóa trắng bảng OrderDetails.');
        process.exit();
    } catch (error) {
        console.error(`❌ [ORDER DETAIL SEEDER] Lỗi: ${error.message}`);
        process.exit(1);
    }
};

// Điều hướng dựa trên tham số dòng lệnh
if (process.argv[2] === '-d') {
    destroyOrderDetails();
} else {
    seedOrderDetails();
}