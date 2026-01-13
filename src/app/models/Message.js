const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new mongoose.Schema({
    nguoiGui: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nguoiNhan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    noiDung: {
        type: String,
        required: true
    }
    }, {
        timestamps: true
    });
module.exports = mongoose.model('Message', messageSchema, "message")

