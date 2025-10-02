import setupBot from "@/bot/index.ts";
import sequelize from "@/database/config.ts";
import setupModels from "@/database/relation";

(async function () {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        setupModels();
        const bot = setupBot();
        bot.start()
         
        console.log("</ Bot launched successfully >");
    } catch (error) {
        console.error(error);
    }
})();