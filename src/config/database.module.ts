import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const node_env =
          configService.get<string>("NODE_ENV") === "test" ? "_test" : "";
        const db_host = configService.get("DB_HOST") || "localhost";
        const db_name = configService.get("DB_NAME");
        const db_port = configService.get("DB_PORT");

        const uri = `mongodb://${db_host}:${db_port}/${db_name}${node_env}`;
        return { uri };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [MongooseModule],
})
export class DatabaseModule {}
