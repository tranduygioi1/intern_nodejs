const User = require('../models/User')
const bcrypt = require('bcrypt')
const fs = require('fs');
const path = require('path');

class HomeController{
    async home(req, res, next){
        try {
            const users = await User.find().lean();
            res.render('home/home', {users})
        } catch (error) {
            next(error);
        }
    }

    async add_user(req, res, next){
        try {
            const {username, email, password} = req.body
            const [checkUsername, checkEmail] = await Promise.all([
                User.findOne({username}),
                User.findOne({email})
            ])
            if(checkUsername){
                return res.send('Error Username');
            }

            if(checkEmail){
                return res.send('Error Email')
            }

            const soVongmahoa = 10;
            const passMahoa = await bcrypt.hash(password, soVongmahoa)

            const user = new User ({
                ...req.body,
                password: passMahoa
            })
            await user.save();

            res.redirect('/home')

        } catch (error) {
            next(error)
        }
    }

    async delete_user(req, res, next){
        try {
            const {id} = req.params
            await User.findByIdAndDelete(id);
            
            res.redirect('/home')
        } catch (error) {
            next(error)
        }
    }

    async update_user (req, res, next){
        try {
            const {id} = req.params;
            const {name, username, department, email} = req.body;
            const [checkEmail, checkUsername] = await Promise.all([
                //Dùng $ne (not equal) để loại chính _id đang update:
                User.findOne({ email, _id: { $ne: id } }),
                User.findOne({ username, _id: { $ne: id } })
            ])

            if(checkUsername){
                return res.send('Error Username');
            }

            if(checkEmail){
                return res.send('Error Email')
            }

            await User.findByIdAndUpdate(id, {name, username, department, email})

            res.redirect('/home')

        } catch (error) {
            next(error)
        }
    }

    
    // [GET] /home/users
    async users(req, res, next) {
        try {
        const q = req.query.q || '';
        let query = {};

        if (q.trim() !== '') {
            const regex = new RegExp(q.trim(), 'i');l
            query = { $or: [{ username: regex }, { email: regex }] };
        }

        // Populate role để hiển thị tên vai trò
        const users = await User.find(query)
            .populate('role')
            .lean();

        res.render('home/users', { users, q });
        } catch (error) {
        next(error);
        }
    }

    // async users(req, res, next){
    //     try {
    //         const q = req.query.q || '';
    //         let query = {}

    //         if(q.trim() !==''){
    //             const regex = new RegExp( q.trim(), 'i');
    //             query = { $or: [{ username: regex}, { email: regex}]};
    //         }
    //         const users = await User.find(query)
    //             .populate('role')
    //             .lean();

    //         res.render('home/users', {users, q});
    //     } catch (error) {
    //         next(error) 
    //     }
    // }

    // async friends(req, res, next) {
    //     try {
    //         const currentUserId = req.user?._id; // nếu bạn có middleware checkLogin
    //         const q = req.query.q || "";

    //         // Lấy danh sách người dùng gợi ý (ngoại trừ chính mình)
    //         const users = await User.find({
    //             _id: { $ne: currentUserId },
    //             $or: [
    //                 { username: new RegExp(q, 'i') },
    //                 { name: new RegExp(q, 'i') },
    //                 { email: new RegExp(q, 'i') }
    //             ]
    //         }).lean();

    //         res.render('home/friends', { users, q });
    //     } catch (error) {
    //         next(error);    
    //     }
    // }


    async my_profile(req, res, next){
        try {
            if (!req.user) {
            return res.redirect('/login');
            }

            const freshUser = await User.findById(req.user._id)
                .populate('role')
                .lean();
            res.render('home/my_profile', { user: freshUser });
        } catch (error) {
            next(error);
        }
    }

    async update_profile(req, res, next){
        try {
            const userId = req.user._id;
            const { name, username, department } = req.body;

            let updateData = {name, username, department};

            if(req.file){
                const avataPath = `/uploads/avatars/${req.file.filename}`;

                //lay thong tin user hien tai
                const currentUser = await User.findById(userId);

                //xoa anh cu
                if(currentUser.avatar){
                    const oldPath = path.join(__dirname, '../../public', currentUser.avatar);
                    if(fs.existsSync(oldPath)){
                        try{
                            fs.unlinkSync(oldPath);
                            console.log('Da xoa anh cu: ', oldPath);
                        } catch(error){
                            console.log('Loi xoa anh cu: ', error);
                        }
                    }
                }
                updateData.avatar = avataPath;
            }

            //update thong tin user
            await User.findByIdAndUpdate(userId, updateData);

            //chuyen huong de middleware check login lai user tu Db
            res.redirect('/home/my-profile');

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new HomeController();