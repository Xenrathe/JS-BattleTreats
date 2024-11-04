import { Gameboard } from "./gameboard";

export class Player {
  constructor(name, isHuman, boardDom) {
    this.name = name;
    this.isHuman = isHuman;

    this.gameboard = new Gameboard(boardDom);
  }
}
