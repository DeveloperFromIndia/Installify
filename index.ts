import setupBot from "@/bot";
import sequelize from "@/database/config";

(async function () {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        
        const bot = setupBot();
        await bot.start().then(() => console.log("</ Bot launched successfully >"));
    } catch (error) {
        console.error(error);
    }
})();