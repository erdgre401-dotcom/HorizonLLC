require("dotenv").config();
const { REST, Routes } = require("discord.js");
const setup = require("./commands/setup");
const help = require("./commands/help");
const general = require("./commands/general");
const moderation = require("./commands/moderation");
const commands = [setup.data, help.data, ...general.map(c => c.data), ...moderation.map(c => c.data)].map(c => c.toJSON());
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) throw new Error("Set DISCORD_TOKEN, CLIENT_ID and GUILD_ID in .env");
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
(async () => {
  await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
  console.log(`Registered ${commands.length} HORIZON commands.`);
})().catch(console.error);
