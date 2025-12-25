import Package from '../models/Package.js';
import { ACCOUNT_STATUS } from '../utils/constants.js'; // Import ACCOUNT_STATUS

export const getAllPackages = async (req, res) => {
    try {
        const packages = await Package.find();
        res.status(200).json(packages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Admin thêm gói tập mới
 * @route   POST /api/admin/add-package
 * @access  Private/Admin
 */
export const addPackage = async (req, res) => {
    try {
        const {
            packageName,
            description,
            price,
            durationInDays,
            features,
            category,
            status,
            displayOrder
        } = req.body;

        // Basic validation for required fields
        if (!packageName || !description || !price || !durationInDays || !category) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ tên gói, mô tả, giá, thời hạn và danh mục.',
            });
        }

        // Create new package
        const newPackage = await Package.create({
            packageName,
            description,
            price,
            durationInDays,
            features: features || [], // features is optional
            category,
            status: status || ACCOUNT_STATUS.ACTIVE, // default to active
            displayOrder: displayOrder || 0 // default to 0
        });

        res.status(201).json({
            success: true,
            message: 'Gói tập đã được thêm thành công.',
            data: newPackage
        });

    } catch (error) {
        console.error(`❌ [ADD PACKAGE ERROR]: ${error.message}`);
        // Handle specific Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({
                success: false,
                message: 'Tên gói tập đã tồn tại. Vui lòng chọn tên khác.',
            });
        }
            res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống, vui lòng thử lại sau.',
            });
        }
    };
        
        /**
         * @desc    Admin cập nhật gói tập hiện có
         * @route   POST /api/admin/update-package/:id
         * @access  Private/Admin
         */
        export const updatePackage = async (req, res) => {
            try {
                const { id: packageId } = req.params;
                const {
                    packageName,
                    description,
                    price,
                    durationInDays,
                    features,
                    category,
                    status,
                    displayOrder
                } = req.body;
        
                const packageToUpdate = await Package.findById(packageId);
        
                if (!packageToUpdate) {
                    return res.status(404).json({
                        success: false,
                        message: 'Không tìm thấy gói tập.',
                    });
                }
        
                // Update fields if provided
                if (packageName) packageToUpdate.packageName = packageName;
                if (description) packageToUpdate.description = description;
                if (price !== undefined) packageToUpdate.price = price;
                if (durationInDays !== undefined) packageToUpdate.durationInDays = durationInDays;
                if (features) packageToUpdate.features = features;
                if (category) packageToUpdate.category = category;
                if (status !== undefined) packageToUpdate.status = status;
                if (displayOrder !== undefined) packageToUpdate.displayOrder = displayOrder;
        
                await packageToUpdate.save();
        
                res.status(200).json({
                    success: true,
                    message: 'Gói tập đã được cập nhật thành công.',
                    data: packageToUpdate,
                });
        
            } catch (error) {
                console.error(`❌ [UPDATE PACKAGE ERROR]: ${error.message}`);
                if (error.name === 'CastError') {
                    return res.status(400).json({
                        success: false,
                        message: 'ID gói tập không hợp lệ.',
                    });
                }
                if (error.name === 'ValidationError') {
                    const messages = Object.values(error.errors).map(val => val.message);
                    return res.status(400).json({
                        success: false,
                        message: messages.join(', '),
                    });
                }
                if (error.code === 11000) { // Duplicate key error
                    return res.status(400).json({
                        success: false,
                        message: 'Tên gói tập đã tồn tại. Vui lòng chọn tên khác.',
                    });
                }
                res.status(500).json({
                    success: false,
                    message: 'Lỗi hệ thống, vui lòng thử lại sau.',
                });
            }
        };
/**
 * @desc    Admin thay đổi trạng thái gói tập (kích hoạt/ngừng kích hoạt)
 * @route   POST /api/admin/change-status-package
 * @access  Private/Admin
 */
export const changeStatusPackage = async (req, res) => {
    try {
        const { id: packageId } = req.params;
        const { newStatus } = req.body;

        if (newStatus === undefined || (newStatus !== ACCOUNT_STATUS.ACTIVE && newStatus !== ACCOUNT_STATUS.INACTIVE)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp trạng thái mới hợp lệ (0 hoặc 1).',
            });
        }

        const packageToUpdate = await Package.findById(packageId);

        if (!packageToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy gói tập.',
            });
        }

        packageToUpdate.status = newStatus;
        await packageToUpdate.save();

        res.status(200).json({
            success: true,
            message: 'Trạng thái gói tập đã được cập nhật thành công.',
            data: packageToUpdate,
        });

    } catch (error) {
        console.error(`❌ [CHANGE PACKAGE STATUS ERROR]: ${error.message}`);
        // Handle Mongoose CastError for invalid packageId format
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

/**
 * @desc    Admin xóa gói tập
 * @route   DELETE /api/admin/delete-package/:id
 * @access  Private/Admin
 */
export const deletePackage = async (req, res) => {
    try {
        const { id: packageId } = req.params;

        const deletedPackage = await Package.findByIdAndDelete(packageId);

        if (!deletedPackage) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy gói tập để xóa.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Gói tập đã được xóa thành công.',
            data: deletedPackage,
        });

    } catch (error) {
        console.error(`❌ [DELETE PACKAGE ERROR]: ${error.message}`);
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
