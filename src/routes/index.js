import express from 'express';
const router = express.Router();

// Import Controllers as namespaces
import * as AdminController from '../controllers/AdminController.js';
import * as ClientController from '../controllers/ClientController.js';
import * as OrderController from '../controllers/OrderController.js';
import * as PackageController from '../controllers/PackageController.js';
import { getAllPackageCategories } from '../controllers/PackageCategoryController.js';
import * as CoachController from '../controllers/CoachController.js';
import * as StudentController from '../controllers/StudentController.js';
import * as ScheduleController from '../controllers/ScheduleController.js';
import * as RoomController from '../controllers/RoomController.js';
import * as PostController from '../controllers/PostController.js';

// Import Middlewares as namespaces
import * as AdminMiddleware from '../middlewares/AdminMiddleware.js';
import * as ClientMiddleware from '../middlewares/ClientMiddleware.js';
import * as CoachMiddleware from '../middlewares/CoachMiddleware.js';


/**
 * ==========================================
 * ROUTES CHO ADMIN (QUẢN TRỊ VIÊN)
 * ==========================================
 */
// Đăng nhập Admin (Public)
router.post('/admin/login',
    AdminController.loginAdmin
);

// Kiểm tra đăng nhập và lấy thông tin cá nhân Admin (Private)
router.get('/admin/check-login',
    AdminMiddleware.protect,
    AdminController.checkLogin
);

router.get('/admin/all-clients',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    ClientController.getAllClients
)

// Admin gets all Packages
router.get('/admin/packages',
    AdminMiddleware.protect,
    PackageController.getAllPackages
);

// Admin gets all Package Categories
router.get('/admin/package-categories',
    AdminMiddleware.protect,
    getAllPackageCategories
);

router.post('/admin/add-package',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    PackageController.addPackage
)

router.post('/admin/change-status-package/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    PackageController.changeStatusPackage
)

router.post('/admin/update-package/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    PackageController.updatePackage
)

router.post('/admin/delete-package/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    PackageController.deletePackage
)

router.get('/admin/orders',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    OrderController.getAllOrders
);

router.post('/admin/check-order/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    OrderController.checkOrder
)

router.post('/admin/cancel-order/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    OrderController.cancelOrder
)

router.post('/admin/lock-open-customer/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    ClientController.lockOpenCustomer
);

router.post('/admin/ban-customer/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    ClientController.banCustomer
)

router.get('/admin/all-coaches',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    CoachController.getAllCoaches
)

router.post('/admin/lock-open-coach/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    CoachController.lockOpenCoach
)

router.post('/admin/ban-coach/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    CoachController.banCoach
)

router.get('/admin/all-rooms',
    AdminMiddleware.protect,
    RoomController.getAllRooms
);

router.get('/admin/get-room/:id',
    AdminMiddleware.protect,
    RoomController.getRoomById
);

router.post('/admin/add-room',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    RoomController.createRoom
);

router.post('/admin/update-room/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    RoomController.updateRoom
);

router.post('/admin/delete-room/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    RoomController.deleteRoom
);
router.post('/admin/lock-room/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    RoomController.lockRoom
)
router.post('/admin/maintain-room/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    RoomController.maintainRoom
)
router.post('/admin/unmaintain-room/:id',
    AdminMiddleware.protect,
    AdminMiddleware.authorizeSuperAdmin,
    RoomController.unmaintainRoom
)

/**
 * ==========================================
 * ROUTES CHO CLIENT (HỘI VIÊN)
 * ==========================================
 */
// Lấy danh sách khách hàng (Admin private)
router.post('/client/login',
    ClientController.loginClient
);

router.post('/client/register',
    ClientController.registerClient
);

router.get('/client/check-login',
    ClientMiddleware.protect,
    ClientController.checkLogin
);

// Client gets all Packages
router.get('/client/packages',
    ClientMiddleware.protect,
    PackageController.getAllPackages
);

// Client gets all Package Categories
router.get('/client/package-categories',
    ClientMiddleware.protect,
    getAllPackageCategories
);

router.post('/client/order',
    ClientMiddleware.protect,
    OrderController.placeOrder
);


router.get('/client/orders',
    ClientMiddleware.protect,
    OrderController.getAllOrders
);

router.get('/client/all-coaches',
    ClientMiddleware.protect,
    CoachController.getAllCoaches
)

router.post('/client/book-coach/:id',
    ClientMiddleware.protect,
    StudentController.bookCoach
)

router.get('/client/all-rooms',
    ClientMiddleware.protect,
    RoomController.getAllRooms
);

router.get('/client/get-room/:id',
    ClientMiddleware.protect,
    RoomController.getRoomById
);

router.get('/client/my-profile',
    ClientMiddleware.protect,
    ClientController.getMyProfile
)
router.post('/client/update-profile',
    ClientMiddleware.protect,
    ClientController.updateProfile
)
router.post('/client/update-avatar',
    ClientMiddleware.protect,
    ClientController.updateAvatar
)
router.get('/client/all-post/',
    ClientMiddleware.protect,
    PostController.getAllPosts
)
/**
 * ==========================================
 * ROUTES CHO COACH (HLV) - Placeholder
 * ==========================================
 */

router.post('/coach/login',
    CoachController.login
);
router.get('/coach/check-login',
    CoachMiddleware.protect,
    CoachController.checkLogin
);
router.get('/coach/my-students/:id',
    CoachMiddleware.protect,
    StudentController.getMyStudents
);
router.post('/coach/add-schedule/:id',
    CoachMiddleware.protect,
    ScheduleController.addSchedule
);
router.post('/coach/delete-schedule/:id',
    CoachMiddleware.protect,
    ScheduleController.deleteSchedule
);
router.get('/coach/my-schedules/:id',
    CoachMiddleware.protect,
    ScheduleController.getMySchedules
)

export default router;
