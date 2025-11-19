const Users = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "My_VNPT";

class LoginController {
    // GET /login
    async index(req, res) {
        res.render('login', { 
            layout: 'login_layout', // sử dụng layout riêng
        });
    }

    async login(req, res, next) {
        const { username, password } = req.body;
        console.log('Tài khoản login: ', req.body);

        try {
            //Tìm user + lấy thông tin role (nếu có)
            const user = await Users.findOne({ username }).populate('role');

            if (!user) {
                return res.send('Không tìm thấy tài khoản !!!');
            }

            //Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.send('Sai mật khẩu !!!');
            }

            //Kiểm tra quyền (role)
            if (!user.role) {
                return res.send('Tài khoản của bạn chưa được cấp vai trò, không thể đăng nhập!');
            }

            //Tạo token JWT lưu thông tin người dùng + role
            const token = jwt.sign(
                {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    role: user.role.role_name,
                },
                SECRET_KEY,
                { expiresIn: '1h' }
            );

            //Lưu token vào cookie
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000,
            });

            console.log(`Đăng nhập thành công: ${username} (role: ${user.role.role_name})`);
            res.redirect('/home');

        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            res.status(500).send('Lỗi máy chủ!');
        }
    }



    // async checkLogin(req, res, next){
    //     try {
    //         const token = req.cookies.token;

    //         if(!token){
    //             return res.redirect('/')
    //         }

    //         const giaiMa = jwt.verify(token, SECRET_KEY);
    //         console.log('------Dữ liệu giải mã token-------', giaiMa);

    //         const user = await Users.findById(giaiMa.id);
    //         req.user = user;//luu thong tin cua user vao request
            
    //         res.locals.name = user.name;
    //         res.locals.userInitials = user.name ? user.name.charAt(0).toUpperCase() : 'A';
    //         res.locals.avatar = user.avatar || null; 

    //         next();
        
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    async checkLogin(req, res, next){
        try {
            const token = req.cookies.token;

            //nếu không có token thì quay về login
            if(!token){
                return res.redirect('/');
            }

            let giaiMa;
            try {
                giaiMa = jwt.verify(token, SECRET_KEY);
                console.log('------Dữ liệu giải mã token-------', giaiMa);

            } catch (error) {
                console.error('JWT error');

                //token het han, xoa cookie qua ve login
                res.clearCookie('token');
                return res.redirect('/');
            }

            //tim user trong DB
            const user = await Users.findById(giaiMa.id);
            if(!user){
                res.clearCookie('token');
                return res.redirect('/')
            }

            //luu user vao request
            req.user = user;

            //bien dung cho layout
            res.locals.name = user.name;
            res.locals.userInitials = user.name ? user.name.charAt(0).toUpperCase(): 'A';
            res.locals.avatar = user.avatar || null;

            next()

        } catch (error) {
            console.error('checkLogin error:', error);
            res.clearCookie('token');
            res.redirect('/');
        }
    }

    logout(req, res){
        res.clearCookie('token');
        res.redirect('/')
    }

}

module.exports = new LoginController();
