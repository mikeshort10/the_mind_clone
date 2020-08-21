import { actions } from "../../../types";
import { Socket } from "socket.io";

export const emitError = (
  socket: Socket,
  code: string,
  defaultError?: string
) => {
  return (error = defaultError) => {
    socket.emit(actions.CLIENT_ERROR, { code, error });
  };
};
