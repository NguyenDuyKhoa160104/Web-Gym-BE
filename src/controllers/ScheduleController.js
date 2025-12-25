import Schedule from '../models/Schedule.js';
import Student from '../models/Student.js';
import Coach from '../models/Coach.js';
import { SCHEDULE_STATUS } from '../utils/constants.js';

// Thêm lịch trình cho học viên
export const addSchedule = async (req, res) => {
    try {
        const { studentId, date, dayOfWeek, startTime, endTime } = req.body;
        const coachId = req.params.id;

        // Kiểm tra xem student có tồn tại và có thuộc về coach này không
        const student = await Student.findOne({
            _id: studentId,
            coach: coachId,
        });

        if (!student) {
            return res.status(404).json({
                message:
                    'Không tìm thấy học viên hoặc học viên không thuộc huấn luyện viên này',
            });
        }

        // Tạo lịch trình mới
        const newSchedule = new Schedule({
            student: studentId,
            coach: coachId,
            date,
            dayOfWeek,
            startTime,
            endTime,
            status: SCHEDULE_STATUS.SCHEDULED,
        });

        await newSchedule.save();

        res.status(201).json({
            message: 'Thêm lịch trình thành công',
            data: newSchedule,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi server',
            error: error.message,
        });
    }
};

// Xóa lịch trình
export const deleteSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.id;
        const coachId = req.user.id;

        // Tìm lịch trình
        const schedule = await Schedule.findById(scheduleId);

        if (!schedule) {
            return res.status(404).json({
                message: 'Không tìm thấy lịch trình',
            });
        }

        // Kiểm tra xem lịch trình có thuộc về coach này không
        if (schedule.coach.toString() !== coachId) {
            return res.status(403).json({
                message: 'Bạn không có quyền xóa lịch trình này',
            });
        }

        // Xóa lịch trình
        await Schedule.findByIdAndDelete(scheduleId);

        res.status(200).json({
            message: 'Xóa lịch trình thành công',
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi server',
            error: error.message,
        });
    }
};

// Lấy danh sách lịch trình của một coach
export const getMySchedules = async (req, res) => {
    try {
        const coachId = req.params.id;

        // Validate if the coach exists
        const coach = await Coach.findById(coachId);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy huấn luyện viên.',
            });
        }
        
        // Find all schedules for the given coach
        const schedules = await Schedule.find({ coach: coachId })
            .populate({
                path: 'student',
                select: 'client',
                populate: {
                    path: 'client',
                    select: 'fullname email avatar_url'
                }
            })
            .sort({ dayOfWeek: 1, startTime: 1 }); // Sort by day and time

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách lịch trình thành công.',
            data: schedules,
        });

    } catch (error) {
        console.error(`❌ [GET MY SCHEDULES ERROR]: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau.',
        });
    }
};