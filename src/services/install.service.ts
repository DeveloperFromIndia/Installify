import { createWriteStream, existsSync, mkdirSync, unlink, unlinkSync } from "fs";
import path, { join } from "path";
import { YtDlp } from "ytdlp-nodejs";

const ytdlp = new YtDlp({
    binaryPath: path.resolve(process.cwd(), "node_modules/ytdlp-nodejs/bin/yt-dlp.exe")
});

class InstallService {
    async getFormat(link: string): Promise<any> {
        try {
            const info: any = await ytdlp.getInfoAsync(link);
            if (!info) return null;


            const progressive = info.formats.filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none');
            if (progressive.length > 0) {

                progressive.sort((a: any, b: any) => ((b.height || 0) * 1000 + (b.tbr || 0)) - ((a.height || 0) * 1000 + (a.tbr || 0)));
                return {
                    type: 'progressive',
                    format: progressive[0]
                };
            }

            const videoOnly = info.formats.filter((f: any) => f.vcodec !== 'none' && f.acodec === 'none');
            const audioOnly = info.formats.filter((f: any) => f.acodec !== 'none' && f.vcodec === 'none');

            if (videoOnly.length === 0 || audioOnly.length === 0) {
                return null;
            }

            videoOnly.sort((a: any, b: any) => ((b.height || 0) * 1000 + (b.tbr || 0)) - ((a.height || 0) * 1000 + (a.tbr || 0)));
            audioOnly.sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0));

            return {
                type: 'dash',
                video: videoOnly[0],
                audio: audioOnly[0]
            };

        } catch (err) {
            console.error(err);
            return null;
        }
    }
    async save(url: string, format: any) {
        const tempFolder = join(process.cwd(), "temp");

        if (!existsSync(tempFolder)) {
            mkdirSync(tempFolder, { recursive: true });
        }

        const name = crypto.randomUUID();
        const tmpFile = join(tempFolder, `${name}.mp4`);
        const st = createWriteStream(tmpFile);
        console.log(format.format_id);
        const ytdlpPipe = ytdlp.stream(url, {
            format: format.format_id,
            // onProgress: (progress) => {
            //     const percent = progress.total ? (progress.downloaded / progress.total) * 100 : 0;
            //     console.log(`Downloaded: ${percent.toFixed(2)}%`);
            // },
        });

        await ytdlpPipe.pipeAsync(st);
        return tmpFile;
    }
    async saveDash(
        video: { url: string; format: any },
        audio: { url: string; format: any }
    ): Promise<string> {
        const tempFolder = join(process.cwd(), "temp");

        if (!existsSync(tempFolder)) {
            mkdirSync(tempFolder, { recursive: true });
        }

        const videoFile = await this.save(video.url, video.format);

        const audioFile = await this.save(audio.url, audio.format);

        const name = crypto.randomUUID();
        const outputFile = join(tempFolder, `${name}_merged.mp4`);

        await ytdlp.execAsync(
            `ffmpeg -y -i "${videoFile}" -i "${audioFile}" -c copy "${outputFile}"`,
            {
                onData: (d) => console.log(d),
            }
        );

        try {
            unlinkSync(videoFile);
            unlinkSync(audioFile);
        } catch (err) {
            console.warn("Failed to remove temp files:", err);
        }

        return outputFile;
    }
    async remove(source: string) {
        unlink(source, () => { });
    }
}

export default new InstallService;