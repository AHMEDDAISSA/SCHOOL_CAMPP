import multer, { StorageEngine } from 'multer';
import path from 'path';

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads')); 
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = file.mimetype.split('/')[1];
    const filename = `${timestamp}.${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

export default upload;
