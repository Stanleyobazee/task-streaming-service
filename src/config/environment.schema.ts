import * as Joi from "joi";

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  MONGODB_URI: Joi.string().default(
    "mongodb://localhost:27017/task_streaming_storage",
  ),
  MONGODB_TEST_URI: Joi.string().default(
    "mongodb://localhost:27017/task_streaming_storage_test",
  ),
  PORT: Joi.number().default(60061),
  DB_HOST: Joi.string().default("localhost"),
  DB_NAME: Joi.string().default("task-streaming-storage"),
  DB_PORT: Joi.number().default(27017),
});
