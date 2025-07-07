import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import { communityRoleId, welcomeChannelId } from "../utils/helpers";

export default {
  name: "guildMemberUpdate",
  async execute(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (newMember.user.bot) return;

    if (newMember.user.id === "1258348384671109120") return;

    try {
      // Check if the community role was added
      const oldRoles = oldMember.roles.cache;
      const newRoles = newMember.roles.cache;

      if (!oldRoles.has(communityRoleId) && newRoles.has(communityRoleId)) {
        const welcomeChannel = newMember.guild.channels.cache.get(
          welcomeChannelId
        ) as TextChannel;

        if (!welcomeChannel)
          throw new Error("Welcome channel not found, speak with your dev");

        const welcomeEmbed = new EmbedBuilder()
          .setColor(0xffffff)
          .setTitle("-ˏˋ⋆ ᴡ ᴇ ʟ ᴄ ᴏ ᴍ ᴇ ⋆ˊˎ-")
          .setDescription(
            `Hello ${newMember}! Welcome to **Finesse**.\n\n` +
              `Please make sure you head to <#1303919197629321308> before chatting.\n` +
              `On top of that, please go to <#1292714443351785502> to set up your profile.\n\n` +
              `└─── we hope you enjoy your stay in here!──➤`
          )
          .setThumbnail(
            "https://cdn.discordapp.com/attachments/1293239740404994109/1310247866970800209/tl.png?ex=674486ea&is=6743356a&hm=e89c4eb171c56724f5e7b1702d85acfa208a03b47c65632de850af79fe826a8c&"
          );

        await welcomeChannel.send({
          embeds: [welcomeEmbed],
          allowedMentions: { parse: ["users"] },
        });
      }
    } catch (error) {
      console.error("Error sending welcome message:", error);
    }
  },
};
