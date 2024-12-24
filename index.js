const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const roomManager = require("./roomManager");

const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Replace with your frontend URL
        methods: ["GET", "POST"],
    },
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Create a new room and send back the room ID
    socket.on('create-room', ({userId},callback) => {
        const roomId = roomManager.createRoom(userId);
        callback(roomId);
        // socket.emit('room-created', { roomId });
    });

    // Join an existing room
    socket.on('join-room', ({ roomId },callback) => {
        console.log('Rooms:',roomManager.rooms)
        if (roomManager.rooms.has(roomId)) {
            roomManager.joinRoom(roomId, socket.id);
            socket.join(roomId);
            io.to(roomId).emit('user-joined', { userId: socket.id, roomId });
            callback({ success: true, roomId });
        } else {
            callback({ success: false, message: "Room does not exist" });
        }
    });

    // Leave a room
    socket.on('leave-room', ({ roomId }) => {
        roomManager.leaveRoom(roomId, socket.id);
        socket.leave(roomId);
        io.to(roomId).emit('user-left', { userId: socket.id });
        roomManager.deleteRoomIfEmpty(roomId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
        for (const [roomId, users] of roomManager.rooms.entries()) {
            if (users.includes(socket.id)) {
                roomManager.leaveRoom(roomId, socket.id);
                io.to(roomId).emit('user-left', { userId: socket.id });
                roomManager.deleteRoomIfEmpty(roomId);
                break;
            }
        }
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Signaling server running on port ${PORT}`);
});
