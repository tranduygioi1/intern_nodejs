const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    role_name: {type: String, require: true, unique: true},
    
    description: {type: String, require: true},
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }]
},{timestamps: true})
    
module.exports = mongoose.model('Role', RoleSchema, 'roles');