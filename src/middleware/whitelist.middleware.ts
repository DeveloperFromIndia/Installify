const whiteList: string[] = [
    "tiktok",
    "instagram"
];

const whitelistMiddleware = async (ctx: any, next: any) => {
    const url = ctx.message?.text;
    if (!url) return;

    const isAllowed = whiteList.some(item => url.includes(item));
    // console.log(url);
    if (isAllowed) {
        // if (url.includes("instagram")) {
        //     const cleanUrl = url.split("?")[0];
        //     const msg = `@${ctx.message.from.username}\n${cleanUrl}`;
        //     await ctx.api.sendMessage(ctx.chat.id, msg, {
        //         disable_web_page_preview: true,
        //     });
        //     await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id);

        //     return;
        // }

        return next();
    }

    return null;
};

export default whitelistMiddleware;



