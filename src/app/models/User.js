const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    name: { type: String },
    username: { type: String },
    password: { type: String },
    department: { type: String },
    email: { type: String },    
    role: { type: Schema.Types.ObjectId, ref: 'Role' }, 
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    avatar: {type: String},


    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // bạn bè thực sự
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // lời mời đến
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // lời mời đã gửi

});

module.exports = mongoose.model('User', UsersSchema, 'users');
