const path   = require('path');
const fs     = require('fs');
const multer = require('multer');

const allowed = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'video/mp4', 'video/mpeg', 'video/quicktime',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const fileFilter = (req, file, cb) => {
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`File type '${file.mimetype}' not allowed`), false);
};

const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10) * 1024 * 1024;

const hasCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

// ── Cloudinary storage ────────────────────────────────────────────────────────
function buildCloudinaryStorage() {
  const { v2: cloudinary }    = require('cloudinary');
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      let resource_type = 'raw', folder = 'schoolms/docs';
      if (file.mimetype.startsWith('image/'))       { resource_type = 'image'; folder = 'schoolms/images'; }
      else if (file.mimetype.startsWith('video/'))  { resource_type = 'video'; folder = 'schoolms/videos'; }
      else if (file.mimetype === 'application/pdf') { folder = 'schoolms/pdfs'; }
      return { folder, resource_type, use_filename: true, unique_filename: true };
    },
  });
}

// ── Local disk storage ────────────────────────────────────────────────────────
function buildDiskStorage() {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => {
      let sub = 'docs';
      if (file.mimetype.startsWith('image/'))       sub = 'images';
      else if (file.mimetype.startsWith('video/'))  sub = 'videos';
      else if (file.mimetype === 'application/pdf') sub = 'pdfs';
      const dir = path.join(uploadDir, sub);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

// ── Wrap multer to fix local disk path → HTTP URL ────────────────────────────
function makeUpload(storage) {
  const base = multer({ storage, fileFilter, limits: { fileSize: maxSize } });

  if (hasCloudinary) return base;

  // For local disk: rewrite the absolute path to an HTTP URL
  const wrap = (handler) => (req, res, next) => {
    handler(req, res, (err) => {
      if (err) return next(err);
      if (req.file && req.file.path && !req.file.path.startsWith('http')) {
        const rel = req.file.path.replace(/\\/g, '/').split('/uploads/').pop();
        const host = process.env.SERVER_URL ||
          `http://localhost:${process.env.PORT || 5000}`;
        req.file.path = `${host}/uploads/${rel}`;
      }
      if (req.files) {
        req.files = req.files.map(f => {
          if (f.path && !f.path.startsWith('http')) {
            const rel = f.path.replace(/\\/g, '/').split('/uploads/').pop();
            const host = process.env.SERVER_URL ||
              `http://localhost:${process.env.PORT || 5000}`;
            f.path = `${host}/uploads/${rel}`;
          }
          return f;
        });
      }
      next();
    });
  };

  return {
    single: (field) => wrap(base.single(field)),
    array:  (field, max) => wrap(base.array(field, max)),
    fields: (fields) => wrap(base.fields(fields)),
    none:   () => wrap(base.none()),
  };
}

const storage = hasCloudinary ? buildCloudinaryStorage() : buildDiskStorage();

if (hasCloudinary) {
  console.log('Upload storage: Cloudinary ☁️');
} else {
  console.log('Upload storage: Local disk 💾  (set CLOUDINARY_* in .env to use cloud storage)');
}

module.exports = makeUpload(storage);
