const express = require('express');
const router = express.Router();
const RolesController = require('../app/controllers/RolesController')
const LoginController = require('../app/controllers/LoginController')
const checkPermission = require('../app/middlewares/checkPermission')
const viewsPermission = require('../app/middlewares/viewsPermissions') 
// Quản lý role
router.get('/', LoginController.checkLogin, viewsPermission , RolesController.roles);
router.post('/add-roles', LoginController.checkLogin, checkPermission('add_roles'), RolesController.add_roles);
router.post('/delete-roles/:id', LoginController.checkLogin, checkPermission('delete_roles'), RolesController.delete_roles);
router.post('/edit-roles/:id', LoginController.checkLogin, checkPermission('edit_roles'), RolesController.edit_roles);

// Gán vai trò cho user
router.get('/assign-role/:id', LoginController.checkLogin, checkPermission('assign_role'), RolesController.assign_role);
router.post('/assign-role/:id', LoginController.checkLogin, checkPermission('assign_role'), RolesController.update_assign_role);

// Quản lý permission
router.get('/permission', LoginController.checkLogin,viewsPermission, checkPermission('permission') ,RolesController.permission);
router.post('/add-permission', LoginController.checkLogin, checkPermission('add_permission'), RolesController.add_permission);
router.post('/delete-permission/:id', LoginController.checkLogin, checkPermission('delete_permission'), RolesController.delete_permission);
router.post('/edit-permission/:id', LoginController.checkLogin, checkPermission('edit_permission'), RolesController.edit_permission);

// Gán permission cho role
router.get('/assign-permission/:id', LoginController.checkLogin, checkPermission('assign_permission'), RolesController.assign_permission);
router.post('/assign-permission/:id', LoginController.checkLogin, checkPermission('assign_permission'), RolesController.update_assign_permission);

module.exports = router;
