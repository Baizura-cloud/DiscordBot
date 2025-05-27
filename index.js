const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID // Only monitor this voice channel
const TEXT_CHANNEL_ID = process.env.TEXT_CHANNEL_ID   // Send logs to this text channel
function getMalaysiaTimestamp() {
  const date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' });
  const d = new Date(date);

  const pad = (n) => n.toString().padStart(2, '0');

  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1); // Months are 0-indexed
  const year = d.getFullYear();

  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
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
  const timestamp = getMalaysiaTimestamp();

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
