import { statSync } from 'fs';
import { join } from 'path';

const _48MB = 48 * 1024 * 1024;

const config = {
    name: "spotify",
    aliases: ["spotify"],
    version: "1.0.1",
    description: "An AI-powered music search and playback assistant that finds and plays any song you desire.",
    usage: "[song name]",
    credits: "Chael",
    cooldown: 5
}

const langData = {
    "en_US": {
        "missingSong": "Please provide a song name. \n\nex: [!spotify palagi tj monterde]",
        "fileTooLarge": "File is too large, max size is 48MB",
        "error": "An error occurred"
    }
}

async function getSongURL(songName) {
    try {
        const res = await global.GET(`https://openapi-idk8.onrender.com/search-song?song=${encodeURIComponent(songName)}`);
        return { downloadUrl: res.data.downloadUrl || null, desc: res.data.description || null };
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function onCall({ message, args, getLang }) {
    let cachePath;
    try {
        if (!args[0]) return message.reply(getLang('missingSong'));
        const songName = args[0];

        await message.reply(`Searching...`);
        message.react("⏳");
        const { downloadUrl, desc } = await getSongURL(songName);
        if (!downloadUrl) return message.reply(getLang('error'));

        cachePath = join(global.cachePath, `_spotify_${message.senderID}${Date.now()}.mp3`);

        await global.downloadFile(cachePath, downloadUrl);
        message.react("✅");
        const fileStat = statSync(cachePath);
        if (fileStat.size > _48MB) message.reply(getLang('fileTooLarge'));
        else await message.reply({
          body: 'Now Playing...',
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
