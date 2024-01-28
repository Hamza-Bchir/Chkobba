const http = require('http');
const express = require('express');
const app = express();
const {Server} = require('socket.io');
const { rmSync } = require('fs');
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('./public'));

var users = [];
var isShooter = undefined;
var deck = [];


io.on('connection',(socket)=>{
    console.log(`user ${socket.id} connected`);
    users.push(socket.id);
    socket.on('disconnect',()=>{
        console.log(`User : ${socket.id} disconnected`);
        users=users.filter((element)=>element == socket.id);
    })

    if(users.length >= 2){
        io.to(users[0]).timeout(5000).emit('getGameModeValue',(err,response)=>{
            if(err){
                console.log(`getGameModeValue error:`+ err);
                throw err;
            }
            console.log('getGameModeValue request returned with response : '+response);
        });
        playerShooter();
        createDeck();
        shuffleDeck();
        io.timeout(5000).emit('deck',deck,(err,res)=>{
            if(err){
                console.log('deck emit return error :'+err);
            }
            else{
                console.log(`deck emit returned response :`+res);
            }
        })

    }
    socket.on('gameModeValue',(value)=>{
        io.timeout(5000).emit('startGame',value);
    })

    socket.on('move',(playerHand,aiHand,discardStack,callback)=>{
        console.log('Received all data :'+playerHand+aiHand+discardStack);
        callback('Received move event on the server OK');
        let receiver = socket.id == users[0] ? users[1] : users[0];
        io.to(receiver).timeout(5000).emit('move',playerHand,aiHand,discardStack,(err,res)=>{
            if(err){
                console.log(`Move event emitted from server to client got error :${err}`);
            }
            else{
                console.log(`Move event emitted from server to client was received with status : ${res}`);
            }
        })
    });
});




server.listen(5500,()=>{
    console.log('Server is listening on port 5500 ...');
})


const playerShooter =()=>{
    let shooter = Math.floor(Math.random()*2)=== 1 ? true : false;
    io.to(users[0]).timeout(5000).emit('shooter',shooter,(err,res)=>{if(err){console.log(err)}else{console.log(res)}});
    io.to(users[1]).timeout(5000).emit('shooter',!shooter,(err,res)=>{if(err){console.log(err)}else{console.log(res)}})
    if(shooter){
        isShooter = users[1];
    }
    else{
        isShooter = users[0];
    }}
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