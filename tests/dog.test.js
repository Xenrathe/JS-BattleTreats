import { Dog } from "../src/dog";

test("creates a smallDog Dog object of length 1, treats 0, name 'Pom'", () => {
  const smallDog = new Dog(1, "Pom", 0);
  expect(smallDog.treats).toBe(0);
  expect(smallDog.length).toBe(1);
  expect(smallDog.name).toBe("Pom");
});

test("creates a largeDog Dog object of length 5, treats 2, name 'Great Dane'", () => {
  const largeDog = new Dog(5, "Great Dane", 2);
  expect(largeDog.treats).toBe(2);
  expect(largeDog.length).toBe(5);
  expect(largeDog.name).toBe("Great Dane");
});

test("created a fedDog Dog object of length 4, treats 4, which should already be satiated", () => {
  const fedDog = new Dog(4, "Dashund", 4);
  expect(fedDog.isSatiated()).toBe(true);
});

test("feeds a smallDog once, thereby making it satiated", () => {
  const smallDog = new Dog(1, "Pom", 0);
  smallDog.feed();
  expect(smallDog.isSatiated()).toBe(true);
});

test("feeds a smallDog twice, thereby making it satiated", () => {
  const smallDog = new Dog(1, "Pom", 0);
  smallDog.feed();
  smallDog.feed();
  expect(smallDog.isSatiated()).toBe(true);
});

test("feeds a largeDog two times, which will not satiate it", () => {
  const largeDog = new Dog(5, "Great Dane", 2);
  largeDog.feed();
  largeDog.feed();
  expect(largeDog.isSatiated()).toBe(false);
});

test("feeds a largeDog three times, which will satiate it", () => {
  const largeDog = new Dog(5, "Great Dane", 2);
  largeDog.feed();
  largeDog.feed();
  largeDog.feed();
  expect(largeDog.isSatiated()).toBe(true);
});

test("resets a fedDog's treats, thereby no longer making it satiated", () => {
  const fedDog = new Dog(4, "Dashund", 4);
  fedDog.resetTreats();
  expect(fedDog.isSatiated()).toBe(false);
});
