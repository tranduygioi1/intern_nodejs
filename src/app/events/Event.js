//events/Event.js

const EventsEmitter = require('events');

class Event extends EventsEmitter{};
const eventEmitter = new Event();

//lắng nghe sự kiện
eventEmitter.on('userAdded', (user) => {
    console.log(`User mới được thêm: ${user.username} - ${user.email}`);
})

eventEmitter.on('userDeleted', (id) => {
    console.log(`User đã được xóa: ${id}`);
})

eventEmitter.on('userUpdated', (id) => {
    console.log(`User đã được cập nhật: ${id}`);
})

eventEmitter.on('profileUpdated', (user) => {
  console.log(
    `Hồ sơ được cập nhật: ${user._id} - tên: ${user.name} - phòng ban: ${user.department}`
  );
})


module.exports = eventEmitter;