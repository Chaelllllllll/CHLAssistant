const config = {
    name: "maintain",
    description: "on/off maintain mode",
    usage: "[on/off]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "XaviaTeam",
    isAbsolute: true
}

const langData = {
    "en_US": {
        "alreadyOn": "Bot is already in maintain mode",
        "on": "Turned on maintain mode",
        "alreadyOff": "Bot is already out of maintain mode",
        "off": "Turned off maintain mode"
    }
}

async function onCall({ message, args, getLang }) {
    let input = args[0]?.toLowerCase() == "on" ? true : args[0]?.toLowerCase() == "off" ? false : null;

    if (input == null) input = !global.maintain;

    if (input) {
        if (global.maintain) return message.reply(getLang("alreadyOn"));
        global.maintain = true;

        message.reply(getLang("on"));
    } else {
        if (!global.maintain) return message.reply(getLang("alreadyOff"));
        global.maintain = false;

        message.reply(getLang("off"));
    }
}

export default {
    config,
    langData,
    onCall
}
