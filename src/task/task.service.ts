import { Injectable } from "@nestjs/common";
import {
  CreateTaskDto,
  ITaskFilter,
  TaskPaginationRequestDto,
  UpdateTaskDto,
} from "./dto/task.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Task, TaskDocument } from "./entities/task.entity";
import { Model } from "mongoose";
import { ObjectIdFromHex } from "../utils/mongo";
import { CurrentTime } from "../utils/date";

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}
  create(createTaskDto: CreateTaskDto): Promise<TaskDocument> {
    return this.taskModel.create(createTaskDto);
  }

  updateOne(filter: Partial<ITaskFilter>, update: Partial<UpdateTaskDto>) {
    return this.taskModel.findOneAndUpdate(filter, update, { new: true });
  }

  deleteOne(filter: Partial<ITaskFilter>) {
    return this.taskModel.findOneAndDelete(filter);
  }

  findById(id: string): Promise<TaskDocument> {
    return this.taskModel.findById(id);
  }

  async countTasks(
    user_id: string,
    { start_date, due_date, is_completed }: TaskPaginationRequestDto,
  ): Promise<number> {
    const start_date_query = !start_date
      ? {}
      : { created_at: { $gte: start_date } };
    const due_date_query = !due_date ? {} : { due_date: { $gte: due_date } };

    const is_completed_query = is_completed ? { is_completed: true } : {};

    return this.taskModel.countDocuments({
      user_id: user_id,
      ...start_date_query,
      ...due_date_query,
      ...is_completed_query,
    });
  }

  async fetchTasks(
    user_id: string,
    {
      limit,
      start_date,
      due_date,
      page,
      is_completed,
    }: Partial<TaskPaginationRequestDto>,
  ): Promise<Array<Partial<TaskDocument>>> {
    const start_date_query = !start_date
      ? {}
      : { created_at: { $gte: start_date } };
    const due_date_query = !due_date ? {} : { due_date: { $gte: due_date } };

    const is_completed_query = is_completed ? { is_completed: true } : {};

    return this.taskModel.aggregate([
      {
        $match: {
          user_id: ObjectIdFromHex(user_id),
          ...start_date_query,
          ...due_date_query,
          ...is_completed_query,
        },
      },
      { $sort: { created_at: -1 } },
      { $skip: limit * (page - 1) },
      { $limit: limit },
      {
        $addFields: {
          overdue: { $lt: ["$due_date", CurrentTime()] },
        },
      },
    ]);
  }
}
