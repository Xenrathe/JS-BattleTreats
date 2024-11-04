import { Gameboard } from "./gameboard";

export class Player {
  constructor(name, isHuman, boardDom) {
    this.name = name;
    this.isHuman = isHuman;

    this.gameboard = new Gameboard(boardDom);
  }

  giveTreat(coords, opposingPlayer) {
    const boardToTreat = opposingPlayer.gameboard;

    if (boardToTreat.checkVictory()) {
      return;
    }

    // Immediately have opposingPlayer - IF AI - make their turn
    // Also check for victory after moves were made
    if (boardToTreat.receiveTreat(coords) && this.isHuman) {
      if (boardToTreat.checkVictory()) {
        alert(`Woof woof ${this.name}! You won!`);
      } else {
        opposingPlayer.AI_giveTreat("random", this.gameboard);
        if (this.gameboard.checkVictory()) {
          alert(`Ruf roh ${this.name}... You lost!`);
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
