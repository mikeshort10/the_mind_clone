import { generateGame } from "../handlers/generateGame";

describe("generateGame", () => {
  it("returns new game", () => {
    expect(generateGame("the-main-mind")).toMatchInlineSnapshot(`
      Object {
        "accruedLives": 3,
        "dealtCards": Array [],
        "lastPlayedIndex": -1,
        "mistakes": 0,
        "players": Array [
          "the-main-mind",
        ],
        "round": 1,
        "stars": 3,
        "status": "join",
      }
    `);
  });
});
