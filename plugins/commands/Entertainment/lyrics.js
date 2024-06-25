const config = {
  name: "lyrics",
  aliases: ["lyrics", "lyrical"],
  description: "Fetch song lyrics based on the provided artist and song title.",
  usage: "[artist] [song title]",
  cooldown: 3,
  isAbsolute: false,
  isHidden: false,
  credits: "Chael",
}

const langData = {
  "en_US": {
    "message": "Hello",
    "no_query": "Please provide an artist and a song title. \n\nex: [!lyrics Coldplay Yellow]",
    "fetching": "Fetching the lyrics...",
    "no_result": "Sorry, I couldn't find the lyrics for that song. Please try again with different artist or song title.",
    "error": "Oops! Something went wrong while trying to get a response. Please check your internet connection and try again."
  }
}

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
  const [artist, ...songParts] = args;
  const song = songParts.join(" ");

  if (!artist || !song) {
    message.reply(getLang("no_query"));
    return;
  }

  const apiUrl = `https://openapi-idk8.onrender.com/lyrical/find?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}`;

  try {
    await message.reply(getLang("fetching"));
    message.react('⏱️');
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (response.ok && result.lyrics) {
      message.reply(result.lyrics);
      message.react('✅');
    } else {
      message.reply(getLang("no_result"));
      message.react('⚠️');
    }
  } catch (error) {
    message.reply(getLang("error"));
    message.react('⚠️');
  }
}

export default {
  config,
  langData,
  onCall
}
