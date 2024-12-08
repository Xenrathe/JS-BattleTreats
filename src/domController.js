import { Player } from "./player";
import { DotMatrix } from "./dotMatrixController";
import treatMiss from "./images/red-treat.png";
import {
  getDogSegment,
  dropDogOnCell,
  rotateDogPlacement,
  cloneImageOnDogDragStart,
  setDragData,
} from "./dogDragAndRotate";

// ************ IMAGE STUFF **********************
const images = require.context("./images/dogs", false, /\.(png|jpe?g|svg)$/);
const imagePaths = {};
export const preloadedVerticalImages = {};

export function initialImageProcessing() {
  // image paths
  images.keys().forEach((key) => {
    // get the image name without extension and directory (e.g., pug)
    const imageName = key.replace("./", "").replace(/\.(png|jpe?g|svg)$/, "");
    imagePaths[imageName] = images(key);
  });

  // preload vertical images with dimensions set
  const dogNames = ["pug", "corgi", "dashund", "bulldog", "komondor"];
  dogNames.forEach((dog) => {
    const verticalImage = new Image();
    verticalImage.src = imagePaths[`${dog}V`];
    verticalImage.width = 40;
    switch (dog) {
      case "pug":
        verticalImage.height = 87;
        break;
      case "bulldog":
        verticalImage.height = 179;
        break;
      case "komondor":
        verticalImage.height = 225;
        break;
      default: // corgi and dashund
        verticalImage.height = 133;
    }

    preloadedVerticalImages[dog] = verticalImage;
  });
}

// ***************** END IMAGE STUFF ****************

const opponentBoard = document.querySelector("#opponent-gameboard");
const userBoard = document.querySelector("#player-gameboard");
const omniBtn = document.querySelector("#omni-btn");
let gameStarted = false;
let userPlayer = null;
let opponentPlayer = null;
let dotMatrix = null;
let dogImages = [];

export function initializeDom() {
  omniBtn.addEventListener("click", () => omniButton());

  const dotMatrixContainer = document.querySelector("#dot-matrix-container");
  dotMatrix = new DotMatrix(dotMatrixContainer, 15);
  dotMatrix.displayString("NEW GAME?");

  const kennelDogRandomBtn = document.querySelector("#random-btn");
  kennelDogRandomBtn.disabled = true;

  const kennelDogs = document.querySelectorAll(".kennel-dog img");
  kennelDogs.forEach((dogImg) => {
    dogImg.draggable = true;
    addDragEventListenersToDogImg(dogImg, dogImg.dataset.length, true);
  });
}

function addDragEventListenersToDogImg(dogImg, dogLength, isKennelDog) {
  // DESKTOP: DRAG/DROP
  dogImg.addEventListener("dragstart", (e) => {
    const segmentIndex = getDogSegment(e, dogImg, dogLength);
    setDragData(dogImg.dataset.dog, segmentIndex);
    dogImg.classList.add("almost-hidden");
    if (!isKennelDog) {
      cloneImageOnDogDragStart(e);
    }
  });

  dogImg.addEventListener("dragend", (e) => {
    dogImg.classList.remove("almost-hidden");
  });

  // MOBILE: TOUCH START/MOVE
  let touchStartX = 0;
  let touchOffsetX = 0;
  let touchStartY = 0;
  let touchOffsetY = 0;
  let touchIsATap = true;
  let dragClone = null;

  dogImg.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    const rect = dogImg.getBoundingClientRect();
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchOffsetX = touch.clientX - rect.left;
    touchOffsetY = touch.clientY - rect.top;

    const segmentIndex = getDogSegment(e, dogImg, dogLength);
    setDragData(dogImg.dataset.dog, segmentIndex);

    dragClone = cloneImageOnDogDragStart(e);
    if (dragClone) {
      dogImg.classList.add("barely-visible");
      dragClone.style.left = `${touch.clientX - touchOffsetX}px`;
      dragClone.style.top = `${touch.clientY - touchOffsetY}px`;
    }

    e.preventDefault();
  });

  dogImg.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      touchIsATap = false;
    }

    dogImg.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    if (dragClone) {
      dragClone.style.left = `${touch.clientX - touchOffsetX}px`;
      dragClone.style.top = `${touch.clientY - touchOffsetY}px`;
    }

    e.preventDefault();
  });

  dogImg.addEventListener("touchend", (e) => {
    // Remove the drag clone
    if (dragClone) {
      dragClone.remove();
      dragClone = null;
      dogImg.classList.remove("barely-visible");
    }
    dogImg.classList.remove("almost-hidden");
    dogImg.style.transform = "";

    const touch = e.changedTouches[0];
    const dropX = touch.clientX;
    const dropY = touch.clientY;

    if (touchIsATap && !isKennelDog) {
      const rect = dogImg.getBoundingClientRect();
      const offsetX = dropX - rect.left;
      const offsetY = dropY - rect.top;

      // why this complicated simulatedClick you ask?!
      // why not just do a simple .click() call you ask?!
      // because we later use coordinate info of the click to determine the 'segment' the dog was clicked
      const simulatedClick = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: touch.clientX,
        clientY: touch.clientY,
        offsetX: offsetX,
        offsetY: offsetY,
      });

      dogImg.dispatchEvent(simulatedClick);
      return;
    }

    dogImg.style.visibility = "hidden"; //gotta hide this to prevent elementFromPoint grabbing dog img
    const targetCell = document.elementFromPoint(dropX, dropY);
    dogImg.style.visibility = "visible";

    if (
      targetCell &&
      targetCell.classList.contains("grid-cell") &&
      targetCell.parentElement.id == "player-grid"
    ) {
      const col = targetCell.id.substring(1);
      const row = targetCell.id.substring(0, 1);

      const dropResult = dropDogOnCell(
        e,
        col,
        Number(letterToNumber(row)),
        userPlayer
      );
      handleDropResult(dropResult, userPlayer.gameboard);
    }
  });
}

// contains both startNewGame and beginGame functionality, depending on state of game
function omniButton() {
  if (gameStarted === false && userPlayer != null) {
    beginGame();
  } else {
    newGame();
  }
}
// Puts game logic and gameboard DOM into initial state
function newGame() {
  let firstPlayerName = null;

  firstPlayerName = prompt("Please enter your name", "Legend");
  if (firstPlayerName == null) {
    return;
  }

  gameStarted = false;
  userBoard.classList.remove("game-started");

  userPlayer = new Player(
    firstPlayerName,
    true,
    userBoard,
    userBoard.querySelector(".board-grid")
  );
  window.userPlayer = userPlayer;
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
  const kennel = document.querySelector(".kennels");
  kennel.classList.remove("hidden");
  const kennelDogs = document.querySelectorAll(".kennel-dog img");
  kennelDogs.forEach((kennelImg) => {
    kennelImg.parentElement.classList.remove("hidden");
    kennelImg.classList.remove("almost-hidden");
  });

  // Enable random placement button
  const kennelDogRandomBtn = document.querySelector("#random-btn");
  kennelDogRandomBtn.disabled = false;
  kennelDogRandomBtn.addEventListener("click", () => {
    if (!gameStarted) {
      userPlayer.gameboard.randomlyPlaceDogs();
      dotMatrix.displayString("CLICK START");
      omniBtn.innerHTML = "<span>START</span>";
      displayGrid(userPlayer.gameboard);
      kennelDogs.forEach((kennelImg) => {
        kennelImg.parentElement.classList.add("hidden");
      });
    }
  });

  userPlayer.gameboard.resetBoard();
  initializeBoard(userPlayer);

  opponentPlayer.gameboard.resetBoard();
  opponentPlayer.gameboard.randomlyPlaceDogs();
  initializeBoard(opponentPlayer);

  dotMatrix.displayString("PLACE DOGS");
}

// Actually starts the gameplay
function beginGame() {
  // make sure all player dogs are placed
  if (userPlayer.gameboard.areAllDogsPlaced()) {
    const kennel = document.querySelector(".kennels");
    kennel.classList.add("hidden");
    dotMatrix.displayString("GAME BEGIN!");
    omniBtn.innerHTML = "<span>NEW GAME</span>";
    userBoard.classList.add("game-started");
    gameStarted = true;
  }
}

// only called on page load
// sets up the actual DOM elements (i.e. NOT the game logic) of the gameboard
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
        gridCell.addEventListener("drop", (e) => {
          if (!gameStarted) {
            const dropResult = dropDogOnCell(
              e,
              col,
              letterToNumber(row),
              playerObject
            );
            handleDropResult(dropResult, boardObject);
          }
        });
      }

      domGrid.appendChild(gridCell);
    });
  });
}

// used after drag/drop and touchstart/end
function handleDropResult(dropResult, boardObject) {
  if (dropResult.wasSuccessful) {
    displayDog(dropResult.dogObject, boardObject);
    if (boardObject.areAllDogsPlaced()) {
      dotMatrix.displayString("CLICK START");
      omniBtn.textContent = "START";
    }
  }
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
// coordStatus = 1; display a MISS (a red bone)
// coordStatus = 0; display EMPTY (nothing)
// coordStatus = object + treated; display a HIT (a red letter or a dog image)
// coordstatus = object + !treated; show no information
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

    // DOG HAS BEEN TREATED (only way it's visible on opponent board)
    if (coordStatus.treated) {
      textElement.textContent = coordStatus.dog.name[0];

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

// actually displays a dog image on the board
// for playerboard, this is from start; for opponent board, dog must be fully treated
export function displayDog(dog, boardObject) {
  const { coords, name } = dog;
  const boardDom = boardObject.domBoard;
  const boardGrid = boardObject.domGrid;

  // do not display dog if it's not on board yet
  if (coords.length == 0) {
    return;
  }

  // remove any pre-existing dog image
  const gridDogImage = boardGrid.querySelector(`img[data-dog=${name}`);
  if (gridDogImage) {
    gridDogImage.remove();
  }

  const isVertical = dog.isVertical();

  const dogImage = document.createElement("img");
  dogImage.src = imagePaths[name.toLowerCase()];
  dogImage.alt = name;
  dogImage.classList.add("dog-image");
  dogImage.classList.add(`L${coords.length}`);

  // drag/drop stuff
  dogImage.dataset.dog = name;
  dogImage.dataset.orientation = isVertical ? "ver" : "hor";
  addDragEventListenersToDogImg(dogImage, dog.length, false);

  dogImage.addEventListener("click", (e) => {
    // disallow rotation if game has started
    // update dog display if click is successful
    if (!gameStarted && rotateDogPlacement(e, boardObject)) {
      displayDog(dog, boardObject);
    }
  });

  const firstCell = boardDom.querySelector(
    `#${numberToLetter(coords[0][1]) + (coords[0][0] + 1)}`
  );

  if (isVertical) {
    dogImage.classList.add("vertical");
  }

  firstCell.appendChild(dogImage);
  dogImages.push(dogImage);
}

// helper function to convert coord #s 0, 1, etc to corresponding vertical axis coords 'A', 'B', etc
function numberToLetter(number) {
  return String.fromCharCode(65 + number);
}

// helper function to convert vertical axis coords 'A', 'B', etc to coord #s 0, 1, etc
function letterToNumber(letter) {
  return String(letter).charCodeAt(0) - 65;
}
