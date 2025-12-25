import mongoose from 'mongoose';
import { ROOM_STATUS } from '../utils/constants.js';

/**
 * Schema cho Phòng tập (Room)
 */
const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên phòng là bắt buộc'],
            trim: true,
            unique: true,
        },
        image: {
            type: String,
            trim: true,
        },
        capacity: {
            type: Number,
            required: [true, 'Sức chứa là bắt buộc'],
            min: [1, 'Sức chứa phải lớn hơn 0'],
        },
        description: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(ROOM_STATUS),
            default: ROOM_STATUS.AVAILABLE,
        },
    },
    {
        timestamps: true,
        collection: 'Rooms',
    }
);

export default mongoose.model('Room', roomSchema);
