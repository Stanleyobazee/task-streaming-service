import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { Transform } from "class-transformer";
import { TaskIdExists } from "../validators/task-id-exists";
import { PaginationRequestDto } from "src/utils/Pagination";
import { ToBoolean, ToDate } from "../../utils/validator";
import { ObjectId } from "mongoose";

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 1025)
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;

  user_id: ObjectId;

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  due_date: Date;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 1025)
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsBoolean()
  is_completed: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  due_date: Date;
}

export class TaskIdDto {
  @IsString()
  @IsNotEmpty()
  @TaskIdExists()
  task_id: string;
}

export class TaskPaginationRequestDto extends PaginationRequestDto {
  @Transform(({ value }) => ToDate(value))
  @IsOptional()
  @IsDate()
  public due_date: Date;

  @Transform(({ value }) => ToBoolean(value))
  @IsOptional()
  @IsBoolean()
  public is_completed: boolean;
}

export interface ITaskFilter {
  _id: string;

  user_id: string;
}
