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
        opposingPlayer.AI_giveTreat("smart", this.gameboard);
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
    // intelligent mode - once a dog is uncovered, will make connected guesses
    else {
      let uncoveredGridDog = null;
      let currentCoord = [0, 0];

      // find a starting point to build from
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          let gridData = boardToTreat.getCoord([x, y]);

          // For this to be a valid point to build off:
          // 1) Is valid (not null)
          // 2) Isn't empty (is an object, not a 0 or 1)
          // 3) Has already been guessed (treated = true, otherwise AI would be cheating!)
          // 4) the dog hasn't been fully revealed
          if (
            gridData !== null &&
            typeof gridData === "object" &&
            gridData.treated &&
            !gridData.dog.isSatiated()
          ) {
            uncoveredGridDog = gridData;
            currentCoord = [x, y];
            //break the loop
            x = 10;
            y = 10;
          }
        }
      }

      // guess random if no valid points to build from exist
      if (uncoveredGridDog == null) {
        console.log("switching to random mode!");
        this.AI_giveTreat("random", boardToTreat);
      }
      // otherwise let's find a good adjacent point
      else {
        const dogIsVertical = this.#AI_shouldGuessVertical(
          currentCoord,
          boardToTreat
        );

        // start one above or left, then go down or right until making a valid  guess
        if (dogIsVertical) {
          let x = currentCoord[0];
          let y = currentCoord[1] - 1;
          while (boardToTreat.receiveTreat([x, y]) === false) {
            y = y + 1;
          }
        } else {
          let x =
            currentCoord[0] == 0 ? currentCoord[0] + 1 : currentCoord[0] - 1;
          let y = currentCoord[1];
          while (boardToTreat.receiveTreat([x, y]) === false) {
            x = x + 1;
          }
        }
      }
    }
  }

  // Note: does not currently check for 'fitting'
  // i.e. if the dog cannot possibly be horizontal or vertical because of boundaries
  #AI_shouldGuessVertical(currentCoord, boardToTreat) {
    const uncoveredGridDog = boardToTreat.getCoord(currentCoord);

    // Does the AI 'know' that the dog is horizontal from a known guess response?
    let gridDataRight = boardToTreat.getCoord([
      currentCoord[0] + 1,
      currentCoord[1],
    ]);
    if (
      typeof gridDataRight == "object" &&
      gridDataRight.treated &&
      gridDataRight.dog.name == uncoveredGridDog.dog.name
    ) {
      return false;
    } else {
      let gridDataBelow = boardToTreat.getCoord([
        currentCoord[0],
        currentCoord[1] + 1,
      ]);
      let gridDataAbove = boardToTreat.getCoord([
        currentCoord[0],
        currentCoord[1] - 1,
      ]);

      // Does the AI 'know' that the dog is NOT vertical by checking that...
      //  NOT vertical IF the point below AND above is...
      //    1) out of bounds OR
      //    2) a known miss OR
      //    3) an object AND has been treated AND is a different dog
      if (
        (gridDataBelow === null ||
          gridDataBelow == 1 ||
          (typeof gridDataBelow == "object" &&
            gridDataBelow.treated &&
            gridDataBelow.dog.name != uncoveredGridDog.dog.name)) &&
        (gridDataAbove === null ||
          gridDataAbove == 1 ||
          (typeof gridDataAbove == "object" &&
            gridDataAbove.treated &&
            gridDataAbove.dog.name != uncoveredGridDog.dog.name))
      ) {
        return false;
      }
    }

    return true;
  }
}
