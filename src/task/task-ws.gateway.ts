import {
  WebSocketGateway,
  WsException,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from "@nestjs/websockets";
import { config } from "dotenv";
config();
import { Socket, Server } from "socket.io";
import { Logger } from "@nestjs/common";
import { Task } from "./entities/task.entity";

// port 0 means the websocket will use same port as the app server
@WebSocketGateway(0, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_LIVE_HOST
        : [`http://localhost:${process.env.PORT}`],
  },
  allowEIO3: true, // allow socket.io v2 clients
  transports: ["websocket", "polling"], // order of preference
  cookie: true,
})
export class TaskWSGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("WebsocketGateway");
  }

  async handleConnection(client: Socket): Promise<any> {
    try {
      const user_id = this.getUserIdFromSocket(client);

      // add all devices with this userId to a Channel
      client.join(this.getUserDevicesChannelName(user_id));

      client.broadcast.emit("connection", {
        user_id,
        online: true,
      });

      return { error: false, message: "connected", data: null };
    } catch (e) {
      await client.disconnect();
      throw new WsException(e.message);
    }
  }

  async handleDisconnect(client: Socket): Promise<any> {
    try {
      const userId = this.getUserIdFromSocket(client);

      client.broadcast.emit("connection", {
        user_id: userId,
        online: false,
      });
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  emitTask(task: Task) {
    this.server
      .to(this.getUserDevicesChannelName(task.user_id.toString()))
      .emit("data_stream", task);
  }

  getUserIdFromSocket(socket: Socket): string {
    return String(socket.request.headers?.user);
  }

  getUserDevicesChannelName(userId: string): string {
    return `${userId}-client-devices`;
  }
}
