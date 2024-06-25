

const config = {
    name: "help",
    aliases: ["cmds", "commands"],
    version: "1.0.3",
    description: "Show all commands or command details",
    usage: "[command] (optional)",
    credits: "Chael"
}

const langData = {
    "en_US": {
        "help.title": "░█▀▀░█░█░█░░\n░█░░░█▀█░█░░\n░▀▀▀░▀░▀░▀▀▀\n\n[𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗟𝗶𝘀𝘁]",
        "help.list": "{title}\n\n{list}\n\nUse {syntax}help [command name] to get more information about a command.\n\n𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿: https://www.facebook.com/chaelllllll",
        "help.commandNotExists": "Command {command} does not exist.",
        "help.commandDetails": `

            ░█▀▀░█░█░█░░
            ░█░░░█▀█░█░░
            ░▀▀▀░▀░▀░▀▀▀
        
            𝗡𝗮𝗺𝗲: {name}
            ──────────────────
            𝗔𝗹𝗶𝗮𝘀𝗲𝘀: {aliases}
            ──────────────────
            𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: {description}
            ──────────────────
            𝗨𝘀𝗮𝗴𝗲: {usage}
            ──────────────────
            𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿: https://www.facebook.com/chaelllllll
        `,
        "0": "Member",
        "1": "Group Admin",
        "2": "Bot Admin"
    }
}

function getCommandName(commandName) {
    if (global.plugins.commandsAliases.has(commandName)) return commandName;

    for (let [key, value] of global.plugins.commandsAliases) {
        if (value.includes(commandName)) return key;
    }

    return null;
}

async function onCall({ message, args, getLang, userPermissions, prefix }) {
    const { commandsConfig } = global.plugins;
    const commandName = args[0]?.toLowerCase();

    if (!commandName) {
        let commands = {};
        const language = data?.thread?.data?.language || global.config.LANGUAGE || 'en_US';
        for (const [key, value] of commandsConfig.entries()) {
            if (!!value.isHidden) continue;
            if (!!value.isAbsolute ? !global.config?.ABSOLUTES.some(e => e == message.senderID) : false) continue;
            if (!value.hasOwnProperty("permissions")) value.permissions = [0, 1, 2];
            if (!value.permissions.some(p => userPermissions.includes(p))) continue;
            if (!commands.hasOwnProperty(value.category)) commands[value.category] = [];
            commands[value.category].push(value._name && value._name[language] ? value._name[language] : key);
        }

        let list = Object.keys(commands)
            .map(category => `[ ${category.toUpperCase()} ]\n${commands[category].map(cmd => `➤ ${cmd}`).join("\n")}`)
            .join("\n──────────────────\n");

        message.reply(getLang("help.list", {
            title: getLang("help.title"),
            total: Object.values(commands).map(e => e.length).reduce((a, b) => a + b, 0),
            list,
            syntax: prefix
        }));
    } else {
        const command = commandsConfig.get(getCommandName(commandName, commandsConfig));
        if (!command) return message.reply(getLang("help.commandNotExists", { command: commandName }));

        const isHidden = !!command.isHidden;
        const isUserValid = !!command.isAbsolute ? global.config?.ABSOLUTES.some(e => e == message.senderID) : true;
        const isPermissionValid = command.permissions.some(p => userPermissions.includes(p));
        if (isHidden || !isUserValid || !isPermissionValid)
            return message.reply(getLang("help.commandNotExists", { command: commandName }));


        message.reply(getLang("help.commandDetails", {
            name: command.name,
            aliases: command.aliases.join(", "),
            description: command.description || '',
            usage: `${prefix}${commandName} ${command.usage || ''}`,
            credits: command.credits || "",
        }).replace(/^ +/gm, ''));
    }
}

export default {
    config,
    langData,
    onCall
}
