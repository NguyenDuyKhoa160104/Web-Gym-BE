import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';
import { ADMIN_ROLES, ACCOUNT_STATUS } from '../utils/constants.js';

// Cấu hình biến môi trường
dotenv.config({ path: './.env' });

// Dữ liệu mẫu Admin
const admins = [
    {
        fullname: 'Super Admin HD',
        email: 'admin@hdfitness.com',
        password: 'password123',
        role_level: ADMIN_ROLES.SUPER_ADMIN,
        status: ACCOUNT_STATUS.ACTIVE
    }
];

const seedAdmins = async () => {
    try {
        console.log('⚙️ [ADMIN SEEDER] Bắt đầu quá trình nạp dữ liệu...');
        await connectDB();

        // Xóa dữ liệu cũ
        await Admin.deleteMany();
        console.log('🗑️  [ADMIN SEEDER] Dọn dẹp dữ liệu cũ...');

        // Nạp dữ liệu mới (.create để kích hoạt middleware hash password)
        await Admin.create(admins);
        console.log('🌱 [ADMIN SEEDER] Nạp dữ liệu Admins mới...');
        
        console.log('🎉 [ADMIN SEEDER] Hoàn tất!');
        process.exit();
    } catch (error) {
        console.error(`💀 [ADMIN SEEDER] Lỗi kinh hoàng: ${error.message}`);
        process.exit(1);
    }
};

const destroyAdmins = async () => {
    try {
        console.log('⚙️ [ADMIN SEEDER] Bắt đầu quá trình HỦY DIỆT dữ liệu...');
        await connectDB();
        await Admin.deleteMany();
        console.log('🔥 [ADMIN SEEDER] Hủy diệt toàn bộ dữ liệu Admins...');
        console.log('✨ [ADMIN SEEDER] Đã xóa sạch!');
        process.exit();
    } catch (error) {
        console.error(`💀 [ADMIN SEEDER] Lỗi kinh hoàng: ${error.message}`);
        process.exit(1);
    }
};

// Điều hướng dựa trên tham số dòng lệnh
if (process.argv[2] === '-d') {
    destroyAdmins();
} else {
    seedAdmins();
}