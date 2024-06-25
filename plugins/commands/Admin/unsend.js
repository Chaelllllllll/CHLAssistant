const config = {
  name: "unsend",
  aliases: ["unsend"],
  description: "Unsend bot's message",
  usage: "[reply/on/off]",
  cooldown: 3,
  permissions: [2],
  credits: "XaviaTeam"
}

const langData = {
  "en_US": {
      "dataNotReady": "The group's data is not ready",
      "notReply": "You must reply to the bot's message",
      "notBotMessage": "The message you reply is not from the bot",
      "notAllowed": "This group is not allowed to unsend bot's message",
      "alreadyOn": "The unsend bot's message feature is already on",
      "on": "Turned on the unsend bot's message feature",
      "alreadyOff": "The unsend bot's message feature is already off",
      "off": "Turned off the unsend bot's message feature",
      "notAllowedToTurnOn": "You don't have enough permissions to turn on this feature",
      "notAllowedToTurnOff": "You don't have enough permissions to turn off this feature",
      "error": "An error has occurred"
  }
}

async function onCall({ message, args, getLang, data, userPermissions }) {
  try {
      const thread = data?.thread;
      if (!thread) return message.reply(getLang("dataNotReady"));

      const threadData = thread.data || {};
      const isAllowed = threadData?.unsend === true;
      const input = args[0]?.toLowerCase();
      const isInputQuery = input == "on" || input == "off";

      const isGroupAdmin = userPermissions.some(e => e == 1);

      if (isGroupAdmin && isInputQuery) {
          if (input == "on") {
              if (isAllowed) return message.reply(getLang("alreadyOn"));

              await global.controllers.Threads.updateData(message.threadID, { unsend: true });
              return message.reply(getLang("on"));
          } else {
              if (!isAllowed) return message.reply(getLang("alreadyOff"));

              await global.controllers.Threads.updateData(message.threadID, { unsend: false });
              return message.reply(getLang("off"));
          }
      } else if (!isGroupAdmin && isInputQuery) {
          if (input == "on") return message.reply(getLang("notAllowedToTurnOn"));
          else return message.reply(getLang("NotAllowedToTurnOff"));
      } else {
          if (message.type != "message_reply") return message.reply(getLang("notReply"));
          if (message.messageReply?.senderID != global.botID) return message.reply(getLang("notBotMessage"));

          if (!isAllowed) return message.reply(getLang("notAllowed"));

          const targetMessageID = message.messageReply.messageID;

          return global.api.unsendMessage(targetMessageID, (e) => {
              if (e) return message.react("❌");
              message.react("✅");
          });
      }
  } catch (err) {
      console.error(err);
      message.reply(getLang("error"));
  }
}

export default {
  config,
  langData,
  onCall
}