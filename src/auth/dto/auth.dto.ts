import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class LoginDto {
  @IsString()
  @IsEmail()
  @Length(1, 256)
  email!: string;
  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  password!: string;
}

export class JwtPayload {
  sub: string; // id
}

export class CurrentUser {
  id: string;
}

export class LoginResponse {
  access_token: string;
  user: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}
