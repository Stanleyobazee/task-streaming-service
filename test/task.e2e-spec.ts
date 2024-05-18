import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TestDatabaseService } from "../src/config/test_db.service";
import { AppModule } from "../src/app.module";
import { useContainer } from "class-validator";
import { LoginResponse } from "../src/auth/dto/auth.dto";
import { TaskService } from "../src/task/task.service";
import { UsersService } from "../src/users/users.service";
import { userStub1, userStub2 } from "./stubs/users.stubs";
import { CreateTaskDto, UpdateTaskDto } from "../src/task/dto/task.dto";
import { taskStub1 } from "./stubs/task.stubs";
import { Types } from "mongoose";

const routes = {
  createTask: {
    method: "POST",
    path: "/tasks",
    describe: "create task",
  },
  fetchAllTasks: {
    method: "GET",
    path: "/tasks",
    describe: "fetch all tasks",
  },
  deleteTask: {
    method: "DELETE",
    path: "/tasks/",
    describe: "hard delete task",
  },
  updateTask: {
    method: "PATCH",
    path: "/tasks/",
    describe: "modify task details",
  },
};

const getTestName = (p: keyof typeof routes) =>
  `[${routes[p].method}] ${routes[p].path} (${routes[p].describe})`;
const getRoutePath = (p: keyof typeof routes, postfix?: string): string =>
  postfix ? routes[p].path.concat(postfix) : routes[p].path;

describe("TaskController", () => {
  let app: INestApplication;
  let taskService: TaskService, usersService: UsersService;
  let userBearerToken: string, userBearerToken1: string;
  let user_id: Types.ObjectId, task_id: Types.ObjectId;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    await app.init();

    taskService = await app.get(TaskService);
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
  const deleteResponse = (path: string) =>
    request(app.getHttpServer()).delete(path);
  // const getResponse = (path: string) => request(app.getHttpServer()).get(path);

  describe(getTestName("createTask"), () => {
    beforeAll(async () => {
      const user = await usersService.create(userStub1());
      user_id = user._id;

      // user-login
      const { body: userLoginResp }: { body: LoginResponse } = await request(
        app.getHttpServer(),
      )
        .post("/auth/login")
        .send({
          email: userStub1().email,
          password: userStub1().password,
        });
      userBearerToken = userLoginResp.access_token;
    });

    it("User needs to login to create task", async () => {
      const payload: Partial<CreateTaskDto> = {
        title: taskStub1().title,
        description: taskStub1().description,
        due_date: taskStub1().due_date,
      };

      const { status, body } = await postResponse(
        getRoutePath("createTask"),
      ).send(payload);

      expect(status).toBe(401);
      expect(body.message).toEqual("no auth token provided");
    });

    it("Cannot create task without title", async () => {
      const payload: Partial<CreateTaskDto> = {
        description: taskStub1().description,
        due_date: taskStub1().due_date,
      };
      const { status, body } = await postResponse(getRoutePath("createTask"))
        .send(payload)
        .auth(userBearerToken, { type: "bearer" });

      expect(status).toBe(400);
      expect(body.message[0]).toEqual(
        "title must be longer than or equal to 1 characters",
      );
    });

    it("Can create task with existing title", async () => {
      const payload: Partial<CreateTaskDto> = {
        title: taskStub1().title,
        description: taskStub1().description,
        due_date: taskStub1().due_date,
      };

      const response1 = await postResponse(getRoutePath("createTask"))
        .send(payload)
        .auth(userBearerToken, { type: "bearer" });

      expect(response1.status).toBe(201);

      const response2 = await postResponse(getRoutePath("createTask"))
        .send(payload)
        .auth(userBearerToken, { type: "bearer" });

      expect(response2.status).toBe(201);
      expect(response1.body.title).toEqual(response2.body.title);
    });

    it("Can create task with/without description", async () => {
      const payload: Partial<CreateTaskDto> = {
        title: taskStub1().title,
        due_date: taskStub1().due_date,
      };

      const response1 = await postResponse(getRoutePath("createTask"))
        .send(payload)
        .auth(userBearerToken, { type: "bearer" });

      expect(response1.status).toBe(201);
      expect(response1.body.description).toBeFalsy();

      payload.description = taskStub1().description;
      const response2 = await postResponse(getRoutePath("createTask"))
        .send(payload)
        .auth(userBearerToken, { type: "bearer" });

      expect(response2.status).toBe(201);
      expect(response2.body.description).toEqual(payload.description);
    });

    it("Cannot create task without due_date", async () => {
      const payload: Partial<CreateTaskDto> = {
        title: taskStub1().title,
      };
      const { status, body } = await postResponse(getRoutePath("createTask"))
        .send(payload)
        .auth(userBearerToken, { type: "bearer" });

      expect(status).toBe(400);
      expect(body.message[0]).toEqual(
        "due_date must be a valid ISO 8601 date string",
      );
    });
  });

  describe(getTestName("updateTask"), () => {
    beforeAll(async () => {
      const task = await taskService.create({ ...taskStub1(), user_id });
      task_id = task._id;

      await usersService.create(userStub2());

      // user-login
      const { body: userLoginResp }: { body: LoginResponse } = await request(
        app.getHttpServer(),
      )
        .post("/auth/login")
        .send({
          email: userStub2().email,
          password: userStub2().password,
        });
      userBearerToken1 = userLoginResp.access_token;
    });

    it("User needs to login to modify task", async () => {
      const payload: Partial<UpdateTaskDto> = {
        title: taskStub1().title,
        description: taskStub1().description,
        is_completed: taskStub1().is_completed,
        due_date: taskStub1().due_date,
      };

      const { status, body } = await patchResponse(
        getRoutePath("updateTask").concat(task_id.toString()),
      ).send(payload);

      expect(status).toBe(401);
      expect(body.message).toEqual("no auth token provided");
    });

    it("logged user is not task owner", async () => {
      const payload: Partial<UpdateTaskDto> = {
        title: taskStub1().title,
        description: taskStub1().description,
        is_completed: taskStub1().is_completed,
        due_date: taskStub1().due_date,
      };

      const { status, body } = await patchResponse(
        getRoutePath("updateTask").concat(task_id.toString()),
      )
        .send(payload)
        .auth(userBearerToken1, { type: "bearer" });

      expect(status).toBe(403);
      expect(body.message).toEqual("Cannot access this resource");
    });

    it("Can modify task title", async () => {
      const payload: Partial<UpdateTaskDto> = {
        title: taskStub1().title + "MODIFIED",
      };

      const { status } = await patchResponse(
        getRoutePath("updateTask").concat(task_id.toString()),
      )
        .send(payload)
        .auth(userBearerToken, { type: "bearer" });

      expect(status).toBe(200);

      const task = await taskService.findById(task_id.toString());
      expect(task.title.toLowerCase()).toEqual(payload.title.toLowerCase());
    });

    it("Can modify task description", async () => {
      const payload: Partial<UpdateTaskDto> = {
        description: taskStub1().description + "MODIFIED",
      };

      const { status } = await patchResponse(
        getRoutePath("updateTask").concat(task_id.toString()),
      )
        .send(payload)
        .auth(userBearerToken, { type: "bearer" });

      expect(status).toBe(200);

      const task = await taskService.findById(task_id.toString());
      expect(task.description.toLowerCase()).toEqual(
        payload.description.toLowerCase(),
      );
    });

    it("Can modify task completion status", async () => {
      const payload: Partial<UpdateTaskDto> = {
        is_completed: !taskStub1().title,
      };

      const { status } = await patchResponse(
        getRoutePath("updateTask").concat(task_id.toString()),
      )
        .send(payload)
        .auth(userBearerToken, { type: "bearer" });

      expect(status).toBe(200);

      const task = await taskService.findById(task_id.toString());
      expect(task.is_completed).toEqual(payload.is_completed);
    });

    it("Can modify task due_date", async () => {
      const payload: Partial<UpdateTaskDto> = {
        due_date: taskStub1().due_date,
      };

      const { status } = await patchResponse(
        getRoutePath("updateTask").concat(task_id.toString()),
      )
        .send(payload)
        .auth(userBearerToken, { type: "bearer" });

      expect(status).toBe(200);

      const task = await taskService.findById(task_id.toString());
      expect(task.due_date).toEqual(payload.due_date);
    });
  });

  describe(getTestName("deleteTask"), () => {
    it("User needs to login to delete task", async () => {
      const { status, body } = await deleteResponse(
        getRoutePath("deleteTask").concat(task_id.toString()),
      );

      expect(status).toBe(401);
      expect(body.message).toEqual("no auth token provided");
    });

    it("Logged user is not task owner", async () => {
      const { status, body } = await deleteResponse(
        getRoutePath("deleteTask").concat(task_id.toString()),
      ).auth(userBearerToken1, { type: "bearer" });

      expect(status).toBe(403);
      expect(body.message).toEqual("Cannot access this resource");
    });

    it("User can delete task", async () => {
      const { status } = await deleteResponse(
        getRoutePath("deleteTask").concat(task_id.toString()),
      ).auth(userBearerToken, { type: "bearer" });

      expect(status).toBe(200);

      // confirm it was deleted
      const task = await taskService.findById(task_id.toString());
      expect(task).toBeFalsy();
    });
  });
});
