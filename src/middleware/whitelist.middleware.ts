const whiteList: string[] = [
    "tiktok",
    "instagram"
];

const whitelistMiddleware = async (ctx: any, next: any) => {
    const url = ctx.message.text;
    const isAllowed = whiteList.some(item => url.includes(item));
    if (isAllowed) {
        if (url.includes("instagram")) {
            await ctx.reply("Билл Гейст пидорас!");
            return; 
        }
        return next();
    }

    return null;
};

export default whitelistMiddleware;
