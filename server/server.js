const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server)

app.use(express.static('./public'));
// Server configurations


var users = [];

var deck = [];
var gameModeValue=11; //Default value


io.on('connection',async (socket)=>{

    console.log('New connection ... ID:'+socket.id);
    users.push(socket.id);

    socket.on('disconnect',()=>{
        console.log(`User : ${socket.id} disconnected`);
        users=users.filter((element)=>element == socket.id);
        socket.emit('gameOver',()=>{});

    })
    
    if (users.length > 1) {

        io.to(users[0]).emit('getGameModeValue');

         io.emit('startGame', () => {

            playerShooter();
        });
    }

    socket.on('GameModeValue', (value) => {
        gameModeValue = value;
        console.log('step 2');
        console.log(gameModeValue);
    });
});



server.listen(5500,()=>{
    console.log('Server is listening on port 5500');
});





const playerShooter =()=>{
    let shooter = Math.floor(Math.random()*2)=== 1 ? true : false;
    console.log(shooter);
    io.to(users[0]).emit('shooter',shooter);
    io.to(users[1]).emit('shooter',!shooter);
}


// The server will send the deck once shuffled so that each individual client use it whithout sending requests each time
