import * as Joi from "joi";

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(60061),
  DB_HOST: Joi.string().default("localhost"),
  DB_NAME: Joi.string().required(),
  DB_PORT: Joi.number().default(27017),
  JWT_SECRET: Joi.string().required(),
});
