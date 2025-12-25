import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Client from '../models/Client.js';
import { ACCOUNT_STATUS } from '../utils/constants.js';

// Cấu hình biến môi trường
dotenv.config({ path: './.env' });

// Dữ liệu mẫu Client
const clients = [
    {
        fullname: 'Nguyễn Văn A',
        email: 'client1@gmail.com',
        password: 'password123',
        phone: '0901234567',
        health_info: { height: 175, weight: 70, target: 'Tăng cơ' },
        status: ACCOUNT_STATUS.ACTIVE
    },
    {
        fullname: 'Trần Thị B',
        email: 'client2@gmail.com',
        password: 'password123',
        phone: '0907654321',
        health_info: { height: 160, weight: 50, target: 'Giảm mỡ' },
        status: ACCOUNT_STATUS.ACTIVE
    }
];

const seedClients = async () => {
    try {
        console.log('⚙️ [CLIENT SEEDER] Bắt đầu quá trình nạp dữ liệu...');
        await connectDB();

        // Xóa dữ liệu cũ
        await Client.deleteMany();
        console.log('🗑️  [CLIENT SEEDER] Dọn dẹp dữ liệu cũ...');

        // Nạp dữ liệu mới
        await Client.create(clients);
        console.log('🌱 [CLIENT SEEDER] Nạp dữ liệu Clients mới...');

        console.log('🎉 [CLIENT SEEDER] Hoàn tất!');
        process.exit();
    } catch (error) {
        console.error(`💀 [CLIENT SEEDER] Lỗi kinh hoàng: ${error.message}`);
        process.exit(1);
    }
};

const destroyClients = async () => {
    try {
        console.log('⚙️ [CLIENT SEEDER] Bắt đầu quá trình HỦY DIỆT dữ liệu...');
        await connectDB();
        await Client.deleteMany();
        console.log('🔥 [CLIENT SEEDER] Hủy diệt toàn bộ dữ liệu Clients...');
        console.log('✨ [CLIENT SEEDER] Đã xóa sạch!');
        process.exit();
    } catch (error) {
        console.error(`💀 [CLIENT SEEDER] Lỗi kinh hoàng: ${error.message}`);
        process.exit(1);
    }
};

// Điều hướng dựa trên tham số dòng lệnh
if (process.argv[2] === '-d') {
    destroyClients();
} else {
    seedClients();
}