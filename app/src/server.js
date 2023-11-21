const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const path = require('path');
const Filter = require('bad-words');
const app = express();
const server = createServer(app);
const io = new Server(server);
const format = require('date-format');
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit("welcome","Hello ");
  socket.broadcast.emit("welcome","Add one user ");
  socket.on('chat message', (msg,callback) => {
    const filter = new Filter();
    if(filter.isProfane(msg)) {
      callback("Error Word");
    }else{
       const message = {
      msg,
      time : format.asString('hh:mm', new Date())
    }
    io.emit('Message' , message);

    }
    
   
  });
  socket.on('share location',({latitude,longitude})=>{
    const link =  `http://www.google.com/maps?q=${latitude},${longitude}`;
    io.emit('share location form sever',link);
  })


  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
