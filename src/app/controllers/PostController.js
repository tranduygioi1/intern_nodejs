const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { minioClient, bucketName } = require('../../config/minio');
const crypto = require('crypto');


class PostController {
    // Hiển thị trang news
    async news(req, res, next) {
        try {
            const userId = req.user._id;

            // Lấy lại thông tin user và danh sách bạn bè
            const freshUser = await User.findById(userId)
                .populate('role')
                .populate('friends', '_id name')
                .lean();

        // Danh sách người có thể xem bài viết (bạn bè + chính mình)
            const visibleUserIds = [userId, ...(freshUser.friends?.map(f => f._id) || [])];

        // Lọc bài viết chỉ của user và bạn bè
            const posts = await Post.find({ author: { $in: visibleUserIds } })
                .populate('author')
                .sort({ createdAt: -1 })
                .lean();

            res.render('home/news', { user: freshUser, posts });
        } catch (error) {
            console.error('❌ Lỗi khi tải news:', error);
            next(error);
        }
    }

    // Xử lý đăng bài
    async create(req, res, next) {
        try {
            const { content, type } = req.body;
            const userId = req.user._id;
            let mediaUrl = null;

            // Nếu có file upload
            if (req.file) {
                const file = req.file;
                const fileName = crypto.randomBytes(16).toString('hex');
                const ext = file.originalname.split('.').pop();
                const finalName = `${fileName}.${ext}`;

                // Upload buffer lên MinIO
                await minioClient.putObject(bucketName, finalName, file.buffer, {
                    'Content-Type': file.mimetype,
                });

                mediaUrl = `/media/${finalName}`;
            }

            const newPost = new Post({
                author: userId,
                content,
                type,
                mediaUrl,
            });

            // Lưu bài viết
            await newPost.save();

            // Lấy danh sách bạn bè của người đăng
            const user = await User.findById(userId).populate('friends', '_id name');

            // Tạo thông báo cho từng bạn bè
            const notifications = user.friends.map(friend => ({
                user: friend._id, // người nhận
                sender: userId,   // người đăng bài
                type: 'new_post',
                message: `${user.name || user.username} vừa đăng một bài viết mới.`
            }));

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }

            res.redirect('/news');
        } catch (error) {
            console.error('❌ Upload error:', error);
            next(error);
        }
    }

    // Xóa bài viết
    async delete(req, res) {
        try {
            await Post.findByIdAndDelete(req.params.id);
            res.redirect('/news');
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi khi xóa bài viết');
        }
    }
}

module.exports = new PostController();
