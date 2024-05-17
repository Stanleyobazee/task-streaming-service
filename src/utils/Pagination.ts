import { Transform } from "class-transformer";
import { ToDate, ToNumber } from "./validator";
import { IsDate, IsNumber, IsOptional } from "class-validator";

export class PaginationRequestDto {
  @Transform(({ value }) => ToNumber(value, { default: 1, min: 1, max: 50 }))
  @IsNumber()
  @IsOptional()
  public page: number = 1;

  @Transform(({ value }) => ToNumber(value, { default: 10, min: 1, max: 100 }))
  @IsNumber()
  @IsOptional()
  public limit: number = 10;

  @Transform(({ value }) => ToDate(value))
  @IsOptional()
  @IsDate()
  public start_date: Date;
}

export class PaginationResponseDto<Model> {
  meta: {
    page_number: number;

    limit: number;

    total: number;
  };

  data: Array<Partial<Model>>;
}
