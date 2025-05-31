import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { STICKYCHANNEL_delete } from "../../utils/StickyChannel.helper";

export default {
  data: new SlashCommandBuilder()
    .setName("sticky_delete")
    .setDescription("Deletes Sticky Channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to unset the sticky channel")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member;
    if (!member || !interaction.guild) return;

    await interaction.deferReply({ flags: "Ephemeral" });

    try {
      const channel = interaction.options.getChannel("channel") as TextChannel;

      if (!channel) {
        await interaction.editReply({ content: "Channel not found" });
        return;
      }

      const success = await STICKYCHANNEL_delete(channel.id);

      if (!success) {
        await interaction.editReply({
          content: "Something went wrong with deleting the sticky channel",
        });
        return;
      }

      await interaction.editReply({
        content: "Sticky channel deleted successfully",
      });
      return;
    } catch (error) {}
  },
};
