const { EmbedBuilder } = require("discord.js");
const config = require("../config");
function base(title, description) {
  return new EmbedBuilder()
    .setColor(config.accent)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: config.footer })
    .setTimestamp();
}
module.exports = { base };
