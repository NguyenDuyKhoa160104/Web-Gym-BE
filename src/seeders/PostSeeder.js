import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Post from '../models/Post.js';
import Admin from '../models/Admin.js'; // Import Admin model to find an author
import { POST_STATUS } from '../utils/constants.js';

// Cấu hình biến môi trường
dotenv.config({ path: './.env' });

const seedPosts = async () => {
    try {
        console.log('⚙️ [POST SEEDER] Bắt đầu quá trình nạp dữ liệu...');
        await connectDB();

        // 1. Find an admin to be the author
        console.log('🔗 [POST SEEDER] Tìm kiếm tác giả (Admin)...');
        const author = await Admin.findOne();
        if (!author) {
            console.error('💀 [POST SEEDER] Không tìm thấy Admin nào để làm tác giả. Vui lòng tạo Admin trước.');
            process.exit(1);
        }
        console.log(`✅ [POST SEEDER] Đã tìm thấy tác giả: ${author.fullname}`);


        // Dữ liệu mẫu
        const posts = [
            {
                title: '10 Mẹo Tập Gym Hiệu Quả Cho Người Mới Bắt Đầu',
                content: 'Nội dung chi tiết về 10 mẹo tập gym... Đây là một bài viết rất dài và đầy đủ thông tin.',
                author: author._id,
                status: POST_STATUS.PUBLISHED,
                tags: ['tips', 'beginner', 'gym'],
                cover_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48'
            },
            {
                title: 'Chế Độ Dinh Dưỡng Tăng Cơ Giảm Mỡ',
                content: 'Để tăng cơ và giảm mỡ, bạn cần một chế độ ăn uống khoa học...',
                author: author._id,
                status: POST_STATUS.PUBLISHED,
                tags: ['nutrition', 'fitness', 'diet'],
                cover_image_url: 'https://images.unsplash.com/photo-1543362906-acfc16c67564'
            },
            {
                title: 'Bài Viết Nháp Về Yoga',
                content: 'Yoga là một phương pháp tuyệt vời để cải thiện sự dẻo dai và tinh thần...',
                author: author._id,
                status: POST_STATUS.DRAFT,
                tags: ['yoga', 'mindfulness'],
            }
        ];

        // 2. Xóa dữ liệu cũ
        await Post.deleteMany();
        console.log('🗑️  [POST SEEDER] Dọn dẹp dữ liệu cũ...');

        // 3. Nạp dữ liệu mới
        await Post.create(posts);
        console.log('🌱 [POST SEEDER] Nạp dữ liệu Posts mới...');

        console.log('🎉 [POST SEEDER] Hoàn tất!');
        process.exit();
    } catch (error) {
        console.error(`💀 [POST SEEDER] Lỗi kinh hoàng: ${error.message}`);
        process.exit(1);
    }
};

const destroyPosts = async () => {
    try {
        console.log('⚙️ [POST SEEDER] Bắt đầu quá trình HỦY DIỆT dữ liệu...');
        await connectDB();
        await Post.deleteMany();
        console.log('🔥 [POST SEEDER] Hủy diệt toàn bộ dữ liệu Posts...');
        console.log('✨ [POST SEEDER] Đã xóa sạch!');
        process.exit();
    } catch (error) {
        console.error(`💀 [POST SEEDER] Lỗi kinh hoàng: ${error.message}`);
        process.exit(1);
    }
};

// Điều hướng dựa trên tham số dòng lệnh
if (process.argv[2] === '-d') {
    destroyPosts();
} else {
    seedPosts();
}
