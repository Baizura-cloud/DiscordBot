const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID // Only monitor this voice channel
const TEXT_CHANNEL_ID = process.env.TEXT_CHANNEL_ID   // Send logs to this text channel

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  const user = newState.member.user;
  const timestamp = new Date().toLocaleString();

  // Skip if neither oldState nor newState relates to the target voice channel
  const wasInTarget = oldState.channelId === VOICE_CHANNEL_ID;
  const nowInTarget = newState.channelId === VOICE_CHANNEL_ID;

  // Ignore if no relevant activity happened in the target voice channel
  if (!wasInTarget && !nowInTarget) return;

  let logMessage = null;

  if (!wasInTarget && nowInTarget) {
    logMessage = `✅ **${user.tag}** joined **${newState.channel.name}** at ${timestamp}`;
  } else if (wasInTarget && !nowInTarget) {
    logMessage = `❌ **${user.tag}** left **${oldState.channel.name}** at ${timestamp}`;
  } else if (wasInTarget && nowInTarget && oldState.channelId !== newState.channelId) {
    logMessage = `🔁 **${user.tag}** switched from **${oldState.channel.name}** to **${newState.channel.name}** at ${timestamp}`;
  }

  if (logMessage) {
    const logChannel = await newState.guild.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
    if (logChannel && logChannel.isTextBased()) {
      logChannel.send(logMessage);
    }
  }
});

client.login(process.env.BOT_TOKEN);
