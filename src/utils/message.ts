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
    poll?: any;
    location?: any;
    venue?: any;
    contact?: any;
    [key: string]: any;
};

type transferMessageOptions = {
    archiveFileSrc: string;
    role: string;
}

// Храним маппинг с временными метками для очистки
const messageMap = new Map<string, { targetMessageId: number; timestamp: number }>();

// Максимальное время хранения (24 часа)
const MAX_AGE_MS = 6 * 60 * 60 * 1000;
// Максимальное количество записей
const MAX_ENTRIES = 10000;

const makeKey = (chatId: number, messageId: number) =>
    `${chatId}:${messageId}`;

// Очистка старых записей
const cleanupOldMessages = () => {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, value] of messageMap.entries()) {
        if (now - value.timestamp > MAX_AGE_MS) {
            keysToDelete.push(key);
        }
    }

    keysToDelete.forEach(key => messageMap.delete(key));

    // Если все еще слишком много записей, удаляем самые старые
    if (messageMap.size > MAX_ENTRIES) {
        const entries = Array.from(messageMap.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        const toRemove = entries.slice(0, messageMap.size - MAX_ENTRIES);
        toRemove.forEach(([key]) => messageMap.delete(key));
    }

    console.log(`Cleanup: removed ${keysToDelete.length} old entries, map size: ${messageMap.size}`);
};

// Запускаем очистку каждый час
setInterval(cleanupOldMessages, 60 * 60 * 1000);


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

        case !!data.poll:
            return bot.api.sendPoll(
                chatId,
                data.poll.question,
                data.poll.options.map((o: any) => o.text),
                {
                    ...common,
                    is_anonymous: data.poll.is_anonymous,
                    type: data.poll.type,
                    allows_multiple_answers: data.poll.allows_multiple_answers,
                }
            );

        case !!data.location:
            return bot.api.sendLocation(
                chatId,
                data.location.latitude,
                data.location.longitude,
                common
            );

        case !!data.venue:
            return bot.api.sendVenue(
                chatId,
                data.venue.location.latitude,
                data.venue.location.longitude,
                data.venue.title,
                data.venue.address,
                common
            );

        case !!data.contact:
            return bot.api.sendContact(
                chatId,
                data.contact.phone_number,
                data.contact.first_name,
                {
                    ...common,
                    last_name: data.contact.last_name,
                }
            );

        default:
            throw new Error("Unsupported message type");
    }
};

export const transferMessageToAnotherChat = async (
    targetChatId: number,
    ctx: any,
) => {
    if (!ctx.message) return;

    const sourceChatId = ctx.chat.id;
    const sourceMessageId = ctx.message.message_id;

    let data: MessageData = {};

    // Определяем тип сообщения и извлекаем данные
    switch (true) {
        case typeof ctx.message.text === "string":
            data.text = ctx.message.text;
            break;

        case !!ctx.message.photo:
            data.photo = ctx.message.photo.at(-1).file_id;
            data.caption = ctx.message.caption;
            break;

        case !!ctx.message.video:
            data.video = ctx.message.video.file_id;
            data.caption = ctx.message.caption;
            break;

        case !!ctx.message.document:
            data.document = ctx.message.document.file_id;
            data.caption = ctx.message.caption;
            break;

        case !!ctx.message.voice:
            data.voice = ctx.message.voice.file_id;
            break;

        case !!ctx.message.audio:
            data.audio = ctx.message.audio.file_id;
            data.caption = ctx.message.caption;
            break;

        case !!ctx.message.sticker:
            data.sticker = ctx.message.sticker.file_id;
            break;

        case !!ctx.message.animation:
            data.animation = ctx.message.animation.file_id;
            data.caption = ctx.message.caption;
            break;

        case !!ctx.message.video_note:
            data.video_note = ctx.message.video_note.file_id;
            break;

        case !!ctx.message.poll:
            data.poll = ctx.message.poll;
            break;

        case !!ctx.message.location:
            data.location = ctx.message.location;
            break;

        case !!ctx.message.venue:
            data.venue = ctx.message.venue;
            break;

        case !!ctx.message.contact:
            data.contact = ctx.message.contact;
            break;

        default:
            console.log("Unsupported message type:", Object.keys(ctx.message));
            return;
    }

    // Обрабатываем reply
    let replyToTargetMessageId: number | undefined;

    if (ctx.message.reply_to_message) {
        const repliedKey = makeKey(
            sourceChatId,
            ctx.message.reply_to_message.message_id
        );

        const mapped = messageMap.get(repliedKey);
        if (mapped) {
            replyToTargetMessageId = mapped.targetMessageId;
        }
    }

    try {
        const sent = await sendMessage(
            targetChatId,
            data,
            undefined,
            replyToTargetMessageId
        );

        // Сохраняем маппинг сообщений с временной меткой
        if (sent?.message_id) {
            const key = makeKey(sourceChatId, sourceMessageId);
            messageMap.set(key, {
                targetMessageId: sent.message_id,
                timestamp: Date.now()
            });
        }
    } catch (error) {
        console.error("Error transferring message:", error);
    }
};