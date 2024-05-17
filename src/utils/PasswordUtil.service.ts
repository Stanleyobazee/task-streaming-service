import * as bcrypt from "bcryptjs";
import { v4 as uuidV4 } from "uuid";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PasswordUtils {
  constructor() {}

  hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  correctPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  generateUUID(): string {
    return uuidV4();
  }

  generate4Digits(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
  }
}
