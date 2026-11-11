const {
  SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder,
  ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType,
  EmbedBuilder, RoleSelectMenuBuilder
} = require("discord.js");
const config = require("../config");
const { base } = require("../lib/embeds");

const MODULES = [
  ["roles", "Organization roles", "Create leadership, staff, roster and member roles"],
  ["channels", "Channels & categories", "Create information, staff, roster and community channels"],
  ["permissions", "Baseline permissions", "Apply safe baseline role permissions"],
  ["welcome", "Welcome system", "Create welcome channel and configure join messages"],
  ["verification", "Verification", "Create a verification panel and verified role"],
  ["tickets", "Ticket system", "Create ticket category and support panel"],
  ["applications", "Applications", "Create player, staff, creator and partnership application panel"],
  ["logging", "Logging", "Create moderation, member and ticket log channels"],
  ["roster", "Roster system", "Create competitive, creative, content and studio roster channels"],
  ["announcements", "Announcements", "Create announcement channels"],
  ["socials", "Socials", "Create social links and updates channels"],
  ["information", "Information", "Create rules and requirements channels"],
  ["competitive", "Competitive", "Create scrim, tournament, practice and results channels"]
];

const ROLE_DEFS = [
  ["HORIZON | Owner", 0xE8E8E8],
  ["HORIZON | AO perms", 0xD6B7FF],
  ["HORIZON | Head Of Operations", 0x9B6BFF],
  ["HORIZON | Chief", 0x8FC49B],
  ["HORIZON | Executive", 0xFF79C6],
  ["HORIZON | C-suite executive", 0xD8AAA0],
  ["HORIZON | Chief of administrators", 0xE04444],
  ["HORIZON | Chief of staff", 0xD47DB5],
  ["HORIZON | Chief operation officer", 0x8FA7D4],
  ["HORIZON | Chief of recruitment officer", 0x22D66D],
  ["HORIZON | Chief of community officer", 0xE8758A],
  ["HORIZON | High Authority", 0x9AAAB5],
  ["HORIZON | Management", 0x69B65A],
  ["HORIZON | Administrator", 0xE05252],
  ["HORIZON | Moderator", 0x4D91D9],
  ["HORIZON | Recruitment", 0x36BDA5],
  ["HORIZON | Competitive Staff", 0xD6A54A],
  ["HORIZON | Pro", 0xE4B94F],
  ["HORIZON | Semi Pro", 0xB8C2D0],
  ["HORIZON | Future 2.0", 0x83A9D8],
  ["HORIZON | Academy", 0x7FBF9A],
  ["HORIZON | Future Academy", 0x68B8C7],
  ["HORIZON | Grinder+", 0xA6A6A6],
  ["HORIZON | Token Pro", 0xB18AFF],
  ["HORIZON | Main Creative", 0xD78CEB],
  ["HORIZON | Creative Academy", 0xC3A3D9],
  ["HORIZON | Creative Future", 0xAFA3C7],
  ["HORIZON | Main Content Creator", 0xE28C65],
  ["HORIZON | Content Creator", 0xD9A477],
  ["HORIZON | VFX", 0x6BA9E8],
  ["HORIZON | GFX", 0x7B8CE8],
  ["HORIZON | Verified", 0x4DAD86],
  ["HORIZON | Member", 0x8B95A5]
];

const CHANNELS = {
  "📌 INFORMATION": ["welcome", "rules", "requirements", "announcements", "socials", "faq"],
  "💬 COMMUNITY": ["general", "media", "bot-commands"],
  "🔒 STAFF": ["staff-chat", "staff-announcements", "staff-logs", "mod-logs", "ticket-logs"],
  "🎮 ROSTERS": ["competitive-roster", "creative-roster", "content-roster", "studios"],
  "🏆 COMPETITIVE": ["scrim-announcements", "tournaments", "practice-schedule", "results"],
  "🎫 SUPPORT": ["make-a-ticket"]
};

async function ensureRole(guild, name, color) {
  let role = guild.roles.cache.find(r => r.name === name);
  if (!role) role = await guild.roles.create({ name, color, reason: "HORIZON LLC setup" });
  return role;
}
async function ensureCategory(guild, name) {
  return guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === name)
    || guild.channels.create({ name, type: ChannelType.GuildCategory, reason: "HORIZON LLC setup" });
}
async function ensureText(guild, name, parent, overwrites = []) {
  return guild.channels.cache.find(c => c.type === ChannelType.GuildText && c.name === name)
    || guild.channels.create({ name, type: ChannelType.GuildText, parent, permissionOverwrites: overwrites, reason: "HORIZON LLC setup" });
}

async function runModule(interaction, key) {
  const guild = interaction.guild;
  if (key === "roles") {
    let made = 0;
    for (const [name, color] of ROLE_DEFS) {
      const existed = guild.roles.cache.some(r => r.name === name);
      await ensureRole(guild, name, color);
      if (!existed) made++;
    }
    return `Created ${made} missing HORIZON roles. Existing roles were preserved.`;
  }
  if (key === "channels") {
    let made = 0;
    for (const [categoryName, names] of Object.entries(CHANNELS)) {
      const category = await ensureCategory(guild, categoryName);
      for (const name of names) {
        const existed = guild.channels.cache.some(c => c.type === ChannelType.GuildText && c.name === name);
        await ensureText(guild, name, category.id);
        if (!existed) made++;
      }
    }
    const voice = await ensureCategory(guild, "🔊 VOICE CHANNELS");
    for (const name of ["General Voice", "Competitive 1", "Competitive 2", "Staff Voice"]) {
      if (!guild.channels.cache.some(c => c.type === ChannelType.GuildVoice && c.name === name)) {
        await guild.channels.create({ name, type: ChannelType.GuildVoice, parent: voice.id, reason: "HORIZON LLC setup" });
        made++;
      }
    }
    return `Created ${made} missing channels. Existing channels were preserved.`;
  }
  if (key === "permissions") {
    const everyone = guild.roles.everyone;
    const verified = await ensureRole(guild, config.verifiedRoleName, 0x4DAD86);
    const member = await ensureRole(guild, config.memberRoleName, 0x8B95A5);
    await ensureCategory(guild, "🔒 STAFF");
    // Conservative baseline: no dangerous permissions are granted to staff roles automatically.
    await verified.setPermissions([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]);
    await member.setPermissions([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]);
    return `Applied basic member permissions to ${verified.name} and ${member.name}. Staff-only channel overwrites should be reviewed and assigned to your actual staff roles.`;
  }
  if (key === "welcome") {
    const cat = await ensureCategory(guild, "📌 INFORMATION");
    await ensureText(guild, config.welcomeChannelName, cat.id);
    return "Welcome channel is ready. Join messages are posted when the bot observes a member join.";
  }
  if (key === "verification") {
    const role = await ensureRole(guild, config.verifiedRoleName, 0x4DAD86);
    const cat = await ensureCategory(guild, "📌 INFORMATION");
    const channel = await ensureText(guild, "verify", cat.id);
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("horizon_verify").setLabel("Verify").setStyle(ButtonStyle.Success));
    await channel.send({ embeds: [base("HORIZON LLC | Verification", "Welcome to HORIZON LLC. Press the button below to receive the verified role and access the community.")], components: [row] });
    return `Verification panel posted. The bot will assign ${role.name}.`;
  }
  if (key === "tickets") {
    const cat = await ensureCategory(guild, config.ticketCategoryName);
    const panel = await ensureText(guild, "make-a-ticket", (await ensureCategory(guild, "🎫 SUPPORT")).id);
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("horizon_ticket").setLabel("Create a ticket").setStyle(ButtonStyle.Primary));
    await panel.send({ embeds: [base("HORIZON LLC | Support", "Need help or want to apply? Open a private ticket using the button below.")], components: [row] });
    return `Ticket category ${cat.name} and ticket panel are ready.`;
  }
  if (key === "applications") {
    const cat = await ensureCategory(guild, config.applicationCategoryName);
    const panel = await ensureText(guild, "applications", (await ensureCategory(guild, "📌 INFORMATION")).id);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("horizon_app_player").setLabel("Player").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("horizon_app_staff").setLabel("Staff").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("horizon_app_creator").setLabel("Creator").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("horizon_app_partner").setLabel("Partnership").setStyle(ButtonStyle.Secondary)
    );
    await panel.send({ embeds: [base("HORIZON LLC | Applications", "Choose the application that matches what you are applying for. A private channel will be created for your application.")], components: [row] });
    return `Application category ${cat.name} and application panel are ready.`;
  }
  if (key === "logging") {
    const cat = await ensureCategory(guild, "🔒 STAFF");
    for (const name of ["mod-logs", "member-logs", "staff-logs", "ticket-logs"]) await ensureText(guild, name, cat.id);
    return "Logging channels are ready. Moderation and member events will be posted where supported.";
  }
  if (key === "roster") {
    const cat = await ensureCategory(guild, "🎮 ROSTERS");
    for (const name of ["competitive-roster", "creative-roster", "content-roster", "studios"]) await ensureText(guild, name, cat.id);
    return "Competitive, creative, content and studio roster channels are ready.";
  }
  if (key === "announcements") {
    const cat = await ensureCategory(guild, "📌 INFORMATION");
    await ensureText(guild, "announcements", cat.id);
    return "Announcement channel is ready.";
  }
  if (key === "socials") {
    const cat = await ensureCategory(guild, "📌 INFORMATION");
    await ensureText(guild, "socials", cat.id);
    return "Socials channel is ready.";
  }
  if (key === "information") {
    const cat = await ensureCategory(guild, "📌 INFORMATION");
    for (const name of ["rules", "requirements", "faq"]) await ensureText(guild, name, cat.id);
    return "Rules, requirements and FAQ channels are ready.";
  }
  if (key === "competitive") {
    const cat = await ensureCategory(guild, "🏆 COMPETITIVE");
    for (const name of ["scrim-announcements", "tournaments", "practice-schedule", "results"]) await ensureText(guild, name, cat.id);
    return "Competitive channels are ready.";
  }
  return "Unknown setup module.";
}

module.exports = {
  data: new SlashCommandBuilder().setName("setup").setDescription("Open the HORIZON LLC interactive setup dashboard").setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const menu = new StringSelectMenuBuilder().setCustomId("horizon_setup_select").setPlaceholder("Choose a setup module").addOptions(MODULES.map(([value, label, description]) => ({ value, label, description })));
    const row = new ActionRowBuilder().addComponents(menu);
    const run = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("horizon_setup_run").setLabel("Run selected module").setStyle(ButtonStyle.Primary));
    await interaction.reply({ embeds: [base("HORIZON LLC | Server Setup", "Select a module, then press **Run selected module**. Setup is non-destructive: existing roles and channels are preserved.")] , components: [row, run], ephemeral: true });
  },
  MODULES,
  runModule
};
