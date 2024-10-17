const Dog = require("./dog");

class Gameboard {
  // board array contains one of three:
  // 0 for empty
  // 1 for missed treat
  // an object: {dog: the occupying dog object, treated: false or true}
  #board;
  #dogs;

  constructor() {
    this.resetBoard();
  }

  // adds a pre-existing Dog (e.g. from the #dogs array) starting at firstCoord and ending at secondCoord
  // returns false for incorrect coords (diagonal, out of bounds, already occupied, etc)
  addDog(dogObject, firstCoord, secondCoord) {
    // Return false if an invalid point
    if (
      this.getCoord(firstCoord) == null ||
      this.getCoord(secondCoord) == null
    ) {
      return false;
    }

    //Vertical
    if (firstCoord[0] == secondCoord[0] && firstCoord[1] != secondCoord[1]) {
      const x = firstCoord[0];
      const startYCoord = firstCoord[1];
      const endYCoord = secondCoord[1];

      //check for length mismatch
      const length = Math.abs(startYCoord - endYCoord) + 1;
      if (length != dogObject.length) {
        return false;
      }

      const step = startYCoord < endYCoord ? 1 : -1; //Could be increase or decrease

      for (let y = startYCoord; y != endYCoord + step; y += step) {
        this.#board[x][y] = { dog: dogObject, treated: false };
      }

      return true;
    }
    //Horizontal
    else if (
      firstCoord[0] != secondCoord[0] &&
      firstCoord[1] == secondCoord[1]
    ) {
      const y = firstCoord[1];
      const startXCoord = firstCoord[0];
      const endXCoord = secondCoord[0];

      //check for length mismatch
      const length = Math.abs(startXCoord - endXCoord) + 1;
      if (length != dogObject.length) {
        return false;
      }

      const step = startXCoord < endXCoord ? 1 : -1; //Could be increase or decrease

      for (let x = startXCoord; x != endXCoord + step; x += step) {
        this.#board[x][y] = { dog: dogObject, treated: false };
      }

      return true;
    }
    //Diagonal or other error cases
    else {
      return false;
    }
  }

  // finds the given dog in #dogs and then calls addDog for that dog
  // returns false if no such dog was found in #dogs
  addDogByName(dogName, firstCoord, secondCoord) {
    let dogObject = null;
    this.#dogs.forEach((dog) => {
      if (dog.name == dogName) {
        dogObject = dog;
      }
    });

    if (dogObject != null) {
      this.addDog(dogObject, firstCoord, secondCoord);
    } else {
      return false;
    }
  }

  // returns true if all Dogs in #dogs have been fully fed
  checkVictory() {
    let victoryStatus = true;
    this.#dogs.forEach((dog) => {
      if (dog.isSatiated() == false) {
        victoryStatus = false;
      }
    });

    return victoryStatus;
  }

  // returns the status of a given [x, y] cooords
  // 0: empty
  // 1: empty but already targeted
  // a {dog: dogObject, treated: true/false} object, where 'treated' represents an attempted feed
  getCoord(coords) {
    const xCoord = coords[0];
    const yCoord = coords[1];

    if (xCoord >= this.#board.length || xCoord < 0) {
      return null;
    } else if (yCoord >= this.#board[0].length || yCoord < 0) {
      return null;
    } else {
      return this.#board[xCoord][yCoord];
    }
  }

  // attempts to treat a given coords location
  // 0 -> 1
  // 1 -> make no change, return false
  // {dog: dogObject, treated: false} -> {dog: dogObject, treated: true}
  // {dog: dogObject, treated: true} -> make no change, return false
  receiveTreat(coords) {
    const currentValue = this.getCoord(coords);
    const xCoord = coords[0];
    const yCoord = coords[1];

    if (currentValue == 1) {
      return false;
    } else if (currentValue == 0) {
      this.#board[xCoord][yCoord] = 1;
      return true;
    } else if (currentValue.treated == true) {
      return false;
    } else {
      currentValue.dog.feed();
      this.#board[xCoord][yCoord].treated = true;
      return true;
    }
  }

  // returns the 10x10 2d array #board to a blank state of all 0s
  // resets #dogs to default 5 dogs, with no treats
  resetBoard() {
    this.#board = Array(10)
      .fill()
      .map(() => Array(10).fill(0));

    this.#dogs = [
      new Dog(2, "Chihuahua", 0),
      new Dog(3, "Pug", 0),
      new Dog(3, "Beagle", 0),
      new Dog(4, "Dashund", 0),
      new Dog(5, "Labrador", 0),
    ];
  }
}

module.exports = Gameboard;
