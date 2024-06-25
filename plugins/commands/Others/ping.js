export default function ({ message }) {
    let timeStart = Date.now();
    message.send('').catch(_ => {
        let timeEnd = Date.now();
        message.reply(`Ping: ${timeEnd - timeStart}ms`);
    })
}
