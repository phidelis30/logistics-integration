import { Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";
import { config } from "../config";

export const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: config.db.database,
  user: config.db.username,
  password: config.db.password,
  host: config.db.host,
  port: config.db.port,
});
