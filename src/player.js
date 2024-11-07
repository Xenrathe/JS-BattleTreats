import { Gameboard } from "./gameboard";

export class Player {
  constructor(name, isHuman, boardDom, gridDom) {
    this.name = name;
    this.isHuman = isHuman;

    this.gameboard = new Gameboard(boardDom, gridDom);
  }

  giveTreat(coords, opposingPlayer, dotMatrixObject) {
    const boardToTreat = opposingPlayer.gameboard;

    console.log("giveTreat dotMatrix: " + dotMatrixObject);
    // No more moves after treating
    if (boardToTreat.checkVictory() || this.gameboard.checkVictory()) {
      return;
    }

    // Immediately have opposingPlayer - IF AI - make their turn
    // Also check for victory after moves were made
    if (boardToTreat.receiveTreat(coords, dotMatrixObject) && this.isHuman) {
      if (boardToTreat.checkVictory()) {
        dotMatrixObject.displayString("Woof! You won!");
      } else {
        opposingPlayer.AI_giveTreat("random", this.gameboard);
        if (this.gameboard.checkVictory()) {
          dotMatrixObject.displayString(`Bark! You lost!`);
        }
      }
    }
  }

  AI_giveTreat(mode, boardToTreat) {
    // random mode
    if (mode == "random") {
      let x, y;
      do {
        x = Math.round(Math.random() * 9);
        y = Math.round(Math.random() * 9);
      } while (!boardToTreat.receiveTreat([x, y]));
    }
  }
}
