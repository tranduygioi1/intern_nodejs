const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' }, // người nhận thông báo
  sender: { type: Schema.Types.ObjectId, ref: 'User' }, // người tạo thông báo
  type: { type: String, enum: ['new_post', 'friend_accept'], required: true },
  message: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema, 'notifications');