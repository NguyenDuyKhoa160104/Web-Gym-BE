import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Room from '../models/Room.js';
import { ROOM_STATUS } from '../utils/constants.js';

dotenv.config({ path: './.env' });

await connectDB();

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
        await Room.deleteMany();
        console.log('Rooms are deleted');

        await Room.insertMany(rooms);
        console.log('Rooms are added');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedRooms();
