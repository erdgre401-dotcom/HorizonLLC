require("dotenv").config();
const {
  Client, GatewayIntentBits, Collection, Events, ChannelType,
  PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder,
  ButtonBuilder, ButtonStyle, EmbedBuilder
} = require("discord.js");
const config = require("./config");
const { base } = require("./lib/embeds");
const setup = require("./commands/setup");
const help = require("./commands/help");
const general = require("./commands/general");
const moderation = require("./commands/moderation");

if (!process.env.DISCORD_TOKEN) throw new Error("Missing DISCORD_TOKEN in .env");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const commands = new Collection();
for (const c of [setup, help, ...general, ...moderation]) commands.set(c.data.name, c);

client.once(Events.ClientReady, c => console.log(`${c.user.tag} is online for HORIZON LLC.`));

client.on(Events.GuildMemberAdd, async member => {
  const ch = member.guild.channels.cache.find(c => c.name === config.welcomeChannelName);
  if (ch) ch.send({ embeds: [base("Welcome to HORIZON LLC", `Welcome ${member} to the organization. Please review #rules and #requirements to get started.`)] }).catch(() => {});
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
      return;
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "horizon_setup_select") {
        const key = interaction.values[0];
        await interaction.update({ content: `Selected setup module: **${setup.MODULES.find(m => m[0] === key)?.[1] || key}**. Press **Run selected module** to continue.`, embeds: interaction.message.embeds, components: interaction.message.components });
        interaction.client.setupSelections ||= new Map();
        interaction.client.setupSelections.set(interaction.user.id, key);
        return;
      }
      if (interaction.customId === "horizon_help_select") {
        const group = help.groups[interaction.values[0]] || [];
        const lines = group.map(([cmd, desc]) => `**${cmd}** — ${desc}`).join("\n");
        await interaction.update({ embeds: [base(`HORIZON LLC | ${interaction.values[0]}`, lines || "No commands in this category.")], components: interaction.message.components });
        return;
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId === "horizon_setup_run") {
        if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "You need Administrator permission to run setup.", ephemeral: true });
        const key = interaction.client.setupSelections?.get(interaction.user.id);
        if (!key) return interaction.reply({ content: "Choose a setup module from the dropdown first.", ephemeral: true });
        await interaction.deferReply({ ephemeral: true });
        const result = await setup.runModule(interaction, key);
        return interaction.editReply({ embeds: [base("HORIZON LLC | Setup complete", result)] });
      }
      if (interaction.customId === "horizon_verify") {
        const role = interaction.guild.roles.cache.find(r => r.name === config.verifiedRoleName);
        if (!role) return interaction.reply({ content: "The verified role was not found. Ask an administrator to run `/setup` → Verification.", ephemeral: true });
        const member = await interaction.guild.members.fetch(interaction.user.id);
        await member.roles.add(role);
        return interaction.reply({ content: "You're verified. Welcome to HORIZON LLC!", ephemeral: true });
      }
      if (interaction.customId === "horizon_ticket" || interaction.customId.startsWith("horizon_app_")) {
        const isApp = interaction.customId.startsWith("horizon_app_");
        const parentName = isApp ? config.applicationCategoryName : config.ticketCategoryName;
        let parent = interaction.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === parentName);
        if (!parent) parent = await interaction.guild.channels.create({ name: parentName, type: ChannelType.GuildCategory });
        const safeName = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 18);
        const kind = isApp ? interaction.customId.replace("horizon_app_", "") : "support";
        const channel = await interaction.guild.channels.create({
          name: `${isApp ? "app" : "ticket"}-${kind}-${safeName}`.slice(0, 90),
          type: ChannelType.GuildText,
          parent: parent.id,
          permissionOverwrites: [
            { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
          ]
        });
        const close = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("horizon_close_ticket").setLabel("Close").setStyle(ButtonStyle.Danger));
        await channel.send({ content: `${interaction.user} ${isApp ? "application" : "support"} channel. Staff will be with you shortly.`, embeds: [base(isApp ? `HORIZON | ${kind} application` : "HORIZON | Support ticket", "Please provide the information needed. Be respectful and patient while staff review your request.")], components: [close] });
        return interaction.reply({ content: `Created your private channel: ${channel}`, ephemeral: true });
      }
      if (interaction.customId === "horizon_close_ticket") {
        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels) && !interaction.channel.name.startsWith(`ticket-`) && !interaction.channel.name.startsWith(`app-`)) return interaction.reply({ content: "You cannot close this channel.", ephemeral: true });
        await interaction.reply({ content: "This channel will be deleted in 5 seconds." });
        setTimeout(() => interaction.channel.delete("HORIZON ticket closed").catch(() => {}), 5000);
        return;
      }
    }
  } catch (error) {
    console.error(error);
    const message = "Something went wrong. Check the bot console and confirm the bot has the required permissions.";
    if (interaction.isRepliable()) {
      if (interaction.deferred || interaction.replied) await interaction.followUp({ content: message, ephemeral: true }).catch(() => {});
      else await interaction.reply({ content: message, ephemeral: true }).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
