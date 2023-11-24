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
const {getUserList,addUser,removeUser} = require('./app/public/utils/user')
app.use(express.static(path.join(__dirname, './app/public')));

app.get('/', (req, res) => {
  res.render('./app/public/index.html')
})

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on("JoinRoom",({room,username})=>{
    socket.join(room);  
    //chao
    socket.emit("welcome", (room,username));
    socket.broadcast.to(room).emit("welcomex", username);
  //chat
   socket.on('chat message', (msg,callback) => {
     const filter = new Filter();
    if(filter.isProfane(msg)) {
      callback("Error Word");
    }else{
       const message = {
        username:username,
        msg,
        time : format.asString('hh:mm', new Date())
    }
    io.to(room).emit('Message' , message);

    }
  });
  //share location
  socket.on('share location',({latitude,longitude})=>{
    const link =  `http://www.google.com/maps?q=${latitude},${longitude}`;
    io.to(room).emit('share location form sever',link);
  })
  //user online
  const newUser = {
    id : socket.id,
    username:username,
    room:room
  }
  addUser(newUser)
  io.to(room).emit('user online',getUserList(room))
   
  //disconnect
  socket.on('disconnect', () => {
    removeUser(socket.id);
    console.log('user disconnected');
    io.to(room).emit('user online',getUserList(room))
  });
  })
 

  
  
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
  
});
