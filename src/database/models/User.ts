import { DataTypes } from "sequelize";
import SequelizeConfig from "../../database/config";

const UserModel = SequelizeConfig.define("user_info", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: true },
    blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
    telegramId: { type: DataTypes.INTEGER, unique: true },
});

export default UserModel;