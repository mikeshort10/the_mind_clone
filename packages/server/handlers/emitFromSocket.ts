import { ActionType, EmitData } from "../../../types";

export const emitFromSocket = (socket: SocketIO.Socket) => {
  return (type: ActionType, message: EmitData): void => {
    socket.emit(type, message);
  };
};
