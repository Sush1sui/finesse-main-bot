import {
  ChatInputCommandInteraction,
  Colors,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { getAllStickyChannels } from "../../utils/StickyChannel.helper";
import { EmbedBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("sticky_show")
    .setDescription("Shows all sticky channels")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member = interaction.member;
    if (!member || !interaction.guild) return;

    await interaction.deferReply({ flags: "Ephemeral" });
    const channel = interaction.channel as TextChannel;

    try {
      const allStickyChannelId = (await getAllStickyChannels()).map(
        (c) => c.channelId
      );
      if (allStickyChannelId.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle("NO STICKY CHANNELS FOUND")
          .setDescription(
            `There are no channels found, try adding a channel for sticky message with **/sticky_add** command`
          )
          .setColor(Colors.White);

        await channel.send({ embeds: [embed] });
        await interaction.editReply({ content: "No channels found" });
        return;
      }

      let stickyChannelsString = "";
      for (let i = 0; i < allStickyChannelId.length; ++i) {
        stickyChannelsString += `<#${allStickyChannelId[i]}>${
          i < allStickyChannelId.length ? "\n" : ""
        }`;
      }

      const embed = new EmbedBuilder()
        .setTitle("STICKY CHANNELS LIST")
        .setDescription(stickyChannelsString)
        .setColor(Colors.DarkBlue);

      await interaction.editReply({
        content: "Channels fetched successfully",
        embeds: [embed],
      });
      return;
    } catch (error) {
      console.error("There was an error fetching the channels", error);
      await interaction.editReply({
        content: `There was an error fetching the channels`,
      });
      return;
    }
  },
};
