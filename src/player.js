import { Gameboard } from "./gameboard";

export class Player {
  constructor(name, isHuman, gridObject) {
    this.name = name;
    this.isHuman = isHuman;

    this.gameboard = new Gameboard(gridObject);
  }
}
