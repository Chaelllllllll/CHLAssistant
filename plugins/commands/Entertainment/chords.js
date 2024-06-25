const config = {
  name: "chords",
  aliases: ["chord", "chords"],
  description: "An AI dedicated to searching for song chords and their details efficiently.",
  usage: "[song name]",
  cooldown: 3,
  isAbsolute: false,
  isHidden: false,
  credits: "Chael",
};

const langData = {
  "en_US": {
    "message": "Hello",
    "no_query": "Please provide a song name. \n\nExample: [!chords Palagi]",
  }
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
  const songName = args.join(" ");

  if (!songName) {
    message.send(getLang("no_query"));
    return;
  }

  const apiUrl = `https://markdevs-api.onrender.com/search/chords?q=${encodeURIComponent(songName)}`;

  try {
    await message.reply(`Searching...`);
    message.react('⏱️');

    const response = await fetch(apiUrl);
    const result = await response.json();

    if (response.ok) {
      const chordData = result.chord;
      if (!chordData) {
        message.reply("No results found.");
        message.react('⚠️');
        return;
      }

      const { title, artist, key, type, url, chords } = chordData;
      const chordDetails = `
        𝗧𝗶𝘁𝗹𝗲: ${title}\n\n𝗔𝗿𝘁𝗶𝘀𝘁: ${artist}\n\n𝗞𝗲𝘆: ${key}\n\n𝗧𝘆𝗽𝗲: ${type}\n\n𝗖𝗵𝗼𝗿𝗱𝘀:\n${chords.replace(/\r\n/g, "\n")}\n\n𝗦𝗼𝘂𝗿𝗰𝗲: ${url}
      `;

      message.reply(`${chordDetails}`);
      message.react('✅');
    } else {
      message.reply("Sorry, I couldn't get a response from the service. Please try again later.");
      message.react('⚠️');
    }
  } catch (error) {
    message.reply("Oops! Something went wrong while trying to get a response. Please check your internet connection and try again.");
    message.react('⚠️');
  }
}

export default {
  config,
  langData,
  onCall
};
