import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  Query,
  Patch,
  Logger,
  ForbiddenException,
  Delete,
} from "@nestjs/common";
import { TaskService } from "./task.service";
import {
  CreateTaskDto,
  TaskIdDto,
  TaskPaginationRequestDto,
  UpdateTaskDto,
} from "./dto/task.dto";
import { TaskDocument } from "./entities/task.entity";
import { PaginationResponseDto } from "../utils/Pagination";
import { TaskWSGateway } from "./task-ws.gateway";

@Controller("tasks")
export class TaskController {
  logger: Logger;
  constructor(
    private readonly taskService: TaskService,
    private readonly taskWSGateway: TaskWSGateway,
  ) {
    this.logger = new Logger("TaskController");
  }

  @Post()
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req,
  ): Promise<TaskDocument> {
    createTaskDto.user_id = req.user.id;

    const task = await this.taskService.create(createTaskDto);
    this.taskWSGateway.emitTask(task);
    return task;
  }

  @Patch("/:task_id")
  async updateTask(
    @Param() { task_id }: TaskIdDto,
    @Body() body: UpdateTaskDto,
    @Request() req,
  ): Promise<TaskDocument> {
    const { user_id } = await this.taskService.findById(task_id);
    if (user_id != req.user.id) {
      throw new ForbiddenException("Cannot access this resource");
    }

    return this.taskService.updateOne({ _id: task_id }, body);
  }

  @Get("/:task_id")
  async singleTask(
    @Param() { task_id }: TaskIdDto,
    @Request() req,
  ): Promise<TaskDocument> {
    const task = await this.taskService.findById(task_id);
    if (task.user_id != req.user.id) {
      throw new ForbiddenException("Cannot access this resource");
    }

    return task;
  }

  @Get("")
  async fetchTasks(
    @Query() query: TaskPaginationRequestDto,
    @Request() req,
  ): Promise<PaginationResponseDto<TaskDocument>> {
    return {
      meta: {
        limit: query.limit,
        page_number: query.page,
        total: await this.taskService.countTasks(req.user.id, query),
      },
      data: await this.taskService.fetchTasks(req.user.id, query),
    };
  }

  @Delete("/:task_id")
  async deleteTask(
    @Param() { task_id }: TaskIdDto,
    @Request() req,
  ): Promise<Record<string, string>> {
    const task = await this.taskService.deleteOne({
      _id: task_id,
      user_id: req.user.id,
    });
    if (!task) {
      throw new ForbiddenException("Cannot access this resource");
    }

    return { message: "success" };
  }
}
