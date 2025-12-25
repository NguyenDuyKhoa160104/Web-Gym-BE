/**

Định nghĩa các hằng số hệ thống (Integer Mapping)
*/

// Định nghĩa cấp độ quản trị
export const ADMIN_ROLES = {
    SUPER_ADMIN: 0,
    MANAGER: 1
};

// Định nghĩa trạng thái tài khoản
export const ACCOUNT_STATUS = {
    BANNED: -1,
    INACTIVE: 0,
    ACTIVE: 1
};

export const ORDER_STATUS = {
    PENDING: 0,
    COMPLETED: 1,
    CANCELLED: 2
};

export const PAYMENT_STATUS = {
    PENDING: 0,
    PAID: 1,
    FAILED: 2
};

export const STUDENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    COMPLETED: 'completed'
};

export const SCHEDULE_STATUS = {

    SCHEDULED: 'scheduled',

    COMPLETED: 'completed',

    CANCELLED: 'cancelled'

};



export const ROOM_STATUS = {

    AVAILABLE: 'available',

    UNAVAILABLE: 'unavailable',

    MAINTENANCE: 'maintenance'

};

export const POST_STATUS = {
    DRAFT: 0,
    PUBLISHED: 1
};
