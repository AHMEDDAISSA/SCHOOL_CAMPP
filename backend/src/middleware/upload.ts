import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define uploads directory at the root level (outside src)
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// Also define uploads directory in src for backward compatibility
const srcUploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure both directories exist
[uploadsDir, srcUploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created uploads directory: ${dir}`);
        } catch (error) {
            console.error(`Error creating directory ${dir}:`, error);
        }
    }
});

console.log('Upload middleware initialized with directories:');
console.log('- Main uploads:', uploadsDir);
console.log('- Src uploads:', srcUploadsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use the main uploads directory
        console.log(`Uploading file to: ${uploadsDir}`);
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Get original extension
        const ext = path.extname(file.originalname);
        const filename = uniqueSuffix + ext;
        
        console.log(`Generated filename: ${filename} (original: ${file.originalname})`);
        cb(null, filename);
        
        // Also save a copy to the src uploads directory for backward compatibility
        setTimeout(() => {
            if (fs.existsSync(path.join(uploadsDir, filename))) {
                try {
                    fs.copyFileSync(
                        path.join(uploadsDir, filename),
                        path.join(srcUploadsDir, filename)
                    );
                    console.log(`Copied file to secondary location: ${path.join(srcUploadsDir, filename)}`);
                } catch (err) {
                    console.error('Error copying file to secondary location:', err);
                }
            }
        }, 100);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only image files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.log(`Rejected file of type: ${file.mimetype}`);
        cb(new Error(`Only image files are allowed. Received: ${file.mimetype}`));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

export default upload;