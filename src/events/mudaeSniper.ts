import { Message } from "discord.js";
import top1kCharacters from "../utils/characters.json";

// Create a Set of lowercase character names for efficient lookups
const characterSet = new Set(
  top1kCharacters.map((character) => character.name.toLowerCase())
);

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

      const isClaimed = embed.footer?.text.toLowerCase().includes("belongs to");
      const characterName = embed.author?.name;

      // If the character is not claimed and has a name, perform a quick check
      if (!isClaimed && characterName) {
        if (characterSet.has(characterName.toLowerCase())) {
          console.log(`Found character: ${characterName}`);

          for (const userId of VIP_USERS_ID) {
            try {
              const user = await message.client.users.fetch(userId);
              await user.send({
                content: `# A top character \`${characterName}\` has appeared! Click here to jump to the message: ${message.url}`,
                embeds: [embed],
              });
              console.log(`Successfully sent DM to user ${userId}`);
            } catch (dmError) {
              console.error(`Failed to send DM to user ${userId}:`, dmError);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to snipe: ${(error as Error).message}`);
    }
  },
};
