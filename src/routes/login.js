const express = require('express');
const router = express.Router();
const LoginController = require('../app/controllers/LoginController');

// khi truy cập GET /login => gọi LoginController.index
router.get('/', LoginController.index);

router.post('/login' , LoginController.login);

router.get('/logout' , LoginController.logout);

module.exports = router;
