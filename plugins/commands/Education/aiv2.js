const config = {
  name: "aiv2",
  aliases: ["aiv2"],
  description: "an intelligent, conversational assistant designed to provide insightful and accurate responses to your queries with speed and clarity",
  usage: "[query]",
  cooldown: 3,
  isAbsolute: false,
  isHidden: false,
  credits: "Chael",
}

const langData = {
  "en_US": {
    "message": "Hello",
    "no_query": "Please provide a query. \n\nex: [!aiv2 what is love?]",
  }
}

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
  const query = args.join(" ");

  if (!query) {
    message.reply(getLang("no_query"));
    return;
  }

  const apiUrl = `https://markdevs-api.onrender.com/api/v3/gpt4?ask=${encodeURIComponent(query)}`;

  try {

    await message.reply(`Typing...`);
    message.react('⏱️');
    const response = await fetch(apiUrl);
    const result = await response.json();

    const textResult = result.answer;

    if (response.ok) {
      message.reply(textResult);
      message.react('✅');
      console.log("CHL: Response: ", textResult);
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
}