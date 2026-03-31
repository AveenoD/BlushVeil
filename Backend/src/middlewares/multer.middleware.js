import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = path.join(__dirname, '../../public/temp');

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('✅ Created directory:', tempDir);
}

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, tempDir);
    },
    filename: function (req, file, cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// ✅ NEW — Whitelist of allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ✅ NEW — fileFilter: validates MIME type before file is accepted
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true); // ✅ Accept file
    } else {
        // ✅ Reject file with typed Error — caught by Express error handler
        cb(new Error('Only image files (jpeg, png, webp) are allowed'), false);
    }
};

export const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024  // unchanged — 10MB
    },
    fileFilter: fileFilter  // ✅ NEW — added to multer config
});