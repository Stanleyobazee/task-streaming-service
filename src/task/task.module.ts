import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TaskController } from "./task.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Task, TaskSchema } from "./entities/task.entity";
import { TaskIdExistsConstraint } from "./validators/task-id-exists";
import { TaskWSGateway } from "./task-ws.gateway";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskIdExistsConstraint, TaskWSGateway],
  exports: [TaskService, TaskIdExistsConstraint, TaskWSGateway],
})
export class TaskModule {}
