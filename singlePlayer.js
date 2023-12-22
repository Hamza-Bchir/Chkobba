let deck = []                // This is the main deck
let isPlayerShooter= false;
let isPlayerTurn=true;

// Track of the score
let playerScore = 0;
let aiScore = 0;


let playerHand=[];           // Hands
let aiHand=[];               // Hands
let discardStack=[];         // Hands

let playerConsumedCards=[];
let aiConsumedCards=[];

let isButtonClicked= false;

let isSelectionEnabled = false; 



window.onload = function(){
    createDeck();
    isPlayerShooter();
    console.log(isPlayerShooter);
    shuffleDeck();
    console.log(deck);
    playGame();
}

playGame = () => {
    const playerDiv = document.getElementById('userCards');
    const aiDiv = document.getElementById('aiCards');
    const discardDiv = document.getElementById('discardStack');

    if (isPlayerShooter) {
        let shootedCard = deck.pop();
        addToPlayerHand(shootedCard);
        display();
    }

    keepButton();
    layButton();

    // Use a promise to handle the asynchronous button click
    waitForButtonClick().then(() => {
        toggleSelection();
        console.log("Selection activated");
    });
}

shuffleDeck=()=>{
    for(i=0;i<deck.length;i++){
        let random=Math.floor(Math.random()*deck.length);
        let temp =deck[i];
        deck[i]=deck[random];
        deck[random]=temp;
    }
}
createDeck=()=>{
    const cardType=['C','D','H','S'];
    const cardValue=['A','2','3','4','5','6','7','Q','J','K'];
    for(i=0;i<4;i++){
        for(j=0;j<10;j++){
            deck.push(cardValue[j]+'-'+cardType[i]);
        }
    }
}
isPlayerShooter=()=>{
    isPlayerShooter = Math.floor(Math.random()*2)===1 ? true : false; 
}

layButton=()=>{ // Must the selection functions before, so the player can choose to lay a particular card
    const layButton = document.getElementById('layButton');
    layButton.addEventListener('click', handleLayEvent);
}
function handleLayEvent() {
    isButtonClicked = true;
    const divPlayer = document.getElementById('userCards');

    if (playerHand.length === 0) {
        return;
    }

    let srcImage;

    if (playerHand.length === 1) {
        const imageElements = divPlayer.querySelectorAll('img');
        if (imageElements.length > 0) {
            srcImage = imageElements[0].src;
        }
    } else if (playerHand.length > 1) {
        const cardsSelected = divPlayer.querySelectorAll('.selected');
        if (cardsSelected.length === 1) {
            srcImage = cardsSelected[0].src;
        } else if (cardsSelected.length === 0) {
            alert('You must select at least one card');
        } else {
            alert('You must select only one card to lay');
            cardsSelected.forEach(card => {
                card.classList.remove('selected');
            });
        }
    }

    if (srcImage) {
        addToDiscardStack(getCardFromSrc(srcImage));
        removeFromPlayerHand(getCardFromSrc(srcImage));
    }

    display();
}


keepButton=()=>{
    const keepButton = document.getElementById('keepButton');
    keepButton.addEventListener('click', handleKeepEvent);
}
function handleKeepEvent(){
    isButtonClicked=true;
}

addToPlayerHand=(card)=>{          // Logical add
    if(playerHand.length==3)
        return;
    playerHand.push(card);
}
addToAiHand=(card)=>{              // Logical add
    if(aiHand.length===3)
        return;
    aiHand.push(card);
}
addToDiscardStack=(card)=>{       // Logical add
    if(discardStack.length===4)
        return;
    discardStack.push(card);
}

addToPlayerConsumedCards=(card)=>{
    playerConsumedCards.push(card);
}
addToAiConsumedCards=(card)=>{
    aiConsumedCards.push(card);
}


removeFromPlayerHand=(card)=>{
    indexCard = playerHand.indexOf(card);
    if(indexCard !== -1){
        playerHand.splice(indexCard,1);
    }
}
removeFromAiHand=(card)=>{
    indexCard = aiHand.indexOf(card);
    if(indexCard !== -1){
        aiHand.splice(indexCard,1);
    }
}
removeFromDiscardStack=(card)=>{
    indexCard = discardStack.indexOf(card);
    if(indexCard !== -1){
        discardStack.splice(indexCard,1);
    }
}

toggleSelection=()=>{
    isSelectionEnabled = !isSelectionEnabled;
    const cards = document.querySelectorAll('.playable');

    if(!isSelectionEnabled){
        cards.forEach(card =>{
            card.classList.remove('selected');
            card.removeEventListener('click',handleCardClick);
        })
    }
    else{
        cards.forEach(card=>{
            card.addEventListener('click', handleCardClick);
        })
    }
}
handleCardClick=(event)=>{
    const card = event.currentTarget;
    card.classList.toggle('selected');
}

getCardFromSrc=(cardSrc)=>{
    const startIndex= cardSrc.indexOf('cards/')+'cards/'.length;
    const endIndex= cardSrc.indexOf('.png');
    const cardValue = cardSrc.slice(startIndex,endIndex);
    return cardValue;
}

waitForButtonClick=()=>{
    return new Promise((resolve) => {
        const intervalId = setInterval(() => {
            if (isButtonClicked) {
                clearInterval(intervalId);
                resolve();
            }
        }, 100); // Check every 100 milliseconds
    });
};

deal=()=>{
    for(i=0;i<3;i++){
        if(aiHand.length<3){
            addToAiHand(deck.pop);
        }
        if(playerHand.length<3){
            addToPlayerHand(deck.pop);
        }
        if(discardStack.length<4){
            addToDiscardStack(deck.pop);
        }
    }
}

display=()=>{ // Check hands remove all images and display over again accordingly to the hands's player
    const divPlayer = document.getElementById('userCards');
    const divDiscardStack = document.getElementById('discardStack');
    const divAi = document.getElementById('aiCards');

    divPlayer.innerHTML='';
    divAi.innerHTML='';
    divDiscardStack.innerHTML='';

    for(i=0;i<playerHand.length;i++){
        let cardImg = document.createElement('img');
        cardImg.src ='./images/cards/'+playerHand[i]+'.png';
        divPlayer.append(cardImg);
    }

    for(i=0;i<aiHand.length;i++){
        let cardImg = document.createElement('img');
        cardImg.src ='./images/cards/'+aiHand[i]+'.png';
        divAi.append(cardImg);
    }

    for(i=0;i<discardStack.length;i++){
        let cardImg = document.createElement('img');
        cardImg.src ='./images/cards/'+discardStack[i]+'.png';
        divDiscardStack.append(cardImg);
    }
}