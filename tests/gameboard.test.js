import { Gameboard } from "../src/gameboard";

//addDog TEST BEGIN
test("addDog places a Dog object VERTICALLY extending from 0,0 to 0, 2", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 3, name: "Dashund", treats: 0 };
  const expectedDog = { dog: mockDog, treated: false };
  gameboard.addDog(mockDog, [0, 0], [0, 2]);
  expect(gameboard.getCoord([0, 0])).toEqual(expectedDog);
  expect(gameboard.getCoord([0, 1])).toEqual(expectedDog);
  expect(gameboard.getCoord([0, 2])).toEqual(expectedDog);
  expect(gameboard.getCoord([0, 3])).toBe(0);
});

test("places a Dog object HORIZONTALLY extending from 0,0 to 3, 0", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 4, name: "Dashund", treats: 0 };
  const expectedDog = { dog: mockDog, treated: false };
  gameboard.addDog(mockDog, [0, 0], [3, 0]);
  expect(gameboard.getCoord([0, 0])).toEqual(expectedDog);
  expect(gameboard.getCoord([1, 0])).toEqual(expectedDog);
  expect(gameboard.getCoord([2, 0])).toEqual(expectedDog);
  expect(gameboard.getCoord([3, 0])).toEqual(expectedDog);
  expect(gameboard.getCoord([4, 0])).toBe(0);
});

test("addDog places a Dog object HORIZONTALLY extended from 4,3 to 8, 3", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 5, name: "Dashund", treats: 0 };
  const expectedDog = { dog: mockDog, treated: false };
  gameboard.addDog(mockDog, [4, 3], [8, 3]);
  expect(gameboard.getCoord([4, 3])).toEqual(expectedDog);
  expect(gameboard.getCoord([5, 3])).toEqual(expectedDog);
  expect(gameboard.getCoord([6, 3])).toEqual(expectedDog);
  expect(gameboard.getCoord([7, 3])).toEqual(expectedDog);
  expect(gameboard.getCoord([8, 3])).toEqual(expectedDog);
  expect(gameboard.getCoord([9, 3])).toBe(0);
});

test("addDog refuses to place a Dog object diagonally", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 5, name: "Dashund", treats: 0 };
  expect(gameboard.addDog(mockDog, [4, 5], [8, 3])).toBe(false);
  expect(gameboard.getCoord([4, 5])).toBe(0);
});

test("addDog efuses to place a Dog object with a starting coordinate below the board", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 3, name: "Dashund", treats: 0 };
  expect(gameboard.addDog(mockDog, [0, -1], [0, 1])).toBe(false);
  expect(gameboard.getCoord([0, 0])).toBe(0);
});

test("addDog refuses to place a Dog object with an ending coordinate below the board", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 3, name: "Dashund", treats: 0 };
  expect(gameboard.addDog(mockDog, [0, 1], [0, -1])).toBe(false);
  expect(gameboard.getCoord([0, 0])).toBe(0);
});

test("addDog refuses to place a Dog object with an starting coordinate above the board", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 3, name: "Dashund", treats: 0 };
  expect(gameboard.addDog(mockDog, [0, 10], [0, 8])).toBe(false);
  expect(gameboard.getCoord([0, 9])).toBe(0);
});

test("addDog refuses to place a Dog object with an ending coordinate above the board", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 3, name: "Dashund", treats: 0 };
  expect(gameboard.addDog(mockDog, [0, 8], [0, 10])).toBe(false);
  expect(gameboard.getCoord([0, 9])).toBe(0);
});

test("addDog refuses to place a Dog object with a starting coordinate left of board", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 3, name: "Dashund", treats: 0 };
  expect(gameboard.addDog(mockDog, [-1, 3], [1, 3])).toBe(false);
  expect(gameboard.getCoord([0, 3])).toBe(0);
});

test("addDogrefuses to place a Dog object with an ending coordinate left of board", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 3, name: "Dashund", treats: 0 };
  expect(gameboard.addDog(mockDog, [1, 3], [-1, 3])).toBe(false);
  expect(gameboard.getCoord([0, 3])).toBe(0);
});

test("addDog refuses to place a Dog object with a starting coordinate right of board", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 3, name: "Dashund", treats: 0 };
  expect(gameboard.addDog(mockDog, [10, 3], [8, 3])).toBe(false);
  expect(gameboard.getCoord([9, 3])).toBe(0);
});

test("addDog refuses to place a Dog object with an ending coordinate right of board", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 3, name: "Dashund", treats: 0 };
  expect(gameboard.addDog(mockDog, [8, 3], [10, 3])).toBe(false);
  expect(gameboard.getCoord([9, 3])).toBe(0);
});

test("addDog refuses to place a Dog object whose starting and ending coords do not match Dog's length", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 3, name: "Dashund", treats: 0 };
  expect(gameboard.addDog(mockDog, [5, 5], [8, 5])).toBe(false);
  expect(gameboard.getCoord([5, 5])).toBe(0);
});
//addDog TEST END

//receiveTreat TEST BEGIN
test("receiveTreat on an empty spot records a miss", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 4, name: "Dashund", treats: 0 };
  gameboard.addDog(mockDog, [0, 0], [3, 0]);
  gameboard.receiveTreat([3, 3]);
  expect(gameboard.getCoord([3, 3])).toBe(1);
});

test("receiveTreat on an occupied spot records a hit", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 4, name: "Dashund", treats: 0, feed: jest.fn() };
  const expectedDog = { dog: mockDog, treated: true };
  gameboard.addDog(mockDog, [0, 0], [3, 0]);
  gameboard.receiveTreat([3, 0]);
  expect(gameboard.getCoord([3, 0])).toEqual(expectedDog);
  expect(mockDog.feed.mock.calls).toHaveLength(1);
});

test("receiveTreat rejects attempt on an already missed location", () => {
  const gameboard = new Gameboard();
  gameboard.receiveTreat([3, 0]);
  expect(gameboard.receiveTreat([3, 0])).toBe(false);
});

test("receiveTreat rejects attempt on an already treated location", () => {
  const gameboard = new Gameboard();
  const mockDog = { length: 4, name: "Dashund", treats: 0, feed: jest.fn() };
  gameboard.addDog(mockDog, [0, 0], [3, 0]);
  gameboard.receiveTreat([3, 0]);
  expect(gameboard.receiveTreat([3, 0])).toBe(false);
  expect(mockDog.feed.mock.calls).toHaveLength(1);
});
//receiveTreat TEST END

//checkVictory TEST BEGIN
test("checkVictory returns false when no dogs have been fed", () => {
  const gameboard = new Gameboard();
  expect(gameboard.checkVictory()).toBe(false);
});

test("checkVictory returns false after feeding some but not all dogs", () => {
  const gameboard = new Gameboard();
  gameboard.addDogByName("Chihuahua", [0, 0], [0, 1]);
  gameboard.addDogByName("Pug", [1, 0], [1, 2]);
  gameboard.addDogByName("Beagle", [2, 0], [2, 2]);
  gameboard.addDogByName("Dashund", [3, 0], [3, 3]);
  gameboard.addDogByName("Labrador", [4, 0], [4, 4]);
  //feed 4 of the dogs - but not labrador
  for (let y = 0; y <= 4; y++) {
    for (let x = 0; x <= 3; x++) {
      gameboard.receiveTreat([x, y]);
    }
  }
  expect(gameboard.checkVictory()).toBe(false);
});

test("checkVictory returns true after feeding all 5 default dogs", () => {
  const gameboard = new Gameboard();
  gameboard.addDogByName("Chihuahua", [0, 0], [0, 1]);
  gameboard.addDogByName("Pug", [1, 0], [1, 2]);
  gameboard.addDogByName("Beagle", [2, 0], [2, 2]);
  gameboard.addDogByName("Dashund", [3, 0], [3, 3]);
  gameboard.addDogByName("Labrador", [4, 0], [4, 4]);
  //feed all of these dogs to max
  for (let y = 0; y <= 4; y++) {
    for (let x = 0; x <= 4; x++) {
      gameboard.receiveTreat([x, y]);
    }
  }
  expect(gameboard.checkVictory()).toBe(true);
});
