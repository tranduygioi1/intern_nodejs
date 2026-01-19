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
    noiDung: String,

    daDoc: {
        type: Boolean,
        default: false   
    }
    }, {
        timestamps: true
    });
module.exports = mongoose.model('Messenger', messageSchema, "messenger")

