import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
} from "@nestjs/common";
import { JwtPayload, LoginDto, LoginResponse } from "./dto/auth.dto";
import { Public } from "./jwt-auth.guard";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { PasswordUtils } from "src/utils/PasswordUtil.service";

@Controller("auth")
export class AuthController {
  logger: Logger;
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordUtils: PasswordUtils,
  ) {
    this.logger = new Logger("AuthController");
  }

  @Public()
  @Post("login")
  async login(@Body() payload: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(payload.email, true);
    if (user) {
      if (this.passwordUtils.correctPassword(payload.password, user.password)) {
        const payload: JwtPayload = {
          sub: user._id.toString(),
        };

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id: user._id.toString(),
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
          },
        };
      }
    }

    throw new BadRequestException("incorrect email or password");
  }
}
