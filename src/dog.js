export class Dog {
  constructor(length, name, treats) {
    this.length = length;
    this.name = name;
    this.treats = treats;
    this.coords = [];
  }

  addCoord(coord) {
    this.coords.push(coord);
  }

  isVertical() {
    if (this.coords.length == 0) {
      return false;
    } else {
      return this.coords[0][0] == this.coords[1][0]; // i.e. x value stays same
    }
  }

  feed() {
    this.treats += 1;
  }

  isSatiated() {
    return this.treats >= this.length;
  }

  resetTreats() {
    this.treats = 0;
  }
}
