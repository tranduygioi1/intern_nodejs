const express = require('express');
const router = express.Router();
const { minioClient, bucketName } = require('../config/minio');

router.get('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;

    // Lấy object từ MinIO
    const objectStream = await minioClient.getObject(bucketName, fileName);

    // Tự động phát hiện content type từ phần mở rộng
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'mp4') res.setHeader('Content-Type', 'video/mp4');
    else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext))
      res.setHeader('Content-Type', `image/${ext}`);
    else res.setHeader('Content-Type', 'application/octet-stream');

    objectStream.pipe(res);
  } catch (err) {
    console.error('❌ Lỗi khi tải file từ MinIO:', err);
    res.status(404).send('Không tìm thấy file');
  }
});

module.exports = router;
