const config = {
  name: "respaper",
  aliases: ["respaper"],
  description: "An AI-powered document search tool specializing in retrieving research papers based on specific queries.",
  usage: "[query]",
  cooldown: 3,
  isAbsolute: false,
  isHidden: false,
  credits: "Chael",
};

const langData = {
  "en_US": {
    "message": "Hello",
    "no_query": "Please provide a query. \n\nex: [!respaper the effects of bullying]",
  }
};

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
  const query = args.join(" ");

  if (!query) {
    message.reply(getLang("no_query"));
    
    return;
  }

  const apiUrl = `https://openapi-idk8.onrender.com/eric-search?q=${encodeURIComponent(query)}&count=10`;

  try {
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (response.ok) {
      const books = result.results;
      if (books.length === 0) {
        message.reply("No results found.");
        message.react('⚠️');
        return;
      }

      const bookList = books.map(book => {
        let directLink = book.directLink !== "No Direct Link" ? `Direct Link: ${book.directLink}` : "";
        let fullTextLink = book.fullTextLink !== "No Full Text Link" ? `Full Text Link: ${book.fullTextLink}` : "";
        return `${book.title} (${book.publicationDate})\nAuthors: ${book.authors.join(", ")}\nDescription: ${book.description}\nKeywords: ${book.keywords}\n${directLink}\n${fullTextLink}`;
      }).join("\n\n");

      message.reply(`Here are some books I found:\n\n${bookList}`);
      message.react('✅');
    } else {
      message.reply("Sorry, I couldn't get a response from the service. Please try again later.");
      message.react('⚠️');
    }
  } catch (error) {
    console.error("Error fetching from API:", error);
    message.reply("Oops! Something went wrong while trying to get a response. Please check your internet connection and try again.");
    message.react('⚠️');
  }
}

export default {
  config,
  langData,
  onCall
};
