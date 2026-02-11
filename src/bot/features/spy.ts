// const SOURCE_CHAT = -1003835036908;
const SOURCE_CHAT = -1001754314208;
const TARGET_CHAT = -1003599464395;

import { transferMessageToAnotherChat } from "@/utils/message";
import type { Bot, Context } from "grammy";



export const spy = (bot: Bot<Context>) => {
    bot.command("invite", async (ctx) => {
        const invite = await ctx.api.createChatInviteLink(SOURCE_CHAT, {
            expire_date: Math.floor(Date.now() / 1000) + 60 * 60, // 1 час
            member_limit: 1, 
        });

        await ctx.reply(
            `Вот временная ссылка-приглашение:\n${invite.invite_link}`
        );
    });
    bot.on("message", async (ctx) => {
        if (ctx.chat.id !== SOURCE_CHAT && ctx.chat.id !== TARGET_CHAT) return;
        if (ctx.from?.is_bot) return;

        await transferMessageToAnotherChat(ctx.chat.id == SOURCE_CHAT ? TARGET_CHAT : SOURCE_CHAT, ctx);
    });
};