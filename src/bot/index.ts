import { Bot } from "grammy";
import { setupStart } from "./features/start";

const bot = new Bot(process.env.BOT_TOKEN!);

const setupBot = () => {
    setupStart(bot);
    return bot;
}
export default setupBot;