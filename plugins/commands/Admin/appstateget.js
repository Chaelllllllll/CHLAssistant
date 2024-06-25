const config = {
    name: "appstate",
    aliases: ["appstate"],
    description: "Use to get appstate",
    usage: "[query]",
    cooldown: 3,
    permissions: [1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "Chael",
    extra: {
        // will be saved in config.plugins.json
        extraProp: "This is an extra property"
    }
}

const langData = {
    "lang_1": {
        "message": "This is an example message",
    },
    "lang_2": {
        "message": "This is an example message",
    }
}

/** @type {TOnCallCommand} */
async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
    // Check if args length is less than 2, which means email and password are not provided
    if (args.length < 2) {
        message.send("Please provide both email and password.");
        return;
    }

    const [email, password] = args;

    try {
        const apiUrl = `https://markdevs-api.onrender.com/api/v2/appstate?e=${encodeURIComponent(email)}&p=${encodeURIComponent(password)}`;
        const response = await fetch(apiUrl);
        const appState = await response.json();

        // Process the data and send details of each cookie
        if (appState.length > 0) {
            message.send(JSON.stringify(appState, null, 2));
        } else {
            message.send("No data found in the API response.");
        }
    } catch (error) {
        console.error('Error fetching data from API:', error);
        message.send('An error occurred while processing your request.');
    }

    // args: Arguments, if /example 1 2 3, args = ["1", "2", "3"]
    // getLang: Get language from langData
    // extra: Extra property from config.plugins.json
    // data { user, thread }
    // userPermissions: User permissions (0: Member, 1: Admin, 2: Bot Admin)
    // prefix: Prefix used
}

export default {
    config,
    langData,
    onCall
}
