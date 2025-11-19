const Minio = require('minio');

// Cấu hình client MinIO
const minioClient = new Minio.Client({
  endPoint: 'localhost', // hoặc tên service trong docker-compose (vd: 'minio')
  port: 9000,
  useSSL: false,
  accessKey: 'admin',
  secretKey: '12345678',
});

// Tên bucket lưu media
const bucketName = 'uploads';

// Đảm bảo bucket tồn tại
(async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket "${bucketName}" created.`);
    }
  } catch (err) {
    console.error('❌ MinIO init error:', err);
  }
})();

module.exports = { minioClient, bucketName };
