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

const bot_token = process.env.BOT_TOKEN;
if (bot_token || bot_token !== undefined) {
  console.log("Bot token is set.");
} else {
  console.error(
    "Bot token is not set. Please check your environment variables."
  );
  process.exit(1);
}

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

client
  .login(bot_token)
  .then(() => {
    console.log("Logged in to Discord!");
  })
  .catch((error) => {
    console.error("Failed to login to Discord:", error);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});
