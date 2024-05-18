import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { CurrentUser, JwtPayload } from "./dto/auth.dto";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async getUserFromAuthenticationToken(
    token: string,
  ): Promise<CurrentUser | null> {
    const payload: JwtPayload = this.jwtService.verify(token, {
      secret: this.configService.get("JWT_SECRET"),
    });

    const user = await this.usersService.findById(payload.sub);

    return !user ? null : { id: payload.sub };
  }
}
