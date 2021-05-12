const Discord = require("discord.js");
const handler = require("./handler");
const client = new Discord.Client();

require('dotenv').config()
const token = process.env.TOKEN

client.login(token);

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", handler.getMessage);