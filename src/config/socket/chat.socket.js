const Message = require('../../app/models/Messenger');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'My_VNPT';

function chatSocket(io) {
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      if (!cookieHeader) return next();

      const cookies = cookie.parse(cookieHeader);
      if (!cookies.token) return next();

      const decoded = jwt.verify(cookies.token, SECRET_KEY);
      socket.userId = decoded.id;

      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', socket => {
    const userId = socket.userId;
    if (!userId) return;

    console.log('🟢 User connected:', socket.id, 'userId:', socket.userId);

    socket.join(userId.toString());

    /* ===== GỬI TIN ===== */
    socket.on('gui_tin_nhan', async ({ nguoiNhan, noiDung }) => {
      if (!nguoiNhan || !noiDung) return;

      const tinNhan = await Message.create({
        nguoiGui: userId,
        nguoiNhan,
        noiDung,
        daDoc: false
      });

      const payload = {
        nguoiGuiId: userId.toString(),
        nguoiNhanId: nguoiNhan.toString(),
        noiDung,
        thoiGian: tinNhan.createdAt
      };

      io.to(nguoiNhan.toString()).emit('nhan_tin_nhan', payload);
      socket.emit('nhan_tin_nhan', payload);

      // 🔔 báo unread
      io.to(nguoiNhan.toString()).emit('unread_message');
    });

    /* ===== LOAD HISTORY ===== */
    socket.on('load_history', async ({ nguoiNhan }) => {
      if (!nguoiNhan) return;

      await Message.updateMany(
        {
          nguoiGui: nguoiNhan,
          nguoiNhan: userId,
          daDoc: false
        },
        { daDoc: true }
      );

      const tinNhan = await Message.find({
        $or: [
          { nguoiGui: userId, nguoiNhan },
          { nguoiGui: nguoiNhan, nguoiNhan: userId }
        ]
      }).sort({ createdAt: 1 });

      socket.emit(
        'chat_history',
        tinNhan.map(tn => ({
          nguoiGuiId: tn.nguoiGui.toString(),
          noiDung: tn.noiDung,
          thoiGian: tn.createdAt
        }))
      );

      io.to(userId.toString()).emit('unread_message');

      socket.on('disconnect', () => {
        console.log('🔴 User disconnected:', socket.id);
      });
      
    });
  });
}

module.exports = chatSocket;
