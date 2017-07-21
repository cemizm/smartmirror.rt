import * as express from "express";
import * as http from "http";
import * as socketIo from "socket.io";

class Server {
  public readonly PORT = 8080;
  public app: any;
  private server: any;
  private io: any;
  private port: number;

  constructor() {
    this.createApp();
    this.config();
    this.createServer();
    this.sockets();
    this.listen();
  }

  private createApp(): void {
    this.app = express();
  }

  private createServer(): void {
    this.server = http.createServer(this.app);
  }

  private config(): void {
    this.port = +process.env.PORT || this.PORT;
  }

  private sockets(): void {
    this.io = socketIo(this.server);
  }

  private listen(): void {
    this.server.listen(this.port, () => {
    });

    this.io.on("connect", (socket: any) => {
      const mirrorId = socket.handshake.query.mirrorId;

      if (mirrorId) {
        socket.join(mirrorId);
      } else {
        socket.on("update", (mirror: any) => {
          if (mirror && mirror.id)
            socket.to(mirror.id).emit("update", mirror);
        });

        socket.on("action", (action: any) => {
          if (action && action.mirrorId)
            socket.to(action.mirrorId).emit("action", action);
        });
      }

      socket.on("disconnect", () => {
        if (mirrorId) socket.leave(mirrorId);
      });
    });
  }
}

export default new Server().app;
