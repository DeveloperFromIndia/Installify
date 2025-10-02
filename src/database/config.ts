import dotenv from 'dotenv'; dotenv.config();
import { Sequelize } from "sequelize";
import setupModels from './relation';

const config = new Sequelize(
    {
        dialect: 'sqlite',
        storage: 'src/database/db.sqlite',
        logging: false, 
        define: {
            freezeTableName: true,
            timestamps: true
        },

    }
);

export default config;