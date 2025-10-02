import { Bot, Context } from "grammy";

export const setupStart = (bot: Bot<Context>) => {
    bot.command("start", async (ctx) => {
        await ctx.reply("test");
    });

};