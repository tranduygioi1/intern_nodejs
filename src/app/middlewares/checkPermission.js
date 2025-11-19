const User = require('../models/User');

function checkPermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Kiểm tra user hoặc role chưa tồn tại
      if (!user || !user.role) {
        return res.status(403).send('Không có quyền truy cập');
      }

      // Populate lại role và permission nếu cần
        const populatedUser = await User.findById(user._id).populate({
        path: 'role',
        populate: { path: 'permissions' },
      });

      const permissions = populatedUser.role?.permissions || [];

      // Nếu không có quyền nào thì chặn
      if (!permissions.some(p => p.permission_name === requiredPermission)) {
        return res.status(403).send('Không có quyền truy cập');
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi máy chủ');
    }
  };
}

module.exports = checkPermission;
