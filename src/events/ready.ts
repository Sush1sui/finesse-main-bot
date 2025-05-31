import { Client, Events } from "discord.js";
import deployCommands from "../deploy-commands";
import { initializeNicknameRequests } from "../utils/NicknameRequest.helper";
import { initializeStickyChannels } from "../utils/StickyChannel.helper";
import { checkSupporterStatus } from "../utils/Vanity.helper";

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    if (!client.user) {
      console.log(client);
      console.log("client user not found");
      return;
    }

    const guild = await client.guilds.fetch("1290538848933117993");

    deployCommands();

    await initializeNicknameRequests(client);
    await checkSupporterStatus(guild);
    await initializeStickyChannels();

    console.log(`Logged in as ${client.user.tag}`);

    // Schedule the task to run every hour
    setInterval(async () => {
      // Replace with your guild ID
      await checkSupporterStatus(guild);
    }, 5 * 60 * 1000); // 1 hour interval
  },
};
