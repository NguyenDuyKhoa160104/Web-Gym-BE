import Package from '../models/Package.js';
import Room from '../models/Room.js';
import Coach from '../models/Coach.js';
import Post from '../models/Post.js';
import { ACCOUNT_STATUS, POST_STATUS, ROOM_STATUS } from '../utils/constants.js';

/**
 * @desc    Global, cross-model search for packages, rooms, coaches, and posts.
 * @route   POST /api/client/search
 * @access  Private (Client)
 */
export const searchAll = async (req, res) => {
    try {
        const { query, page = 1, limit = 10 } = req.body;

        if (!query) {
            return res.status(400).json({ 
                success: false,
                message: 'Vui lòng cung cấp từ khóa (query).' 
            });
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const searchRegex = { $regex: query, $options: 'i' };

        // Define queries for each model
        const packageQuery = { status: ACCOUNT_STATUS.ACTIVE, $or: [{ packageName: searchRegex }, { description: searchRegex }, { features: searchRegex }] };
        const roomQuery = { status: ROOM_STATUS.AVAILABLE, $or: [{ name: searchRegex }, { description: searchRegex }] };
        const coachQuery = { status: ACCOUNT_STATUS.ACTIVE, $or: [{ fullname: searchRegex }, { specialty: searchRegex }, { bio: searchRegex }] };
        const postQuery = { status: POST_STATUS.PUBLISHED, $or: [{ title: searchRegex }, { content: searchRegex }, { tags: searchRegex }] };

        // Perform all searches and counts in parallel for efficiency
        const [
            packages,
            rooms,
            coaches,
            posts,
            packageCount,
            roomCount,
            coachCount,
            postCount
        ] = await Promise.all([
            // Find results with pagination
            Package.find(packageQuery).select('packageName description price durationInDays status').skip(skip).limit(parseInt(limit, 10)).lean(),
            Room.find(roomQuery).select('name description capacity image status').skip(skip).limit(parseInt(limit, 10)).lean(),
            Coach.find(coachQuery).select('fullname specialty experience avatar_url status').skip(skip).limit(parseInt(limit, 10)).lean(),
            Post.find(postQuery).populate('author', 'fullname').select('title slug cover_image_url createdAt status').skip(skip).limit(parseInt(limit, 10)).lean(),
            // Count total matching documents for each model
            Package.countDocuments(packageQuery),
            Room.countDocuments(roomQuery),
            Coach.countDocuments(coachQuery),
            Post.countDocuments(postQuery)
        ]);

        const totalResults = packageCount + roomCount + coachCount + postCount;

        if (totalResults === 0) {
            return res.status(404).json({
                success: true, // The request succeeded, there are just no results
                message: `Không tìm thấy kết quả nào cho '${query}'.`,
                data: {
                    packages: { results: [], total: 0, totalPages: 0 },
                    rooms: { results: [], total: 0, totalPages: 0 },
                    coaches: { results: [], total: 0, totalPages: 0 },
                    posts: { results: [], total: 0, totalPages: 0 },
                }
            });
        }
        
        // Combine results and send response
        res.status(200).json({
            success: true,
            message: `Tìm thấy tổng cộng ${totalResults} kết quả cho '${query}'.`,
            data: {
                packages: {
                    results: packages,
                    total: packageCount,
                    totalPages: Math.ceil(packageCount / limit),
                },
                rooms: {
                    results: rooms,
                    total: roomCount,
                    totalPages: Math.ceil(roomCount / limit),
                },
                coaches: {
                    results: coaches,
                    total: coachCount,
                    totalPages: Math.ceil(coachCount / limit),
                },
                posts: {
                    results: posts,
                    total: postCount,
                    totalPages: Math.ceil(postCount / limit),
                },
            },
            pagination: {
                currentPage: parseInt(page, 10),
                limit: parseInt(limit, 10),
            }
        });

    } catch (error) {
        console.error(`❌ [GLOBAL SEARCH ERROR]: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi thực hiện tìm kiếm, vui lòng thử lại sau.',
        });
    }
};
