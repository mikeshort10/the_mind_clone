import { generateGame } from "../handlers/generateGame";
import { dealCards } from "../handlers/dealCards";
import { pipe } from "fp-ts/lib/function";
import { getCardsToDeal } from "../handlers/getCardsToDeal";

describe("dealCards", () => {
  const baseGame = generateGame("");
  it("returns 3 hands with 5 cards on round five", () => {
    const players = ["Mike", "Muhammad", "Winona"];
    const round = 5;
    const hands = pipe(
      { ...baseGame, players, round },
      getCardsToDeal,
      dealCards
    );
    expect(hands).toHaveLength(players.length);
    expect(hands[0]).toHaveLength(round);
  });

  it("returns 6 hands with 2 cards on round two", () => {
    const players = ["Mike", "Muhammad", "Winona", "Xiyu", "Five", "Ford"];
    const round = 2;
    const hands = pipe(
      { ...baseGame, players, round },
      getCardsToDeal,
      dealCards
    );
    expect(hands).toHaveLength(players.length);
    expect(hands[0]).toHaveLength(round);
  });
});
