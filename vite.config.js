import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { Server } from 'socket.io';

const socketIoPlugin = () => ({
  name: 'socket-io-server',
  configureServer(server) {
    if (!server.httpServer) return;
    
    const io = new Server(server.httpServer, {
      cors: { origin: '*' }
    });

    const rooms = new Map(); // roomCode -> { code, hostId, members: [], messages: [] }

    io.on('connection', (socket) => {
      let currentRoom = null;
      let currentUser = null;

      socket.on('join-room', ({ roomCode, userName }) => {
        if (!roomCode || !userName) return;
        currentRoom = roomCode.toUpperCase();
        currentUser = userName;

        socket.join(currentRoom);

        if (!rooms.has(currentRoom)) {
          rooms.set(currentRoom, {
            code: currentRoom,
            hostId: socket.id,
            members: [],
            messages: []
          });
        }

        const room = rooms.get(currentRoom);
        
        // Remove old entry if same socket
        room.members = room.members.filter(m => m.id !== socket.id);
        
        const isHost = room.hostId === socket.id || room.members.length === 0;
        if (isHost) room.hostId = socket.id;

        room.members.push({ id: socket.id, name: userName, isHost });

        // System join message
        const sysMsg = { type: 'system', text: `${userName} joined the room!` };
        room.messages.push(sysMsg);

        // Broadcast to everyone in room
        io.to(currentRoom).emit('room-updated', {
          members: room.members,
          hostId: room.hostId,
          messages: room.messages
        });

        io.to(currentRoom).emit('new-message', sysMsg);
      });

      socket.on('change-name', ({ roomCode, oldName, newName }) => {
        const code = (roomCode || currentRoom || '').toUpperCase();
        const room = rooms.get(code);
        if (room && newName && newName.trim()) {
          const cleanName = newName.trim();
          const member = room.members.find(m => m.id === socket.id);
          if (member) member.name = cleanName;
          currentUser = cleanName;

          const sysMsg = { type: 'system', text: `${oldName} changed name to ${cleanName}` };
          room.messages.push(sysMsg);

          io.to(code).emit('room-updated', {
            members: room.members,
            hostId: room.hostId,
            messages: room.messages
          });
          io.to(code).emit('new-message', sysMsg);
        }
      });

      socket.on('send-chat', ({ roomCode, text }) => {
        const code = (roomCode || currentRoom || '').toUpperCase();
        const room = rooms.get(code);
        if (room && text && text.trim()) {
          const msg = { 
            type: 'user', 
            sender: currentUser || 'Guest', 
            text: text.trim(), 
            timestamp: Date.now() 
          };
          room.messages.push(msg);
          io.to(code).emit('new-message', msg);
        }
      });

      socket.on('send-reaction', ({ roomCode, reaction }) => {
        const code = (roomCode || currentRoom || '').toUpperCase();
        io.to(code).emit('new-reaction', { sender: currentUser, reaction });
      });

      socket.on('sync-action', ({ roomCode, action, time }) => {
        const code = (roomCode || currentRoom || '').toUpperCase();
        const room = rooms.get(code);
        if (room) {
          let text = `${currentUser} ${action === 'pause' ? 'paused' : 'resumed'} party playback`;
          if (action === 'refresh') text = `${currentUser} synced the video players`;
          
          const sysMsg = { type: 'system', text };
          room.messages.push(sysMsg);
          io.to(code).emit('new-message', sysMsg);
          io.to(code).emit('playback-synced', { action, time, sender: currentUser });
        }
      });

      socket.on('sync-media', ({ roomCode, server, season, episode }) => {
        const code = (roomCode || currentRoom || '').toUpperCase();
        const room = rooms.get(code);
        if (room) {
          const sysMsg = { type: 'system', text: `${currentUser} changed video source` };
          room.messages.push(sysMsg);
          io.to(code).emit('new-message', sysMsg);
          io.to(code).emit('media-synced', { server, season, episode, sender: currentUser });
        }
      });

      socket.on('disconnect', () => {
        if (currentRoom && rooms.has(currentRoom)) {
          const room = rooms.get(currentRoom);
          room.members = room.members.filter(m => m.id !== socket.id);

          if (room.members.length === 0) {
            rooms.delete(currentRoom);
          } else {
            if (room.hostId === socket.id) {
              room.hostId = room.members[0].id;
              room.members[0].isHost = true;
            }
            const sysMsg = { type: 'system', text: `${currentUser || 'A watcher'} left the room` };
            room.messages.push(sysMsg);
            io.to(currentRoom).emit('room-updated', {
              members: room.members,
              hostId: room.hostId,
              messages: room.messages
            });
            io.to(currentRoom).emit('new-message', sysMsg);
          }
        }
      });
    });

    console.log('⚡ [CineParty Engine] Real-Time Socket.io Server initialized on Vite server');
  }
});

export default defineConfig({
  plugins: [react(), socketIoPlugin()],
  server: {
    port: 5173,
    open: true
  }
});
