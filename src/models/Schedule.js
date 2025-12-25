import mongoose from 'mongoose';
import { SCHEDULE_STATUS } from '../utils/constants.js';

const ScheduleSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    coach: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String, // e.g., "09:00"
        required: true,
    },
    endTime: {
        type: String, // e.g., "10:00"
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(SCHEDULE_STATUS),
        default: SCHEDULE_STATUS.SCHEDULED,
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true,
    collection: 'Schedules',
});

const Schedule = mongoose.model('Schedule', ScheduleSchema);
export default Schedule;

