import { Bot } from "grammy";
import { setupStart } from "./features/start";
import { setupInstallify } from "./features/installify";

const bot = process.env.BOT_TOKEN ? new Bot(process.env.BOT_TOKEN) : null;

const setupBot = () => {
    if (!bot)
        throw console.error("Token not found");

    setupStart(bot);
    setupInstallify(bot);

    return bot;
}
export default setupBot;