import Client from '../models/Client.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import { ACCOUNT_STATUS } from '../utils/constants.js';
import fs from 'fs'; // <--- BẮT BUỘC THÊM DÒNG NÀY Ở ĐẦU FILE

/**
 * @desc    Đăng nhập dành cho Hội viên (Client)
 * @route   POST /api/client/login
 * @access  Public
 */
export const loginClient = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Kiểm tra dữ liệu đầu vào
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ email và mật khẩu',
            });
        }

        // 2. Tìm Client theo email (lấy kèm mật khẩu để so sánh)
        const client = await Client.findOne({ email }).select('+password');

        if (!client) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không chính xác',
            });
        }

        // 3. Kiểm tra trạng thái tài khoản
        if (client.status !== ACCOUNT_STATUS.ACTIVE) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản hội viên của bạn đang bị khóa hoặc chưa kích hoạt',
            });
        }

        // 4. So khớp mật khẩu
        const isMatch = await client.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không chính xác',
            });
        }

        // 5. Tạo JWT Token dành riêng cho Client
        const token = jwt.sign(
            { id: client._id, role: 'client' }, // Payload chứa role client
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        // 6. Trả về kết quả
        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            data: {
                id: client._id,
                fullname: client.fullname,
                email: client.email,
                phone: client.phone,
                avatar_url: client.avatar_url || '',
                health_info: client.health_info // Trả về thông tin sức khỏe để hiển thị Dashboard
            }
        });

    } catch (error) {
        console.error(`❌ [CLIENT LOGIN ERROR]: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau',
        });
    }
};

/**
 * @desc    Đăng ký tài khoản mới cho Hội viên (Client)
 * @route   POST /api/client/register
 * @access  Public
 */
export const registerClient = async (req, res) => {
    try {
        const { fullname, email, password, phone } = req.body;

        // 1. Kiểm tra dữ liệu đầu vào
        if (!fullname || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin: họ tên, email, mật khẩu và số điện thoại.',
            });
        }

        // 2. Kiểm tra password đủ dài
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự.'
            })
        }

        // 3. Kiểm tra xem email đã tồn tại chưa
        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return res.status(409).json({ // 409 Conflict
                success: false,
                message: 'Email này đã được sử dụng để đăng ký tài khoản.',
            });
        }

        // 4. Tạo client mới (mật khẩu sẽ được hash tự động bởi pre-save hook)
        const newClient = await Client.create({
            fullname,
            email,
            password,
            phone,
            status: ACCOUNT_STATUS.ACTIVE // Mặc định là active
        });

        // Lấy lại thông tin client vừa tạo mà không có mật khẩu
        const clientData = await Client.findById(newClient._id).select('-password');
        // 5. Tạo JWT Token để tự động đăng nhập
        const token = jwt.sign(
            { id: newClient._id, role: 'client' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        // 6. Trả về kết quả
        res.status(201).json({
            success: true,
            message: 'Đăng ký tài khoản thành công.',
            token,
            data: {
                id: clientData._id,
                fullname: clientData.fullname,
                email: clientData.email,
                phone: clientData.phone,
                avatar_url: clientData.avatar_url || '',
                health_info: clientData.health_info
            }
        });

    } catch (error) {
        console.error(`❌ [CLIENT REGISTER ERROR]: ${error.message}`);
        // Handle potential validation errors from Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(' ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau.',
        });
    }
};

/**
 * @desc    Kiểm tra trạng thái đăng nhập của Hội viên
 * @route   GET /api/client/check-login
 * @access  Private (Yêu cầu ClientMiddleware.protect)
 */
export const checkLogin = async (req, res) => {
    try {
        // req.client sẽ được middleware 'protectClient' (cần viết thêm) đính kèm vào
        if (!req.client) {
            return res.status(401).json({
                success: false,
                message: 'Phiên đăng nhập đã hết hạn'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: req.client._id,
                fullname: req.client.fullname,
                email: req.client.email,
                phone: req.client.phone,
                avatar_url: req.client.avatar_url || '',
                health_info: req.client.health_info
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi xác thực phiên đăng nhập',
        });
    }
};



/**
 * @desc    Lấy danh sách tất cả khách hàng (phân trang, tìm kiếm, lọc)
 * @route   GET /api/clients
 * @access  Private (Admin)
 */
export const getAllClients = async (req, res) => {
    try {
        // 1. Lấy các tham số query từ request
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search || '';
        const status = req.query.status;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // 2. Xây dựng query filter
        let query = {};

        // Tìm kiếm theo tên hoặc email (không phân biệt hoa thường)
        if (search) {
            query.$or = [
                { fullname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Lọc theo trạng thái nếu có
        if (status) {
            query.status = status;
        }

        // 3. Thực thi truy vấn với phân trang và sắp xếp
        const clients = await Client.find(query)
            .select('-password') // Không trả về field password vì bảo mật
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();

        // 4. Đếm tổng số bản ghi để phục vụ phía Frontend làm UI phân trang
        const totalClients = await Client.countDocuments(query);
        const totalPages = Math.ceil(totalClients / limit);

        // 5. Trả về kết quả thành công
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách khách hàng thành công",
            data: clients,
            pagination: {
                totalResults: totalClients,
                totalPages: totalPages,
                currentPage: page,
                limit: limit
            }
        });

    } catch (error) {
        // 6. Xử lý lỗi hệ thống
        console.error('Error in getAllClients:', error);
        return res.status(500).json({
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách khách hàng",
            error: error.message
        });
    }
};

/**
 * @desc    Helper function to update a client's account status
 * @param   {string} clientId
 * @param   {number} newStatus
 * @param   {object} res
 * @returns {Promise<void>}
 */
const _updateClientStatus = async (clientId, newStatus, res) => {
    try {
        // 1. Find client
        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khách hàng.',
            });
        }

        // 2. Prevent changing status if client is already BANNED, unless the new status is also BANNED
        if (client.status === ACCOUNT_STATUS.BANNED && newStatus !== ACCOUNT_STATUS.BANNED) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị cấm vĩnh viễn và không thể thay đổi trạng thái thành Mở hoặc Khóa.',
            });
        }

        // 3. Update status
        client.status = newStatus;
        await client.save();

        let message = '';
        if (newStatus === ACCOUNT_STATUS.ACTIVE) {
            message = 'Mở tài khoản khách hàng thành công.';
        } else if (newStatus === ACCOUNT_STATUS.INACTIVE) {
            message = 'Khóa tài khoản khách hàng thành công.';
        } else if (newStatus === ACCOUNT_STATUS.BANNED) {
            message = 'Cấm tài khoản khách hàng thành công.';
        }

        res.status(200).json({
            success: true,
            message: message,
            data: client,
        });

    } catch (error) {
        console.error(`❌ [UPDATE CLIENT STATUS ERROR]: ${error.message}`);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID khách hàng không hợp lệ.',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau.',
        });
    }
};

/**
 * @desc    Admin khóa hoặc mở tài khoản khách hàng
 * @route   POST /api/admin/lock-open-customer/:id
 * @access  Private (Admin)
 */
export const lockOpenCustomer = async (req, res) => {
    const { id: clientId } = req.params;
    try {
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khách hàng.',
            });
        }

        let newStatus;
        if (client.status === ACCOUNT_STATUS.ACTIVE) {
            newStatus = ACCOUNT_STATUS.INACTIVE; // If active, lock it
        } else if (client.status === ACCOUNT_STATUS.INACTIVE) {
            newStatus = ACCOUNT_STATUS.ACTIVE; // If inactive, open it
        } else {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị cấm vĩnh viễn và không thể thay đổi trạng thái (Mở hoặc Khóa).',
            });
        }

        await _updateClientStatus(clientId, newStatus, res);

    } catch (error) {
        console.error(`❌ [LOCK/OPEN CUSTOMER ERROR]: ${error.message}`);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID khách hàng không hợp lệ.',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau.',
        });
    }
};

/**
 * @desc    Admin cấm tài khoản khách hàng vĩnh viễn
 * @route   POST /api/admin/ban-customer/:id
 * @access  Private (Admin)
 */
export const banCustomer = async (req, res) => {
    const { id: clientId } = req.params;
    await _updateClientStatus(clientId, ACCOUNT_STATUS.BANNED, res);
};

/**
 * @desc    Lấy thông tin cá nhân của Client (từ token)
 * @route   GET /api/client/my-profile
 * @access  Private (Client)
 */
export const getMyProfile = async (req, res) => {
    try {
        // The `protect` middleware has already fetched the client and attached it to req.client
        // We can just return it. This avoids a redundant database query.
        const client = req.client;

        res.status(200).json({
            success: true,
            data: {
                ...client.toObject(), // Convert Mongoose document to plain object
                avatar_url: client.avatar_url || '' // Ensure avatar_url is never null/undefined
            },
        });
    } catch (error) {
        console.error(`❌ [GET MY PROFILE ERROR]: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau.',
        });
    }
};

/**
 * @desc    Cập nhật thông tin cá nhân của Client (từ token)
 * @route   POST /api/client/update-profile
 * @access  Private (Client)
 */
export const updateProfile = async (req, res) => {
    try {
        // ID is retrieved from the token via `protect` middleware
        const clientId = req.client._id;
        const { fullname, phone, address, date_of_birth, gender, health_info } = req.body;

        const client = await Client.findById(clientId);

        if (!client) {
            // This case should theoretically not be reached if the token is valid
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng',
            });
        }

        // Cập nhật thông tin
        client.fullname = fullname || client.fullname;
        client.phone = phone || client.phone;
        client.address = address || client.address;
        client.date_of_birth = date_of_birth || client.date_of_birth;
        client.gender = gender || client.gender;
        client.health_info = health_info || client.health_info;

        const updatedClient = await client.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: updatedClient,
        });

    } catch (error) {
        console.error(`❌ [UPDATE PROFILE ERROR]: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau.',
        });
    }
};

/**
 * @desc    Cập nhật ảnh đại diện của Client (từ token)
 * @route   POST /api/client/update-avatar
 * @access  Private (Client)
 */
/**
 * @desc    Cập nhật ảnh đại diện của Client
 * @route   POST /api/client/update-avatar
 * @access  Private (Client)
 */
export const updateAvatar = async (req, res) => {
    try {
        // Giả sử middleware xác thực đã gắn thông tin client vào req.client hoặc req.user
        const clientId = req.client?._id || req.user?._id;

        // Kiểm tra xem có lấy được ID không
        if (!clientId) {
            // Nếu có file upload lên mà không có ID, xóa file đi
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(401).json({
                success: false,
                message: 'Không xác thực được người dùng (Token lỗi hoặc Middleware chưa gắn req.client)',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng tải lên một tệp ảnh',
            });
        }

        // 1. Tìm client trong DB trước
        const client = await Client.findById(clientId);
        if (!client) {
            // Nếu không tìm thấy user, xóa ảnh vừa upload lên để tránh rác
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng trong CSDL',
            });
        }

        // 2. Xóa ảnh cũ nếu tồn tại (Tránh đầy bộ nhớ server)
        if (client.avatar_url) {
            // Logic: Lấy đường dẫn file cũ từ URL
            // Sử dụng process.cwd() để đảm bảo đường dẫn đúng từ thư mục gốc
            // Loại bỏ dấu '/' ở đầu avatar_url nếu có để path.join hoạt động đúng
            const relativeAvatarPath = client.avatar_url.startsWith('/') ? client.avatar_url.substring(1) : client.avatar_url;
            const oldAvatarPath = path.join(process.cwd(), 'public', relativeAvatarPath);

            // Kiểm tra file có tồn tại không rồi mới xóa
            if (fs.existsSync(oldAvatarPath)) {
                try {
                    fs.unlinkSync(oldAvatarPath);
                    console.log(`Deleted old avatar: ${oldAvatarPath}`);
                } catch (err) {
                    console.error("Lỗi khi xóa ảnh cũ:", err);
                }
            }
        }

        // 3. Tạo đường dẫn URL cho ảnh mới
        // Chuẩn hóa dấu gạch chéo (Windows dùng \)
        let relativePath = req.file.path.replace(/\\/g, '/');

        // Bỏ phần 'public' ở đầu để tạo URL truy cập qua web
        // Ví dụ: public/images/Customer/abc.jpg -> /images/Customer/abc.jpg
        const avatar_url = relativePath.startsWith('public/')
            ? relativePath.replace('public/', '/')
            : '/' + relativePath;

        // 4. Lưu vào DB
        client.avatar_url = avatar_url;
        const updatedClient = await client.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật ảnh đại diện thành công',
            data: updatedClient,
        });

    } catch (error) {
        // Nếu có lỗi hệ thống, xóa ảnh vừa upload để dọn rác
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error("Không thể xóa file rác:", e);
            }
        }

        console.error(`❌ [UPDATE AVATAR ERROR]: ${error.message}`);
        // TRẢ VỀ CHI TIẾT LỖI ĐỂ DEBUG (sau này production có thể ẩn đi)
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống: ' + error.message,
        });
    }
};




