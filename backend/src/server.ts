import { createServer } from 'http';
import app from './app';
import SocketService from './socket';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

// Créer le serveur HTTP
const server = createServer(app);

// Initialiser Socket.IO
const socketService = new SocketService(server);

// Exporter l'instance socket pour l'utiliser ailleurs
export { socketService };

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Socket.IO server ready`);
});