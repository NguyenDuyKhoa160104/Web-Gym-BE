import Package from '../models/Package.js';
import PackageReview from '../models/PackageReview.js';
import Order from '../models/Order.js';
import OrderDetail from '../models/OrderDetail.js';
import Client from '../models/Client.js';
import { ACCOUNT_STATUS, ORDER_STATUS, PACKAGE_REVIEW_STATUS } from '../utils/constants.js';

/**
 * @desc    Client gửi đánh giá cho một gói tập
 * @route   POST /api/client/review-package/:id
 * @access  Private (Client)
 */
export const reviewPackage = async (req, res) => {
    const { id: requestedClientId } = req.params;
    const authenticatedClientId = req.client._id.toString();
    const { packageId, rating, comment } = req.body;

    try {
        // 1. Authorize: Check if the logged-in client is the one making the request
        if (requestedClientId !== authenticatedClientId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện hành động này.',
            });
        }

        // 2. Validate input
        if (!packageId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ID của gói tập.',
            });
        }
        if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp điểm đánh giá hợp lệ từ 1 đến 5.',
            });
        }

        // 3. Check if package exists
        const packageExists = await Package.findById(packageId);
        if (!packageExists) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy gói tập.',
            });
        }

        // 4. Check if client has purchased this package
        const completedOrders = await Order.find({
            client: authenticatedClientId,
            status: ORDER_STATUS.COMPLETED,
        }).select('_id');

        if (!completedOrders.length) {
            return res.status(403).json({
                success: false,
                message: 'Bạn chỉ có thể đánh giá những gói tập bạn đã mua và hoàn thành.',
            });
        }

        const orderIds = completedOrders.map(order => order._id);

        const purchase = await OrderDetail.findOne({
            order: { $in: orderIds },
            package: packageId,
        });

        if (!purchase) {
            return res.status(403).json({
                success: false,
                message: 'Bạn chỉ có thể đánh giá những gói tập bạn đã mua.',
            });
        }

        // 5. Check if the user has already reviewed this package
        const existingReview = await PackageReview.findOne({
            package: packageId,
            client: authenticatedClientId,
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã đánh giá gói tập này rồi.',
            });
        }

        // 6. Create new review
        const newReview = await PackageReview.create({
            package: packageId,
            client: authenticatedClientId,
            rating,
            comment: comment || '',
        });

        res.status(201).json({
            success: true,
            message: 'Cảm ơn bạn đã gửi đánh giá! Đánh giá của bạn đang chờ được duyệt.',
            data: newReview,
        });

    } catch (error) {
        console.error(`❌ [REVIEW PACKAGE ERROR]: ${error.message}`);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ.', // Could be packageId or clientId
            });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau.',
        });
    }
};

/**
 * @desc    Admin gets all package reviews (paginated, filterable, searchable)
 * @route   GET /api/admin/all-package-review
 * @access  Private (SuperAdmin)
 */
export const getAllReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        let query = {};

        // Filtering by status
        if (status) {
            query.status = status;
        }

        // Searching by client name or package name
        if (search) {
            // Find matching client IDs
            const matchingClients = await Client.find({
                fullname: { $regex: search, $options: 'i' },
            }).select('_id');
            const clientIds = matchingClients.map(client => client._id);

            // Find matching package IDs
            const matchingPackages = await Package.find({
                packageName: { $regex: search, $options: 'i' },
            }).select('_id');
            const packageIds = matchingPackages.map(pkg => pkg._id);

            query.$or = [
                { client: { $in: clientIds } },
                { package: { $in: packageIds } },
            ];
        }

        const reviews = await PackageReview.find(query)
            .populate({
                path: 'client',
                select: 'fullname email avatar_url',
            })
            .populate({
                path: 'package',
                select: 'packageName',
            })
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalReviews = await PackageReview.countDocuments(query);
        const totalPages = Math.ceil(totalReviews / limit);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách tất cả đánh giá thành công.',
            data: reviews,
            pagination: {
                totalResults: totalReviews,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
            },
        });

    } catch (error) {
        console.error(`❌ [GET ALL REVIEWS ERROR]: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi lấy danh sách đánh giá, vui lòng thử lại sau.',
        });
    }
};

const _updateReviewStatus = async (reviewId, newStatus, res) => {
    try {
        const review = await PackageReview.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá.',
            });
        }

        review.status = newStatus;
        await review.save();

        let message = '';
        if (newStatus === PACKAGE_REVIEW_STATUS.APPROVED) {
            message = 'Duyệt đánh giá thành công.';
        } else if (newStatus === PACKAGE_REVIEW_STATUS.REJECTED) {
            message = 'Từ chối đánh giá thành công.';
        }

        res.status(200).json({
            success: true,
            message: message,
            data: review,
        });
    }
    catch (error) {
        console.error(`❌ [UPDATE REVIEW STATUS ERROR]: ${error.message}`);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID đánh giá không hợp lệ.',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau.',
        });
    }
}

/**
 * @desc    Admin duyệt một đánh giá
 * @route   POST /api/admin/approved/package-review/:id
 * @access  Private (SuperAdmin)
 */
export const approveReview = async (req, res) => {
    const { id: reviewId } = req.params;
    await _updateReviewStatus(reviewId, PACKAGE_REVIEW_STATUS.APPROVED, res);
};

/**
 * @desc    Admin từ chối một đánh giá
 * @route   POST /api/admin/approved/reject-review/:id
 * @access  Private (SuperAdmin)
 */
export const rejectReview = async (req, res) => {
    const { id: reviewId } = req.params;
    await _updateReviewStatus(reviewId, PACKAGE_REVIEW_STATUS.REJECTED, res);
};

/**
 * @desc    Kiểm tra xem client đã đánh giá gói tập này chưa
 * @route   GET /api/client/check-review/:id
 * @access  Private (Client)
 */
export const checkReview = async (req, res) => {
    try {
        // 1. Dùng optional chaining (?.) để an toàn hơn nếu middleware lỗi
        const authenticatedClientId = req.client?._id;
        const packageId = req.params.id;

        if (!packageId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ID của gói tập.',
            });
        }

        // 2. CẢI TIẾN: Sử dụng .lean() để truy vấn nhanh hơn
        // Chỉ chọn các trường cần thiết (rating, comment, createdAt)
        const existingReview = await PackageReview.findOne({
            package: packageId,
            client: authenticatedClientId,
        })
            .select('rating comment createdAt') // Chỉ lấy các trường cần dùng
            .lean(); // Trả về Plain Object giúp query nhẹ và nhanh hơn

        // 3. Phản hồi đầy đủ hơn
        res.status(200).json({
            success: true,
            data: {
                hasReviewed: !!existingReview, // Vẫn giữ boolean để check nhanh
                review: existingReview || null // Trả về chi tiết để UI hiển thị số sao cũ
            },
        });

    } catch (error) {
        console.error(`❌ [CHECK REVIEW ERROR]: ${error.message}`);

        // Xử lý lỗi ID sai định dạng MongoDB (ví dụ ID quá ngắn hoặc chứa ký tự lạ)
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID gói tập không hợp lệ.',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau.',
        });
    }
};
