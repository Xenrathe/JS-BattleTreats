import { preloadedVerticalImages } from "./domController";

let dragDogName = "";
let dragSegmentIndex = 0;

export function setDragData(dogName, segmentIndex) {
  dragDogName = dogName;
  dragSegmentIndex = segmentIndex;
}
// during initial board setup, allows players to drag/drop dog onto a cell
// placed as an eventListener on every grid-cell
// returns an object {wasSuccessful: true/false, dogObject: dog being dragged}
export function dropDogOnCell(event, x, y, playerObject) {
  event.preventDefault();

  const gameboard = playerObject.gameboard;
  //const dogName = event.dataTransfer.getData("dog-name");
  const dogObject = gameboard.getDogByName(dragDogName);

  // adjust coords based on where the user has 'grabbed' the dog
  //const segment = event.dataTransfer.getData("segment-index");
  const shiftedCoords = calculateShiftedCoords(
    dogObject,
    [x - 1, y],
    dragSegmentIndex
  );
  const firstCoord = shiftedCoords[0];
  const secondCoord = shiftedCoords[shiftedCoords.length - 1];

  const dropSuccessful = gameboard.addDogByName(
    dragDogName,
    firstCoord,
    secondCoord,
    false
  );

  const kennelDogImage = document.querySelector(
    `.kennel-dogs [data-dog="${dragDogName}"]`
  );

  if (dropSuccessful) {
    if (kennelDogImage) {
      kennelDogImage.parentElement.classList.add("hidden");
    }
  } else {
    kennelDogImage.classList.remove("almost-hidden");
    console.error("Dog placement failed.");
  }

  return { wasSuccessful: dropSuccessful, dogObject: dogObject };
}

// during initial board setup, called to rotate dog when user clicks on dog
// placed as an eventListener for 'click' on dog images in the gameboard
export function rotateDogPlacement(event, gameboard) {
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
    return true;
  }

  return false;
}

// function for dragging dog, put on a dragStart or touchStart eventListener
// returns the segment (0 for top/leftmost, dogLength# for bottom/rightmost)
export function getDogSegment(event, dogImage, dogLength) {
  const isVertical = dogImage.dataset.orientation === "ver";
  const rect = dogImage.getBoundingClientRect();

  let clickOffset;

  if (event.type.startsWith("touch")) {
    const touch = event.touches[0];
    clickOffset = isVertical
      ? touch.clientY - rect.top
      : touch.clientX - rect.left;
  } else if (event.type.startsWith("mouse") || event.type === "dragstart") {
    clickOffset = event.offsetX;
  } else {
    throw new Error("Unsupported event type in getDogSegment");
  }

  const segmentSize = isVertical
    ? rect.height / dogLength
    : rect.width / dogLength;

  return Math.floor(clickOffset / segmentSize);
}

// This creates a clone image when dragging vertical dogs
// Necessary to preserve the rotation which is otherwise lost
export function cloneImageOnDogDragStart(event) {
  const dogImage = event.target;
  const dogImageRect = dogImage.getBoundingClientRect();
  const dogName = dogImage.dataset.dog.toLowerCase();
  const dragImage = preloadedVerticalImages[dogName];

  // clone only necessary for vertical dogs
  if (dogImage.dataset.orientation !== "ver" || !dragImage) {
    return null;
  }

  // create a temporary clone to style it explicitly
  const tempImage = document.createElement("img");
  tempImage.src = dragImage.src;
  tempImage.style.width = `${dogImageRect.width}px`;
  tempImage.style.height = `${dogImageRect.height}px`;
  tempImage.style.position = "absolute";
  tempImage.style.opacity = 0.5;

  if (event.type.startsWith("touch")) {
    tempImage.style.pointerEvents = "none";
    tempImage.id = "dragging-clone";

    document.body.appendChild(tempImage);
  } else {
    // make sure it's off-screen
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

  return tempImage;
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
