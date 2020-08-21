import { ActionType, EmitData } from "../../../types";

export const emitFromSocket = (socket: SocketIO.Socket) => {
  return (type: ActionType, message: EmitData): void => {
    console.log("emitting", type, message);
    socket.emit(type, message);
  };
};
