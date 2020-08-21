import { ActionType, EmitData } from "../../../types";
import { Namespace, Socket } from "socket.io";

export const emitToRoom = (socket: Socket, connection: Namespace) => {
  return (action: ActionType, payload: EmitData, emitToSelf = false): void => {
    const emitter = emitToSelf ? connection : socket;
    // eslint-disable-next-line functional/no-expression-statement
    emitter.in(payload.code).emit(action, payload);
    socket.emit(action, payload);
  };
};
