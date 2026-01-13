const Message = require('../../app/models/Message');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'My_VNPT';

module.exports = (io) => {

  // ============================
  // SOCKET AUTH
  // ============================
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
      console.log('❌ Socket auth error:', err.message);
      next();
    }
  });

  // ============================
  // CONNECTION
  // ============================
  io.on('connection', (socket) => {
    const userId = socket.userId;

    if (!userId) return;

    console.log('🟢 User connected:', socket.id, 'userId:', userId);

    // ✅ JOIN ROOM THEO USER ID (CỐT LÕI)
    socket.join(userId.toString());

    // ============================
    // GỬI TIN NHẮN
    // ============================
    socket.on('gui_tin_nhan', async ({ nguoiNhan, noiDung }) => {

      if (!nguoiNhan || !noiDung) return;

      // LƯU DB
      const tinNhan = await Message.create({
        nguoiGui: userId,
        nguoiNhan,
        noiDung
      });

      const payload = {
        nguoiGuiId: userId.toString(),
        nguoiNhanId: nguoiNhan,
        noiDung,
        thoiGian: tinNhan.createdAt
      };

      // GỬI CHO NGƯỜI NHẬN
      io.to(nguoiNhan.toString()).emit('nhan_tin_nhan', payload);

      // GỬI LẠI CHO NGƯỜI GỬI
      io.to(userId.toString()).emit('nhan_tin_nhan', payload);
    });

      //LỊCH SỬ CHAT
      socket.on('load_history', async ({nguoiNhan}) => {
        if (!nguoiNhan) return;

        const tinNhan = await Message.find({
          $or: [
            { nguoiGui: userId, nguoiNhan},
            { nguoiGui: nguoiNhan, nguoiNhan: userId}
          ]
        }).sort({ createdAt: 1});

        socket.emit('chat_history', tinNhan.map(tn => ({
          nguoiGuiId: tn.nguoiGui.toString(),
          noiDung: tn.noiDung,
          thoiGian: tn.createdAt,
        
        })))
      })


    socket.on('disconnect', () => {
      console.log('🔴 User disconnected:', socket.id);
    });
  });
};
