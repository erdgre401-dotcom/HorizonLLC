const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../config");
const store = require("../lib/store");
const { base } = require("../lib/embeds");

module.exports = [
  {
    data: new SlashCommandBuilder().setName("roster").setDescription("Manage the HORIZON roster")
      .addStringOption(o => o.setName("action").setDescription("Roster action").setRequired(true).addChoices({name:"add",value:"add"},{name:"remove",value:"remove"},{name:"list",value:"list"}))
      .addStringOption(o => o.setName("name").setDescription("Player name").setRequired(false))
      .addStringOption(o => o.setName("division").setDescription("Roster division").setRequired(false))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(i) {
      const state = store.read(); state.roster ||= [];
      const action = i.options.getString("action"), name = i.options.getString("name"), division = i.options.getString("division") || "Unassigned";
      if (action === "list") return i.reply({ embeds: [base("HORIZON | Roster", state.roster.length ? state.roster.map(p => `• **${p.name}** — ${p.division}`).join("\n") : "No roster members have been added yet.")], ephemeral: true });
      if (!name) return i.reply({ content: "Provide a player name.", ephemeral: true });
      if (action === "add") { state.roster = state.roster.filter(p => p.name.toLowerCase() !== name.toLowerCase()); state.roster.push({name, division}); }
      else state.roster = state.roster.filter(p => p.name.toLowerCase() !== name.toLowerCase());
      store.write(state);
      return i.reply({ content: action === "add" ? `Added **${name}** to **${division}**.` : `Removed **${name}** from the roster.`, ephemeral: true });
    }
  },
  {
    data: new SlashCommandBuilder().setName("announce").setDescription("Post a HORIZON announcement")
      .addChannelOption(o => o.setName("channel").setDescription("Target text channel").addChannelTypes(ChannelType.GuildText).setRequired(true))
      .addStringOption(o => o.setName("title").setDescription("Announcement title").setRequired(true))
      .addStringOption(o => o.setName("message").setDescription("Announcement message").setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(i) {
      const channel = i.options.getChannel("channel");
      await channel.send({ embeds: [base(i.options.getString("title"), i.options.getString("message"))] });
      return i.reply({ content: `Announcement posted in ${channel}.`, ephemeral: true });
    }
  },
  {
    data: new SlashCommandBuilder().setName("ticketpanel").setDescription("Post the HORIZON ticket panel")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(i) {
      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("horizon_ticket").setLabel("Create a ticket").setStyle(ButtonStyle.Primary));
      await i.channel.send({ embeds: [base("HORIZON LLC | Support", "Press below to open a private support or recruitment ticket.")], components: [row] });
      return i.reply({ content: "Ticket panel posted.", ephemeral: true });
    }
  }
];
