const TinNhan = require('../models/Messenger');
const User = require('../models/User');
const mongoose = require('mongoose');


class MessageController {

    async index(req, res) {
    const userId = req.user._id.toString();

    const selectedUserId =
      mongoose.Types.ObjectId.isValid(req.params.id)
        ? req.params.id
        : null;

    /* =========================
       1. DANH SÁCH CHAT (LEFT)
    ========================== */
    const conversations = await TinNhan.aggregate([
      {
        $match: {
          $or: [
            { nguoiGui: req.user._id },
            { nguoiNhan: req.user._id }
          ]
        }
      },
      {
        $project: {
          otherUser: {
            $cond: [
              { $eq: ['$nguoiGui', req.user._id] },
              '$nguoiNhan',
              '$nguoiGui'
            ]
          },
          noiDung: 1,
          createdAt: 1,

          // ✅ THÊM ĐOẠN NÀY
          isUnread: {
            $cond: [
              {
                $and: [
                  { $eq: ['$nguoiNhan', req.user._id] },
                  { $eq: ['$daDoc', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $first: '$noiDung' },
          lastTime: { $first: '$createdAt' },
          hasUnread: { $max: '$isUnread' } // ✅ BÂY GIỜ MỚI ĐÚNG
        }
      }
    ]);


    const friendIds = conversations.map(c => c._id);
    const friends = await User.find({ _id: { $in: friendIds } })
      .select('name avatar');

    const friendMap = {};
    friends.forEach(f => {
      friendMap[f._id.toString()] = f;
    });

    const chatList = conversations.map(c => ({
      _id: c._id.toString(),
      name: friendMap[c._id]?.name || 'Unknown',
      avatar: friendMap[c._id]?.avatar,
      lastMessage: c.lastMessage,
      hasUnread: c.hasUnread === 1

    }));
    console.log(chatList);

    /* =========================
       2. LỊCH SỬ CHAT (RIGHT)
    ========================== */
    let messages = [];
    let selectedUser = null;

    if (selectedUserId) {
      // đánh dấu đã đọc
      // await TinNhan.updateMany(
      //   {
      //     nguoiGui: selectedUserId,
      //     nguoiNhan: userId,
      //     daDoc: false
      //   },
      //   { daDoc: true }
      // );

      const rawMessages = await TinNhan.find({
        $or: [
          { nguoiGui: userId, nguoiNhan: selectedUserId },
          { nguoiGui: selectedUserId, nguoiNhan: userId }
        ]
      }).sort({ createdAt: 1 });

      messages = rawMessages.map(m => ({
        noiDung: m.noiDung,
        nguoiGui: m.nguoiGui.toString(),
        thoiGian: m.createdAt
      }));

      selectedUser = await User.findById(selectedUserId)
        .select('name avatar');
    }

    res.render('home/chat', {
      chatList,
      messages,
      selectedUser,
      userId,
      selectedUserId
    });
  }

  /* =========================
     UNREAD COUNT
  ========================== */
  async getUnreadCount(req, res) {
    const count = await TinNhan.countDocuments({
      nguoiNhan: req.user._id,
      daDoc: false
    });

    res.json({ count });
  }




  // async trangChat(req, res) {
  //   const nguoiGuiId = req.user._id.toString();
  //   const nguoiNhanId = req.params.id;

  //   const roomId = [nguoiGuiId, nguoiNhanId].sort().join('_');

  //   const tinNhanRaw = await TinNhan.find({
  //     $or: [
  //       { nguoiGui: nguoiGuiId, nguoiNhan: nguoiNhanId },
  //       { nguoiGui: nguoiNhanId, nguoiNhan: nguoiGuiId }
  //     ]
  //   }).sort({ createdAt: 1 });

  //   const tinNhan = tinNhanRaw.map(tn => ({
  //     noiDung: tn.noiDung,
  //     nguoiGuiId: tn.nguoiGui.toString(),
  //     thoiGian: tn.createdAt
  //   }));

  //   const nguoiNhan = await User.findById(nguoiNhanId)
  //     .select('name avatar');

  //   res.render('home/chat', {
  //     nguoiGuiId,
  //     nguoiNhan,
  //     nguoiNhanId,
  //     roomId,
  //     tinNhan
  //   });
  // }
}

module.exports = new MessageController();
