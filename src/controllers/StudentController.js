import Student from '../models/Student.js';
import Client from '../models/Client.js'; // Assuming Client model is needed for validation
import Coach from '../models/Coach.js';   // Assuming Coach model is needed for validation
import { STUDENT_STATUS } from '../utils/constants.js'; // Assuming STUDENT_STATUS is defined

/**
 * @desc    Client đăng ký HLV
 * @route   POST /api/client/book-coach/:id
 * @access  Private (Client)
 */
export const bookCoach = async (req, res) => {
    try {
        const { id: coachId } = req.params;
        const clientId = req.client._id; // Client ID comes from the protect middleware

        // 1. Check if coachId is valid
        const coach = await Coach.findById(coachId);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy HLV để đăng ký.',
            });
        }

        // 2. Check if the client is already an ACTIVE student of any coach
        const existingActiveStudent = await Student.findOne({ client: clientId, status: STUDENT_STATUS.ACTIVE });
        if (existingActiveStudent) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã có một HLV đang hoạt động. Vui lòng hoàn thành hoặc hủy đăng ký hiện tại trước khi đăng ký HLV mới.',
                data: existingActiveStudent // Optionally return existing student data
            });
        }

        // 3. Create new student entry
        const student = await Student.create({
            coach: coachId,
            client: clientId,
            status: STUDENT_STATUS.ACTIVE,
        });

        res.status(201).json({
            success: true,
            message: 'Đăng ký HLV thành công!',
            data: student,
        });

    } catch (error) {
        console.error(`❌ [BOOK COACH ERROR]: ${error.message}`);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID HLV không hợp lệ.',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau.',
        });
    }
};

/**
 * @desc    HLV lấy danh sách học viên của mình
 * @route   GET /api/coach/my-students
 * @access  Private (Coach)
 */
export const getMyStudents = async (req, res) => {
    try {
        const coachId = req.params.id; // Coach ID comes from the URL parameter

        // 1. Lấy các tham số query từ request
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search || '';
        const status = req.query.status; // Can filter by student status (active, inactive, completed)
        const sortBy = req.query.sortBy || 'enrollmentDate';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // 2. Xây dựng query filter
        let query = { coach: coachId }; // Filter by the logged-in coach's ID

        // Tìm kiếm học viên theo tên hoặc email của client
        if (search) {
            // Need to first find clients matching the search, then use their IDs
            const matchingClients = await Client.find({
                $or: [
                    { fullname: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            const clientIds = matchingClients.map(client => client._id);

            query.client = { $in: clientIds };
        }

        // Lọc theo trạng thái học viên nếu có
        if (status) {
            // Validate status against STUDENT_STATUS enum
            if (!Object.values(STUDENT_STATUS).includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái học viên không hợp lệ.',
                });
            }
            query.status = status;
        }

        // 3. Thực thi truy vấn với phân trang, sắp xếp và populate client info
        const students = await Student.find(query)
            .populate({
                path: 'client',
                select: 'fullname email phone avatar_url health_info' // Select specific client fields
            })
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();

        // 4. Đếm tổng số bản ghi
        const totalStudents = await Student.countDocuments(query);
        const totalPages = Math.ceil(totalStudents / limit);

        // 5. Trả về kết quả
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách học viên thành công",
            data: students,
            pagination: {
                totalResults: totalStudents,
                totalPages: totalPages,
                currentPage: page,
                limit: limit
            }
        });

    } catch (error) {
        console.error(`❌ [GET MY STUDENTS ERROR]: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau.',
        });
    }
};
