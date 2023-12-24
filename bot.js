class Card {
    constructor(value) {
        this.value = value;
    }
}

class Player {
    constructor() {
        this.hand = [];
        this.points = 0;
    }

    hasCards() {
        return this.hand.length > 0;
    }

    captureCards(cards) {
        this.hand = this.hand.concat(cards);
    }

    removeCard(card) {
        const cardIndex = this.hand.findIndex(c => c === card);
        if (cardIndex !== -1) {
            this.hand.splice(cardIndex, 1);
        }
    }
}

class GameMaster {
    constructor() {
        this.table = [];
    }

    presentDeck(player) {
        const randomIndex = Math.floor(Math.random() * player.hand.length);
        const cutCard = player.hand.splice(randomIndex, 1)[0];
        return cutCard;
    }

    dealCards(player, numCardsPlayer, numCardsOpponent, numCardsTable) {
        const dealtCards = Array.from({ length: 10 }, (_, i) => new Card(i + 1));

        player.hand = player.hand.concat(dealtCards.splice(0, numCardsPlayer));

        if (numCardsOpponent) {
            const opponentHand = dealtCards.splice(0, numCardsOpponent);
        }

        if (numCardsTable) {
            this.table = this.table.concat(dealtCards.splice(0, numCardsTable));
        }
    }

    countPoints(player) {
        player.points += player.hand.length;
    }
}

function canCapture(card, table) {
    return table.some(tableCard => card.value === tableCard.value);
}

function evaluateMoveScore(cards) {
    return cards.reduce((score, card) => score + card.value, 0);
}

function decideMove(player, table) {
    const chosenMove = [];
    const hayaInHand = player.hand.find(card => card.value === 7);
    const hayaOnTable = table.find(card => card.value === 7);

    if (hayaInHand) {
        chosenMove.push(hayaInHand);
    } else if (hayaOnTable) {
        chosenMove.push(hayaOnTable);
    } else {
        const nonHayaCard = player.hand.find(card => card.value !== 7);
        if (nonHayaCard) {
            chosenMove.push(nonHayaCard);
        }
    }

    if (chosenMove.length === 0 && player.hand.length > 0) {
        chosenMove.push(player.hand[0]);
    }

    return chosenMove;
}

function executeMove(player, table, move) {
    if (move.length === 1 && canCapture(move[0], table)) {
        captureCards(player, table, move[0]);
    } else if (move.length === 1) {
        placeCard(player, table, move[0]);
    }
}

function captureCards(player, table, cardToCapture) {
    const capturedCards = [cardToCapture];

    const additionalCards = table.filter(tableCard => tableCard.value === cardToCapture.value);
    capturedCards.push(...additionalCards);

    player.captureCards(capturedCards);
    capturedCards.forEach(capturedCard => {
        const index = table.indexOf(capturedCard);
        if (index !== -1) {
            table.splice(index, 1);
        }
    });
}

function placeCard(player, table, cardToPlace) {
    
    table.push(cardToPlace);
    player.removeCard(cardToPlace);
}

const gameMaster = new GameMaster();
const player = new Player();

gameMaster.dealCards(player, 3, 3, 4);
const cutCard = gameMaster.presentDeck(player);

if (cutCard.value > 5) {
    gameMaster.dealCards(player, 4, 2, 3);
} else {
    gameMaster.dealCards(player, 3, 3);
}

while (player.hasCards()) {
    const move = decideMove(player, gameMaster.table);
    executeMove(player, gameMaster.table, move);
}

gameMaster.countPoints(player);

console.log("Player's Points: " + player.points);
