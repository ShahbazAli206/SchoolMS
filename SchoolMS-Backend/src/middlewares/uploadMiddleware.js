const multer  = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resource_type = 'raw';
    let folder = 'schoolms/docs';

    if (file.mimetype.startsWith('image/')) {
      resource_type = 'image';
      folder = 'schoolms/images';
    } else if (file.mimetype.startsWith('video/')) {
      resource_type = 'video';
      folder = 'schoolms/videos';
    } else if (file.mimetype === 'application/pdf') {
      resource_type = 'raw';
      folder = 'schoolms/pdfs';
    }

    return { folder, resource_type, use_filename: true, unique_filename: true };
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'video/mp4', 'video/mpeg', 'video/quicktime',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`File type '${file.mimetype}' not allowed`), false);
};

const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10) * 1024 * 1024;

const upload = multer({ storage, fileFilter, limits: { fileSize: maxSize } });

module.exports = upload;
