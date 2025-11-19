const multer = require('multer');
const path = require('path');

// Lưu file tạm trong bộ nhớ RAM (buffer)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.mp4', '.mov'];
    if (!allowed.includes(ext)) {
      return cb(new Error('Chỉ chấp nhận ảnh hoặc video.'));
    }
    cb(null, true);
  },
});

module.exports = upload;
