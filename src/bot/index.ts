import { Bot } from "grammy";
import { setupStart } from "./features/start";
import { setupInstallify } from "./features/installify";
import { spy } from "./features/spy";

const bot = process.env.BOT_TOKEN ? new Bot(process.env.BOT_TOKEN) : null;
(async function () {
    try {
        if (!bot)
            throw console.error("Token not found");
        
        // spy(bot);
        setupStart(bot);
        setupInstallify(bot);
        
    } catch (error) {
        console.error(error);
    }
})();


export default bot;