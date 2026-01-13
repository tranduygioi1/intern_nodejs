const User = require('../models/User')
const Notification = require('../models/Notification');
const { pluralize } = require('mongoose');

class FriendsController{
    async friends(req, res, next) {
        try {
            
            const userId = req.user?._id; // nếu bạn có middleware checkLogin
            const q = req.query.q || "";
            

            // Lấy thông tin người dùng hiện tại
            const currentUser = await User.findById(userId).lean();
            if (!currentUser) {
                return res.status(404).send('Không tìm thấy người dùng hiện tại');
            }

            // Lấy danh sách lời mời kết bạn gửi đến người hiện tại
            const friendRequests = await User.find({
                _id: { $in: currentUser.friendRequests }
            }).lean();

            // Lấy danh sách người gợi ý (loại bỏ chính mình, bạn bè, các lời mời đã gửi/nhận)
            const excludeIds = [
                userId,
                ...(currentUser.friends || []),
                ...(currentUser.friendRequests || []),
                // Không loại bỏ những người bạn đã gửi lời mời (để họ vẫn hiển thị)
            ];

            const users = await User.find({
                _id: { $nin: excludeIds },
                $or: [
                { username: new RegExp(q, 'i') },
                { name: new RegExp(q, 'i') },
                { email: new RegExp(q, 'i') }
                ]
            }).lean();

            // Trả về view
            res.render('home/friends', {
                users,
                friendRequests,
                currentUser,
                q
            });

        } catch (error) {
            console.error(' Lỗi trong FriendsController.friends:', error);
            next(error);
        }
    }

    async my_friends(req, res, next) {
        try {
            const userId = req.user?._id;
            if (!userId) 
                return res.redirect('/login');

            const user = await User.findById(userId).lean();
            const friends = await User.find({ _id: { $in: user.friends}}).lean();

            res.render('home/my_friends', {
                friends,
                q: req.query.q,
                nguoiGuiId: req.user._id.toString() // ✅ ĐẶT Ở ĐÂY
            });

        } catch (error) {
            next(error);
        }
    }


    // [POST] /friends/request/:id
    async sendRequest(req, res, next) {
        try {
            const fromId = req.user._id;   // người gửi
            const toId = req.params.id;    // người nhận

            if (fromId.equals(toId)) return res.status(400).json({ message: 'Không thể tự kết bạn với chính mình' });

            const [fromUser, toUser] = await Promise.all([
                User.findById(fromId),
                User.findById(toId),
            ]);

            // Nếu đã là bạn bè
            if (fromUser.friends.includes(toId))
                return res.status(400).json({ message: 'Hai bạn đã là bạn bè' });

            // Nếu đã gửi trước đó
            if (fromUser.sentRequests.includes(toId))
                return res.status(400).json({ message: 'Đã gửi lời mời trước đó' });

            // Thêm lời mời
            fromUser.sentRequests.push(toId);
            toUser.friendRequests.push(fromId);

            await Promise.all([fromUser.save(), toUser.save()]);

            res.json({ success: true, message: 'Đã gửi lời mời kết bạn' });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /friends/cancel/:id
    async cancelRequest(req, res, next) {
        try {
            const fromId = req.user._id;
            const toId = req.params.id;

            await Promise.all([
                User.findByIdAndUpdate(fromId, { $pull: { sentRequests: toId } }),
                User.findByIdAndUpdate(toId, { $pull: { friendRequests: fromId } }),
            ]);

            res.json({ success: true, message: 'Đã hủy lời mời kết bạn' });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /friends/accept/:id
    async acceptRequest(req, res, next) {
        try {
            const currentId = req.user._id;
            const fromId = req.params.id;

            await Promise.all([
                User.findByIdAndUpdate(currentId, {
                    $pull: { friendRequests: fromId },
                    $addToSet: { friends: fromId },
                }),
                User.findByIdAndUpdate(fromId, {    
                    $pull: { sentRequests: currentId },
                    $addToSet: { friends: currentId },
                }),
            ]);

            // Gửi thông báo cho người gửi lời mời
            const [currentUser, fromUser] = await Promise.all([
                User.findById(currentId).lean(),
                User.findById(fromId).lean(),
            ]);

            await Notification.create({
                user: fromId, // người nhận thông báo (người được chấp nhận)
                sender: currentId,
                type: 'friend_accept',
                message: `${currentUser.name || currentUser.username} đã chấp nhận lời mời kết bạn của bạn.`
            });
            res.json({ success: true, message: 'Đã chấp nhận lời mời kết bạn' });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /friends/reject/:id
    async rejectRequest(req, res, next) {
        try {
            const currentId = req.user._id;
            const fromId = req.params.id;

            await Promise.all([
                User.findByIdAndUpdate(currentId, { $pull: { friendRequests: fromId } }),
                User.findByIdAndUpdate(fromId, { $pull: { sentRequests: currentId } }),
            ]);

            res.json({ success: true, message: 'Đã từ chối lời mời kết bạn' });
        } catch (error) {
            next(error);
        }
    }

    async unfriend(req, res, next){
        try {
            const currentId = req.user._id;
            const friendId = req.params.id;

            await Promise.all([
                User.findByIdAndUpdate(currentId, {$pull: {friends: friendId}}),
                User.findByIdAndUpdate(currentId, {$pull: {friends: currentId}})
            ])
        } catch (error) {
            next(error);
        }
    }
    
    async unfriend(req, res, next){
        try {
            const currentId = req.user._id; //ng dung hien tai
            const friendId  = req.params.id; // ng muon unfriend

            await Promise.all([
                User.findByIdAndUpdate( currentId, { $pull: { friends: friendId} }),
                User.findByIdAndUpdate( friendId, { $pull: { friends: currentId } })
            ])

            res.json({ success: true, message: 'Đã hủy kết bạn thành công' });

        } catch (error) {
            next(error);
        }
    }

    //thông báo khi có người mới đăng tin.
    async notification(req, res, next){
        try {
            const userId = req.user._id;
            const notifications = await Notification.find({ user: userId })
                .populate('sender', 'name username avatar')
                .sort({ createdAt: -1 })
                .lean();
            res.render('home/notification', { notifications });
        } catch (error) {
            next(error);
        }
    }

 
    // async news(req, res, next){
    //     try {
    //         const freshUser = await User.findById(req.user._id)
    //             .populate('role')
    //             .lean();

    //         res.render('home/news', { user: freshUser })
    //     } catch (error) {
    //         next(error);
    //     }
    // }
    
}

module.exports = new FriendsController();