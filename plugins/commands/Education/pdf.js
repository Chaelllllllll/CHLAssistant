const config = {
  name: "pdf",
  aliases: ["pdf"],
  description: "An AI equipped to efficiently search PDF documents based on user queries, delivering precise results swiftly",
  usage: "[query]",
  cooldown: 3,
  isAbsolute: false,
  isHidden: false,
  credits: "Chael",
};

const langData = {
  "en_US": {
    "message": "Hello",
    "no_query": "Please provide a query. \n\nex: [!pdf programming language]",
  }
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
  const query = args.join(" ");

  if (!query) {
    message.send(getLang("no_query"));
    return;
  }

  const apiUrl = `https://openapi-idk8.onrender.com/pdf?find=${encodeURIComponent(query)}&count=10`;

  try {
    await message.reply(`Searching...`);
    message.react('⏱️');
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (response.ok) {
      const books = result.results;
      if (books.length === 0) {
        message.reply("No results found.");
        message.react('⚠️');
        return;
      }

      const bookList = books.map(book => `${book.title}: ${book.url}\n${book.snippet}`).join("\n\n");
      message.reply(`Here are some books I found:\n\n${bookList}`);
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
