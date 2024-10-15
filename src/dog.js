class Dog {
  constructor(length, name, hits) {
    this.length = length;
    this.name = name;
    this.hits = hits;
    this.isSunk = false; // No reason to instantiate a sunk object ever
  }
}
