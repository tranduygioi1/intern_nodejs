const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    permission_name: {type: String, require: true, unique: true},
    description: {type: String}
}, {timestamps: true});

module.exports = mongoose.model('Permission', PermissionSchema, 'permissions');