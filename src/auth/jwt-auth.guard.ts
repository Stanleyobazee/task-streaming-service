import {
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
  CanActivate,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsersService } from "../users/users.service";
import { CurrentUser, JwtPayload } from "./dto/auth.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_ADMIN_KEY = "isAdmin";
export const AdminAuthGuard = () => SetMetadata(IS_ADMIN_KEY, true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  logger: Logger;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    this.logger = new Logger("JwtAuthGuard");
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // PUBLIC ROUTES
    const is_public = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (is_public) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("no auth token provided");
    }

    request["user"] = await this.getUserFromAuthenticationToken(token);
    if (!request.user) {
      throw new UnauthorizedException("invalid token");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers["authorization"]?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private async getUserFromAuthenticationToken(
    token: string,
  ): Promise<CurrentUser | null> {
    const payload: JwtPayload = this.jwtService.verify(token, {
      secret: this.configService.get("JWT_SECRET"),
    });

    const user = await this.usersService.findById(payload.sub);

    return !user ? null : { id: payload.sub };
  }
}
