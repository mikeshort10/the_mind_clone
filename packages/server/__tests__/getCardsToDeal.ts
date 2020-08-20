import { generateGame } from "../handlers/generateGame";
import { getCardsToDeal } from "../handlers/getCardsToDeal";

describe("updateGameMistake", () => {
  it("gets 1 card per player on round 1", () => {
    const players = ["Mike", "Muhammad", "Xiyu", "Diego"];
    const { dealtCards } = getCardsToDeal({ ...generateGame(""), players });
    expect(dealtCards).toHaveLength(players.length);
    // all values are unique
    expect(dealtCards).toHaveLength(new Set(dealtCards).size);
  });

  it("gets 5 card per player on round 5", () => {
    const round = 5;
    const players = ["Mike", "Muhammad", "Xiyu", "Diego"];
    const { dealtCards } = getCardsToDeal({
      ...generateGame(""),
      players,
      round,
    });
    expect(dealtCards).toHaveLength(players.length * round);
    // all values are unique
    expect(dealtCards).toHaveLength(new Set(dealtCards).size);
  });
});
