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
export const getClientMySchedules = async (req, res) => {
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

/**
 * @desc    Lấy danh sách lịch tập của hội viên
 * @route   GET /api/client/my-schedule/:id
 * @access  Private (Client)
 */
export const getMySchedules = async (req, res) => {
    try {
        const clientId = req.params.id;

        // 1. Kiểm tra quyền truy cập (Bảo mật)
        // Đảm bảo người đang request (từ token) chính là người sở hữu id này
        if (req.client._id.toString() !== clientId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem lịch tập của người khác',
            });
        }

        // 2. Tìm lịch tập trong Database
        // Giả sử model Schedule có field 'client' (hoặc client_id) và 'class' (hoặc class_id)
        // Lấy các lịch có trạng thái 'confirmed' (hoặc tương đương) và sắp xếp theo thời gian mới nhất
        const schedules = await Schedule.find({ client: clientId })
            .populate({
                path: 'class', // Tên field tham chiếu tới bảng Class
                select: 'name instructor room time date' // Chỉ lấy các trường cần thiết để hiển thị
            })
            .sort({ date: 1, time: 1 }); // Sắp xếp tăng dần theo ngày giờ (lịch sắp tới trước)

        // 3. (Tùy chọn) Lọc bỏ các lịch đã quá hạn nếu cần
        // const upcomingSchedules = schedules.filter(s => new Date(s.date) >= new Date());

        if (!schedules || schedules.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Chưa có lịch tập nào',
                data: [],
            });
        }

        // 4. Trả về dữ liệu
        res.status(200).json({
            success: true,
            count: schedules.length,
            data: schedules,
        });

    } catch (error) {
        console.error(`❌ [GET SCHEDULE ERROR]: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi lấy lịch tập',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};