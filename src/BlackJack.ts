export type Card = {
    id: string,
    suit?: string,
    rank?: string,
    imageFileName: string,
}

export type PlayStatus = {
    playerCards: Card[],
    dealerCards: Card[],
    playerPoints: number,
    dealerPoints: number,
    credits: number,
    status: string,
}

const INITIAL_CREDITS: number = 2000
const NUMBER_OF_DECKS: number = 6
const BLACKJACK_RATE: number = 1.5
const DEALER_DRAW_THRESHOLD: number = 17

const TURNED_CARD: Card = {
    id: 'back',
    imageFileName: 'back',
}


export default class BlackJack {
    static Status = {
        DEAL: 'DEAL',
        HIT: 'HIT',
        BLACKJACK: 'BLACKJACK',
        WIN: 'WIN',
        BUST: 'BUST',
        LOSE: 'LOSE',
        PUSH: 'PUSH',
    }

    private static _instance: BlackJack

    private _deck: Card[] = []
    private _dealerCards: Card[] = []
    private _playerCards: Card[] = []
    private _credits: number = 0
    private _bet: number = 0

    private constructor() {
        this._credits = INITIAL_CREDITS
        this.initializeDeck()
    }

    static get instance(): BlackJack {
        if(!BlackJack._instance) {
            BlackJack._instance = new BlackJack()
        }
        return BlackJack._instance
    }

    private initializeDeck(): void {
        const SUITS = ['clubs', 'hearts', 'spades', 'diamonds']
        const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace']

        for(let deckNumber = 0; deckNumber < NUMBER_OF_DECKS; deckNumber++) {
            SUITS.forEach(suit => {
                RANKS.forEach(rank => {
                    const imageFileName = `${suit}_${rank}`

                    this._deck.push({
                        id: `${deckNumber}_${imageFileName}`,
                        suit,
                        rank,
                        imageFileName,
                    })
                })
            })
        }
    }

    private shuffleDeck() {
        const shuffledCards: Card[] = []

        while(this._deck.length > 0) {
            const randomIndex = Math.floor(Math.random() * this._deck.length)
            shuffledCards.push(this._deck[randomIndex])
            this._deck.splice(randomIndex, 1)
        }
        this._deck = shuffledCards
    }

    /**
     * Deals 2 cards to the player and dealer.
     * @param bet The player bet.
     * @returns Result type object with information on the turn.
     */
    deal(bet: number): PlayStatus {
        // put player's cards back on deck and shuffles it
        this.unshiftPlayersCardsOnDeck()
        this.shuffleDeck()
        
        // deals 2 cards for each the player and the dealer
        for(let cardsPerPlayer = 0; cardsPerPlayer < 2; cardsPerPlayer++) {
            this.hitPlayer()
            this.hitDealer()
        }

        // sets bet
        this._credits -= bet
        this._bet = bet

        // verify hand status and returns result
        const playerPoints: number = this.calculatePoints(this._playerCards)
        let dealerPoints: number = this.calculatePoints([this._dealerCards[0]])
        let dealerCards: Card[] = [this._dealerCards[0], TURNED_CARD]
        let status: string = BlackJack.Status.DEAL

        if(this.isBlackjack(playerPoints)) {
            status = BlackJack.Status.BLACKJACK
            this._credits += this._bet * (BLACKJACK_RATE + 1)
            dealerPoints = this.calculatePoints(this._dealerCards)
            dealerCards = this._dealerCards
        }

        return {
            playerCards: this._playerCards,
            dealerCards,
            playerPoints,
            dealerPoints,
            credits: this._credits,
            status,
        }
    }

    /**
     * Gives one card to the player.
     * @returns Result type object with information on the turn.
     */
    hit(): PlayStatus {
        this.hitPlayer()

        // verify hand status and returns result
        const playerPoints: number = this.calculatePoints(this._playerCards)
        let dealerPoints: number = this.calculatePoints([this._dealerCards[0]])
        let dealerCards: Card[] = [this._dealerCards[0], TURNED_CARD]
        let status: string = BlackJack.Status.HIT

        if(this.isBust(playerPoints)) {
            status = BlackJack.Status.BUST
            dealerPoints = this.calculatePoints(this._dealerCards)
            dealerCards = this._dealerCards
        } else if(this.isBlackjack(playerPoints)) {
            return this.stand(playerPoints)
        }

        return {
            playerCards: this._playerCards,
            dealerCards,
            playerPoints,
            dealerPoints,
            credits: this._credits,
            status,
        }
    }

    /**
     * Doubles the player's bet, gives him one card and ends his turn.
     * @returns Result type object with information on the turn.
     */
    double(): PlayStatus {
        this.hitPlayer()

        // sets bet
        this._credits -= this._bet
        this._bet *= 2

        // verify hand status and returns result
        const playerPoints: number = this.calculatePoints(this._playerCards)

        if(!this.isBust(playerPoints)) {
            return this.stand(playerPoints)
        }

        return {
            playerCards: this._playerCards,
            dealerCards: this._dealerCards,
            playerPoints,
            dealerPoints: this.calculatePoints(this._dealerCards),
            credits: this._credits,
            status: BlackJack.Status.BUST,
        }
    }

    /**
     * Ends player's turn and executes dealer's turn.
     * @param playerPoints Optional. The player points.
     * @returns Result type object with information on the turn.
     */
    stand(playerPoints: number = this.calculatePoints(this._playerCards)): PlayStatus {
        // dealer plays
        let dealerPoints: number = this.calculatePoints(this._dealerCards)

        while(dealerPoints < DEALER_DRAW_THRESHOLD) {
            this.hitDealer()
            dealerPoints = this.calculatePoints(this._dealerCards)
        }

        // verify hand status and returns result
        let status: string = BlackJack.Status.LOSE

        if(this.isBust(dealerPoints) || dealerPoints < playerPoints) {
            status = BlackJack.Status.WIN
            this._credits += this._bet * 2
        } else if(dealerPoints === playerPoints) {
            status = BlackJack.Status.PUSH
            this._credits += this._bet
        }

        return {
            playerCards: this._playerCards,
            dealerCards: this._dealerCards,
            playerPoints,
            dealerPoints,
            credits: this._credits,
            status,
        }
    }

    private hitDealer(): void {
        this._dealerCards.push(this.drawCardFromDeck())
    }

    private hitPlayer(): void {
        this._playerCards.push(this.drawCardFromDeck())
    }

    private drawCardFromDeck(): Card {
        return this._deck.pop() as Card
    }

    private unshiftPlayersCardsOnDeck(): void {
        const playersCards: Card[] = [...this._playerCards, ...this._dealerCards]
        playersCards.forEach(card => this._deck.unshift(card))
        this._playerCards = []
        this._dealerCards = []
    }

    private calculatePoints(cards: Card[]): number {
        let points: number = 0
        let aces: number = 0

        cards.forEach(({rank}) => {
            switch(rank) {
                case 'king':
                case 'queen':
                case 'jack':
                    points += 10
                    break
                case 'ace':
                    aces++
                    break
                default:
                    points += Number(rank)
            }
        })

        
        if(points === 10 && aces > 1) {
            for(let ace = 0; ace < aces; ace++) {
                points += 1
            }
        } else {
            for(let ace = 0; ace < aces; ace++) {
                if(points + 11 > 21) {
                    points += 1
                } else {
                    points += 11
                }
            }
        }

        return points
    }

    private isBlackjack(points: number): boolean {
        return points === 21
    }

    private isBust(points: number): boolean {
        return points > 21
    }

    get credits(): number {
        return this._credits
    }
}