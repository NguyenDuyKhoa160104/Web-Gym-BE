import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Cấu hình nơi lưu trữ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Sử dụng path.join để đảm bảo đường dẫn đúng trên Windows (dùng dấu \)
        const uploadPath = path.join('public', 'images', 'Customer');

        // Kiểm tra và tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Đặt tên file: avatar-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Bộ lọc chỉ cho phép file ảnh
const fileFilter = (req, file, cb) => {
    // Chấp nhận các loại ảnh phổ biến
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    // Kiểm tra extname và mimetype
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

export default upload;