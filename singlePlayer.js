let deck = []                // This is the main deck
let isPlayerShooter= false;

// Track of the score
let playerScore = 0;
let aiScore = 0;


let playerHand=[];           // Hands
let aiHand=[];               // Hands
let discardStack=[];         // Hands

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
        let cardImg = document.createElement('img');
        cardImg.src = './images/cards/' + shootedCard + '.png';
        playerDiv.append(cardImg);
        addToPlayerHand(shootedCard);
    }

    keepButton();
    layButton();

    // Use a promise to handle the asynchronous button click
    const waitForButtonClick = () => {
        return new Promise((resolve) => {
            const intervalId = setInterval(() => {
                if (isButtonClicked) {
                    clearInterval(intervalId);
                    resolve();
                }
            }, 100); // Check every 100 milliseconds
        });
    };

    waitForButtonClick().then(() => {
        console.log("Ci dija");
        toggleSelection();
        console.log("Sahitek ya rajel");
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
function handleLayEvent(){
    const cards = document.querySelectorAll('.playable');
    if(playerHand.length===0){
        return;
    }
    else if(playerHand.length===1){
        const divDiscardStack= document.getElementById('discardStack');
        const divPlayer= document.getElementById('userCards');
        const imageElements=divPlayer.querySelectorAll('img');
        let srcImage=imageElements[0].src;
        divPlayer.removeChild(imageElements[0]);
        let cardImg=document.createElement('img');
        cardImg.src=srcImage;
        divDiscardStack.append(cardImg);
        addToDiscardStack(getCardFromSrc(srcImage));
    }
    else if(playerHand.length >1){
        //Check selected cards => three possibilities
    }
    else if(playerHand.length===0){

    }


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
    if(aiHand.length==3)
        return;
    aiHand.push(card);
}
addToDiscardStack=(card)=>{       // Logical add
    if(discardStack==4)
        return;
    discardStack.push(card);
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