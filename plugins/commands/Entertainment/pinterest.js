import { statSync } from 'fs';
import { join } from 'path';

const _48MB = 48 * 1024 * 1024;

const config = {
    name: "pinterest",
    aliases: ["pinterest", "pinte"],
    version: "1.0.1",
    description: "An AI-powered image search tool that retrieves images based on user queries.",
    permissions: [1, 2],
    usage: "[keyword]",
    credits: "Chael",
    cooldown: 5
}

const langData = {
    "en_US": {
        "missingQuery": "Please provide a search query. \n\nex: [!pinterest cute dogs]",
        "fileTooLarge": "File is too large, max size is 48MB",
        "error": "An error occurred while fetching images"
    }
}

async function getImages(searchQuery) {
    try {
        const res = await global.GET(`https://openapi-idk8.onrender.com/pinterest?search=${searchQuery}&count=40`);
        return res.data.images || [];
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function onCall({ message, args, getLang }) {
    let cachePaths = [];
    try {
        if (!args[0]) return message.reply(getLang('missingQuery'));
        const searchQuery = args.join(" ");
        const count = 40; // Fetching 10 images to ensure randomness

        await message.reply(`Searching...`);
        message.react("⏳");
        const images = await getImages(searchQuery, count);
        if (!images.length) return message.reply(getLang('error'));

        // Shuffle the images array to randomize selection
        shuffleArray(images);

        // Pick the first two images
        const selectedImages = images.slice(0, 21);

        for (let i = 0; i < selectedImages.length; i++) {
            const imageUrl = selectedImages[i];
            const cachePath = join(global.cachePath, `_pinterest_${message.senderID}_${i}_${Date.now()}.jpg`);

            await global.downloadFile(cachePath, imageUrl);
            const fileStat = statSync(cachePath);
            if (fileStat.size > _48MB) {
                message.reply(getLang('fileTooLarge'));
            } else {
                cachePaths.push(cachePath);
            }
        }

        if (cachePaths.length === 21) {
            const attachments = cachePaths.map(path => global.reader(path));
            await message.reply({ attachment: attachments });
        } else {
            message.reply(getLang('error'));
        }

        message.react("✅");
    } catch (e) {
        message.react("❌");
        console.error(e);
        message.reply(getLang('error'));
    } finally {
        cachePaths.forEach(path => {
            if (global.isExists(path)) global.deleteFile(path);
        });
    }
}

// Function to shuffle an array (Fisher-Yates shuffle algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export default {
    config,
    langData,
    onCall
}