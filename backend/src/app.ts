import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import authRouter from "./routes/authRoutes";
import campRouter from "./routes/campRoutes";
import postRouter from "./routes/postRoutes";
import categoryRouter from "./routes/categoryRoutes";
import adminRouter from "./routes/categoryRoutes";
import userRouter from "./routes/userRoutes";
import dotenv from "dotenv";
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import upload from "./middleware/upload";

dotenv.config();

const app: Application = express();

app.post('/test-upload', upload.single('image'), (req: Request, res: Response): void => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

        console.log('File uploaded successfully:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            url: imageUrl
        });

        res.json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                url: imageUrl
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));

// Middleware pour parser le JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORRECTION : Créer le dossier uploads avec le bon chemin
const uploadsDir = path.join(__dirname, '..', 'uploads');
console.log('Main uploads directory path:', uploadsDir);

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created main uploads directory:', uploadsDir);
}
const srcUploadsDir = path.join(__dirname, 'uploads');
console.log('Src uploads directory path:', srcUploadsDir);

if (!fs.existsSync(srcUploadsDir)) {
    fs.mkdirSync(srcUploadsDir, { recursive: true });
    console.log('Created src uploads directory:', srcUploadsDir);
}

// Log existing files in both directories
try {
    const mainFiles = fs.readdirSync(uploadsDir);
    console.log('Files in main uploads directory:', mainFiles);
    
    const srcFiles = fs.readdirSync(srcUploadsDir);
    console.log('Files in src uploads directory:', srcFiles);
    
    // If files exist in src/uploads but not in main uploads, copy them
    if (srcFiles.length > 0 && mainFiles.length === 0) {
        srcFiles.forEach(file => {
            const srcPath = path.join(srcUploadsDir, file);
            const destPath = path.join(uploadsDir, file);
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied file from ${srcPath} to ${destPath}`);
        });
    }
} catch (error) {
    console.error('Error reading/copying uploads directories:', error);
}

// IMPROVED: Enhanced logging middleware for static files
app.use('/uploads', (req: Request, res: Response, next: NextFunction): void => {
    const requestedFile = req.path.startsWith('/') ? req.path.substring(1) : req.path;
    
    // Try both upload directories
    const mainFilePath = path.join(uploadsDir, requestedFile);
    const srcFilePath = path.join(srcUploadsDir, requestedFile);
    
    const mainFileExists = fs.existsSync(mainFilePath);
    const srcFileExists = fs.existsSync(srcFilePath);
    
    console.log(`[STATIC REQUEST] URL: ${req.originalUrl}`);
    console.log(`[STATIC REQUEST] Requested file: ${requestedFile}`);
    console.log(`[STATIC REQUEST] Main file exists: ${mainFileExists} (${mainFilePath})`);
    console.log(`[STATIC REQUEST] Src file exists: ${srcFileExists} (${srcFilePath})`);
    
    // If file exists in src but not in main, copy it
    if (!mainFileExists && srcFileExists) {
        try {
            fs.copyFileSync(srcFilePath, mainFilePath);
            console.log(`[STATIC REQUEST] Copied file from ${srcFilePath} to ${mainFilePath}`);
        } catch (err) {
            console.error(`[STATIC REQUEST] Error copying file:`, err);
        }
    }
    
    next();
});

// CORRECTION : Configuration des fichiers statiques avec middleware de debugging
// app.use('/uploads', (req: Request, res: Response, next: NextFunction): void => {
//     const requestedFile = req.path.startsWith('/') ? req.path.substring(1) : req.path;
//     const fullFilePath = path.join(uploadsDir, requestedFile);
    
//     console.log(`[STATIC REQUEST] URL: ${req.originalUrl}`);
//     console.log(`[STATIC REQUEST] Path: ${req.path}`);
//     console.log(`[STATIC REQUEST] Requested file: ${requestedFile}`);
//     console.log(`[STATIC REQUEST] Full file path: ${fullFilePath}`);
//     console.log(`[STATIC REQUEST] File exists: ${fs.existsSync(fullFilePath)}`);
    
//     if (fs.existsSync(fullFilePath)) {
//         const stats = fs.statSync(fullFilePath);
//         console.log(`[STATIC REQUEST] File size: ${stats.size} bytes`);
//         console.log(`[STATIC REQUEST] File modified: ${stats.mtime}`);
//     } else {
//         console.log(`[STATIC REQUEST] File not found: ${fullFilePath}`);
        
//         try {
//             const availableFiles = fs.readdirSync(uploadsDir);
//             console.log(`[STATIC REQUEST] Available files:`, availableFiles);
//         } catch (error) {
//             console.error(`[STATIC REQUEST] Error reading directory:`, error);
//         }
//     }
    
//     next();
// });

// Configuration des fichiers statiques
app.use('/uploads', express.static(uploadsDir, {
    maxAge: '1d',
    setHeaders: (res: Response): void => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

app.use('/uploads', express.static(srcUploadsDir, {
    maxAge: '1d',
    setHeaders: (res: Response): void => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

// Middleware pour gérer les erreurs 404 sur les fichiers statiques
app.use('/uploads', (req: Request, res: Response): void => {
    const requestedFile = req.path.startsWith('/') ? req.path.substring(1) : req.path;
    console.log(`[404] File not found: ${req.originalUrl}`);
    
    // Show information about both directories
    const mainFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    const srcFiles = fs.existsSync(srcUploadsDir) ? fs.readdirSync(srcUploadsDir) : [];
    
    res.status(404).json({
        error: 'File not found',
        requestedFile: requestedFile,
        mainUploadsPath: uploadsDir,
        srcUploadsPath: srcUploadsDir,
        mainDirectoryFiles: mainFiles,
        srcDirectoryFiles: srcFiles
    });
});;

// Middleware de logging général
app.use((req: Request, res: Response, next: NextFunction): void => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// CORRECTION : Route de test avec types corrects
app.get('/test', (req: Request, res: Response): void => {
    res.json({
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uploadsPath: uploadsDir,
        uploadsExists: fs.existsSync(uploadsDir),
        availableFiles: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : []
    });
});

// CORRECTION : Route pour lister les fichiers uploads avec types corrects
app.get('/uploads-list', (req: Request, res: Response): void => {
    try {
        if (!fs.existsSync(uploadsDir)) {
            res.status(404).json({
                error: 'Uploads directory not found',
                path: uploadsDir
            });
            return;
        }
        
        const files = fs.readdirSync(uploadsDir).map((file: string) => {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
            return {
                name: file,
                size: stats.size,
                modified: stats.mtime,
                url: `${req.protocol}://${req.get('host')}/uploads/${file}`
            };
        });
        
        res.json({
            uploadsPath: uploadsDir,
            totalFiles: files.length,
            files: files
        });
    } catch (error) {
        console.error('Error listing uploads:', error);
        res.status(500).json({
            error: 'Error listing files',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Routes de l'API
app.use('/auth', authRouter);
app.use('/camp', campRouter);
app.use('/post', postRouter);
app.use('/cat', categoryRouter);
app.use('/admin', adminRouter);
app.use('/user', userRouter);

// CORRECTION : Route racine avec types corrects
app.get('/', (req: Request, res: Response): void => {
    res.json({
        message: 'API Server is running',
        version: '1.0.0',
        endpoints: {
            auth: '/auth',
            users: '/user',
            posts: '/post',
            camps: '/camp',
            categories: '/cat',
            admin: '/admin',
            uploads: '/uploads',
            test: '/test',
            uploadsList: '/uploads-list'
        }
    });
});

// CORRECTION : Middleware pour gérer les routes non trouvées avec types corrects
app.use('*', (req: Request, res: Response): void => {
    console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'Route not found',
        method: req.method,
        path: req.originalUrl,
        availableRoutes: [
            'GET /',
            'GET /test',
            'GET /uploads-list',
            'GET /uploads/:filename',
            '/auth/*',
            '/user/*',
            '/post/*',
            '/camp/*',
            '/cat/*',
            '/admin/*'
        ]
    });
});

// CORRECTION : Middleware de gestion d'erreurs avec types corrects
app.use((error: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error('Server Error:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
});

// Connexion à la base de données
mongoose.connect(process.env.MONGO_URI as string)
.then(() => {
    console.log('✅ Connected to MongoDB');
})
.catch((error) => {
    console.error('❌ Error connecting to MongoDB:', error);
});

// Gestion des erreurs MongoDB
mongoose.connection.on('error', (error: Error) => {
    console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await mongoose.connection.close();
    process.exit(0);
});

export default app;