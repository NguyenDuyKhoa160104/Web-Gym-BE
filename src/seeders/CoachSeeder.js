import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Coach from '../models/Coach.js';
import { ACCOUNT_STATUS } from '../utils/constants.js';

// Cấu hình biến môi trường
dotenv.config({ path: './.env' });

// Dữ liệu mẫu Coach
const coaches = [
    {
        fullname: 'Coach David Nguyễn',
        email: 'david@hdfitness.com',
        password: 'password123',
        phone: '0988888888',
        specialty: 'Bodybuilding',
        experience: 5,
        bio: 'Chuyên gia huấn luyện thể hình với hơn 5 năm kinh nghiệm.',
        status: ACCOUNT_STATUS.ACTIVE
    },
    {
        fullname: 'Coach Sarah Trần',
        email: 'sarah@hdfitness.com',
        password: 'password123',
        phone: '0977777777',
        specialty: 'Yoga & Pilates',
        experience: 3,
        bio: 'Hướng dẫn Yoga giúp cải thiện sự linh hoạt và tinh thần.',
        status: ACCOUNT_STATUS.ACTIVE
    }
];

const seedCoaches = async () => {
    try {
        console.log('⚙️ [COACH SEEDER] Bắt đầu quá trình nạp dữ liệu...');
        await connectDB();
        await Coach.deleteMany();
        console.log('🗑️  [COACH SEEDER] Dọn dẹp dữ liệu cũ...');

        await Coach.create(coaches);
        console.log('🌱 [COACH SEEDER] Nạp dữ liệu Coaches mới...');
        
        console.log('🎉 [COACH SEEDER] Hoàn tất!');
        process.exit();
    } catch (error) {
        console.error(`💀 [COACH SEEDER] Lỗi kinh hoàng: ${error.message}`);
        process.exit(1);
    }
};

const destroyCoaches = async () => {
    try {
        console.log('⚙️ [COACH SEEDER] Bắt đầu quá trình HỦY DIỆT dữ liệu...');
        await connectDB();
        await Coach.deleteMany();
        console.log('🔥 [COACH SEEDER] Hủy diệt toàn bộ dữ liệu Coaches...');
        console.log('✨ [COACH SEEDER] Đã xóa sạch!');
        process.exit();
    } catch (error) {
        console.error(`💀 [COACH SEEDER] Lỗi kinh hoàng: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyCoaches();
} else {
    seedCoaches();
}