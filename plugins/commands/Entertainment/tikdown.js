import { statSync } from 'fs';
import { join } from 'path';

const _48MB = 48 * 1024 * 1024;

const config = {
    name: "tiktok",
    aliases: ["tiktok"],
    version: "1.0.1",
    description: "An AI-powered tool designed to effortlessly download TikTok videos without any watermarks.",
    usage: "[url]",
    credits: "Chael",
    cooldown: 5
}

const langData = {
    "en_US": {
        "missingUrl": "Please provide a url. \n\nex: [!tiktok tiktok video link]",
        "fileTooLarge": "File is too large, max size is 48MB",
        "error": "An error occured"
    }
}

async function getVideoURL(url) {

    try {
        const res = await global
            .GET(`${global.xva_api.main}/tikdown?url=${url}`);

        return { videoUrl: res.data.result.video.url_list[0] || null, desc: res.data.result.aweme_detail.desc || null };
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

        cachePath = join(global.cachePath, `_tikdown_${message.senderID}${Date.now()}.mp4`);

        await global.downloadFile(cachePath, videoUrl);
        message.react("✅");
        const fileStat = statSync(cachePath);
        if (fileStat.size > _48MB) message.reply(getLang('fileTooLarge'));
        else await message.reply({
            attachment: global.reader(cachePath)
        });
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
