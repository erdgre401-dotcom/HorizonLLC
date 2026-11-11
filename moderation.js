const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../config");
const store = require("../lib/store");
const { base } = require("../lib/embeds");

function log(guild, embed) {
  const channel = guild.channels.cache.find(c => c.name === config.logChannelName);
  if (channel) channel.send({ embeds: [embed] }).catch(() => {});
}
const commands = [
  {
    data: new SlashCommandBuilder().setName("warn").setDescription("Warn a member")
      .addUserOption(o => o.setName("member").setDescription("Member to warn").setRequired(true))
      .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(i) {
      const user = i.options.getUser("member"), reason = i.options.getString("reason");
      const s = store.read(); s.warnings ||= {}; s.warnings[user.id] ||= []; s.warnings[user.id].push({ reason, moderator: i.user.id, at: new Date().toISOString() }); store.write(s);
      log(i.guild, base("Member warned", `${user.tag} was warned by ${i.user.tag}.\n**Reason:** ${reason}`));
      return i.reply({ content: `Warned ${user.tag}.`, ephemeral: true });
    }
  },
  {
    data: new SlashCommandBuilder().setName("timeout").setDescription("Timeout a member")
      .addUserOption(o => o.setName("member").setDescription("Member to timeout").setRequired(true))
      .addIntegerOption(o => o.setName("duration").setDescription("Duration in minutes (1–40320)").setMinValue(1).setMaxValue(40320).setRequired(true))
      .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(i) {
      const user = i.options.getUser("member"), minutes = i.options.getInteger("duration"), reason = i.options.getString("reason");
      const member = await i.guild.members.fetch(user.id);
      await member.timeout(minutes * 60000, reason);
      log(i.guild, base("Member timed out", `${user.tag} timed out for ${minutes} minutes.\n**Reason:** ${reason}`));
      return i.reply({ content: `Timed out ${user.tag} for ${minutes} minutes.`, ephemeral: true });
    }
  },
  {
    data: new SlashCommandBuilder().setName("kick").setDescription("Kick a member")
      .addUserOption(o => o.setName("member").setDescription("Member to kick").setRequired(true))
      .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(i) {
      const user = i.options.getUser("member"), reason = i.options.getString("reason");
      const member = await i.guild.members.fetch(user.id); await member.kick(reason);
      log(i.guild, base("Member kicked", `${user.tag} kicked by ${i.user.tag}.\n**Reason:** ${reason}`));
      return i.reply({ content: `Kicked ${user.tag}.`, ephemeral: true });
    }
  },
  {
    data: new SlashCommandBuilder().setName("ban").setDescription("Ban a member")
      .addUserOption(o => o.setName("member").setDescription("Member to ban").setRequired(true))
      .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(i) {
      const user = i.options.getUser("member"), reason = i.options.getString("reason");
      await i.guild.members.ban(user.id, { reason });
      log(i.guild, base("Member banned", `${user.tag} banned by ${i.user.tag}.\n**Reason:** ${reason}`));
      return i.reply({ content: `Banned ${user.tag}.`, ephemeral: true });
    }
  }
];
module.exports = commands;
