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
        await connectDB();

        // Xóa dữ liệu cũ
        await Admin.deleteMany();
        console.log('🗑️ [ADMIN SEEDER] Đã dọn dẹp bảng Admins.');

        // Nạp dữ liệu mới (.create để kích hoạt middleware hash password)
        await Admin.create(admins);
        console.log('✅ [ADMIN SEEDER] Nạp dữ liệu Admins thành công!');

        process.exit();
    } catch (error) {
        console.error(`❌ [ADMIN SEEDER] Lỗi: ${error.message}`);
        process.exit(1);
    }
};

const destroyAdmins = async () => {
    try {
        await connectDB();
        await Admin.deleteMany();
        console.log('🧹 [ADMIN SEEDER] Đã xóa trắng bảng Admins.');
        process.exit();
    } catch (error) {
        console.error(`❌ [ADMIN SEEDER] Lỗi: ${error.message}`);
        process.exit(1);
    }
};

// Điều hướng dựa trên tham số dòng lệnh
if (process.argv[2] === '-d') {
    destroyAdmins();
} else {
    seedAdmins();
}