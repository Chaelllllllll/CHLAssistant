const config = {
  name: "ngl",
  aliases: ["ngl"],
  description: "NGL Message Bomber",
  usage: "!ngl <username> <message> <quantity>",
  cooldown: 3,
  permissions: [2],
  isAbsolute: false,
  isHidden: false,
  credits: "Chael",
}

const langData = {
  "en_US": {
      "example.error.notEnoughArgs": "Not enough arguments provided. Usage: {prefix}{command} {usage}",
      "example.error.invalidQuantity": "Quantity must be a valid positive number.",
      "example.message": "Message Sent!"
  }
}

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
  const { reply } = message;

  // Extract necessary variables from data
  const { user } = data;
  const username = user.name; // Assume user object has a name property

  // Check if enough arguments are provided
  if (args.length < 3) {
      return reply(getLang("example.error.notEnoughArgs", { prefix, command: config.name, usage: config.usage }));
  }

  // Extract username, message, and quantity from args
  const recipientUsername = args[0];
  const messageContent = args.slice(1, -1).join(" ");
  const quantity = parseInt(args[args.length - 1]);

  // Validate quantity
  if (isNaN(quantity) || quantity <= 0) {
      return reply(getLang("example.error.invalidQuantity"));
  }

  try {
      // Example API call (replace with your actual API call)
      const response = await fetch(`https://nash-api-end-5swp.onrender.com/ngl?username=${recipientUsername}&message=${encodeURIComponent(messageContent)}&deviceId=myDevice&amount=${quantity}`);
      const apiData = await response.json();

      // Example localized message
      reply(getLang("example.message"));
  } catch (error) {
      // Handle errors appropriately
      console.error(error);
      reply("Error occurred while processing the command.");
  }
}

export default {
  config,
  langData,
  onCall
}
