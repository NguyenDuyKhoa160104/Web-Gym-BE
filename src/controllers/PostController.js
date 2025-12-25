import Post from '../models/Post.js';
import { POST_STATUS } from '../utils/constants.js';

/**
 * @desc    Lấy danh sách tất cả bài viết đã xuất bản (phân trang, tìm kiếm, lọc)
 * @route   GET /api/client/all-post
 * @access  Private (Client)
 */
export const getAllPosts = async (req, res) => {
    try {
        // 1. Lấy các tham số query từ request
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // 2. Xây dựng query filter
        let query = {
            status: POST_STATUS.PUBLISHED // Chỉ lấy bài viết đã xuất bản
        };

        // Tìm kiếm theo tiêu đề (không phân biệt hoa thường)
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // 3. Thực thi truy vấn với phân trang và sắp xếp
        const posts = await Post.find(query)
            .populate('author', 'fullname') // Chỉ lấy fullname của tác giả
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();

        // 4. Đếm tổng số bản ghi để phục vụ phía Frontend làm UI phân trang
        const totalPosts = await Post.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / limit);

        // 5. Trả về kết quả thành công
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách bài viết thành công",
            data: posts,
            pagination: {
                totalResults: totalPosts,
                totalPages: totalPages,
                currentPage: page,
                limit: limit
            }
        });

    } catch (error) {
        // 6. Xử lý lỗi hệ thống
        console.error(`💀 [GET ALL POSTS ERROR]: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách bài viết",
            error: error.message
        });
    }
};
