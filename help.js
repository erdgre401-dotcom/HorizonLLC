const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");
const { base } = require("../lib/embeds");

const groups = {
  General: [["/help", "Browse commands you can access."], ["/setup", "Open the server setup dashboard."]],
  Organization: [["/roster", "Add, remove or list HORIZON roster members."], ["/announce", "Publish a branded announcement."], ["/ticketpanel", "Post the ticket panel."]],
  Moderation: [["/warn", "Record a member warning."], ["/timeout", "Temporarily timeout a member."], ["/kick", "Kick a member."], ["/ban", "Ban a member."]]
};

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Browse HORIZON bot commands"),
  async execute(interaction) {
    const allowed = Object.entries(groups).map(([name, commands]) => [name, commands.filter(([cmd]) => {
      if (cmd === "/setup") return interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
      if (["/warn", "/timeout", "/kick", "/ban"].includes(cmd)) return interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers) || interaction.memberPermissions.has(PermissionFlagsBits.KickMembers) || interaction.memberPermissions.has(PermissionFlagsBits.BanMembers);
      if (cmd === "/announce") return interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages);
      if (cmd === "/roster") return interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles);
      return true;
    })]).filter(([, commands]) => commands.length);
    const menu = new StringSelectMenuBuilder().setCustomId("horizon_help_select").setPlaceholder("Choose a command category").addOptions(allowed.map(([name]) => ({ label: name, value: name })));
    const row = new ActionRowBuilder().addComponents(menu);
    const description = allowed.map(([name, commands]) => `**${name}** · ${commands.length} command(s)`).join("\n") || "No commands available.";
    await interaction.reply({ embeds: [base("HORIZON LLC | Command Directory", `Choose a category to see commands you are authorized to use.\n\n${description}`)], components: allowed.length ? [row] : [], ephemeral: true });
  },
  groups
};
