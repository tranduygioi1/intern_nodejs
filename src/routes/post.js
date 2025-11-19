const express = require('express');
const router = express.Router();
const PostController = require('../app/controllers/PostController');
const upload = require('../app/middlewares/upload');
const LoginController = require('../app/controllers/LoginController');

// Trang news
router.get('/', LoginController.checkLogin, PostController.news);

// Đăng bài (ảnh / video / text)
router.post('/create', LoginController.checkLogin, upload.single('media'), PostController.create);
//upload.single('media') chỉ 1 field 'media' trùng với name trong form

router.post('/delete/:id', LoginController.checkLogin, PostController.delete);

module.exports = router;
