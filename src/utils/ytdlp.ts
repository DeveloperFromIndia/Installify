// async function sendVideoToTelegram(chatId: number, url: string) {
//     try {
//         // Получаем метаданные
//         const info = await ytdlp.getInfoAsync(url);

//         // Находим лучший формат с видео+аудио
//         // const bestFormat = info.?.[0]; // можно улучшить выбор формата

//         // if (!bestFormat) throw new Error('Не удалось получить формат видео');

//         // const fileSize = bestFormat.filesize ?? bestFormat.filesize_approx ?? 0;

//         // Если видео меньше лимита
//         if (true) {
//             const tmpFile = join(__dirname, 'video.mp4');
//             const st = createWriteStream(tmpFile);

//             // Скачиваем видео в файл
//             const ytdlpPipe = await ytdlp.stream(url, {
//                 format: 'bestvideo+bestaudio/best',
//                 onProgress: (progress) => {
//                     const percent = progress.total ? (progress.downloaded / progress.total) * 100 : 0;
//                     console.log(`Downloaded: ${percent.toFixed(2)}%`);
//                 },
//             });
//             await ytdlpPipe.pipeAsync(st);

//             // Отправляем файл
//             const videoFile = new InputFile(tmpFile);
//             await bot.api.sendVideo(chatId, videoFile);

//             // Удаляем временный файл
//             unlink(tmpFile, () => { });
//         } else {
//             // Видео больше лимита → используем Direct URL
//             // const directUrl = info.formats?.[0]?.url;
//             // if (!directUrl) throw new Error('Не удалось получить прямой URL');

//             // await bot.api.sendVideo(chatId, directUrl);
//         }

//         console.log('Video sent successfully');
//     } catch (err) {
//         console.error('Error:', err);
//         await bot.api.sendMessage(chatId, 'Не удалось отправить видео.');
//     }
// }