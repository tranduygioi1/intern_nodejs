const User = require('../models/User');

async function viewsPermissions(req, res, next) {
    try {
        if (!req.user) return next();

        const populatedUser = await User.findById(req.user._id)
            .populate({
                path: 'role',
                populate: { path: 'permissions' },
            })
            .populate('permissions'); // quyền gán trực tiếp

        const rolePermissions = populatedUser.role?.permissions || [];
        const userPermissions = populatedUser.permissions || [];

        const allPermissions = [
            ...rolePermissions.map(p => p.permission_name),
            ...userPermissions.map(p => p.permission_name),
        ];

        // Gửi toàn bộ quyền xuống view
        res.locals.userPermissions = allPermissions;
        next();
    } catch (err) {
        console.error(err);
        next(err);
    }
}

module.exports = viewsPermissions;
