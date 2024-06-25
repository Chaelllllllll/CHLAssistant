import { statSync } from 'fs';
import { join } from 'path';

const _48MB = 48 * 1024 * 1024;

const config = {
    name: "fb",
    aliases: ["facebook", "fb"],
    version: "1.0.1",
    description: "Easily download and save your favorite Facebook videos with our AI-powered video downloader.",
    usage: "[url]",
    credits: "Chael",
    cooldown: 5
}

const langData = {
    "en_US": {
        "missingUrl": "Please provide a URL. \n\nex: [!fb facebook video link]",
        "fileTooLarge": "File is too large, max size is 48MB",
        "error": "An error occurred"
    }
}

async function getVideoURL(url) {
    try {
        const res = await global.GET(`https://openapi-idk8.onrender.com/fbvideo/search?url=${url}`);
        const videoUrl = res.data.hd || res.data.sd;
        const desc = res.data.title || null;
        return { videoUrl, desc };
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function onCall({ message, args, getLang }) {
    let cachePath;
    try {
        if (!args[0]) return message.reply(getLang('missingUrl'));
        const url = args[0];

        await message.reply(`Searching...`);
        message.react("⏳");
        const { videoUrl, desc } = await getVideoURL(url);
        if (!videoUrl) return message.reply(getLang('error'));

        cachePath = join(global.cachePath, `_fbvideo_${message.senderID}${Date.now()}.mp4`);

        await global.downloadFile(cachePath, videoUrl);
        message.react("✅");
        const fileStat = statSync(cachePath);
        if (fileStat.size > _48MB) {
            message.reply(getLang('fileTooLarge'));
        } else {
            await message.reply({
                attachment: global.reader(cachePath)
            });
        }
    } catch (e) {
        message.react("❌");
        console.error(e);
        message.reply(getLang('error'));
    }

    try {
        if (global.isExists(cachePath)) global.deleteFile(cachePath);
    } catch (e) {
        console.error(e);
    }
}

export default {
    config,
    langData,
    onCall
}
