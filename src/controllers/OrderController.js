import Order from '../models/Order.js';
import Package from '../models/Package.js';
import Client from '../models/Client.js'; // Import Client model
import { ACCOUNT_STATUS, ORDER_STATUS, PAYMENT_STATUS } from '../utils/constants.js';

/**
 * @desc    Đặt đơn (đăng ký gói tập) cho client
 * @route   POST /api/client/order
 * @access  Private (Yêu cầu ClientMiddleware.protect)
 */
export const placeOrder = async (req, res) => {
    try {
        const { packageId, quantity } = req.body;
        const clientId = req.client._id; // Lấy client ID từ token đã xác thực

        // 1. Kiểm tra dữ liệu đầu vào
        if (!packageId) {
            return res.status(400).json({
                success: false,
                message: 'ID gói tập là bắt buộc.',
            });
        }
        
        const orderQuantity = quantity && quantity > 0 ? quantity : 1;

        // 2. Tìm thông tin gói tập
        const gymPackage = await Package.findById(packageId);

        if (!gymPackage) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy gói tập này.',
            });
        }

        if (gymPackage.status !== ACCOUNT_STATUS.ACTIVE) {
            return res.status(400).json({
                success: false,
                message: 'Gói tập này hiện không khả dụng.',
            });
        }

        // 3. Tính toán tổng số tiền
        const totalAmount = gymPackage.price * orderQuantity;

        // 4. Tạo đơn hàng mới
        const newOrder = await Order.create({
            client: clientId,
            totalAmount: totalAmount,
            status: ORDER_STATUS.PENDING, // Mặc định trạng thái đơn hàng là Đang chờ xử lý
            paymentStatus: PAYMENT_STATUS.PENDING, // Mặc định trạng thái thanh toán là Đang chờ
            // paymentMethod có thể được thêm vào từ req.body nếu có tùy chọn thanh toán
        });

        res.status(201).json({
            success: true,
            message: 'Đơn hàng của bạn đã được đặt thành công.',
            order: newOrder,
        });

    } catch (error) {
        console.error(`❌ [PLACE ORDER ERROR]: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi đặt đơn hàng, vui lòng thử lại sau.',
        });
    }
};

/**
 * @desc    Lấy danh sách tất cả các đơn hàng (cho Admin, có phân trang, tìm kiếm, lọc)
 * @route   GET /api/admin/orders
 * @access  Private (Admin, SuperAdmin)
 */
export const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search || '';
        const status = req.query.status;
        const paymentStatus = req.query.paymentStatus;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        let query = {};

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by payment status
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        // Search by client's fullname or email
        if (search) {
            const matchingClients = await Client.find({
                $or: [
                    { fullname: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ],
            }).select('_id'); // Only select the _id field

            const clientIds = matchingClients.map(client => client._id);
            query.client = { $in: clientIds };
        }

        const orders = await Order.find(query)
            .populate('client', 'fullname email phone') // Populate client details
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limit);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách đơn hàng thành công.',
            data: orders,
            pagination: {
                totalResults: totalOrders,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
            },
        });

    } catch (error) {
        console.error(`❌ [GET ALL ORDERS ERROR]: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi lấy danh sách đơn hàng, vui lòng thử lại sau.',
        });
    }
};