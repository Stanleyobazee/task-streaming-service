import { Module } from "@nestjs/common";
import { ConfigModule as MainConfigModule } from "@nestjs/config";
import EnvironmentSchema from "./environment.schema";
import { DatabaseModule } from "./database.module";

@Module({
  imports: [
    MainConfigModule.forRoot({
      ignoreEnvFile: false,
      isGlobal: true,
      validationSchema: EnvironmentSchema,
    }),
    DatabaseModule,
  ],
  providers: [],
  exports: [MainConfigModule, DatabaseModule],
})
export class ConfigModule {}
