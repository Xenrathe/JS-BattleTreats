import { Gameboard } from "./gameboard";

export class Player {
  constructor(name, isHuman, boardDom, gridDom) {
    this.name = name;
    this.isHuman = isHuman;

    this.gameboard = new Gameboard(boardDom, gridDom);
  }

  giveTreat(coords, opposingPlayer, dotMatrixObject) {
    const boardToTreat = opposingPlayer.gameboard;

    // No more moves after treating
    if (boardToTreat.checkVictory() || this.gameboard.checkVictory()) {
      return;
    }

    // Immediately have opposingPlayer - IF AI - make their turn
    // Also check for victory after moves were made
    const result = boardToTreat.receiveTreat(coords);
    if (result !== false && this.isHuman) {
      if (boardToTreat.checkVictory()) {
        dotMatrixObject.displayString("Woof! You won!");
      } else {
        if (result == 1) {
          dotMatrixObject.displayString("Miss!");
        } else {
          if (result.isSatiated()) {
            dotMatrixObject.displayString(`${result.name} full!`);
          } else {
            dotMatrixObject.displayString(`Fed ${result.name}`);
          }
        }
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
      } while (boardToTreat.receiveTreat([x, y]) === false);
    }
  }
}
