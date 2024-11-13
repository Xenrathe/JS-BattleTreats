import { Player } from "./player";
import { DotMatrix } from "./dotMatrixController";
import treatMiss from "./images/red-treat.png";

const images = require.context("./images/dogs", false, /\.(png|jpe?g|svg)$/);
const imagePaths = {};

images.keys().forEach((key) => {
  // Get the image name without extension and directory (e.g., pug)
  const imageName = key.replace("./", "").replace(/\.(png|jpe?g|svg)$/, "");
  imagePaths[imageName] = images(key);
});

const opponentBoard = document.querySelector("#opponent-gameboard");
const userBoard = document.querySelector("#player-gameboard");
let gameStarted = false;
let userPlayer = null;
let opponentPlayer = null;
let dotMatrix = null;
let dogImages = [];

export function initializeDom() {
  const newGameBtn = document.querySelector("#new-game-btn");
  newGameBtn.addEventListener("click", () => startNewGame());

  const dotMatrixContainer = document.querySelector("#dot-matrix-container");
  dotMatrix = new DotMatrix(dotMatrixContainer, 15);
  dotMatrix.displayString("NEW GAME?");
  dotMatrixContainer.addEventListener("click", () => beginGame());

  const kennelDogs = document.querySelectorAll(".kennel-dog img");
  kennelDogs.forEach((dogImg) => {
    dogImg.draggable = true;
    dogImg.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("dog-name", dogImg.dataset.dog);
      dogImg.classList.add("almost-hidden");
    });

    dogImg.addEventListener("dragend", (e) => {
      dogImg.classList.remove("almost-hidden");
    });
  });
}

// Puts game into initial state
function startNewGame() {
  let firstPlayerName = null;
  gameStarted = false;

  while (firstPlayerName == null) {
    firstPlayerName = prompt("Please enter your name", "Legend");
  }

  userPlayer = new Player(
    firstPlayerName,
    true,
    userBoard,
    userBoard.querySelector(".board-grid")
  );
  opponentPlayer = new Player(
    "Neighbor",
    false,
    opponentBoard,
    opponentBoard.querySelector(".board-grid")
  );

  // Clear any dog images FIRST
  dogImages.forEach((dogImg) => {
    dogImg.remove();
  });
  dogImages = [];

  // Reset kennel visibility
  const kennelDogs = document.querySelectorAll(".kennel-dog img");
  kennelDogs.forEach((kennelImg) => {
    kennelImg.classList.remove("hidden");
    kennelImg.classList.remove("almost-hidden");
  });

  userPlayer.gameboard.resetBoard();
  //userPlayer.gameboard.randomlyPlaceDogs();
  initializeBoard(userPlayer);
  displayGrid(userPlayer.gameboard);

  opponentPlayer.gameboard.resetBoard();
  opponentPlayer.gameboard.randomlyPlaceDogs();
  initializeBoard(opponentPlayer);

  dotMatrix.displayString("PLACE DOGS");
}

// Actually starts the gameplay
function beginGame() {
  if (gameStarted == false) {
    // make sure all player dogs are placed
    if (userPlayer.gameboard.areAllDogsPlaced()) {
      dotMatrix.displayString("GAME BEGIN!");
      gameStarted = true;
    }
  }
}

function initializeBoard(playerObject) {
  const boardObject = playerObject.gameboard;
  const guessingPlayer =
    playerObject == userPlayer ? opponentPlayer : userPlayer;

  //setup the board titles
  boardObject.domBoard.querySelector(
    ".game-board-title"
  ).textContent = `${playerObject.name}'s Yard`;

  //setup the grid
  const domGrid = boardObject.domGrid;
  domGrid.innerHTML = "";

  const rows = "ABCDEFGHIJ".split("");
  const cols = Array.from({ length: 10 }, (_, i) => i + 1);

  rows.forEach((row) => {
    cols.forEach((col) => {
      const gridCell = document.createElement("div");
      gridCell.setAttribute("data-coords", `${row}${col}`);
      gridCell.id = `${row}${col}`;
      gridCell.classList.add("grid-cell");

      //add various event listeners
      if (guessingPlayer == userPlayer) {
        gridCell.addEventListener("click", () => {
          if (gameStarted) {
            guessingPlayer.giveTreat(
              [col - 1, letterToNumber(row)],
              playerObject,
              dotMatrix
            );
          }
        });
      }

      gridCell.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      if (playerObject == userPlayer) {
        gridCell.addEventListener("drop", (e) =>
          dropDogOnCell(e, col, letterToNumber(row), playerObject)
        );
      }

      domGrid.appendChild(gridCell);
    });
  });
}

// only used if you want to reveal the WHOLE board
function displayGrid(boardObject) {
  //setup grid
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      displayGridItem([x, y], boardObject);
    }
  }

  //show dogs
  boardObject.displayAllDogs();
}

// update the display of a single grid item
// coordStatus = 1; display a MISS
// coordStatus = 0; display EMPTY
// coordStatus = object + treated; displayed a RED HIT
// coordstatus = object + !treated; display DOG
export function displayGridItem(coord, boardObject) {
  const coordDiv = boardObject.domGrid.querySelector(
    `#${numberToLetter(coord[1])}${coord[0] + 1}`
  );
  const coordStatus = boardObject.getCoord(coord);

  // TREAT ON EMPTY CELL
  if (coordStatus == 1) {
    const miss_image = document.createElement("img");
    miss_image.src = treatMiss;
    miss_image.classList.add("miss-img");
    coordDiv.appendChild(miss_image);
  }
  // NO TREAT / EMPTY CELL
  else if (coordStatus == 0) {
    coordDiv.innerHTML = "";
    coordDiv.classList.remove("red-text");
  }
  // DOG ON CELL
  else {
    let textElement = coordDiv.querySelector(".status-text");
    if (!textElement) {
      textElement = document.createElement("span");
      textElement.classList.add("status-text");
      coordDiv.appendChild(textElement);
    }
    textElement.textContent = coordStatus.dog.name[0];

    // DOG HAS BEEN TREATED (only way it's visible on opponent board)
    if (coordStatus.treated) {
      if (coordStatus.dog.isSatiated()) {
        textElement.classList.remove("red-text");
        textElement.classList.add("orange-text");

        // remove any existing dog image
        let dogImage = coordDiv.querySelector(".dog-image");
        if (dogImage) {
          dogImage.remove();
        }

        // add dog image
        displayDog(coordStatus.dog, boardObject);
      } else {
        textElement.classList.add("red-text");
      }
    }
    // DOG NOT TREATED
    else {
      textElement.classList.remove("red-text");
    }
  }
}

export function displayDog(dog, boardObject) {
  const { coords, name } = dog;
  const boardDom = boardObject.domBoard;

  // do not display dog if it's not on board yet
  if (coords.length == 0) {
    return;
  }

  const isVertical = dog.isVertical();

  const dogImage = document.createElement("img");
  dogImage.src = imagePaths[name.toLowerCase()];
  dogImage.alt = name;
  dogImage.classList.add("dog-image");
  dogImage.classList.add(`L${coords.length}`);

  const firstCell = boardDom.querySelector(
    `#${numberToLetter(coords[0][1]) + (coords[0][0] + 1)}`
  );

  if (isVertical) {
    dogImage.classList.add("vertical");
  }

  firstCell.appendChild(dogImage);
  dogImages.push(dogImage);
}

function dropDogOnCell(event, x, y, playerObject) {
  if (gameStarted) {
    return;
  }

  event.preventDefault();

  const gameboard = playerObject.gameboard;
  const dogName = event.dataTransfer.getData("dog-name");
  const dogObject = gameboard.getDogByName(dogName);
  const dogLength = dogObject.length;
  const firstCoord = [x - 1, y];
  const secondCoord = dogObject.isVertical()
    ? [firstCoord[0], firstCoord[1] + dogLength - 1]
    : [firstCoord[0] + dogLength - 1, firstCoord[1]];

  const dropSuccessful = gameboard.addDogByName(
    dogName,
    firstCoord,
    secondCoord,
    false
  );

  const kennelDogImage = document.querySelector(
    `.kennel-dogs [data-dog="${dogName}"]`
  );
  if (dropSuccessful) {
    displayDog(dogObject, gameboard);
    kennelDogImage.classList.add("hidden");

    if (gameboard.areAllDogsPlaced()) {
      dotMatrix.displayString("CLICK TO START");
    }
  } else {
    kennelDogImage.classList.remove("almost-hidden");
    console.error("Dog placement failed, returned to kennel.");
  }
}

// helper function to convert coord #s 0, 1, etc to corresponding vertical axis coords 'A', 'B', etc
function numberToLetter(number) {
  return String.fromCharCode(65 + number);
}

// helper function to convert vertical axis coords 'A', 'B', etc to coord #s 0, 1, etc
function letterToNumber(letter) {
  return String(letter).charCodeAt(0) - 65;
}
