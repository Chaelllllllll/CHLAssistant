const config = {
    name: "pending",
    description: "Approve or deny a pending message",
    usage: "",
    cooldown: 3,
    permissions: [1, 2],
    credits: "XaviaTeam",
    isAbsolute: true,
};

const langData = {
    en_US: {
        invalidIndexes: "Invalid indexes",
        successDeny: "Denied successfully {success} group(s)",
        failDeny: "Some groups could not be denied:\n{fail}",
        denied: "Sorry, your group has been denied",
        successApprove: "Approved successfully {success} group(s)",
        failApprove: "Some groups could not be approved:\n{fail}",
        approved:
            "Congratulations, your group has been approved\n{prefix}help to see the list of commands",
        pendingThreadList:
            "List of pending threads:\n{pendingThread}\n\nReply with the following syntax:\nTo deny: deny <index/all>\nTo approve: approve <index/all>",
        pendingThreadListEmpty: "There are no pending threads",
        error: "An error has occurred, please try again later",
    }
};

function handleError(e) {
    console.error(e);
    return null;
}

function out(botID, cTID) {
    return new Promise((resolve) => {
        global.api.removeUserFromGroup(botID, cTID, (err) => {
            if (err) return resolve(null), console.error(err);
            resolve(true);
        });
    });
}

async function callback({ message, getLang, eventData }) {
    const { pendingThread } = eventData;

    const input = message.body.split(" ");
    const indexes =
        input[1] == "all" || input[1] == "-a"
            ? pendingThread.map((_, index) => index)
            : input
                  .slice(1)
                  .map((index) => parseInt(index) - 1)
                  .filter(
                      (index) => index >= 0 && index < pendingThread.length
                  );

    let success = 0,
        fail = [];
    if (input[0] == "deny" || input[0] == "d") {
        if (indexes.length == 0)
            return message.reply(getLang("invalidIndexes"));

        const threads = indexes.map((index) => pendingThread[index]);

        for (const thread of threads) {
            const { threadID: cTID } = thread;

            let _info = await message
                .send(getLang("denied"), cTID)
                .then((data) => data)
                .catch(handleError);
            let _out = await out(global.botID, cTID);

            if (_info == null || _out == null) fail.push(cTID);
            else success++;

            await global.utils.sleep(500);
        }

        message.reply(getLang("successDeny", { success }));
        if (fail.length > 0)
            message.reply(getLang("failDeny", { fail: fail.join("\n") }));
    } else {
        if (indexes.length == 0)
            return message.reply(getLang("invalidIndexes"));

        const threads = indexes.map((index) => pendingThread[index]);

        for (const thread of threads) {
            const { threadID: cTID } = thread;
            let threadPrefix =
                global.data.threads.get(cTID)?.data?.prefix ||
                global.config.PREFIX;

            let _info = await message
                .send(
                    getLang("approved", {
                        prefix: threadPrefix,
                    }),
                    cTID
                )
                .then((data) => data)
                .catch(handleError);

            if (_info == null) fail.push(cTID);
            else success++;

            await global.utils.sleep(500);
        }

        message.reply(getLang("successApprove", { success }));
        if (fail.length > 0)
            message.reply(getLang("failApprove", { fail: fail.join("\n") }));
    }

    return;
}

async function onCall({ message, getLang }) {
    try {
        const SPAM =
            (await global.api.getThreadList(100, null, ["OTHER"])) || [];
        const PENDING =
            (await global.api.getThreadList(100, null, ["PENDING"])) || [];

        const pendingThread = [...SPAM, ...PENDING].filter(
            (thread) => thread.isGroup && thread.isSubscribed
        );
        if (pendingThread.length == 0)
            return message.reply(getLang("pendingThreadListEmpty"));

        return message
            .reply(
                getLang("pendingThreadList", {
                    pendingThread: pendingThread
                        .map(
                            (thread, index) =>
                                `${index + 1}. ${thread.name} (${
                                    thread.threadID
                                })`
                        )
                        .join("\n"),
                })
            )
            .then((_) => _.addReplyEvent({ pendingThread, callback }))
            .catch((e) => console.error(e));
    } catch (e) {
        console.error(e);
        return message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall,
};
