import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import { BOOST_CHANNEL_ID, SERVER_LOGS_CHANNEL_ID } from "../utils/helpers";
import { client } from "../bot";

export default {
  name: "guildMemberUpdate",
  async execute(oldMember: GuildMember, newMember: GuildMember) {
    try {
      const boostChannel = newMember.guild.channels.cache.get(
        BOOST_CHANNEL_ID
      ) as TextChannel;
      const serverLogChannel = client.guilds.cache
        .get(newMember.guild.id)
        ?.channels.cache.get(SERVER_LOGS_CHANNEL_ID) as TextChannel;

      if (!boostChannel)
        throw new Error("Boost channel not found, speak with your dev");

      const oldBoostStatus = oldMember.premiumSince;
      const newBoostStatus = newMember.premiumSince;

      if (
        newBoostStatus &&
        (!oldBoostStatus || oldBoostStatus < newBoostStatus)
      ) {
        const embed = new EmbedBuilder()
          .setTitle("Thank you for the server boost!")
          .setColor(0xff73fa)
          .setDescription(
            `** We truly appreciate your support and all you do to help make this community even better! Sending you all our love and gratitude!**\n\n` +
              "> **Perks**\n" +
              "- Receive <@&1292420325002448930> role\n" +
              "- Custom Onigiri Color Role <#1303919788342382615>\n" +
              "- Nickname perms\n" +
              "- Soundboard\n" +
              "- Image and Embed Links perms\n" +
              "- External Emoji & Sticker\n" +
              "- 2.0x Level Boost"
          )
          .setImage(
            "https://cdn.discordapp.com/attachments/1303917209101406230/1310235247341867028/tyfdboost.gif?ex=67447b29&is=674329a9&hm=9a9a997a62dc63ea9db4071304ab3489d56149113fa7d5f0479d42aea1c3f1ed&"
          )
          .setTimestamp();

        // Send the embed message to the boost channel
        await boostChannel.send({
          content: `# ${newMember} HAS BOOSTED THE SERVER`, // Ping the booster
          embeds: [embed],
          allowedMentions: { parse: ["users"] },
        });

        if (serverLogChannel) {
          await serverLogChannel.send({
            content: `# HEY <@&1310186525606154340>s! ${newMember} HAS BOOSTED THE SERVER`,
          });
        }
      }
    } catch (error) {
      console.error("Error handling boost notification:", error);
    }
  },
};
