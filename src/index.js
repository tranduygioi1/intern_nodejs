const express = require('express');
const { engine } = require('express-handlebars');
const router = require('./routes');
const path = require('path');
const app = express();
const port = 3000;
const db = require('./config/db');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const multer = require('multer');
const fs = require('fs'); 


// //CẤU HÌNH MULTER CHO UPLOAD ẢNH 
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(__dirname, 'public/uploads/avatars');
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     const filename = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
//     cb(null, filename);
//   },
// });


// const upload = multer({ storage });
// app.set('upload', upload); // để các controller hoặc router lấy dùng

  
// Engine
app.engine('hbs', engine({
  extname: '.hbs',
  helpers: {
    sum: (a, b) => a + b,

    formatDate: (date) => {
      return moment(date).format('HH:mm DD/MM/YYYY');
    },
     eq: (a, b) => String(a) === String(b), // so sánh _id
     
    includes: (array, value) => {
      if (!array) return false;
      return array.some(v => v.toString() === value.toString());
    }
  }
}));

app.set('views', path.join(__dirname, 'resources/views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
  
// Middleware parse form đặt trước router
// tăng giới hạn body lên 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
db.connect(); 

// Routes
router(app);

// Middleware xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  res.status(500).send('Có lỗi xảy ra, vui lòng thử lại sau!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
