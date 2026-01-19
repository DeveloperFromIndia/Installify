import 'dotenv/config';
import setupBot from "@/bot/index.ts";
import sequelize from "@/database/config.ts";
import setupModels from "@/database/relation";
import bot from '@/bot/index.ts';

(async function () {
    try {
        if (!bot)
            throw new Error("Bot token not found");
        
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        setupModels();
        
        bot.start()

        console.log("</ Bot launched successfully >");
    } catch (error) {
        console.error(error);
    }
})();