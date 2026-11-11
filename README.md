# HORIZON LLC Discord Bot

A Discord.js v14 starter bot for HORIZON LLC. It includes an interactive `/setup` dashboard, `/help`, moderation, tickets, verification, applications, announcements, and roster tools.

## Requirements
- Node.js 20+
- A Discord application and bot
- A server where you have permission to manage the server

## Install
1. Download and unzip this project.
2. Open a terminal in the project folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Fill in `DISCORD_TOKEN`, `CLIENT_ID`, and `GUILD_ID`.
6. In the Discord Developer Portal, enable **Server Members Intent** and **Message Content Intent** only if you later add features that need them. This starter uses slash commands and does not require Message Content Intent.
7. Invite the bot with the `bot` and `applications.commands` scopes. Grant it Manage Roles, Manage Channels, View Channels, Send Messages, Embed Links, Read Message History, Moderate Members, Kick Members, Ban Members, and Manage Messages as needed.
8. Run `npm run deploy` to register guild slash commands.
9. Run `npm start`.

## Commands
- `/setup` — opens the interactive HORIZON setup dashboard. Select a module and press Run.
- `/help` — shows commands you can use.
- `/roster action:add|remove|list name:<player> division:<division>` — manage the roster.
- `/announce channel:<channel> title:<title> message:<message>` — post a HORIZON announcement.
- `/warn member:<member> reason:<reason>` — record a warning in the configured moderation log.
- `/timeout member:<member> duration:<minutes> reason:<reason>` — timeout a member.
- `/kick member:<member> reason:<reason>` — kick a member.
- `/ban member:<member> reason:<reason>` — ban a member.
- `/ticketpanel` — post the ticket panel in the current channel.

## Setup dashboard modules
The dashboard can create HORIZON role groups, channel/category structure, baseline permissions, welcome/logging channels, verification panel, ticket panel, application panel, roster structure, announcement/social/info channels, and competitive channels.

The bot creates only missing roles/channels and does not delete existing content. Review the generated roles and channel permissions after setup. Discord role hierarchy still applies: the bot's highest role must be above roles it needs to assign or manage.

## Important
- Keep `.env` private. Never share your bot token.
- The bot does not grant Administrator to any role.
- The setup process is designed to be conservative and non-destructive.
- Ticket transcripts are not exported in this starter; ticket close deletes the ticket channel after confirmation.
- Application buttons create private application channels for staff review; configure the staff role in `src/config.js`.
