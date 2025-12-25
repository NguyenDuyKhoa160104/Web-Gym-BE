import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Room from '../models/Room.js';
import { ROOM_STATUS } from '../utils/constants.js';

dotenv.config({ path: './.env' });

const rooms = [
    {
        name: 'Phòng Tập Tạ Chính',
        capacity: 50,
        description: 'Phòng tập chính với đầy đủ các loại tạ tay, tạ đòn và máy tập cơ.',
        status: ROOM_STATUS.AVAILABLE,
        image: 'https://res.cloudinary.com/dthyil6xl/image/upload/v1721235377/gym-web/package/default.png',
    },
    {
        name: 'Phòng Cardio',
        capacity: 30,
        description: 'Phòng tập chuyên cho các bài tập tim mạch như máy chạy bộ, xe đạp, máy chèo thuyền.',
        status: ROOM_STATUS.AVAILABLE,
        image: 'https://res.cloudinary.com/dthyil6xl/image/upload/v1721235377/gym-web/package/default.png',
    },
    {
        name: 'Phòng Yoga & Group X',
        capacity: 25,
        description: 'Phòng tập dành cho các lớp yoga, zumba và các lớp học nhóm khác.',
        status: ROOM_STATUS.AVAILABLE,
        image: 'https://res.cloudinary.com/dthyil6xl/image/upload/v1721235377/gym-web/package/default.png',
    },
    {
        name: 'Phòng Tập Chức Năng',
        capacity: 20,
        description: 'Phòng tập với các dụng cụ tập luyện chức năng như kettlebell, dây kháng lực, bóng tập.',
        status: ROOM_STATUS.MAINTENANCE,
        image: 'https://res.cloudinary.com/dthyil6xl/image/upload/v1721235377/gym-web/package/default.png',
    },
];

const seedRooms = async () => {
    try {
        console.log('⚙️ [ROOM SEEDER] Bắt đầu quá trình nạp dữ liệu...');
        await connectDB();

        await Room.deleteMany();
        console.log('🗑️  [ROOM SEEDER] Dọn dẹp dữ liệu cũ...');

        await Room.insertMany(rooms);
        console.log('🌱 [ROOM SEEDER] Nạp dữ liệu Rooms mới...');
        
        console.log('🎉 [ROOM SEEDER] Hoàn tất!');
        process.exit();
    } catch (error) {
        console.error(`💀 [ROOM SEEDER] Lỗi kinh hoàng: ${error.message}`);
        process.exit(1);
    }
};

const destroyRooms = async () => {
    try {
        console.log('⚙️ [ROOM SEEDER] Bắt đầu quá trình HỦY DIỆT dữ liệu...');
        await connectDB();
        await Room.deleteMany();
        console.log('🔥 [ROOM SEEDER] Hủy diệt toàn bộ dữ liệu Rooms...');
        console.log('✨ [ROOM SEEDER] Đã xóa sạch!');
        process.exit();
    } catch (error) {
        console.error(`💀 [ROOM SEEDER] Lỗi kinh hoàng: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyRooms();
} else {
    seedRooms();
}

