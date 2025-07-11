import {
  ActivityType,
  Client,
  Collection,
  GatewayIntentBits,
} from "discord.js";
import loadCommands from "./loadCommands";
import loadEvents from "./loadEvents";

export interface CustomClient extends Client {
  commands: Collection<string, any>;
}

export let isBotOnline = false;

const bot_token = process.env.BOT_TOKEN;
if (!bot_token) throw new Error("Missing environment variables");

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildPresences,
  ],
}) as CustomClient;

client.commands = new Collection();

loadCommands(client);
loadEvents(client);

client.once("ready", () => {
  client.user?.setPresence({
    status: "idle",
    activities: [
      {
        name: "Do it with Finesse!",
        type: ActivityType.Custom,
      },
    ],
  });
});

export const startBot = async () => {
  try {
    await client.login(bot_token);
    isBotOnline = true;
    console.log("Bot is online");
  } catch (error) {
    console.error("Failed to start the bot:", error);
    isBotOnline = false;
  }
};

setTimeout(() => {
  if (!isBotOnline) {
    console.error("Bot failed to start within 30 seconds, retrying...");
    startBot();
  }
}, 30000);

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});
