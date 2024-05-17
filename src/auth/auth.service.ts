import { Injectable } from "@nestjs/common";
import { CurrentUser, JwtPayload } from "./dto/auth.dto";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  public async getUserFromAuthenticationToken(
    token: string,
  ): Promise<CurrentUser | null> {
    const payload: JwtPayload = this.jwtService.verify(token, {
      secret: this.configService.get("JWT_SECRET"),
    });

    const user = await this.usersService.findById(payload.sub);

    return !user ? null : { id: payload.sub };
  }
}
