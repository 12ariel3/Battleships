const flipButton = document.querySelector('.flip-button')
const optionContainer = document.querySelector('.option-container')
const gamesBoardContainer = document.querySelector('#gamesboards-container')
const startButton = document.querySelector('.start-button')
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn-display')
const buttons  = document.querySelector('.buttons')
const labels = document.querySelector('.labels')
let angle = 0
const width = 10
let notDropped



//option choosing

function flip(){
    angle = angle == 0 ? 90 : 0
    const optionShips = Array.from(optionContainer.children)
    optionShips.forEach(optionShip => optionShip.style.transform = `rotate(${angle}deg)`)
}

flipButton.addEventListener('click', flip)

///creating boards

function createBoard(color, user){
    const gameBoardContainer = document.createElement('div')
    gameBoardContainer.classList.add('game-board')
    gameBoardContainer.style.backgroundColor = color
    gameBoardContainer.id = user
    for(let i = 0; i < width * width; i++){
        const block = document.createElement('div')
        block.classList.add('block')
        block.id = i
        gameBoardContainer.appendChild(block)
    }
    
    gamesBoardContainer.appendChild(gameBoardContainer)
}

createBoard('yellow', 'player')
createBoard('pink', 'computer')

//creating ships

class Ship{
    constructor(name, length){
        this.name = name
        this.length = length
    }
}

const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 3)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)

const ships = [destroyer, submarine, cruiser, battleship, carrier]



function getValidity(allBoardBlocks, isHorizontal, startIndex, ship){

    let validStart = isHorizontal ? startIndex <= width * width -ship.length ? startIndex :
    width * width -ship.length:
    //handle vertical
    startIndex<= width*width -width*ship.length ? startIndex :
    startIndex -ship.length*width + width
    
    // if(isHorizontal){
    //     if(randomStartIndex<=width * width - ship.length){
    //         randomStartIndex
    //     }else{
    //         width*width-ship.length
    //     }
    // }else{
    //     if(randomStartIndex<=width*width -width*ship.length){
    //         randomStartIndex
    //     }else{
    //         randomStartIndex-ship.length*width+width
    //     }
    // }
    
    
    let shipBlocks = []
    
    for(let i=0; i<ship.length; i++){
        if(isHorizontal){
            shipBlocks.push(allBoardBlocks[Number(validStart) + i])
        }else{
            shipBlocks.push(allBoardBlocks[Number(validStart) + i * width])
        }
    }
    
    
    let valid
    const maxShipWidth = 5
    
    if(isHorizontal){
        shipBlocks.every(_shipBlock =>{
            valid = (_shipBlock.id % width <= maxShipWidth) || (width - _shipBlock.id % width) >= shipBlocks.length
        })
    } else{
        valid = true
    }
    
    const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))
    
    return{shipBlocks, valid, notTaken}

}    



function addShipPiece(user, ship, startId){
    const allBoardBlocks = document.querySelectorAll(`#${user} div`)
    let randomBoolean = Math.random() <0.5
    let isHorizontal = user == 'player' ? angle == 0 : randomBoolean
    let randomStartIndex = Math.floor(Math.random()*width * width)
    
    let startIndex = startId ? startId : randomStartIndex
    
    const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if(valid && notTaken){
        shipBlocks.forEach(shipBlock =>{
            shipBlock.classList.add(ship.name)
            shipBlock.classList.add('taken')
        })
    }else{
        if (user == 'computer'){
            addShipPiece(user, ship, startId)
        } else{
            notDropped = true
        }
    }
}

ships.forEach(ship => addShipPiece('computer', ship))

//Drag player ships

let draggedShip
const optionShips = Array.from(optionContainer.children)
optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart))

const allPlayerBlocks = document.querySelectorAll('#player div')
allPlayerBlocks.forEach(playerBlock =>{
    playerBlock.addEventListener('dragover', dragOver)
    playerBlock.addEventListener('drop', dropShip)
})

function dragStart(e){
    notDropped = false
    draggedShip = e.target
}

function dragOver(e){
    e.preventDefault()
    const ship = ships[draggedShip.id]
    highlightArea(e.target.id, ship)
}

function dropShip(e){
    const startId = e.target.id
    const ship = ships[draggedShip.id]
    addShipPiece('player', ship, startId)
    if(!notDropped){
        if(optionContainer.children.length <= 1){
            optionContainer.remove()
            buttons.style.marginTop = '80px'
            gamesBoardContainer.style.marginTop = '10px'
            labels.style.marginTop = '35px'
        }

        draggedShip.remove()
    }
}


//add highlight

function highlightArea(startIndex, ship){
    const allBoardBlocks = document.querySelectorAll('#player div')
    let isHorizontal = angle == 0

    const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if(valid && notTaken){
        shipBlocks.forEach(shipBlock =>{
            shipBlock.classList.add('hover')
            setTimeout(()=>shipBlock.classList.remove('hover'), 200)
        })
    }
}


let gameOver = false

let playerTurn

//Start Game

function startGame(){
    if(playerTurn == undefined){
        if(optionContainer.children.length != 0){
            infoDisplay.innerHTML = 'Please place all your pieces first!'
        }else{
            const allBoardBlocks = document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
            playerTurn = true
            turnDisplay.innerHTML = 'Your Go!'
            turnDisplay.style.color = '#ffff00'
            infoDisplay.innerHTML = 'The game has started'
        }
    }
}


startButton.addEventListener('click', startGame)


let playerHits =[]
let computerHits = []
const playerSunkShips = []
const computerSunkShips = []

function handleClick(e){
    if(gameOver == false){
        if(e.target.classList.contains('taken') && !e.target.classList.contains('boom')){
            e.target.classList.add('boom')
            infoDisplay.innerHTML = 'you hit the computers ship!'
            infoDisplay.style.color = '#b92840'
            let classes = Array.from(e.target.classList)
            classes = classes.filter(className => className!== 'block')
            classes = classes.filter(className => className!== 'boom')
            classes = classes.filter(className => className!== 'taken')
            playerHits.push(...classes)
            checkScore('player', playerHits, playerSunkShips)
        }
        if(!e.target.classList.contains('taken')){
            infoDisplay.innerHTML = 'Nothing hit this time'
            infoDisplay.style.color = '#f7eff7'
            e.target.classList.add('empty')
        }
        playerTurn = false
        const allBoardBlocks = document.querySelectorAll('#computer div')
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
        setTimeout(computerGo, 2000)
    }
}

//Define the computers go

function computerGo(){
    if(gameOver == false){
        turnDisplay.innerHTML = 'Computers Go!'
        turnDisplay.style.color = "#ffc0cb"
        infoDisplay.innerHTML = 'The computer is thinking...'
        infoDisplay.style.color = '#ffc0cb'
        
        setTimeout(()=>{
            let randomGo = Math.floor(Math.random() *width*width)
            const allBoardBlocks = document.querySelectorAll('#player div')
            if(allBoardBlocks[randomGo].classList.contains('taken') &&
            allBoardBlocks[randomGo].classList.contains('boom')){
                computerGo()
                return
            }else if(allBoardBlocks[randomGo].classList.contains('taken') &&
            !allBoardBlocks[randomGo].classList.contains('boom')){
                allBoardBlocks[randomGo].classList.add('boom')
                infoDisplay.innerHTML = 'The computer hit your ship :c'
                infoDisplay.style.color = '#b92840'
                let classes = Array.from(allBoardBlocks[randomGo].classList)
                classes = classes.filter(className => className!== 'block')
                classes = classes.filter(className => className!== 'boom')
                classes = classes.filter(className => className!== 'taken')
                computerHits.push(...classes)
                checkScore('computer', computerHits, computerSunkShips)
            }else{
                infoDisplay.innerHTML = 'Nothing hit this time'
                infoDisplay.style.color = '#f7eff7'
                allBoardBlocks[randomGo].classList.add('empty')
            }
        }, 2500)
        
        setTimeout(()=>{
            playerTurn = true
            turnDisplay.innerHTML = 'Your Go!'
            turnDisplay.style.color = '#ffff00'
            infoDisplay.innerHTML = 'Please take your go.'
            infoDisplay.style.color = '#ffff00'
            const allBoardBlocks = document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
        }, 4000)
    }
}


function checkScore(user, userHits, userSunkShips){
    function checkShip(shipName, shipLength){
        if(userHits.filter(storedShipName => storedShipName == shipName).length == shipLength){
            if(user == 'player'){
                infoDisplay.innerHTML = `You sunk the computer's ${shipName}`
                infoDisplay.style.color = '#600212'
                playerHits = userHits.filter(storedShipName => storedShipName !== shipName)
            }
            if(user == 'computer'){
                infoDisplay.innerHTML = `The computer sunks the player's ${shipName}`
                infoDisplay.style.color = '#600212'
                computerHits = userHits.filter(storedShipName => storedShipName !== shipName)
            }
            userSunkShips.push(shipName)
        }
    }
    checkShip('destroyer', 2)
    checkShip('submarine', 3)
    checkShip('cruiser', 3)
    checkShip('battleship', 4)
    checkShip('carrier', 5)


    if(playerSunkShips.length >= 5){
        infoDisplay.innerHTML = 'You sunk all the computers ships. YOU WON!! :D'
        gameOver = true
    }
    if(computerSunkShips.length >= 5){
        infoDisplay.innerHTML = 'The computer has sunk all your ships. YOU LOST!! :c'
        gameOver = true
    }
}
