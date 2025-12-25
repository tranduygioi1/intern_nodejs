const express = require('express');
const HomeController = require('../app/controllers/HomeController');
const LoginController = require('../app/controllers/LoginController');
const checkPermission = require('../app/middlewares/checkPermission');
const viewsPermission = require('../app/middlewares/viewsPermissions');
const router = express.Router();


// module.exports = (app) => {
//   const router = express.Router();
//   //const upload = app.get('upload'); // lấy upload đã set trong index.js

// router.get('/', LoginController.checkLogin, viewsPermission,HomeController.home);

// router.post('/add-user', LoginController.checkLogin, checkPermission('add_user'), HomeController.add_user);

// router.post('/delete-user/:id', LoginController.checkLogin, checkPermission('delete_user'), HomeController.delete_user);

// router.post('/update-user/:id', LoginController.checkLogin, checkPermission('update_user'), HomeController.update_user);

// router.get('/users', LoginController.checkLogin, viewsPermission, checkPermission('assign_role_users'), HomeController.users);

// // router.get('/friends', LoginController.checkLogin, HomeController.friends);

// router.get('/my-profile', LoginController.checkLogin, HomeController.my_profile);

// router.post('/update-profile', LoginController.checkLogin, HomeController.update_profile);

// return router;

// }


router.get('/', LoginController.checkLogin, viewsPermission,HomeController.home);

router.post('/add-user', LoginController.checkLogin, checkPermission('add_user'), HomeController.add_user);

router.post('/delete-user/:id', LoginController.checkLogin, checkPermission('delete_user'), HomeController.delete_user);

router.post('/update-user/:id', LoginController.checkLogin, checkPermission('update_user'), HomeController.update_user);

router.get('/users', LoginController.checkLogin, viewsPermission, checkPermission('assign_role_users'), HomeController.users);

// router.get('/friends', LoginController.checkLogin, HomeController.friends);

router.get('/my-profile', LoginController.checkLogin, HomeController.my_profile);

router.post('/update-profile', LoginController.checkLogin, HomeController.update_profile);

module.exports = router;
