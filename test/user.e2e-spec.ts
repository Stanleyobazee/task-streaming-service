import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { userStub2, userStub1 } from "./stubs/users.stubs";
import { TestDatabaseService } from "../src/config/test_db.service";
import { UsersService } from "../src/users/users.service";
import { ChangePasswordDto, UserDto } from "../src/users/dto/user.dto";
import { AppModule } from "../src/app.module";
import { useContainer } from "class-validator";
import { LoginResponse } from "../src/auth/dto/auth.dto";

const routes = {
  signup: {
    method: "POST",
    path: "/users/signup",
    describe: "user signup",
  },
  changePassword: {
    method: "PATCH",
    path: "/users/change-password",
    describe: "change user password",
  },
  getUser: {
    method: "GET",
    path: "/users/profile",
    describe: "user profile",
  },
};

const getTestName = (p: keyof typeof routes) =>
  `[${routes[p].method}] ${routes[p].path} (${routes[p].describe})`;
const getRoutePath = (p: keyof typeof routes, postfix?: string): string =>
  postfix ? routes[p].path.concat(postfix) : routes[p].path;

describe("UsersController", () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    await app.init();

    usersService = await app.get(UsersService);

    return app.get(TestDatabaseService).clearTestDB();
  }, 30000);

  afterAll(async () => {
    return await app.close();
  }, 10000);

  const postResponse = (path: string) =>
    request(app.getHttpServer()).post(path);
  const patchResponse = (path: string) =>
    request(app.getHttpServer()).patch(path);
  const getResponse = (path: string) => request(app.getHttpServer()).get(path);

  describe(getTestName("signup"), () => {
    const user2: UserDto = userStub2();
    const user1: UserDto = userStub1();
    beforeAll(async () => {
      await usersService.create(userStub2());
    });

    it("User can not signup without email", async () => {
      const userDto: Partial<UserDto> = {
        firstname: user1.firstname,
        lastname: user1.lastname,
        password: user1.password,
      };
      const { status, body } = await postResponse(getRoutePath("signup")).send(
        userDto,
      );
      expect(status).toBe(400);
      expect(body.message[0]).toEqual(
        "email must be longer than or equal to 1 characters",
      );
    });

    it("User can not signup with existing email", async () => {
      const userDto: Partial<UserDto> = {
        email: user2.email,
        firstname: user2.firstname,
        lastname: user2.lastname,
        password: user2.password,
      };
      const { status, body } = await postResponse(getRoutePath("signup")).send(
        userDto,
      );
      expect(status).toBe(400);
      expect(body.message[0]).toEqual("email already registered");
    });

    it("User can not signup without firstname", async () => {
      const userDto: Partial<UserDto> = {
        lastname: user1.lastname,
        email: user1.email,
        password: user1.password,
      };
      const { status, body } = await postResponse(getRoutePath("signup")).send(
        userDto,
      );
      expect(status).toBe(400);
      expect(body.message[0]).toEqual(
        "firstname must be longer than or equal to 1 characters",
      );
    });

    it("User can not signup without lastname", async () => {
      const userDto: Partial<UserDto> = {
        firstname: user1.firstname,
        email: user1.email,
        password: user1.password,
      };
      const { status, body } = await postResponse(getRoutePath("signup")).send(
        userDto,
      );
      expect(status).toBe(400);
      expect(body.message[0]).toEqual(
        "lastname must be longer than or equal to 1 characters",
      );
    });

    it("User can not signup with weak password", async () => {
      const userDto: Partial<UserDto> = {
        firstname: user1.firstname,
        lastname: user1.lastname,
        email: user1.email,
        password: "weakasf",
      };
      const { status, body } = await postResponse(getRoutePath("signup")).send(
        userDto,
      );
      expect(status).toBe(400);
      expect(body.message[0]).toEqual(
        "password length must be above 8 and must have at least 1 lowercase, 1 uppercase, and 1 symbol",
      );
    });

    it("User can successfully signup", async () => {
      const userDto: UserDto = {
        email: user1.email,
        password: user1.password,
        firstname: user1.firstname,
        lastname: user1.password,
      };
      const { body, status } = await postResponse(getRoutePath("signup")).send(
        userDto,
      );
      expect(status).toBe(201);
      expect(body).toBeDefined();
      expect(body.email).toEqual(user1.email);
      expect(body.password).toBeFalsy();
    });
  });

  describe(getTestName("getUser"), () => {
    const user2: UserDto = userStub2();
    let userBearerToken: string;
    beforeAll(async () => {
      // user login
      const { body }: { body: LoginResponse } = await request(
        app.getHttpServer(),
      )
        .post("/auth/login")
        .send({ email: user2.email, password: user2.password });
      userBearerToken = body.access_token;
    });

    it("User needs to login to view profile", async () => {
      const { status, body } = await getResponse(getRoutePath("getUser"));
      expect(status).toBe(401);
      expect(body.message).toEqual("no auth token provided");
    });

    it("Logged user can view profile", async () => {
      const { status, body } = await getResponse(getRoutePath("getUser")).auth(
        userBearerToken,
        { type: "bearer" },
      );

      expect(status).toBe(200);
      expect(body.email).toEqual(user2.email);
      expect(body.firstname.toLowerCase()).toBe(user2.firstname.toLowerCase());
      expect(body.lastname.toLowerCase()).toBe(user2.lastname.toLowerCase());
    });
  });

  describe(getTestName("changePassword"), () => {
    const user2: UserDto = userStub2();
    const user1: UserDto = userStub1();
    let userBearerToken: string;
    beforeAll(async () => {
      // user login
      const { body }: { body: LoginResponse } = await request(
        app.getHttpServer(),
      )
        .post("/auth/login")
        .send({ email: user2.email, password: user2.password });
      userBearerToken = body.access_token;
    });

    it("User needs to login to change password", async () => {
      const changePasswordDto: ChangePasswordDto = {
        old_password: user2.password,
        new_password: user1.password,
      };
      const { status, body } = await patchResponse(
        getRoutePath("changePassword"),
      ).send(changePasswordDto);
      expect(status).toBe(401);
      expect(body.message).toEqual("no auth token provided");
    });

    it("User can not change password without old_password", async () => {
      const changePasswordDto: Partial<ChangePasswordDto> = {
        new_password: user1.password,
      };

      const { status, body } = await patchResponse(
        getRoutePath("changePassword"),
      )
        .send(changePasswordDto)
        .auth(userBearerToken, { type: "bearer" });
      expect(status).toBe(400);
      expect(body.message[0]).toEqual(
        "old_password must be longer than or equal to 1 characters",
      );
    });

    it("User can not change password to weak/invalid password", async () => {
      const changePasswordDto: Partial<ChangePasswordDto> = {
        old_password: user2.password,
        new_password: "weakasf",
      };

      const { status, body } = await patchResponse(
        getRoutePath("changePassword"),
      )
        .send(changePasswordDto)
        .auth(userBearerToken, { type: "bearer" });
      expect(status).toBe(400);
      expect(body.message[0]).toEqual(
        "password length must be above 8 and must have at least 1 lowercase, 1 uppercase, and 1 symbol",
      );
    });

    it("Old Password is Invalidated", async () => {
      const changePasswordDto: Partial<ChangePasswordDto> = {
        old_password: user2.password,
        new_password: user1.password,
      };

      const { status, body } = await patchResponse(
        getRoutePath("changePassword"),
      )
        .send(changePasswordDto)
        .auth(userBearerToken, { type: "bearer" });
      expect(status).toBe(200);
      expect(body.message).toEqual("success");

      // Attempt login with old password
      const { body: loginBodyF, status: loginStatusF } = await request(
        app.getHttpServer(),
      )
        .post("/auth/login")
        .send({ email: user2.email, password: user2.password });

      expect(loginStatusF).toBe(400);
      expect(loginBodyF.message).toEqual("incorrect email or password");

      // Attempt login with new password
      const { body: loginBody, status: loginStatus } = await request(
        app.getHttpServer(),
      )
        .post("/auth/login")
        .send({ email: user2.email, password: user1.password });

      expect(loginStatus).toBe(201);
      expect(loginBody.user.email).toEqual(user2.email);
    });
  });
});
