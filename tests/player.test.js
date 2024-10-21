const Player = require("../src/player");

//constructor BEGIN
test("addDog places a Dog object VERTICALLY extending from 0,0 to 0, 2", () => {
  const player = new Player("Legend", true);
  expect(player.name).toBe("Legend");
  expect(player.isHuman).toBe(true);
});
//constructor END
