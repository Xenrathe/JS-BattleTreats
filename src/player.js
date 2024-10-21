const Gameboard = require("./gameboard");

class Player {
  constructor(name, isHuman) {
    this.name = name;
    this.isHuman = isHuman;

    this.gameboard = new Gameboard();
  }
}

module.exports = Player;
