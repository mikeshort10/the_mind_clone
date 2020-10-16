import { generateGame } from "../handlers/generateGame";

describe("generateGame", () => {
  it("returns new game", () => {
    expect(
      generateGame("socket-id")({ playerName: "the-main-mind", code: "ABCD" })
    ).toMatchInlineSnapshot(`
      Object {
        "_tag": "Some",
        "value": Object {
          "accruedLives": 3,
          "code": "ABCD",
          "dealtCards": Array [],
          "lastPlayedIndex": -1,
          "mistakes": 0,
          "players": Object {
            "socket-id": Object {
              "gameOwner": true,
              "hand": Array [],
              "playerName": "the-main-mind",
            },
          },
          "round": 1,
          "stars": 3,
          "status": "join",
        },
      }
    `);
  });
});
