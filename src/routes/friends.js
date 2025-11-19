const express = require('express');
const router = express.Router();
const LoginController = require('../app/controllers/LoginController')
const FriendsController = require('../app/controllers/FriendsController')

router.get('/', LoginController.checkLogin, FriendsController.friends);

router.get('/my-friends', LoginController.checkLogin, FriendsController.my_friends);

router.post('/request/:id', LoginController.checkLogin, FriendsController.sendRequest);

router.post('/cancel/:id', LoginController.checkLogin, FriendsController.cancelRequest);

router.post('/accept/:id', LoginController.checkLogin, FriendsController.acceptRequest);

router.post('/reject/:id', LoginController.checkLogin, FriendsController.rejectRequest);

router.post('/unfriend/:id', LoginController.checkLogin, FriendsController.unfriend);

router.get('/notification', LoginController.checkLogin, FriendsController.notification);


//router.get('/news', LoginController.checkLogin, FriendsController.news);

module.exports = router;
