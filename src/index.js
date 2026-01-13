const express = require('express');
const { engine } = require('express-handlebars');
const router = require('./routes');
const path = require('path');
const app = express();
const port = 3000;
const db = require('./config/db');
const cookieParser = require('cookie-parser');
const moment = require('moment');

// THÊM
const http = require('http');
const { Server } = require('socket.io');

// TẠO HTTP SERVER + SOCKET.IO
const server = http.createServer(app);
const io = new Server(server);

// LOAD SOCKET CHAT
require('./config/socket/chat.socket')(io);

// =======================
// HANDLEBARS
// =======================
app.engine('hbs', engine({
  extname: '.hbs',
  helpers: {
    sum: (a, b) => a + b,
    formatDate: (date) => moment(date).format('HH:mm DD/MM/YYYY'),
    eq: (a, b) => String(a) === String(b),
    includes: (array, value) => {
      if (!array) return false;
      return array.some(v => v.toString() === value.toString());
    }
  }
}));

app.set('views', path.join(__dirname, 'resources/views'));
app.set('view engine', 'hbs');

// =======================
// MIDDLEWARE
// =======================
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// =======================
// DATABASE
// =======================
db.connect();

// =======================
// ROUTES
// =======================
router(app);

// =======================
// ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  res.status(500).send('Có lỗi xảy ra, vui lòng thử lại sau!');
});

// =======================
// START SERVER
// =======================
server.listen(port, () => {
  console.log(`🚀 Server + Socket.IO chạy tại http://localhost:${port}`);
});
