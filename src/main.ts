import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { useContainer } from "class-validator";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { CustomExceptionFilter } from "./utils/CustomExceptionFilter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalFilters(new CustomExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  app.use(helmet());
  app.enableCors();

  app.setGlobalPrefix("api");

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(configService.get("PORT"));
}
bootstrap();
