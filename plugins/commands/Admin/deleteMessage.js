const config = {
    name: "delmsg",
    aliases: ["deletemsg", "delmessage", "deletemessage"],
    description: "delete group message",
    usage: "[all]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "XaviaTeam",
    isAbsolute: true
}

const langData = {
    "en_US": {
        "confirmDeleteThis": "React 👍 to confirm delete all messages in this group.",
        "noThread": "No group to delete messages.",
        "confirmDeleteAll": "React 👍 to confirm delete all messages of all groups (except current group).",
        "chooseThread": "=== INBOX ===\n\n{INBOX}\n\n=== PENDING ===\n\n{PENDING}\n\n=== SPAM ===\n\n{SPAM}\n\nEnter the index of groups to delete messages (separated by spaces).\nOr enter all to delete messages of all groups (except current group).",
        "invalidIndexes": "Invalid indexes.",
        "confirmDelete": "React 👍 to confirm delete all messages of the group with the following ID:\n{choosenThreadID}",
        "successDelete": "Deleted successfully!",
        "error": "An error occurred, please try again later."
    }
}

async function confirm({ message, getLang, eventData }) {
    const { targetIDs } = eventData;
    let targetSendID = targetIDs.some(item => item == message.threadID) ? message.userID : message.threadID;
    try {

        global.api.deleteThread(targetIDs, err => {
            if (err) {
                console.error(err);
                return message.send(getLang("error"), targetSendID);
            } else {
                return message.send(getLang("successDelete"), targetSendID);
            }
        });

    } catch (e) {
        console.error(e);
        return message.send(getLang("error"), targetSendID);
    }
}

async function choose({ message, getLang, eventData }) {
    try {
        const { targetIDs } = eventData;

        const choosenThreadID = [];
        const indexes = message.body.split(" ")[0] == "all" ? targetIDs.map((_, index) => index) :
            message.body.split(" ")
                .filter(item => item && !isNaN(item) && item > 0)
                .map(item => parseInt(item - 1));

        for (let index of indexes) {
            if (index < targetIDs.length) choosenThreadID.push(targetIDs[index]);
        }

        if (choosenThreadID.length == 0) return message.reply(getLang("invalidIndexes"));

        return message
            .reply(getLang("confirmDelete", { choosenThreadID: choosenThreadID.join("\n") }))
            .then(_ => _.addReactEvent({ callback: confirm, targetIDs: choosenThreadID }))
            .catch(e => {
                if (e.message) {
                    console.error(e.message);
                    return message.reply(getLang("error"));
                }
            });
    } catch (e) {
        console.error(e);
        return message.reply(getLang("error"));
    }
}

async function onCall({ message, args, getLang }) {
    try {
        const { threadID } = message;

        if (args[0] == "this") {
            return message
                .reply(getLang("confirmDeleteThis"))
                .then(_ => _.addReactEvent({ callback: confirm, targetIDs: [message.threadID] }))
                .catch(e => {
                    if (e.message) {
                        console.error(e.message);
                        return message.reply(getLang("error"));
                    }
                });
        }

        let INBOX = (await global.api.getThreadList(100, null, ["INBOX"])) || [];
        let SPAM = (await global.api.getThreadList(100, null, ["OTHER"])) || [];
        let PENDING = (await global.api.getThreadList(100, null, ["PENDING"])) || [];

        INBOX = INBOX.filter(thread => thread.isGroup && thread.threadID != threadID);
        SPAM = SPAM.filter(thread => thread.isGroup && thread.threadID != threadID);
        PENDING = PENDING.filter(thread => thread.isGroup && thread.threadID != threadID);

        const ALL = [...INBOX, ...SPAM, ...PENDING];

        if (ALL.length == 0) return message.reply(getLang("noThread"));

        if (args[0] == "all") {
            return message
                .reply(getLang("confirmDeleteAll"))
                .then(_ => _.addReactEvent({ callback: confirm, targetIDs: ALL.map(thread => thread.threadID) }))
                .catch(e => {
                    if (e.message) {
                        console.error(e.message);
                        return message.reply(getLang("error"));
                    }
                });
        }

        return message
            .reply(getLang("chooseThread", {
                INBOX: INBOX.map((thread, index) => `${index + 1}. ${thread.name} (${thread.threadID})`).join("\n"),
                SPAM: SPAM.map((thread, index) => `${index + INBOX.length + 1}. ${thread.name} (${thread.threadID})`).join("\n"),
                PENDING: PENDING.map((thread, index) => `${index + INBOX.length + SPAM.length + 1}. ${thread.name} (${thread.threadID})`).join("\n")
            }))
            .then(_ => _.addReplyEvent({ callback: choose, targetIDs: ALL.map(thread => thread.threadID) }))
            .catch(e => {
                if (e.message) {
                    console.error(e.message);
                    return message.reply(getLang("error"));
                }
            });
    } catch (e) {
        console.error(e);
        return message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
