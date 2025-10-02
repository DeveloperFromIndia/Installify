import { createWriteStream, existsSync, mkdirSync, unlink } from "fs";
import path, { join } from "path";
import { YtDlp } from "ytdlp-nodejs";

const ytdlp = new YtDlp({
    binaryPath: path.resolve(__dirname, "node_modules/ytdlp-nodejs/bin/yt-dlp")
});

class InstallService {
    async getInfo(link: string): Promise<any> {
        try {
            const info: any = await ytdlp.getInfoAsync(link);
            // without watermark
            if (info) {
                const formatsWithoutWatermark = info.formats.filter((f: any) => f.acodec !== 'none' && f.vcodec !== 'none');
                formatsWithoutWatermark.sort((a: any, b: any) => {
                    const aScore = (a.height || 0) * 1000 + (a.tbr || 0);
                    const bScore = (b.height || 0) * 1000 + (b.tbr || 0);
                    return bScore - aScore;
                });
                info.formats = formatsWithoutWatermark;
            }

            return info;
        } catch (error) {
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
    async remove(source: string) {
        unlink(source, () => { });
    }
}

export default new InstallService;