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
