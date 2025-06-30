const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Monitor these three voice channels
const MONITORED_VOICE_CHANNELS = [
  process.env.VOICE_CHANNEL_ID1,
  process.env.VOICE_CHANNEL_ID2,
  process.env.VOICE_CHANNEL_ID3,
  process.env.VOICE_CHANNEL_ID4
];

const TEXT_CHANNEL_ID = process.env.TEXT_CHANNEL_ID; // Send logs to this text channel

function getMalaysiaTimestamp() {
  const date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' });
  const d = new Date(date);

  const pad = (n) => n.toString().padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
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
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log(`Current timezone: ${timeZone}`);
  if (timeZone !== 'Asia/Kuala_Lumpur') {
    console.warn(`Warning: The bot is not running in the Asia/Kuala_Lumpur timezone. Current timezone is ${timeZone}.`);
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  const user = newState.member.user;
  const timestamp = getMalaysiaTimestamp();

  const wasInTarget = MONITORED_VOICE_CHANNELS.includes(oldState.channelId);
  const nowInTarget = MONITORED_VOICE_CHANNELS.includes(newState.channelId);

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
