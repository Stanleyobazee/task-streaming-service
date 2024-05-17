import {
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
  CanActivate,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "./auth.service";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_ADMIN_KEY = "isAdmin";
export const AdminAuthGuard = () => SetMetadata(IS_ADMIN_KEY, true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  logger: Logger;
  constructor(
    private authService: AuthService,
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

    request["user"] =
      await this.authService.getUserFromAuthenticationToken(token);
    if (!request.user) {
      throw new UnauthorizedException("invalid token");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers["authorization"]?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
