const config = {
    name: "data",
    permissions: [1, 2],
    credits: "XaviaTeam",
    isAbsolute: true,
};

const langData = {
    en_US: {
        updateSuccess: "Updated data successfully. ({time}ms)",
        resetSuccess: "Reset data successfully.",
        chooseReset:
            "Choose what you want to reset:\n1. Threads\n2. Users\n3. All",
        threads: "All threads data will be reset.",
        users: "All users data will be reset.",
        all: "All data will be reset.",
        confirmReset: "\nReact 👍 to confirm.",
        invalidChoice: "Invalid choice.",
        invalidQuery: "Invalid query, available queries: update, reset.",
        error: "An error occurred.",
    }
};

/** @type {TReactCallback} */
async function resetConfirm({ message, eventData, getLang, xDB }) {
    const { reaction } = message;
    const { type, chosen } = eventData;

    if (reaction != "👍") return;
    global.api.unsendMessage(message.messageID);
    if (chosen == "all") {
        global.data.users = new Map();
        global.data.threads = new Map();

        if (type == "MONGO") {
            await xDB.models.Users.deleteMany({});
            await xDB.models.Threads.deleteMany({});
        }
    } else {
        global.data[chosen] = new Map();
        if (type == "MONGO")
            await xDB.models[
                chosen.charAt(0).toUpperCase() + chosen.slice(1)
            ].deleteMany({});
    }

    try {
        if (type == "JSON") await xDB.update();

        message.send(getLang("resetSuccess"));
    } catch {
        message.send(getLang("error"));
    }
}

function chooseReset({ message, getLang }) {
    const { body, reply } = message;
    const choice = parseInt(body?.toLowerCase());

    if (isNaN(choice)) return reply(getLang("invalidChoice"));
    if (choice < 1 || choice > 3) return reply(getLang("invalidChoice"));

    const chosen = choice == 1 ? "threads" : choice == 2 ? "users" : "all";
    const type = global.config.DATABASE;

    reply(getLang(chosen) + getLang("confirmReset"))
        .then((_) => _.addReactEvent({ callback: resetConfirm, type, chosen }))
        .catch((e) => {
            console.log(e);
            reply(getLang("error"));
        });
}

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang, xDB }) {
    const query = args[0]?.toLowerCase();

    switch (query) {
        case "update": {
            await message.react("🕐");
            let start = Date.now();

            await xDB.update();

            await message.react("✅");

            await message.reply(
                getLang("updateSuccess", {
                    time: (Date.now() - start).toFixed(2),
                })
            );
            break;
        }
        case "reset": {
            message
                .reply(getLang("chooseReset"))
                .then((_) => _.addReplyEvent({ callback: chooseReset }))
                .catch((e) => {
                    console.log(e);
                    message.reply(getLang("error"));
                });

            break;
        }
        default: {
            await message.reply(getLang("invalidQuery"));
            break;
        }
    }

    return;
}

export default {
    config,
    langData,
    onCall,
};
