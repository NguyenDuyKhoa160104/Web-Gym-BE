import Room from '../models/Room.js';
import { ROOM_STATUS } from '../utils/constants.js';

/**
 * @desc    Lấy tất cả phòng tập (có phân trang, tìm kiếm)
 * @route   GET /api/admin/rooms
 * @access  Private (Admin)
 */
export const getAllRooms = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search || '';
        const status = req.query.status;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (status) {
            query.status = status;
        }

        const rooms = await Room.find(query)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalRooms = await Room.countDocuments(query);
        const totalPages = Math.ceil(totalRooms / limit);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách phòng tập thành công',
            data: rooms,
            pagination: {
                totalResults: totalRooms,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
            },
        });
    } catch (error) {
        console.error('Error in getAllRooms:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra khi lấy danh sách phòng tập',
            error: error.message,
        });
    }
};

/**
 * @desc    Lấy thông tin chi tiết một phòng tập
 * @route   GET /api/admin/rooms/:id
 * @access  Private (Admin)
 */
export const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng tập',
            });
        }

        res.status(200).json({
            success: true,
            data: room,
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID phòng tập không hợp lệ',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống',
        });
    }
};


/**
 * @desc    Tạo phòng tập mới
 * @route   POST /api/admin/rooms
 * @access  Private (Admin)
 */
export const createRoom = async (req, res) => {
    try {
        const { name, capacity, description, status, image } = req.body;

        if (!name || !capacity) {
            return res.status(400).json({
                success: false,
                message: 'Tên phòng và sức chứa là bắt buộc',
            });
        }

        const roomExists = await Room.findOne({ name });
        if (roomExists) {
            return res.status(400).json({
                success: false,
                message: 'Tên phòng đã tồn tại',
            });
        }

        const newRoom = await Room.create({
            name,
            capacity,
            description,
            status,
            image,
        });

        res.status(201).json({
            success: true,
            message: 'Tạo phòng tập mới thành công',
            data: newRoom,
        });
    } catch (error) {
        console.error('Error in createRoom:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tạo phòng tập',
            error: error.message,
        });
    }
};

/**
 * @desc    Cập nhật thông tin phòng tập
 * @route   PUT /api/admin/rooms/:id
 * @access  Private (Admin)
 */
export const updateRoom = async (req, res) => {
    try {
        const { name, capacity, description, status, image } = req.body;
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng tập',
            });
        }

        // Check if new name already exists
        if (name && name !== room.name) {
            const roomExists = await Room.findOne({ name });
            if (roomExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên phòng đã tồn tại',
                });
            }
        }

        room.name = name || room.name;
        room.capacity = capacity || room.capacity;
        room.description = description !== undefined ? description : room.description;
        room.status = status || room.status;
        room.image = image || room.image;

        const updatedRoom = await room.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin phòng tập thành công',
            data: updatedRoom,
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID phòng tập không hợp lệ',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống',
        });
    }
};

/**
 * @desc    Xóa phòng tập
 * @route   DELETE /api/admin/rooms/:id
 * @access  Private (Admin)
 */
export const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng tập',
            });
        }

        // Optional: Check if the room is in use before deleting
        // For example, check associated schedules
        // const schedules = await Schedule.find({ room_id: room._id });
        // if (schedules.length > 0) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Không thể xóa phòng đang có lịch sử dụng.',
        //     });
        // }
        
        await room.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Xóa phòng tập thành công',
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID phòng tập không hợp lệ',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống',
        });
    }
};

/**
 * @desc    Khóa/Mở khóa phòng tập
 * @route   POST /api/admin/lock-room/:id
 * @access  Private (Super Admin)
 */
export const lockRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng tập',
            });
        }

        if (room.status === ROOM_STATUS.MAINTENANCE) {
            return res.status(400).json({
                success: false,
                message: 'Phòng đang được bảo trì, không thể thay đổi trạng thái',
            });
        }

        room.status = room.status === ROOM_STATUS.AVAILABLE ? ROOM_STATUS.UNAVAILABLE : ROOM_STATUS.AVAILABLE;
        const updatedRoom = await room.save();

        res.status(200).json({
            success: true,
            message: `Phòng đã được ${room.status === ROOM_STATUS.UNAVAILABLE ? 'khóa' : 'mở khóa'} thành công`,
            data: updatedRoom,
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID phòng tập không hợp lệ',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống',
        });
    }
};

/**
 * @desc    Bảo trì phòng tập
 * @route   POST /api/admin/maintain-room/:id
 * @access  Private (Super Admin)
 */
export const maintainRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng tập',
            });
        }

        room.status = ROOM_STATUS.MAINTENANCE;
        const updatedRoom = await room.save();

        res.status(200).json({
            success: true,
            message: 'Phòng đã được chuyển sang trạng thái bảo trì',
            data: updatedRoom,
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID phòng tập không hợp lệ',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống',
        });
    }
};

/**
 * @desc    Gỡ bảo trì phòng tập
 * @route   POST /api/admin/unmaintain-room/:id
 * @access  Private (Super Admin)
 */
export const unmaintainRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng tập',
            });
        }

        if (room.status !== ROOM_STATUS.MAINTENANCE) {
            return res.status(400).json({
                success: false,
                message: 'Phòng không ở trạng thái bảo trì',
            });
        }

        room.status = ROOM_STATUS.AVAILABLE;
        const updatedRoom = await room.save();

        res.status(200).json({
            success: true,
            message: 'Phòng đã được gỡ bảo trì và chuyển sang trạng thái hoạt động',
            data: updatedRoom,
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID phòng tập không hợp lệ',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống',
        });
    }
};
