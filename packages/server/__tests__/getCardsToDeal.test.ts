import { createGame } from "../handlers/generateGame";
import { getCardsToDeal } from "../handlers/getCardsToDeal";
import { Players } from "../../../types";
import { createNewPlayer } from "../handlers/addPlayerToGame";
import { R } from "../../../fp";

describe("updateGameMistake", () => {
  it("gets 1 card per player on round 1", () => {
    const players: Players = {
      a: { playerName: "Mike", hand: [], gameOwner: true },
      b: createNewPlayer("Muhammad"),
      c: createNewPlayer("Xiyu"),
      d: createNewPlayer("Diego"),
    };

    const { dealtCards } = getCardsToDeal({
      ...createGame("socketId")({ playerName: "", code: "ABCD" }),
      players,
    });
    expect(dealtCards).toHaveLength(R.size(players));
    // all values are unique
    expect(dealtCards).toHaveLength(new Set(dealtCards).size);
  });

  it("gets 5 card per player on round 5", () => {
    const round = 5;
    const players: Players = {
      a: { playerName: "Mike", hand: [], gameOwner: true },
      b: createNewPlayer("Muhammad"),
      c: createNewPlayer("Xiyu"),
      d: createNewPlayer("Diego"),
    };
    const { dealtCards } = getCardsToDeal({
      ...createGame("socketId")({ playerName: "Mike", code: "ABCD" }),
      players,
      round,
    });
    expect(dealtCards).toHaveLength(R.size(players ) * round);
    // all values are unique
    expect(dealtCards).toHaveLength(new Set(dealtCards).size);
  });
});
