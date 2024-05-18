import mongoose from "mongoose";
import { Task } from "../../src/task/entities/task.entity";
import { CurrentTime } from "../../src/utils/date";

export const taskStub1 = (): Task => {
  return {
    user_id: new mongoose.Types.ObjectId(),
    title: "Task 1",
    description: "simple task",
    due_date: CurrentTime(),
    is_completed: true,
  };
};

export const taskStub2 = (): Task => {
  return {
    user_id: new mongoose.Types.ObjectId(),
    title: "Task 2",
    description: "simple task",
    due_date: CurrentTime(),
    is_completed: false,
  };
};
