import { Injectable } from "@nestjs/common";
import { UserDto } from "./dto/user.dto";
import { User, UserDocument } from "./entities/user.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: UserDto): Promise<UserDocument> {
    return this.userModel.create(createUserDto);
  }

  async findById(id: string, with_password?): Promise<UserDocument> {
    return with_password
      ? this.userModel.findById(id).select("+password").exec()
      : this.userModel.findById(id).exec();
  }

  async findByEmail(
    email: string,
    with_password?: boolean,
  ): Promise<UserDocument> {
    return with_password
      ? this.userModel.findOne({ email }).select("+password").exec()
      : this.userModel.findOne({ email }).exec();
  }
}
