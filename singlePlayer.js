let deck = []                // This is the main deck
let isPlayerShooter = false;
let isPlayerTurn = true;
let isPlayerLastAte = false;

// Track of the score
let playerScore = 0;
let aiScore = 0;

let playerChkobbaCount = 0;
let aiChkobbaCount = 0;

let playerHand = [];           // Hands
let aiHand = [];               // Hands
let discardStack = [];         // Hands

let playerConsumedCards = [];
let aiConsumedCards = [];

let isButtonClicked = false;

let isSelectionEnabled = false;

let gameModeValue = 0;



window.onload = function () {
    quitButton();
    restartButton();
    getGameModeValue();
    isPlayerShooter();
    createDeck();
    shuffleDeck();
    console.log(deck);
    playGame();
}

playGame = async () => {
    layButton();
    while (aiScore < gameModeValue && playerScore < gameModeValue) {
        enableKeepButton();
        await shooterPlay();
        disableKeepButton();
        trayDeal();
        aiConsumedCards=[];
        playerConsumedCards=[];
        aiChkobbaCount=0;
        playerChkobbaCount=0;
        while (deck.length) {
            playersDeal();
            while (aiHand.length || playerHand.length) {
                await playerPlay();
            }
        }
        console.log('isButtonClicked value1 = ',isButtonClicked);
        console.log('this is the discard Stack before ! '+ discardStack)
        trayCleaning();
        console.log("this is the discard stack atfer !" + discardStack)
        updateScore();
        createDeck();
        shuffleDeck();
        displayScore(); //ToDo
        console.log(aiScore, playerScore);
    }
    displayWinner(); //ToDo
    displayButtons(); //ToDo
}

playerPlay = async () => {
    console.log("isButtonClicked :" + isButtonClicked + '  isPlayerTurn :' + isPlayerTurn)
    if (isPlayerTurn) {
        await waitForButtonClick(); // Tout se joue sur la variable isButtonClicked qui doit etre true dans les bonnes conditions
    }
    else {
        let matchingValues = getMatchingValues();
        console.log(matchingValues + '<= Matching values and Bot played');
        console.log('Before ai play' + aiHand)
        if (matchingValues.length == 0) {
            if (aiHand.length == 1) {
                addToDiscardStack(aiHand[0]);
                removeFromAiHand(aiHand[0]);
                console.log('After aiHand' + aiHand)
            }
            else {
                let minCard = getMinValue(aiHand);
                removeFromAiHand(minCard);
                addToDiscardStack(minCard);
            }
        }
        else if (matchingValues.length == 1) {
            if (discardStack.length == 1) { // If last card on the tray Chkobba
                aiChkobbaCount++; // Maybe i can put a function here which will increment the variable and display something on the screen
            }
            removeFromAiHand(matchingValues[0][0]);
            removeFromDiscardStack(matchingValues[0][1]);
            addToAiConsumedCards(matchingValues[0][0]);
            addToAiConsumedCards(matchingValues[0][1]);
            isPlayerLastAte = false;
        }
        else {
            if (searchIndexHaya(matchingValues) != null) {
                let indexHaya = searchIndexHaya(matchingValues);
                removeFromAiHand(matchingValues[indexHaya][0]);
                removeFromDiscardStack(matchingValues[indexHaya][1]);
                addToAiConsumedCards(matchingValues[indexHaya][0]);
                addToAiConsumedCards(matchingValues[indexHaya][1]);
                isPlayerLastAte = false;
            }
            else if (searchIndexBermila(matchingValues) != null) {
                let indexBermila = searchIndexBermila(matchingValues);
                removeFromAiHand(matchingValues[indexBermila][0]);
                removeFromDiscardStack(matchingValues[indexBermila][1]);
                addToAiConsumedCards(matchingValues[indexBermila][0]);
                addToAiConsumedCards(matchingValues[indexBermila][1]);
                isPlayerLastAte = false;
            }
            else if (searchIndexDineri(matchingValues) != null) {
                let indexDineri = searchIndexDineri(matchingValues);
                removeFromAiHand(matchingValues[indexDineri][0]);
                removeFromDiscardStack(matchingValues[indexDineri][1]);
                addToAiConsumedCards(matchingValues[indexDineri][0]);
                addToAiConsumedCards(matchingValues[indexDineri][1]);
                isPlayerLastAte = false;
            }
            else {
                let maxIndex = getMaxValueIndex(matchingValues);
                removeFromAiHand(matchingValues[maxIndex][0]);
                removeFromDiscardStack(matchingValues[maxIndex][1]);
                addToAiConsumedCards(matchingValues[maxIndex][0]);
                addToAiConsumedCards(matchingValues[maxIndex][1]);
            }
        }
        isButtonClicked=false;
        console.log('after ai play : ' + aiHand);
    }
    isPlayerTurn = !isPlayerTurn;
    display();
}

trayCleaning = () => {
    //console.log("This is the ai consumed cards: " + aiConsumedCards + ' And this the player consumed cards: ' + playerConsumedCards)
    //console.log(aiConsumedCards.length+playerConsumedCards.length)
    //console.log('isPlayerLastAte :'+isPlayerLastAte)
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
    //console.log("This is the ai consumed cards: " + aiConsumedCards + ' And this the player consumed cards: ' + playerConsumedCards)
    //console.log(aiConsumedCards.length+playerConsumedCards.length)
    //console.log('isPlayerLastAte :'+isPlayerLastAte)
}

updateScore = () => {
    const diamondCards = playerConsumedCards.filter((card) => getTypeFromCard(card) === 'D');
    const sevenCards = playerConsumedCards.filter((card) => getValueFromCard(card) === 7);
    const sixCards = playerConsumedCards.filter((card) => getValueFromCard(card) === 6);
    const hayaCard = playerConsumedCards.includes('7-D');

    if (diamondCards.length > 5) {
        playerScore++;
    }
    else if (diamondCards.length < 5) {
        aiScore++;
    }

    if (sevenCards.length > 2) {
        playerScore++;
    }
    else if (sevenCards.length === 2) {
        if (sixCards.length > 2) {
            playerScore++;
        }
        else if (sixCards.length < 2) {
            aiScore++;
        }
    }
    else {
        aiScore++;
    }

    if (hayaCard) {
        playerScore++;
    }
    else {
        aiScore++;
    }

    if (playerConsumedCards.length > 20) {
        playerScore++;
    }
    else if (playerConsumedCards.length < 20) {
        aiScore++;
    }
}


shooterPlay = async () => {
    let shootedCard = deck.pop();
    if (isPlayerShooter) {
        addToPlayerHand(shootedCard);
        display();
        await waitForButtonClick();
    }
    else {
        addToAiHand(shootedCard);
        if (getValueFromCard(shootedCard) <= 5) {
            removeFromAiHand(shootedCard);
            addToDiscardStack(shootedCard);
            console.log('Lay', shootedCard);
        }
        isButtonClicked = true;
    }
    toggleSelection();
    display();
    console.log("Selection activated");
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

shuffleDeck = () => {
    for (let i = 0; i < deck.length; i++) {
        let random = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[random];
        deck[random] = temp;
    }
}
createDeck = () => {
    const cardType = ['C', 'D', 'H', 'S'];
    const cardValue = ['A', '2', '3', '4', '5', '6', '7', 'Q', 'J', 'K'];
    for (i = 0; i < 4; i++) {
        for (j = 0; j < 10; j++) {
            deck.push(cardValue[j] + '-' + cardType[i]);
        }
    }
}
isPlayerShooter = () => {
    isPlayerShooter = Math.floor(Math.random() * 2) === 1 ? true : false;
    if (isPlayerShooter === true) {
        isPlayerTurn = true;
    }
}


layButton = () => {
    const layButton = document.getElementById('layButton');
    layButton.addEventListener('click', handleLayEvent);
}
function handleLayEvent() {
    const divPlayer = document.getElementById('userCards');

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
        const playerCardsSelected = divPlayer.querySelectorAll('.selected');
        const stackCardsSelected = document.getElementById('discardStack').querySelectorAll('.selected');
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

    display();
}

function handleKeepEvent() {
    isButtonClicked = true;
    console.log('Player played');
}

enableKeepButton = () => {
    const keepButton = document.getElementById('keepButton');
    keepButton.addEventListener('click', handleKeepEvent);
}

disableKeepButton = () => {
    const keepButton = document.getElementById('keepButton');
    keepButton.removeEventListener('click', handleKeepEvent);
}

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

addToPlayerConsumedCards = (card) => {
    playerConsumedCards.push(card);
}
addToAiConsumedCards = (card) => {
    aiConsumedCards.push(card);
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

toggleSelection = () => {
    isSelectionEnabled = !isSelectionEnabled;
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


playersDeal = () => {
    for (i = 0; i < 3; i++) {
        if (aiHand.length < 3) {
            addToAiHand(deck.pop());
        }
        if (playerHand.length < 3) {
            addToPlayerHand(deck.pop());
        }
    }
    display();
}

trayDeal = () => {
    for (i = 0; i < 4; i++) {
        if (discardStack.length < 4) {
            addToDiscardStack(deck.pop());
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
        cardImg.addEventListener('click', handleCardClick);
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


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

getGameModeValue = () => {
    let url = window.location.search;
    let searchParams = new URLSearchParams(url);
    const modeParam = searchParams.get('gamemode');
    gameModeValue = modeParam.includes('classic') ? 21 : 11
}

getMatchingValues = () => {
    let arrayMatchingValues = [];
    for (let i = 0; i < discardStack.length; i++) {
        aiHand.forEach(card => {
            if (getValueFromCard(card) === getValueFromCard(discardStack[i])) {
                const matchingPair = [card, discardStack[i]];
                arrayMatchingValues.push(matchingPair);
            }
        })
    }
    return arrayMatchingValues;
}

getMatchingValuesTypes = () => {
    let arrayMatchingValuesTypes = [];
    for (let i = 0; i < discardStack.length; i++) {
        aiHand.forEach(card => {
            if ((getValueFromCard(card) == getValueFromCard(discardStack[i]) && (getTypeFromCard(card) == getTypeFromCard(discardStack[i])))) {
                const matchingPair = [card, discardStack[i]];
                arrayMatchingValuesTypes.push(matchingPair);
            }
        })
    }
    return arrayMatchingValuesTypes;
}

getMinValue = (arrayHand) => {
    let minCard = arrayHand[0];
    arrayHand.forEach(card => {
        let currentValue = getValueFromCard(card);
        let minValue = getValueFromCard(minCard);
        if (currentValue < minValue) {
            minCard = card;
        }
    });
    return minCard;
}
getMaxValueIndex = (matchingValues) => {
    let maxIndex = 0;
    for (let i = 0; i < matchingValues.length; i++) {
        if (getValueFromCard(matchingValues[i][0]) > getValueFromCard(matchingValues[maxIndex][0])) {
            maxIndex = i;
        }
    }
    return maxIndex;
}
searchIndexHaya = (matchingArray) => {
    for (let i = 0; i < matchingArray.length; i++) {
        for (let j = 0; j < 2; j++) {
            if (matchingArray[i][j] == '7-D') {
                return i;
            }
        }
    }
    return null;
}

searchIndexBermila = (matchingArray) => {

    for (let i = 0; i < matchingArray.length; i++) {
        for (let j = 0; j < 2; j++) {
            if (getValueFromCard(matchingArray[i][j]) == 7) {
                return i;
            }
        }
    }

    for (let i = 0; i < matchingArray.length; i++) {
        for (let j = 0; j < 2; j++) {
            if (getValueFromCard(matchingArray[i][j]) == 6) {
                return i;
            }
        }
    }

    return null;
} 
searchIndexDineri = (matchingArray) => {
    for (let i = 0; i < matchingArray.length; i++) {
        for (let j = 0; j < 2; j++) {
            if (getTypeFromCard(matchingArray[i][j]) == 'D') {
                return i;
            }
        }
    }
    return null;
}

function displayWinner() {

    var winnerMessageElement = document.getElementById("winner-message");
    var winnerNameElement = document.getElementById("winner-name");

    if(playerScore>aiScore){
        let winnerName = 'ربحت يا وحش';
        winnerNameElement.textContent = winnerName;
    }
    else{
        let winnerName =  'للأسف خسرت';
        winnerNameElement.textContent = winnerName;

    }
    winnerMessageElement.style.display = "block";
}


displayScore =() =>{
    scoreTitleElement= document.getElementById('score');
    scoreTitleElement.innerHTML='Score: Bot : '+aiScore+' Player : '+playerScore;
}

restartButton =()=>{
    const restartElement = document.getElementById('Restart');
    restartElement.addEventListener('click', restartButtonEvent);
}
function restartButtonEvent(){
    location.reload();
    console.log('you clicked')
}

quitButton = ()=>{
    const quitElement = document.getElementById('Quit');
    quitElement.addEventListener('click',quitEvent);
}

function quitEvent(){
    window.location.href='http://127.0.0.1:5500/';
}