const { v4: uuidv4 } = require("uuid");

class RoomManager {
    constructor() {
        this.rooms = new Map(); // { roomId: [userSocketId1, userSocketId2, ...] }
    }

    // Create a new room
    createRoom(creatorSocketId) {
        const roomId = uuidv4();
        this.rooms.set(roomId, [creatorSocketId]);
        console.log(`Room ${roomId} created`);
        return roomId;
    }

    // Add a user to a room
    joinRoom(roomId, socketId) {
        if (this.rooms.has(roomId)) {
            this.rooms.get(roomId).push(socketId);
            console.log(`Socket ${socketId} joined room ${roomId}`);
        } else {
            console.log(`Room ${roomId} does not exist`);
        }
    }

    // Remove a user from a room
    leaveRoom(roomId, socketId) {
        if (this.rooms.has(roomId)) {
            const users = this.rooms.get(roomId).filter((id) => id !== socketId);
            this.rooms.set(roomId, users);
            console.log(`Socket ${socketId} left room ${roomId}`);
        }
    }

    // Get all users in a room
    getRoomUsers(roomId) {
        return this.rooms.get(roomId) || [];
    }

    // Delete a room if empty
    deleteRoomIfEmpty(roomId) {
        if (this.rooms.has(roomId) && this.rooms.get(roomId).length === 0) {
            this.rooms.delete(roomId);
            console.log(`Room ${roomId} deleted as it is empty`);
        }
    }
}

module.exports = new RoomManager();
