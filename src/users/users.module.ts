import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./entities/user.entity";
import { UserIdExistsConstraint } from "./validators/user-id-exists";
import { EmailNotRegisteredConstraint } from "./validators/email-not-registered";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    EmailNotRegisteredConstraint,
    UserIdExistsConstraint,
  ],
  exports: [
    MongooseModule,
    UsersService,
    UserIdExistsConstraint,
    EmailNotRegisteredConstraint,
  ],
})
export class UsersModule {}
