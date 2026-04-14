const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
  });

  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} | User: ${socket.user.id}`);

    // Join global room
    socket.join('global');

    // Join community rooms
    socket.on('join_community', (communityId) => {
      socket.join(`community:${communityId}`);
      logger.info(`User ${socket.user.id} joined community ${communityId}`);
    });

    socket.on('leave_community', (communityId) => {
      socket.leave(`community:${communityId}`);
    });

    // Join townhall
    socket.on('join_townhall', (townhallId) => {
      socket.join(`townhall:${townhallId}`);
    });

    // Global chat message
    socket.on('global_message', (data) => {
      io.to('global').emit('global_message', {
        ...data,
        sender: socket.user,
        timestamp: new Date(),
      });
    });

    // Community chat message
    socket.on('community_message', (data) => {
      io.to(`community:${data.communityId}`).emit('community_message', {
        ...data,
        sender: socket.user,
        timestamp: new Date(),
      });
    });

    // Townhall message
    socket.on('townhall_message', (data) => {
      io.to(`townhall:${data.townhallId}`).emit('townhall_message', {
        ...data,
        sender: socket.user,
        timestamp: new Date(),
      });
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.room).emit('typing', { user: socket.user, room: data.room });
    });

    socket.on('stop_typing', (data) => {
      socket.to(data.room).emit('stop_typing', { user: socket.user });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
