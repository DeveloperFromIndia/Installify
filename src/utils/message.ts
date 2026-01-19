import bot from "@/bot";

type MessageData = {
    text?: string;
    photo?: string | { url: string; caption?: string };
    video?: string | { url: string; caption?: string };
    video_note?: string;
    voice?: string;
    document?: string | { url: string; caption?: string };
    audio?: string | { url: string; caption?: string };
    sticker?: string;
    animation?: string;
    caption?: string;
    [key: string]: any;
};

type transferMessageOptions = {
    archiveFileSrc: string;
    role: string;
}

const messageMap = new Map<string, number>();

const makeKey = (chatId: number, messageId: number) =>
    `${chatId}:${messageId}`;

const writeToArchive = async (filePath: string, role: string, messageInfo: string) => {
};

const getMessageDescription = (ctx: any, data: MessageData): string => {
    let description = '';

    switch (true) {
        case typeof data.text === "string":
            description = data.text;
            break;

        case typeof data.photo !== "undefined":
            description = data.caption
                ? `[Изображение] ${data.caption}`
                : '[Изображение]';
            break;

        case typeof data.video !== "undefined":
            description = data.caption
                ? `[Видео] ${data.caption}`
                : '[Видео]';
            break;

        case typeof data.video_note !== "undefined":
            description = '[Видеосообщение]';
            break;

        case typeof data.voice !== "undefined":
            description = '[Голосовое сообщение]';
            break;

        case typeof data.document !== "undefined":
            const docName = ctx.message?.document?.file_name || '';
            description = data.caption
                ? `[Документ: ${docName}] ${data.caption}`
                : `[Документ: ${docName}]`;
            break;

        case typeof data.audio !== "undefined":
            const audioTitle = ctx.message?.audio?.title || ctx.message?.audio?.file_name || '';
            description = data.caption
                ? `[Аудио: ${audioTitle}] ${data.caption}`
                : `[Аудио: ${audioTitle}]`;
            break;

        case typeof data.sticker !== "undefined":
            const emoji = ctx.message?.sticker?.emoji || '';
            description = emoji ? `[Стикер ${emoji}]` : '[Стикер]';
            break;

        case typeof data.animation !== "undefined":
            description = data.caption
                ? `[GIF] ${data.caption}`
                : '[GIF]';
            break;

        default:
            description = '[Неподдерживаемый тип сообщения]';
    }

    return description;
};

export const sendMessage = async (
    chatId: number,
    data: MessageData,
    kb?: any,
    replyToMessageId?: number
) => {
    if (!bot) throw new Error("Bot token not found");

    const common = {
        reply_markup: kb,
        reply_to_message_id: replyToMessageId,
        allow_sending_without_reply: true,
    };

    switch (true) {
        case typeof data.text === "string":
            return bot.api.sendMessage(chatId, data.text, common);

        case !!data.photo:
            return bot.api.sendPhoto(
                chatId,
                typeof data.photo === "string" ? data.photo : data.photo.url,
                { ...common, caption: data.caption }
            );

        case !!data.video:
            return bot.api.sendVideo(
                chatId,
                typeof data.video === "string" ? data.video : data.video.url,
                { ...common, caption: data.caption }
            );

        case !!data.document:
            return bot.api.sendDocument(
                chatId,
                typeof data.document === "string" ? data.document : data.document.url,
                { ...common, caption: data.caption }
            );

        case !!data.voice:
            return bot.api.sendVoice(chatId, data.voice, {
                ...common,
                caption: data.caption,
            });

        case !!data.audio:
            return bot.api.sendAudio(
                chatId,
                typeof data.audio === "string" ? data.audio : data.audio.url,
                { ...common, caption: data.caption }
            );

        case !!data.sticker:
            return bot.api.sendSticker(chatId, data.sticker, common);

        case !!data.animation:
            return bot.api.sendAnimation(chatId, data.animation, {
                ...common,
                caption: data.caption,
            });

        case !!data.video_note:
            return bot.api.sendVideoNote(chatId, data.video_note, common);

        default:
            throw new Error("Unsupported message type");
    }
};

export const transferMessageToAnotherChat = async (
    targetChatId: number,
    ctx: any,
    options?: transferMessageOptions
) => {
    if (!ctx.message) return;

    const sourceChatId = ctx.chat.id;
    const sourceMessageId = ctx.message.message_id;

    let data: MessageData = {};

    switch (true) {
        case typeof ctx.message.text === "string":
            data.text = ctx.message.text;
            break;

        case ctx.message.photo:
            data.photo = ctx.message.photo.at(-1).file_id;
            data.caption = ctx.message.caption;
            break;

        case ctx.message.video:
            data.video = ctx.message.video.file_id;
            data.caption = ctx.message.caption;
            break;

        case ctx.message.document:
            data.document = ctx.message.document.file_id;
            data.caption = ctx.message.caption;
            break;

        case ctx.message.voice:
            data.voice = ctx.message.voice.file_id;
            break;

        case ctx.message.audio:
            data.audio = ctx.message.audio.file_id;
            data.caption = ctx.message.caption;
            break;

        case ctx.message.sticker:
            data.sticker = ctx.message.sticker.file_id;
            break;

        case ctx.message.animation:
            data.animation = ctx.message.animation.file_id;
            data.caption = ctx.message.caption;
            break;

        case ctx.message.video_note:
            data.video_note = ctx.message.video_note.file_id;
            break;

        default:
            return;
    }

    // reply логика
    let replyToTargetMessageId: number | undefined;

    if (ctx.message.reply_to_message) {
        const repliedKey = makeKey(
            sourceChatId,
            ctx.message.reply_to_message.message_id
        );

        replyToTargetMessageId = messageMap.get(repliedKey);
    }

    const sent = await sendMessage(
        targetChatId,
        data,
        undefined,
        replyToTargetMessageId
    );

    // сохраняем соответствие
    if (sent?.message_id) {
        const key = makeKey(sourceChatId, sourceMessageId);
        messageMap.set(key, sent.message_id);
    }

    if (options?.archiveFileSrc && options?.role) {
        const desc = getMessageDescription(ctx, data);
        await writeToArchive(options.archiveFileSrc, options.role, desc);
    }
};

