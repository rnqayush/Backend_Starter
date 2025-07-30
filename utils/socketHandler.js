const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join user to their room
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // Join business room
    socket.on('joinBusiness', (businessId) => {
      socket.join(`business_${businessId}`);
      console.log(`User joined business room: ${businessId}`);
    });

    // Handle booking updates
    socket.on('bookingUpdate', (data) => {
      socket.to(data.businessId).emit('bookingUpdate', data);
    });

    // Handle order updates
    socket.on('orderUpdate', (data) => {
      socket.to(data.businessId).emit('orderUpdate', data);
    });

    // Handle new messages
    socket.on('newMessage', (data) => {
      socket.to(data.recipientId).emit('newMessage', data);
    });

    // Handle notifications
    socket.on('notification', (data) => {
      socket.to(data.userId).emit('notification', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;

