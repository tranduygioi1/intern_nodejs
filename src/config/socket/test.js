// const { Socket } = require('socket.io');
// const Message = require('../../app/models/Message');

// module.exports = (io) => {
//     io.on('connection', (socket) => {
//         console.log('User Connected: ', socket.id);

//         socket.on('join_room', (roomId) => {
//             socket.join(roomId);
//         })

//         socket.on('gui_tin_nhan', async(data) => {
//             const {nguoiGui, nguoiNhan, noiDung, roomId} = data;

//             const tinNhan = await Message.create({
//                 nguoiGui,
//                 nguoiNhan,
//                 noiDung
//             })

//             io.to(roomId).emit('nhan_tin_nhan', {
//                 nguoiGui,
//                 noiDung,
//                 thoiGian: tinNhan.createdAt
//             })
//         })

//         socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//         });
//     })
// }