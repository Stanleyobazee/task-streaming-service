import {
  Controller,
  Post,
  Body,
  Logger,
  Patch,
  BadRequestException,
  Get,
  Request,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { ChangePasswordDto, NewUserResponse, UserDto } from "./dto/user.dto";
import { Public } from "src/auth/jwt-auth.guard";
import { PasswordUtils } from "src/utils/PasswordUtil.service";

@Controller("users")
export class UsersController {
  logger: Logger;
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordUtils: PasswordUtils,
  ) {
    this.logger = new Logger("UsersController");
  }

  @Public()
  @Post("signup")
  async signup(@Body() createUserDto: UserDto): Promise<NewUserResponse> {
    const user = await this.usersService.create(createUserDto);
    return {
      _id: user._id.toString(),
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    };
  }

  @Patch("change-password")
  async changePassword(@Body() payload: ChangePasswordDto, @Request() req) {
    const user = await this.usersService.findById(req.user.id, true);
    const isValidPassword = this.passwordUtils.correctPassword(
      payload.old_password,
      user.password,
    );
    if (!isValidPassword) {
      throw new BadRequestException("wrong password");
    }

    user.password = payload.new_password;
    await user.save();
    return { message: "success" };
  }

  @Get("profile")
  async getUser(@Request() req) {
    return this.usersService.findById(req.user.id);
  }
}
