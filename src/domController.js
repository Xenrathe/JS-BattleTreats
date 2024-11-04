export function initializeGrid(boardObject) {
  const gridObject = boardObject.domGrid;
  gridObject.innerHTML = "";

  const rows = "ABCDEFGHIJ".split("");
  const cols = Array.from({ length: 10 }, (_, i) => i + 1);

  rows.forEach((row) => {
    cols.forEach((col) => {
      const gridCell = document.createElement("div");
      gridCell.setAttribute("data-coords", `${row}${col}`);
      gridCell.id = `${row}${col}`;
      gridCell.classList.add("grid-cell");
      gridCell.addEventListener("click", () =>
        boardObject.receiveTreat([col - 1, letterToNumber(row)])
      );
      gridObject.appendChild(gridCell);
    });
  });
}

export function displayBoard(boardObject) {
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      displayGridItem([x, y], boardObject);
    }
  }
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
  if (coordStatus == 1) {
    coordDiv.classList.add("red-text");
    coordDiv.innerHTML = "X";
  } else if (coordStatus == 0) {
    coordDiv.innerHTML = "";
    coordDiv.classList.remove("red-text");
  } else {
    coordDiv.innerHTML = coordStatus.dog.name[0];
    if (coordStatus.treated) {
      coordDiv.classList.add("red-text");
    } else {
      coordDiv.classList.remove("red-text");
    }
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
