import { Player } from "./player";
import { DotMatrix } from "./dotMatrixController";
import treatMiss from "./images/red-treat.png";

// ************ IMAGE STUFF **********************
const images = require.context("./images/dogs", false, /\.(png|jpe?g|svg)$/);
const imagePaths = {};
const preloadedVerticalImages = {};

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

  const kennelDogRandomBtn = document.querySelector("#random-btn");
  kennelDogRandomBtn.disabled = true;

  const kennelDogs = document.querySelectorAll(".kennel-dog img");
  kennelDogs.forEach((dogImg) => {
    dogImg.draggable = true;
    dogImg.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("dog-name", dogImg.dataset.dog);
      const length = dogImg.dataset.length;
      const segmentIndex = getDogSegment(e, dogImg, length);
      e.dataTransfer.setData("segment-index", segmentIndex);
      dogImg.classList.add("almost-hidden");
    });

    dogImg.addEventListener("dragend", (e) => {
      dogImg.classList.remove("almost-hidden");
    });
  });
}

// Puts game logic and gameboard DOM into initial state
function startNewGame() {
  let firstPlayerName = null;
  gameStarted = false;

  firstPlayerName = prompt("Please enter your name", "Legend");
  if (firstPlayerName == null) {
    return;
  }

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
    kennelImg.classList.remove("hidden");
    kennelImg.classList.remove("almost-hidden");
  });

  // Enable random placement button
  const kennelDogRandomBtn = document.querySelector("#random-btn");
  kennelDogRandomBtn.disabled = false;
  kennelDogRandomBtn.addEventListener("click", () => {
    if (!gameStarted) {
      userPlayer.gameboard.randomlyPlaceDogs();
      dotMatrix.displayString("CLICK TO START");
      displayGrid(userPlayer.gameboard);
      kennelDogs.forEach((kennelImg) => {
        kennelImg.classList.add("hidden");
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
  if (gameStarted == false && userPlayer != null) {
    // make sure all player dogs are placed
    if (userPlayer.gameboard.areAllDogsPlaced()) {
      const kennel = document.querySelector(".kennels");
      kennel.classList.add("hidden");
      dotMatrix.displayString("GAME BEGIN!");
      gameStarted = true;
    }
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
  dogImage.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("dog-name", dogImage.dataset.dog);
    const segmentIndex = getDogSegment(e, dogImage, dog.length);
    e.dataTransfer.setData("segment-index", segmentIndex);
    dogImage.classList.add("almost-hidden");
    cloneImageOnDogDragStart(e);
  });

  dogImage.addEventListener("dragend", () => {
    dogImage.classList.remove("almost-hidden");
  });

  dogImage.addEventListener("click", (e) => rotateDogPlacement(e, boardObject));

  const firstCell = boardDom.querySelector(
    `#${numberToLetter(coords[0][1]) + (coords[0][0] + 1)}`
  );

  if (isVertical) {
    dogImage.classList.add("vertical");
  }

  firstCell.appendChild(dogImage);
  dogImages.push(dogImage);
}

// during initial board setup, allows players to drag/drop dog onto a cell
function dropDogOnCell(event, x, y, playerObject) {
  if (gameStarted) {
    return;
  }

  event.preventDefault();

  const gameboard = playerObject.gameboard;
  const dogName = event.dataTransfer.getData("dog-name");
  const dogObject = gameboard.getDogByName(dogName);
  const dogLength = dogObject.length;
  //const firstCoord = [x - 1, y];
  //const secondCoord = dogObject.isVertical() ? [firstCoord[0], firstCoord[1] + dogLength - 1] : [firstCoord[0] + dogLength - 1, firstCoord[1]];

  // adjust coords based on where the user has 'grabbed' the dog
  const segment = event.dataTransfer.getData("segment-index");
  const shiftedCoords = calculateShiftedCoords(dogObject, [x - 1, y], segment);
  const firstCoord = shiftedCoords[0];
  const secondCoord = shiftedCoords[shiftedCoords.length - 1];
  console.log(`Coords: ${firstCoord}, ${secondCoord}`);

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

    if (kennelDogImage) {
      kennelDogImage.classList.add("hidden");
    }

    if (gameboard.areAllDogsPlaced()) {
      dotMatrix.displayString("CLICK TO START");
    }
  } else {
    kennelDogImage.classList.remove("almost-hidden");
    console.error("Dog placement failed.");
  }
}

// during initial board setup, called to rotate dog when user clicks on dog
function rotateDogPlacement(event, gameboard) {
  if (gameStarted) {
    return;
  }

  const dogImage = event.currentTarget;
  const dogName = dogImage.getAttribute("data-dog");
  const dogObject = gameboard.getDogByName(dogName);

  const isVertical = dogObject.isVertical();
  const nearestCellCoord = findNearestCellCoord(event, dogObject);

  // calculate the new coordinates for counter-clockwise rotation
  const newCoordsCCW = calculateRotatedCoords(
    dogObject,
    nearestCellCoord,
    false
  );
  const newCoordsCW = calculateRotatedCoords(dogObject, nearestCellCoord, true);

  // try to add dog CCW first then CW (go go || short-circuit)
  if (
    gameboard.addDogByName(
      dogName,
      newCoordsCCW[0],
      newCoordsCCW[newCoordsCCW.length - 1],
      false
    ) ||
    gameboard.addDogByName(
      dogName,
      newCoordsCW[0],
      newCoordsCW[newCoordsCW.length - 1],
      false
    )
  ) {
    dogImage.dataset.orientation = isVertical ? "ver" : "hor";
    dogImage.classList.toggle("vertical", dogObject.isVertical());
    displayDog(dogObject, gameboard);
  }
}

// This creates a clone image when dragging vertical dogs
// Necessary to preserve the rotation which is otherwise lost
function cloneImageOnDogDragStart(event) {
  const dogImage = event.target;
  const isVertical = dogImage.dataset.orientation === "ver";
  const dogName = dogImage.dataset.dog.toLowerCase();

  if (isVertical && preloadedVerticalImages[dogName]) {
    const dragImage = preloadedVerticalImages[dogName];

    // create a temporary clone to style it explicitly
    const tempImage = document.createElement("img");
    tempImage.src = dragImage.src;
    tempImage.style.width = `${dragImage.width}px`;
    tempImage.style.height = `${dragImage.height}px`;
    tempImage.style.position = "absolute"; // make sure it's off-screen
    tempImage.style.top = "-9999px";
    tempImage.style.left = "-9999px";

    document.body.appendChild(tempImage);

    // note that offsetY and offsetX are flipped
    // that's because the original image is rotated
    event.dataTransfer.setDragImage(tempImage, event.offsetY, event.offsetX);

    // clean up the temporary element after a short delay
    setTimeout(() => {
      document.body.removeChild(tempImage);
    }, 0);
  }
}

// helper function for rotateDogPlacement
function findNearestCellCoord(event, dogObject) {
  // note that we only need X - even when the image is rotated vertically
  // the browser / JS accounts for this rotation
  const clickX = event.offsetX;
  const imageWidth = event.target.offsetWidth;
  const segmentIndex = Math.floor(clickX / (imageWidth / dogObject.length));

  return dogObject.coords[segmentIndex];
}

// helper function for dragging dog
// returns the segment (0 for top/leftmost, dogLength# for bottom/rightmost)
function getDogSegment(event, dogImage, dogLength) {
  const isVertical = dogImage.dataset.orientation === "ver";
  const rect = dogImage.getBoundingClientRect();

  // note that I don't need to do offsetY even if dog is vertical
  // that's because rotated images also rotate the coordinate system
  const clickOffset = event.offsetX;

  const segmentSize = isVertical
    ? rect.height / dogLength
    : rect.width / dogLength;

  return Math.floor(clickOffset / segmentSize);
}

// helper function for shifting dog placement coords based on segment grabbed
function calculateShiftedCoords(dogObject, dropCoord, segmentIndex) {
  const isVertical = dogObject.isVertical();
  const adjustedCoords = [];

  for (let i = 0; i < dogObject.length; i++) {
    const delta = i - segmentIndex;
    const adjustedCoord = isVertical
      ? [dropCoord[0], dropCoord[1] + delta]
      : [dropCoord[0] + delta, dropCoord[1]];

    adjustedCoords.push(adjustedCoord);
  }

  return adjustedCoords;
}

// helper function to calculate new coordinates based on rotation & pivot point
function calculateRotatedCoords(dogObject, pivotCoord, clockwise = false) {
  const newCoords = [];
  const pivotIndex = dogObject.coords.findIndex(
    (coord) => coord[0] === pivotCoord[0] && coord[1] === pivotCoord[1]
  );

  if (pivotIndex === -1) return null; // just in case I be makin da mistake

  // offset for rotation direction
  const offset = clockwise ? 1 : -1;

  for (let i = 0; i < dogObject.coords.length; i++) {
    const currentCoord = dogObject.coords[i];
    const deltaX = currentCoord[0] - pivotCoord[0];
    const deltaY = currentCoord[1] - pivotCoord[1];

    // rotate each coordinate around the pivot by 90 degrees
    const rotatedX = pivotCoord[0] + offset * deltaY;
    const rotatedY = pivotCoord[1] - offset * deltaX;
    newCoords.push([rotatedX, rotatedY]);
  }

  // sort newCoords so the first item is the most top-leftish coord
  // this is important because displayDog assumes that the first coord is the most top-leftish
  newCoords.sort((a, b) => {
    if (a[1] === b[1]) return a[0] - b[0];
    return a[1] - b[1];
  });

  return newCoords;
}

// helper function to convert coord #s 0, 1, etc to corresponding vertical axis coords 'A', 'B', etc
function numberToLetter(number) {
  return String.fromCharCode(65 + number);
}

// helper function to convert vertical axis coords 'A', 'B', etc to coord #s 0, 1, etc
function letterToNumber(letter) {
  return String(letter).charCodeAt(0) - 65;
}
