import installService from "@/services/install.service";
import { Bot, Context, InputFile } from "grammy";

const MAX_SIZE = 50 * 1024 * 1024;


export const setupInstallify = (bot: Bot<Context>) => {
    bot.on("message:text", async (ctx) => {
        const link = ctx.message.text;

        const info = await installService.getInfo(link);
        if (!info) {
            if (ctx.chat.type === "private")
                return await ctx.reply("not found");
            return;
        }

        // BBW middleware XD
        const size = info.format[0].filesize ?? info.format[0].filesize_approx ?? 0;
        if (size > MAX_SIZE) {
            return;
        }

        // format[0] - hardcode
        const source = await installService.save(link, info.format[0]);
        const videoFile = new InputFile(source);
        await bot.api.sendVideo(ctx.chat.id, videoFile);
        await installService.remove(source);
    });
};