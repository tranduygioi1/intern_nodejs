const express = require('express');
const router = express.Router();
const LoginController = require('../app/controllers/LoginController')
const MessageController = require('../app/controllers/MessageController');


router.get('/:id', LoginController.checkLogin, MessageController.trangChat);

module.exports = router;
