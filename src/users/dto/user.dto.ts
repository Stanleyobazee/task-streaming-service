import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from "class-validator";
import { EmailNotRegistered } from "../validators/email-not-registered";

export class UserDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  lastname: string;

  @IsString()
  @IsEmail()
  @Length(1, 256)
  @EmailNotRegistered()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minLength: 8,
    },
    {
      message:
        "password length must be above 8 and must have at least 1 lowercase, 1 uppercase, and 1 symbol",
    },
  )
  password: string;
}

export class NewUserResponse {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  old_password!: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minLength: 8,
    },
    {
      message:
        "password length must be above 8 and must have at least 1 lowercase, 1 uppercase, and 1 symbol",
    },
  )
  new_password!: string;
}
