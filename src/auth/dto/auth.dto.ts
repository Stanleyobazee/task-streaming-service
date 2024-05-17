import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsString()
  @IsEmail()
  email!: string;
  @IsString()
  @IsNotEmpty()
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
