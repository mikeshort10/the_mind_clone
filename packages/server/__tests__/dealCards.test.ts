import { createGame } from "../handlers/generateGame";
import { dealCards } from "../handlers/dealCards";
import { pipe } from "fp-ts/lib/function";
import { getCardsToDeal } from "../handlers/getCardsToDeal";
import { Players, Game } from "../../../types";
import { createNewPlayer } from "../handlers/addPlayerToGame";
import { R } from "../../../fp";

describe("dealCards", () => {
  const baseGame: Game = createGame("")({ playerName: "Mike", code: "ABCD" });
  it("returns 3 hands with 5 cards on round five", () => {
    const players: Players = {
      a: {
        playerName: "Mike",
        gameOwner: true,
        hand: [],
      },
      b: createNewPlayer("Muhammad"),
      c: createNewPlayer("Xiyu"),
    };
    const round = 5;
    const [hands] = pipe(
      { ...baseGame, players, round },
      getCardsToDeal,
      dealCards
    );
    expect(hands).toHaveLength(R.size(players));
    expect(hands[0]).toHaveLength(round);
  });

  it("returns 6 hands with 2 cards on round two", () => {
    const players: Players = {
      a: {
        playerName: "Mike",
        gameOwner: true,
        hand: [],
      },
      b: createNewPlayer("Muhammad"),
      c: createNewPlayer("Xiyu"),
      d: createNewPlayer("Winona"),
      e: createNewPlayer("Diego"),
      f: createNewPlayer("Artmond"),
    };
    const round = 2;
    const [hands] = pipe(
      { ...baseGame, players, round },
      getCardsToDeal,
      dealCards
    );
    expect(hands).toHaveLength(R.size(players));
    expect(hands[0]).toHaveLength(round);
  });
});
