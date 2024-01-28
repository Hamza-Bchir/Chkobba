const socket = io();


var isShooter = false;
var gameModeValue = 11;
let deck = [];
let isPlayerLastAte = false;

let playerHand = [];
let discardStack = [];
let aiHand = [];

let isButtonClicked = false;

let aiConsumedCards = [];
let playerConsumedCards =  [];

let aiChkobbaCount = 0;
let playerChkobbaCount = 0;

let aiScore = 0;
let playerScore = 0;

let isSelectionEnabled = false;



socket.on('getGameModeValue',(callback)=>{
    callback('getGameModeValue received OK');
    socket.emit('gameModeValue',11);
})
socket.on('startGame',(arg)=>{
    console.log(`Value received ${arg}`);
    playGame();
})
socket.on('shooter',(value,callback)=>{
    isShooter = value;
    callback('Shooter value received with success :'+value);
})
socket.on('deck',(deckRec,callback)=>{
    deck= deckRec;
    callback('deck received with success !'+deck);
})
socket.on('move',(aiHandRec,playerHandRec,discardStackRec,callback)=>{
    aiHand = aiHandRec;
    playerHand = playerHandRec;
    discardStack = discardStackRec;
    isButtonClicked = true;
    callback('Move event received with success on the client side');
});



async function playGame(){
    layButton();
    while(aiScore < gameModeValue && playerScore < gameModeValue){
        aiConsumedCards = [];
        playerConsumedCards = [];
        aiChkobbaCount = 0;
        playerChkobbaCount = 0;
        await shooterPlay();
        display();
        trayDeal();
        while (deck.length){
            playersDeal();
            while (aiHand.length || playerHand.length){
                await playerPlay();
            }
            trayCleaning(); // This function must be reviewed
            updateScore();
            // Another deck most be received
        }
    }
    displayWinner(); // Emit gameOver may be needed
}


async function playerPlay(){
    if(isShooter){
        console.log('im here');
        console.log(isButtonClicked);
        await waitForButtonClick();
        socket.emit('move',playerHand,aiHand,discardStack,(res)=>{console.log('(Players Play phase)Server responded with status :')});
        console.log('taadit el waitForButton playerPlay')
    }
    else{
        console.log('and i\'m here');
        await waitForButtonClick();
        display();
    }
    console.log('lena')
    isShooter = !isShooter;
}
shooterPlay = async () => {
    let shootedCard = deck.pop();
    if (isShooter) {
        enableKeepButton();
        addToPlayerHand(shootedCard);
        display();
        await waitForButtonClick();
        socket.emit('move',playerHand,aiHand,discardStack,(res)=>{console.log('(shooting phase)Server responded with status :')});
        disableKeepButton();
    }
    else {
        addToAiHand(shootedCard);
        console.log('wselt');
        display();
        await waitForButtonClick();
        console.log('taadit');
        display();
    }
    isShooter = !isShooter;
}
layButton = () => {
    const layButton = document.getElementById('layButton');  // Corrected the ID
    layButton.addEventListener('click', handleLayEvent);
}
function handleLayEvent() {
    const divPlayer = document.getElementById('userCards');
    const playerCardsSelected = divPlayer.querySelectorAll('.selected');
    const stackCardsSelected = document.getElementById('discardStack').querySelectorAll('.selected');
    if(!isShooter){
        alert('It is not your turn yet !');
        playerCardsSelected.forEach(card => {
            card.classList.remove('selected');
        });
        stackCardsSelected.forEach(card => {
            card.classList.remove('selected');
        });

    }
    else{

        if (playerHand.length === 0) {
            return;
        }

        let srcImage = null;

        if (playerHand.length === 1) {
            const imageElements = divPlayer.querySelectorAll('img');
            if (imageElements.length > 0) {
                srcImage = imageElements[0].src;
            }
            isButtonClicked = true;
            console.log('Player played');
        }

        else if (playerHand.length > 1) {
            if (playerCardsSelected.length === 1) {
                if (stackCardsSelected.length > 0) {
                    let somme = 0;
                    let playerCardValue = 0;
                    for (let i = 0; i < stackCardsSelected.length; i++) {
                        playerCardValue = getValueFromSrc(stackCardsSelected[i].src);
                        somme += playerCardValue;
                    }
                    if (somme === getValueFromSrc(playerCardsSelected[0].src)) {
                        //Consommation peut s'effectuer
                        srcImage = playerCardsSelected[0].src;
                        stackCardsSelected.forEach(card => {
                            removeFromDiscardStack(getCardFromSrc(card.src));
                            addToPlayerConsumedCards(getCardFromSrc(card.src));
                        });
                        removeFromPlayerHand(getCardFromSrc(srcImage));
                        addToPlayerConsumedCards(getCardFromSrc(srcImage));
                        srcImage = null;
                        isButtonClicked = true;
                        isPlayerLastAte = true;
                        console.log('Player played');
                    }
                    else {
                        alert('The sum of cards is not equal');
                        playerCardsSelected.forEach(card => {
                            card.classList.remove('selected');
                        });
                        stackCardsSelected.forEach(card => {
                            card.classList.remove('selected');
                        });
                    }
                }
                else {
                    isButtonClicked = true;
                    console.log('Player played');
                    srcImage = playerCardsSelected[0].src;
                }
            } else if (playerCardsSelected.length === 0) {
                alert('You must select at least one card');
            } else {
                alert('You must select only one card to lay');
                playerCardsSelected.forEach(card => {
                    card.classList.remove('selected');
                });
            }
        }

        if (srcImage) {
            addToDiscardStack(getCardFromSrc(srcImage));
            removeFromPlayerHand(getCardFromSrc(srcImage));
        }
    }

    display();
}
display = () => {
    const divPlayer = document.getElementById('userCards');
    const divDiscardStack = document.getElementById('discardStack');
    const divAi = document.getElementById('aiCards');

    divPlayer.innerHTML = '';
    divAi.innerHTML = '';
    divDiscardStack.innerHTML = '';

    for (i = 0; i < playerHand.length; i++) {
        let cardImg = document.createElement('img');
        cardImg.src = './images/cards/' + playerHand[i] + '.png';
        cardImg.classList.add('playable');
        cardImg.addEventListener('click', handleCardClick); // HERE
        divPlayer.append(cardImg);
    }

    for (i = 0; i < aiHand.length; i++) {
        let cardImg = document.createElement('img');
        cardImg.src = './images/cards/BACK.png';
        divAi.append(cardImg);
    }

    for (i = 0; i < discardStack.length; i++) {
        let cardImg = document.createElement('img');
        cardImg.src = './images/cards/' + discardStack[i] + '.png';
        cardImg.classList.add('playable');
        cardImg.addEventListener('click', handleCardClick);
        divDiscardStack.append(cardImg);
    }
}
toggleSelection = () => {
    console.log('Selection is toggled from : '+isSelectionEnabled);
    isSelectionEnabled = !isSelectionEnabled;
    console.log('To '+isSelectionEnabled);
    const cards = document.querySelectorAll('.playable img');

    if (!isSelectionEnabled) {
        cards.forEach(card => {
            card.classList.remove('selected');
            card.removeEventListener('click', handleCardClick);
        })
    }
    else {
        cards.forEach(card => {
            card.addEventListener('click', handleCardClick);
        })
    }
}
waitForButtonClick = () => {
    return new Promise((resolve) => {
        const intervalId = setInterval(() => {
            if (isButtonClicked) {
                clearInterval(intervalId);
                isButtonClicked = false;
                resolve();
            }
        }, 100); // Check every 100 milliseconds
    });
};
addToPlayerHand = (card) => {
    if (playerHand.length == 3)
        return;
    playerHand.push(card);
}
addToAiHand = (card) => {
    if (aiHand.length === 3)
        return;
    aiHand.push(card);
}
addToDiscardStack = (card) => {
    discardStack.push(card);
}
removeFromPlayerHand = (card) => {
    let indexCard = playerHand.indexOf(card);
    if (indexCard !== -1) {
        playerHand.splice(indexCard, 1);
    }
}
removeFromAiHand = (card) => {
    let indexCard = aiHand.indexOf(card);
    if (indexCard !== -1) {
        aiHand.splice(indexCard, 1);
    }
}
removeFromDiscardStack = (card) => {
    let indexCard = discardStack.indexOf(card);
    if (indexCard !== -1) {
        discardStack.splice(indexCard, 1);
    }
}
handleCardClick = (event) => {
    const card = event.currentTarget;
    card.classList.toggle('selected');
}
getCardFromSrc = (cardSrc) => {

    const startIndex = cardSrc.indexOf('cards/') + 'cards/'.length;
    const endIndex = cardSrc.indexOf('.png');
    const card = cardSrc.slice(startIndex, endIndex);
    return card;
}
getValueFromSrc = (cardSrc) => {
    let data = getCardFromSrc(cardSrc).split('-');
    let value = data[0];
    if (isNaN(value)) {
        switch (value) {
            case 'K':
                return 10;
            case 'Q':
                return 8;
            case 'J':
                return 9;
            case 'A':
                return 1;
            default:
                console.log('Error value is NaN and not K,Q,J,A')
        }
    }
    return parseInt(value);
}
getTypeFromSrc = (cardSrc) => {
    let data = getCardFromSrc(cardSrc).split('-');
    let type = data[1];
    return type;
}
getValueFromCard = (card) => {
    let data = card.split('-');
    let value = data[0];
    if (isNaN(value)) {
        switch (value) {
            case 'K':
                return 10;
            case 'Q':
                return 8;
            case 'J':
                return 9;
            case 'A':
                return 1;
            default:
                console.log('Error value is NaN and not K,Q,J,A')
        }
    }
    return parseInt(value);
}
getTypeFromCard = (card) => {
    let data = card.split('-');
    let type = data[1];
    return type;
}
playersDeal = () =>{

    if(isShooter){
        for(i = 0; i<3 ; i++){

            if(playerHand.length < 3){
                addToPlayerHand(deck.pop());
            }

            if (aiHand.length < 3) {
                addToAiHand(deck.pop());
            }
        }
    }
    else{
        for (i = 0; i < 3; i++) {

            if (aiHand.length < 3) {
                addToAiHand(deck.pop());
            }

            if (playerHand.length < 3) {
                addToPlayerHand(deck.pop());
            }
        }
    }
    display();
}
function trayDeal(){
    for (i = 0; i < 4; i++) {
        if (discardStack.length < 4) {
            addToDiscardStack(deck.pop());
        }
    }
    display();
}
quitButton = ()=>{
    const quitElement = document.getElementById('Quit');
    quitElement.addEventListener('click',quitEvent);
}
function quitEvent(){
    window.location.href='http://127.0.0.1:5500/';
}
enableKeepButton = () => {
    const keepButton = document.getElementById('keepButton');
    keepButton.addEventListener('click', handleKeepEvent);
}
disableKeepButton = () => {
    const keepButton = document.getElementById('keepButton');
    keepButton.removeEventListener('click', handleKeepEvent);
}
function handleKeepEvent() {
    isButtonClicked = true;
    console.log('Player played');
}
addToPlayerConsumedCards = (card) => {
    playerConsumedCards.push(card);
}
addToAiConsumedCards = (card) => {
    aiConsumedCards.push(card);
}
getGameModeValue = () => {
    let url = window.location.search;
    let searchParams = new URLSearchParams(url);
    const modeParam = searchParams.get('gamemode');
    gameModeValue = modeParam.includes('classic') ? 21 : 11;
}
trayCleaning = () => {
    if (isPlayerLastAte) {
        while (discardStack.length) {
            addToPlayerConsumedCards(discardStack[0])
            removeFromDiscardStack(discardStack[0])
        }
    }
    else {
        while (discardStack.length) {
                addToPlayerConsumedCards(discardStack[0])
                removeFromDiscardStack(discardStack[0])
        }
    }
    display();
}