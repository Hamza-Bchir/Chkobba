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
        socket.emit('gameOver',()=>{
        });

    })
    
    if (users.length > 1) {

        io.to(users[0]).emit('getGameModeValue');
        playerShooter();
        createDeck();
        shuffleDeck();
        io.emit('deck',deck);
        
        io.emit('startGame');
        io.on('shooterPlayed',()=>{
            io.emit('shooterDone');
        })
    }

    socket.on('GameModeValue', (value) => {
        gameModeValue = value;
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

const createDeck = () => {
    deck = [];
    const cardType = ['C', 'D', 'H', 'S'];
    const cardValue = ['A', '2', '3', '4', '5', '6', '7', 'Q', 'J', 'K'];
    for (i = 0; i < 4; i++) {
        for (j = 0; j < 10; j++) {
            deck.push(cardValue[j] + '-' + cardType[i]);
        }
    }
}

const shuffleDeck = () => {
    for (let i = 0; i < deck.length; i++) {
        let random = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[random];
        deck[random] = temp;
    }
}