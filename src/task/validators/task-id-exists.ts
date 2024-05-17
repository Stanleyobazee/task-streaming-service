import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { TaskService } from "../task.service";

@ValidatorConstraint({ async: true })
export class TaskIdExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly taskService: TaskService) {}

  validate(taskId: string) {
    return this.taskService
      .findById(taskId)
      .then((task) => {
        return task != undefined;
      })
      .catch(() => false);
  }

  defaultMessage(): string {
    return "task id does not exist";
  }
}

export function TaskIdExists(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: TaskIdExistsConstraint,
    });
  };
}
