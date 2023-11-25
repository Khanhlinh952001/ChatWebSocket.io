const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');
const path = require('path');
const Filter = require('bad-words');
const app = express();
const server = createServer(app);
const io = new Server(server);
const format = require('date-format');
const { getUserList, addUser, removeUser } = require('./app/public/utils/user');

// Đường dẫn đến thư mục chứa các tệp tĩnh như CSS, JS, v.v.
const libkd = path.join(__dirname, './app/public');
app.use(express.static(libkd));

// Sự kiện xảy ra khi có người dùng kết nối đến server
io.on('connection', (socket) => {
  console.log('Người dùng đã kết nối');

  // Sự kiện khi một người dùng tham gia một phòng cụ thể
  socket.on("JoinRoom", ({ room, username }) => {
    // Kiểm tra xem tên người dùng và tên phòng có giá trị không trống không
    if (!username || !room) {
      // Xử lý khi tên người dùng hoặc tên phòng không hợp lệ
      return;
    }

    // Người dùng tham gia vào phòng
    socket.join(room);

    // Gửi thông báo chào mừng cho người dùng vừa tham gia
    socket.emit("welcome", username);

    // Gửi thông báo chào mừng đến tất cả người dùng trong phòng (ngoại trừ người gửi)
    socket.broadcast.to(room).emit("welcomex", username);

    // Sự kiện khi có tin nhắn chat được gửi từ người dùng
    socket.on('chat message', (msg, callback) => {
      // Kiểm tra nếu tin nhắn chứa từ ngữ không phù hợp
      const filter = new Filter();
      if (filter.isProfane(msg)) {
        // Gửi thông báo lỗi nếu tin nhắn chứa từ ngữ không phù hợp
        callback("Từ không phù hợp");
      } else {
        // Tạo một đối tượng tin nhắn và gửi đến tất cả người dùng trong phòng
        const message = {
          username: username,
          msg,
          time: format.asString('hh:mm', new Date())
        }
        io.to(room).emit('Message', message);
      }
    });

    // Sự kiện khi có yêu cầu chia sẻ vị trí địa lý
    socket.on('share location', ({ latitude, longitude }) => {
      // Tạo một liên kết đến trang Google Maps với vị trí đã chia sẻ
      const link = `http://www.google.com/maps?q=${latitude},${longitude}`;
      // Gửi liên kết đến tất cả người dùng trong phòng
      io.to(room).emit('share location form sever', link, username);
    });

    // Thêm thông tin người dùng mới vào danh sách
    const newUser = {
      id: socket.id,
      username: username,
      room: room
    }
    addUser(newUser);

    // Gửi thông báo về sự hiện diện của người dùng mới đến tất cả người dùng trong phòng
    io.to(room).emit('user online', getUserList(room));

    // Xử lý sự kiện khi người dùng ngắt kết nối
    socket.on('disconnect', () => {
      // Xóa thông tin người dùng khi người dùng ngắt kết nối
      removeUser(socket.id);
      console.log('Người dùng đã ngắt kết nối');
      // Gửi thông báo về sự thay đổi trong danh sách người dùng đến tất cả người dùng trong phòng
      io.to(room).emit('user online', getUserList(room));
    });
  });
});

// Lắng nghe cổng được chọn hoặc cổng 3000 nếu không có cổng nào được cung cấp
