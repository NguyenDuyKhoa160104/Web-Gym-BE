import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Package from '../models/Package.js';
import PackageCategory from '../models/PackageCategory.js'; // Import PackageCategory
import { ACCOUNT_STATUS } from '../utils/constants.js';

// Cấu hình biến môi trường
dotenv.config({ path: './.env' });

const seedPackages = async () => {
    try {
        await connectDB();

        // 1. Đảm bảo rằng các danh mục đã tồn tại để liên kết
        // Nếu không có danh mục, có thể chạy PackageCategorySeeder trước
        let generalCategory = await PackageCategory.findOne({ name: 'Gói tập thông thường' });
        let ptCategory = await PackageCategory.findOne({ name: 'Gói PT cá nhân' });
        let yogaCategory = await PackageCategory.findOne({ name: 'Gói Yoga & Pilates' });

        if (!generalCategory || !ptCategory || !yogaCategory) {
            console.warn('⚠️ [PACKAGE SEEDER] Một số danh mục gói tập chưa tồn tại. Vui lòng chạy PackageCategorySeeder trước.');
            // Tạo tạm các danh mục nếu không có để PackageSeeder không bị lỗi
            // Hoặc có thể thoát và yêu cầu chạy Category Seeder trước
            // For now, let's create them if they don't exist
            await PackageCategory.findOneAndUpdate(
                { name: 'Gói tập thông thường' },
                { description: 'Các gói tập thể dục cơ bản và nâng cao tại phòng gym.', status: ACCOUNT_STATUS.ACTIVE, displayOrder: 1 },
                { upsert: true, new: true }
            );
            await PackageCategory.findOneAndUpdate(
                { name: 'Gói PT cá nhân' },
                { description: 'Các gói tập luyện với huấn luyện viên cá nhân 1 kèm 1.', status: ACCOUNT_STATUS.ACTIVE, displayOrder: 2 },
                { upsert: true, new: true }
            );
            await PackageCategory.findOneAndUpdate(
                { name: 'Gói Yoga & Pilates' },
                { description: 'Các gói tập Yoga và Pilates giúp cải thiện sự dẻo dai và tinh thần.', status: ACCOUNT_STATUS.ACTIVE, displayOrder: 3 },
                { upsert: true, new: true }
            );

            // Re-fetch categories after potential upsert
            const newGeneralCategory = await PackageCategory.findOne({ name: 'Gói tập thông thường' });
            const newPtCategory = await PackageCategory.findOne({ name: 'Gói PT cá nhân' });
            const newYogaCategory = await PackageCategory.findOne({ name: 'Gói Yoga & Pilates' });

            if (!newGeneralCategory || !newPtCategory || !newYogaCategory) {
                console.error('❌ [PACKAGE SEEDER] Không thể tạo hoặc tìm thấy các danh mục gói tập cần thiết.');
                process.exit(1);
            }

            // Update category references
            generalCategory = newGeneralCategory;
            ptCategory = newPtCategory;
            yogaCategory = newYogaCategory;
        }

        // Dữ liệu mẫu Packages
        const packages = [
            {
                packageName: 'Gói Gold - 6 Tháng',
                description: 'Truy cập không giới hạn tất cả các khu vực gym, 3 buổi PT miễn phí.',
                price: 5000000,
                durationInDays: 180,
                features: ['Truy cập Gym không giới hạn', '3 buổi PT', 'Xông hơi miễn phí'],
                category: generalCategory._id, // Liên kết với ID danh mục
                status: ACCOUNT_STATUS.ACTIVE,
                displayOrder: 1
            },
            {
                packageName: 'Gói VIP PT 1:1 - 3 Tháng',
                description: '12 buổi tập với Huấn luyện viên cá nhân, kế hoạch dinh dưỡng riêng.',
                price: 8000000,
                durationInDays: 90,
                features: ['12 buổi PT cá nhân', 'Kế hoạch dinh dưỡng', 'Ưu tiên đặt lịch'],
                category: ptCategory._id, // Liên kết với ID danh mục
                status: ACCOUNT_STATUS.ACTIVE,
                displayOrder: 2
            },
            {
                packageName: 'Gói Yoga Cơ Bản - 1 Tháng',
                description: '4 buổi học Yoga cơ bản mỗi tuần, hướng dẫn bởi chuyên gia.',
                price: 1500000,
                durationInDays: 30,
                features: ['4 buổi Yoga/tuần', 'HLV chuyên nghiệp'],
                category: yogaCategory._id, // Liên kết với ID danh mục
                status: ACCOUNT_STATUS.ACTIVE,
                displayOrder: 3
            },
            {
                packageName: 'Gói Platinum - 1 Năm',
                description: 'Tất cả quyền lợi của gói Gold, thêm 6 buổi PT và dịch vụ spa.',
                price: 9000000,
                durationInDays: 365,
                features: ['Truy cập Gym không giới hạn', '6 buổi PT', 'Spa miễn phí'],
                category: generalCategory._id, // Liên kết với ID danh mục
                status: ACCOUNT_STATUS.ACTIVE,
                displayOrder: 0 // Sẽ được ưu tiên hiển thị đầu tiên
            }
        ];

        // Xóa dữ liệu cũ
        await Package.deleteMany();
        console.log('🗑️ [PACKAGE SEEDER] Đã dọn dẹp bảng Packages.');

        // Nạp dữ liệu mới
        await Package.create(packages);
        console.log('✅ [PACKAGE SEEDER] Nạp dữ liệu Packages thành công!');

        process.exit();
    } catch (error) {
        console.error(`❌ [PACKAGE SEEDER] Lỗi: ${error.message}`);
        process.exit(1);
    }
};

const destroyPackages = async () => {
    try {
        await connectDB();
        await Package.deleteMany();
        console.log('🧹 [PACKAGE SEEDER] Đã xóa trắng bảng Packages.');
        process.exit();
    } catch (error) {
        console.error(`❌ [PACKAGE SEEDER] Lỗi: ${error.message}`);
        process.exit(1);
    }
};

// Điều hướng dựa trên tham số dòng lệnh
if (process.argv[2] === '-d') {
    destroyPackages();
} else {
    seedPackages();
}