import { Message } from "discord.js";
import characterSet from "../utils/characters.json";

const VIP_USERS_ID = ["982491279369830460", "1258348384671109120"];

export default {
  name: "messageCreate",
  once: false,
  async execute(message: Message) {
    try {
      if (message.author.id !== "432610292342587392") return;
      if (message.channelId !== "1310429477548982363") return;
      const embed = message.embeds[0];
      if (!embed) return; // Exit if there's no embed
      // If the character is not claimed and has a name, perform a quick check
      if (
        !embed.footer?.text.toLowerCase().includes("belongs to") &&
        embed.author?.name
      ) {
        if (!characterSet.includes(embed.author.name.toLowerCase())) return;
        // Logging can be removed or minimized in production
        // console.log(`Found character: ${embed.author.name}`);
        await Promise.all(
          VIP_USERS_ID.map(async (userId) => {
            try {
              const user = await message.client.users.fetch(userId);
              await user.send({
                content: `# A top character \`${embed.author?.name}\` has appeared! Click here to jump to the message: ${message.url}`,
                embeds: [embed],
              });
              console.log(`Successfully sent DM to user ${userId}`);
            } catch (dmError) {
              console.error(`Failed to send DM to user ${userId}:`, dmError);
            }
          })
        );
      }
    } catch (error) {
      console.error(`Failed to snipe: ${(error as Error).message}`);
    }
  },
};
