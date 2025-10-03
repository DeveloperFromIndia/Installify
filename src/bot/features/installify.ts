import installService from "@/services/install.service";
import { Bot, Context, InputFile } from "grammy";

const MAX_SIZE = 50 * 1024 * 1024;

export const setupInstallify = (bot: Bot<Context>) => {
    bot.on("message:text", async (ctx) => {
        const link = ctx.message.text;

        const info = await installService.getFormat(link);
        if (!info)
            return await ctx.reply("Video not found");

        const msg = await ctx.reply("⏳ Saving video");

        switch (info.type) {
            case 'progressive':
                let sizeP = info.format.filesize ?? info.format.filesize_approx ?? 0;
                if (sizeP > MAX_SIZE)
                    return;

                const sourceP = await installService.save(link, info.format);
                const videoFileP = new InputFile(sourceP);
                await ctx.api.editMessageText(
                    msg.chat.id,
                    msg.message_id,
                    "⏳ Sending video"
                );
                await bot.api.sendVideo(ctx.chat.id, videoFileP);
                await installService.remove(sourceP);
                await ctx.api.deleteMessage(msg.chat.id, msg.message_id);
                return;
            case 'dash':
                const videoSize = info.video.filesize ?? info.video.filesize_approx ?? 0;
                const audioSize = info.audio.filesize ?? info.audio.filesize_approx ?? 0;

                let sizeD = videoSize + audioSize;
                if (sizeD > MAX_SIZE)
                    return;

                const sourceD = await installService.saveDash(
                    { url: info.video.url, format: info.video.format },    // video
                    { url: info.audio.url, format: info.audio.format }     // audio
                );

                const videoFileD = new InputFile(sourceD);
                await ctx.api.editMessageText(
                    msg.chat.id,
                    msg.message_id,
                    "⏳ Sending video"
                );
                await bot.api.sendVideo(ctx.chat.id, videoFileD);
                await installService.remove(sourceD);
                await ctx.api.deleteMessage(msg.chat.id, msg.message_id);
                break;
        }

    });
};