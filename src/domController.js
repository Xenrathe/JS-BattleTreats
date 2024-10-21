export class DomController {
  constructor(playerGrid, opponentGrid) {
    this.playerGrid = playerGrid;
    this.opponentGrid = opponentGrid;
  }

  initializeGrid(gridObject) {
    gridObject.innerHTML = "";

    const rows = "ABCDEFGHIJ".split("");
    const cols = Array.from({ length: 10 }, (_, i) => i + 1);

    rows.forEach((row) => {
      cols.forEach((col) => {
        const gridCell = document.createElement("div");
        gridCell.setAttribute("data-coords", `${row}${col}`);
        gridObject.appendChild(gridCell);
      });
    });
  }
}
