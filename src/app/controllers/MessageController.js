const TinNhan = require('../models/Message');
const User = require('../models/User');

class MessageController {
  async trangChat(req, res) {
    const nguoiGuiId = req.user._id.toString();
    const nguoiNhanId = req.params.id;

    const roomId = [nguoiGuiId, nguoiNhanId].sort().join('_');

    const tinNhanRaw = await TinNhan.find({
      $or: [
        { nguoiGui: nguoiGuiId, nguoiNhan: nguoiNhanId },
        { nguoiGui: nguoiNhanId, nguoiNhan: nguoiGuiId }
      ]
    }).sort({ createdAt: 1 });

    const tinNhan = tinNhanRaw.map(tn => ({
      noiDung: tn.noiDung,
      nguoiGuiId: tn.nguoiGui.toString(),
      thoiGian: tn.createdAt
    }));

    const nguoiNhan = await User.findById(nguoiNhanId)
      .select('name avatar');

    res.render('home/chat', {
      nguoiGuiId,
      nguoiNhan,
      nguoiNhanId,
      roomId,
      tinNhan
    });
  }
}

module.exports = new MessageController();
