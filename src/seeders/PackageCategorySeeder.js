import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import PackageCategory from '../models/PackageCategory.js';
import { ACCOUNT_STATUS } from '../utils/constants.js';

// Cấu hình biến môi trường
dotenv.config({ path: './.env' });

// Dữ liệu mẫu Package Categories
const packageCategories = [
    {
        name: 'Gói tập thông thường',
        description: 'Các gói tập thể dục cơ bản và nâng cao tại phòng gym.',
        status: ACCOUNT_STATUS.ACTIVE,
        displayOrder: 1
    },
    {
        name: 'Gói PT cá nhân',
        description: 'Các gói tập luyện với huấn luyện viên cá nhân 1 kèm 1.',
        status: ACCOUNT_STATUS.ACTIVE,
        displayOrder: 2
    },
    {
        name: 'Gói Yoga & Pilates',
        description: 'Các gói tập Yoga và Pilates giúp cải thiện sự dẻo dai và tinh thần.',
        status: ACCOUNT_STATUS.ACTIVE,
        displayOrder: 3
    },
    {
        name: 'Gói nhóm đặc biệt',
        description: 'Các lớp học nhóm chuyên sâu với các bài tập độc đáo.',
        status: ACCOUNT_STATUS.INACTIVE, // Ví dụ: đang tạm ngừng
        displayOrder: 4
    }
];

const seedPackageCategories = async () => {
    try {
        await connectDB();

        // Xóa dữ liệu cũ
        await PackageCategory.deleteMany();
        console.log('🗑️ [PACKAGE CATEGORY SEEDER] Đã dọn dẹp bảng Package Categories.');

        // Nạp dữ liệu mới
        await PackageCategory.create(packageCategories);
        console.log('✅ [PACKAGE CATEGORY SEEDER] Nạp dữ liệu Package Categories thành công!');

        process.exit();
    } catch (error) {
        console.error(`❌ [PACKAGE CATEGORY SEEDER] Lỗi: ${error.message}`);
        process.exit(1);
    }
};

const destroyPackageCategories = async () => {
    try {
        await connectDB();
        await PackageCategory.deleteMany();
        console.log('🧹 [PACKAGE CATEGORY SEEDER] Đã xóa trắng bảng Package Categories.');
        process.exit();
    } catch (error) {
        console.error(`❌ [PACKAGE CATEGORY SEEDER] Lỗi: ${error.message}`);
        process.exit(1);
    }
};

// Điều hướng dựa trên tham số dòng lệnh
if (process.argv[2] === '-d') {
    destroyPackageCategories();
} else {
    seedPackageCategories();
}