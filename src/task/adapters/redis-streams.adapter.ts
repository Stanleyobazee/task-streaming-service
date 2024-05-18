import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server, ServerOptions } from "socket.io";
import helmet from "helmet";
import { AuthService } from "../../auth/auth.service";
import { Request } from "express";
import { Logger } from "@nestjs/common";

export class RedisIoAdapter extends IoAdapter {
  private authService: AuthService;

  async connectToRedis(authSvc: AuthService) {
    this.authService = authSvc;
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const logger = new Logger("SocketAuth");

    // create WS server
    const server: Server = super.createIOServer(port, options);

    // WS Middlewares
    server.engine.use(helmet());

    server.engine.use(async (req, res, next) => {
      try {
        const user = await this.getUserFromAuthHeader(req);
        if (user) {
          req.headers.user = user.id;
          next();
        }
      } catch (e) {
        logger.error(`Authorization Error: ${e.message}`, e);
        next(e);
      }
    });

    return server;
  }

  async getUserFromAuthHeader(req: Request) {
    try {
      const [, token] = req.headers["authorization"]?.split(" ") ?? [];

      const user = await this.authService.getUserFromAuthenticationToken(token);
      if (!user) {
        throw new Error("Invalid credentials");
      }
      return user;
    } catch (e) {
      throw e;
    }
  }
}
