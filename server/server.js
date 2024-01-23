const express= require('express');
const http = require('http');
const {Server} = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server)

// 
app.use(express.static('./public'));





io.on('connection',(socket)=>{
    console.log('A is connected');
})

server.listen(5500,()=>{
    console.log('Server is listening on port 5500');
})