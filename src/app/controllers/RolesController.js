const Roles = require('../models/Roles');
const Users = require('../models/User')
const Permissions = require('../models/Permission');

class RolesController{
    async roles(req, res, next) {
        try {
            // chỉ lấy roles, permissions chỉ là mảng ID
            // const roles = await Roles.find().lean();

            // populate để lấy thông tin đầy đủ từ collection Permission
            const roles = await Roles.find()
                .populate('permissions') // lấy cả permission_name thay vì chỉ _id
                .lean();

            res.render('roles/roles', { roles });
        } catch (error) {
            next(error);
        }
    }
    

    async add_roles(req, res, next){
        try {
            const {role_name, description} = req.body;
            const roles = new Roles({role_name, description});
            await roles.save();
            res.redirect('/roles')

        } catch (error) {
            next(error)
        }
    }

    async delete_roles(req, res, next){
        try {
            const{id} = req.params;
            await Roles.findByIdAndDelete(id);
            res.redirect('/roles')

        } catch (error) {
            next(error)
        }
    }

    async edit_roles(req, res, next){
        try {
            const{id} = req.params;
            const{role_name, description} = req.body;
            
            await Roles.findByIdAndUpdate(id, {role_name, description});
            res.redirect('/roles');
        } catch (error) {
            next(error);
        }
    }

    async assign_role(req, res, next) {
        try {
            const { id } = req.params;
            const user = await Users.findById(id).lean();
            if (!user) {
                return res.status(404).send('Không tìm thấy user');
            }

            const roles = await Roles.find().lean();
            res.render('roles/assign_role', { user, roles });
        } catch (error) {
            next(error);
        }
    }

    async update_assign_role(req, res, next) {
        try {
            const { id } = req.params; // user id
            const { role } = req.body; // role id

            // Lấy role kèm permission lưu vào db
            const roleData = await Roles.findById(role).populate('permissions');

            // Lấy danh sách permission id từ role
            const permissionIds = roleData.permissions.map(p => p._id);

            // Cập nhật lại user kèm cả permissions
            await Users.findByIdAndUpdate(id, { 
                role, 
                permissions: permissionIds 
            });

            await Users.findByIdAndUpdate(id, { role });
            res.redirect('/home/users'); // quay lại danh sách user
        } catch (error) {
            next(error);
        }
    }


    async permission(req, res, next){
        try {
            const permission = await Permissions.find().lean();
            res.render('roles/permission', {permission})
        } catch (error) {
            next(error);
        }
    }

    async add_permission(req, res, next){
        try {
            const {permission_name, description} = req.body;
            const permission = new Permissions({permission_name, description});

            await permission.save()
            res.redirect('/roles/permission');

        } catch (error) {
            next(error);
        }
    }

    async delete_permission(req, res, next){
        try {
            const{id} = req.params;
            await Permissions.findByIdAndDelete(id);
            res.redirect('/roles/permission');
            
        } catch (error) {
            next(error);
        }
    }

    async edit_permission(req, res, next){
        try {
            const{id} = req.params;
            const{permission_name, description} = req.body;

            await Permissions.findByIdAndUpdate(id, {permission_name, description});
            res.redirect('/roles/permission')
        } catch (error) {
            next(error);
        }
    }

    async assign_permission(req, res, next){
        try {
            const { id } = req.params;
            // Lấy role theo id
            const role = await Roles.findById(id).lean();
            if (!role) {
                return res.status(404).send('Role không tồn tại');
            }

            // Lấy tất cả permissions
            const permissions = await Permissions.find().lean();

            res.render('roles/assign_permission', { role, permissions });
        } catch (error) {
            next(error);
        }
    }


    async update_assign_permission(req, res, next) {
        try {
            const { id } = req.params;
            let { permissions } = req.body; // có thể là undefined / string / array

            // Nếu không chọn gì -> empty array
            if (!permissions) {
                permissions = [];
            } else if (!Array.isArray(permissions)) {
                // nếu chỉ 1 checkbox thì nó là string -> convert thành array
                permissions = [permissions];
            }

            await Roles.findByIdAndUpdate(id, { permissions });

            return res.redirect('/roles');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RolesController();