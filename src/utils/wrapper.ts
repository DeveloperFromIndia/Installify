class YtDlpWrapper {
    constructor(private ytdlp: any, private defaults: any) { }

    getInfoAsync(url: string, options?: any) {
        return this.ytdlp.getInfoAsync(url, { ...this.defaults, ...options });
    }

    stream(url: string, options?: any) {
        return this.ytdlp.stream(url, { ...this.defaults, ...options });
    }

    download(urls: string | string[], options?: any) {
        return this.ytdlp.download(urls, { ...this.defaults, ...options });
    }
    async execAsync(url: string, options?: any): Promise<string> {
        return this.ytdlp.execAsync(url, options);
    }
}

export default YtDlpWrapper;