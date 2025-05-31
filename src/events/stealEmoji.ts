import { GuildMember, Message } from "discord.js";
import path from "path";
import fs from "fs";
import { downloadFile } from "../utils/helpers";
// import { STAFF_ROLE_IDS } from "../utils/helpers";

export default {
  name: "messageCreate",
  once: false,
  async execute(message: Message) {
    try {
      if (
        message.author.bot ||
        !message.content.startsWith("!steal") ||
        !message.guild
      )
        return;
      const member = message.member as GuildMember;
      if (!member) return;

      // if not staff
      // if (!STAFF_ROLE_IDS.some((id) => member.roles.cache.has(id))) return;

      // Updated regex to match custom emojis (including animated ones)
      const emoji = message.content.match(/<a?:(\w+):(\d+)>/); // Matches both animated and normal emojis

      if (emoji) {
        const isAnimated = emoji[0].startsWith("<a");
        const emojiName = emoji[1];
        const emojiId = emoji[2]; // Get the emoji ID from the match (group 2)
        const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${
          isAnimated ? "gif" : "png"
        }`;

        // Ensure the assets folder exists
        const assetsDir = path.join(__dirname, "..", "assets");
        if (!fs.existsSync(assetsDir)) {
          fs.mkdirSync(assetsDir, { recursive: true });
        }

        const fileName = path.basename(emojiUrl);
        const destination = path.join(__dirname, "..", "assets", fileName);

        // Download the emoji file
        await downloadFile(emojiUrl, destination);

        // Read the downloaded emoji file into a buffer
        const fileBuffer = fs.readFileSync(destination);
        const emojiOptions = {
          name: emojiName, // Set the emoji name to the extracted name
          attachment: fileBuffer, // Provide the image file path
          reason: "Emoji stolen via bot command",
        };

        // Upload the emoji to the server
        const newEmoji = await message.guild.emojis.create(emojiOptions);

        // Respond to the user after the emoji is uploaded
        await message.reply(
          `Emoji has been successfully uploaded to the server: ${newEmoji.toString()}`
        );

        // Delete the file from the assets folder after the upload
        fs.unlinkSync(destination);
        console.log(`Deleted file: ${destination}`);
      }
    } catch (error) {
      console.error(`Failed to add reaction: ${(error as Error).message}`);
    }
  },
};
