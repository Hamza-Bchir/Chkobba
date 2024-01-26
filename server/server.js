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


io.on('connection', (socket)=>{

    console.log('New connection ... ID:'+socket.id);
    users.push(socket.id);

    socket.on('disconnect',()=>{
        console.log(`User : ${socket.id} disconnected`);
        users=users.filter((element)=>element == socket.id);
        //socket.emit('gameOver',()=>{
        //});

    })
    
    if (users.length > 1) { // Problem may be with users.length and how it is implemented

        io.to(users[0]).emit('getGameModeValue');
        playerShooter();
        createDeck();
        shuffleDeck(); // GameModeValue is received from user[0] but never send to user[1];
        io.emit('deck',deck);
    }

    socket.on('GameModeValue', (value) => {
        io.emit('startGame',value);
    });

    socket.on('move',(playerHand, aiHand, tray,callback)=>{
        console.log(`this socket ${socket.id}`);
        console.log('something was received here');
        callback();
        io.emit('move',playerHand, aiHand, tray,(acknowledgmentData)=>{
            console.log('Emission to all clients acknowledged with data:'+acknowledgmentData);
        });
    })
});



server.listen(5500,()=>{
    console.log('Server is listening on port 5500');
});





const playerShooter =()=>{
    let shooter = Math.floor(Math.random()*2)=== 1 ? true : false;
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