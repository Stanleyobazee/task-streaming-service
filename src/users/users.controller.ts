import { Controller, Post, Body, Logger } from "@nestjs/common";
import { UsersService } from "./users.service";
import { NewUserResponse, UserDto } from "./dto/user.dto";

@Controller("users")
export class UsersController {
  logger: Logger;
  constructor(private readonly usersService: UsersService) {
    this.logger = new Logger("UsersController");
  }

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
}
