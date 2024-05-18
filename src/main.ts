import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { useContainer } from "class-validator";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { CustomExceptionFilter } from "./utils/CustomExceptionFilter";
import { RedisIoAdapter } from "./task/adapters/redis-streams.adapter";
import { AuthService } from "./auth/auth.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useGlobalFilters(new CustomExceptionFilter());
  app.use(helmet());
  app.enableCors();

  app.setGlobalPrefix("api");

  const redisAdapter = new RedisIoAdapter(app);
  redisAdapter.connectToRedis(app.get(AuthService));
  app.useWebSocketAdapter(redisAdapter);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(configService.get("PORT"));
}
bootstrap();
