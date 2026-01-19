const express = require('express');
const router = express.Router();
const LoginController = require('../app/controllers/LoginController')
const MessengerController = require('../app/controllers/MessengerController');

router.get('/', LoginController.checkLogin, MessengerController.index);

router.get('/:id', LoginController.checkLogin, MessengerController.index);

router.get('/unread/count', LoginController.checkLogin, MessengerController.getUnreadCount);

module.exports = router;
