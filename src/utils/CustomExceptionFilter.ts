import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const { message: error_response }: any = exception.getResponse()?.valueOf();
    const message =
      (Array.isArray(error_response) ? error_response[0] : error_response) ||
      exception.message;
    response.status(status).json({
      stack: status == 500 ? exception.stack : "",
      timestamp: new Date().toISOString(),
      path: `${request.method} ${request.url}`,
      message,
    });
  }
}
