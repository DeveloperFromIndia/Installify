import userService from "@/services/user.service";
import { Bot, Context } from "grammy";

export const setupStart = (bot: Bot<Context>) => {
    bot.command("start", async (ctx) => {
        await userService.start(ctx.chat.id);
        await ctx.reply("ready to work.");
    });

};