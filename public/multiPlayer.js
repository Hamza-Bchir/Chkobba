const socket = io();
var isShooter = false;
deck = [];
playerHand = [];

/*
socket.on('startGame',()=>{});
socket.on('move',(array)=>{});
socket.on('gameOver',()=>{});

socket.emit('trayDeal',()=>{});
socket.emit('playerDeal',()=>{});
*/



socket.on('deck',(deck)=>{

});

socket.on('shooter',(value)=>{
    console.log('Shooter event received');
    isShooter= value;
    console.log(isShooter)
});

socket.on('getGameModeValue',()=>{
    getGameModeValue();
    socket.emit('GameModeValue',gameModeValue,console.log('gameModeValue event emitted'));
});



getGameModeValue = () => {
    let url = window.location.search;
    let searchParams = new URLSearchParams(url);
    const modeParam = searchParams.get('gamemode');
    gameModeValue = modeParam.includes('classic') ? 21 : 11;
}