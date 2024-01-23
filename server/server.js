const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server)

app.use(express.static('./public'));
// Server configurations
var users={};


var deck = [];



io.on('connection',(socket)=>{
    console.log('New connection ... ID:'+socket.id);

    users[String(socket.id)]={playerId:socket.id };

    socket.on('disconnect',()=>{
        console.log(`User : ${socket.id} disconnected`);
        socket.emit('gameOver',()=>{});
    })

    if(Object.keys(users).length >1){
        socket.emit('startGame',()=>{});
    }

    socket.on('trayDeal',()=>{});
    socket.on('playersDeal',()=>{});


})


server.listen(5500,()=>{
    console.log('Server is listening on port 5500');
})