import { DataSource } from "typeorm";
import { User } from "./entities/User"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "209.38.26.237",
    port: 3306,
    username: "S4007755",
    password: "S4007755",
    database: "S4007755",
    synchronize: true,
    logging: true,
    entities: [User],
});