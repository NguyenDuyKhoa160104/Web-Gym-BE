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
        await connectDB();

        // Xóa dữ liệu cũ
        await Client.deleteMany();
        console.log('🗑️ [CLIENT SEEDER] Đã dọn dẹp bảng Clients.');

        // Nạp dữ liệu mới
        await Client.create(clients);
        console.log('✅ [CLIENT SEEDER] Nạp dữ liệu Clients thành công!');

        process.exit();
    } catch (error) {
        console.error(`❌ [CLIENT SEEDER] Lỗi: ${error.message}`);
        process.exit(1);
    }
};

const destroyClients = async () => {
    try {
        await connectDB();
        await Client.deleteMany();
        console.log('🧹 [CLIENT SEEDER] Đã xóa trắng bảng Clients.');
        process.exit();
    } catch (error) {
        console.error(`❌ [CLIENT SEEDER] Lỗi: ${error.message}`);
        process.exit(1);
    }
};

// Điều hướng dựa trên tham số dòng lệnh
if (process.argv[2] === '-d') {
    destroyClients();
} else {
    seedClients();
}