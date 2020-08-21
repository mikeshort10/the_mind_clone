import { ActionType, EmitData } from "../../../types";
import { Namespace, Socket } from "socket.io";

export const emitToRoom = (socket: Socket, connection: Namespace) => (
  code: string,
  action: ActionType,
  payload: EmitData,
  emitToSelf = false
): void => {
  const emitter = emitToSelf ? connection : socket;
  emitter.in(code).emit(action, payload);
};
