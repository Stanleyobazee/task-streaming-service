import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { LoginDto } from "../src/auth/dto/auth.dto";
import { userStub1, userStub2 } from "./stubs/users.stubs";
import { TestDatabaseService } from "../src/config/test_db.service";
import { UsersService } from "../src/users/users.service";
import { UserDto } from "../src/users/dto/user.dto";
import { AppModule } from "../src/app.module";

const routes = {
  login: {
    method: "POST",
    path: "/auth/login",
    describe: "user login via email",
  },
};

const getTestName = (p: keyof typeof routes) =>
  `[${routes[p].method}] ${routes[p].path} (${routes[p].describe})`;
const getRoutePath = (p: keyof typeof routes, postfix?: string): string =>
  postfix ? routes[p].path.concat(postfix) : routes[p].path;

describe("AuthController", () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    usersService = await app.get(UsersService);

    return app.get(TestDatabaseService).clearTestDB();
  }, 30000);

  afterAll(async () => {
    return await app.close();
  }, 10000);

  const postResponse = (path: string) =>
    request(app.getHttpServer()).post(path);

  describe(getTestName("login"), () => {
    const activeUser: UserDto = userStub1();
    beforeAll(async () => {
      await usersService.create(userStub1());
      await usersService.create(userStub2());
    });

    it("User can successfully login", async () => {
      const loginDto: LoginDto = {
        email: activeUser.email,
        password: activeUser.password,
      };
      const { body, status } = await postResponse(getRoutePath("login")).send(
        loginDto,
      );
      expect(status).toBe(201);
      expect(body).toBeDefined();
      expect(body.user).toBeDefined();
      expect(body.user.email).toEqual(loginDto.email);
      expect(body.user.password).toBeFalsy();
      expect(body.access_token).toBeTruthy();
    });

    it("User can not login without email", async () => {
      const loginDto: Partial<LoginDto> = {
        password: activeUser.password,
      };
      const { status, body } = await postResponse(getRoutePath("login")).send(
        loginDto,
      );
      expect(status).toBe(400);
      expect(body.message[0]).toEqual(
        "email must be longer than or equal to 1 characters",
      );
    });

    it("User can not login without password", async () => {
      const loginDto: Partial<LoginDto> = {
        email: activeUser.email,
      };
      const { status, body } = await postResponse(getRoutePath("login")).send(
        loginDto,
      );
      expect(status).toBe(400);
      expect(body.message[0]).toEqual(
        "password must be longer than or equal to 1 characters",
      );
    });

    it("User can not login with incorrect password", async () => {
      const loginDto: Partial<LoginDto> = {
        email: activeUser.email,
        password: "obviously long incorrect password",
      };
      const { status, body } = await postResponse(getRoutePath("login")).send(
        loginDto,
      );
      expect(status).toBe(400);
      expect(body.message).toEqual("incorrect email or password");
    });
  });
});
