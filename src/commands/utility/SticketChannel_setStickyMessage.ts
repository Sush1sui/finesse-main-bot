import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { STICKYCHANNEL_setStickyMessageId } from "../../utils/StickyChannel.helper";
import { StickyChannelDocument } from "../../models/StickyChannel.model";

export default {
  data: new SlashCommandBuilder()
    .setName("sticky_set")
    .setDescription("Sets sticky message")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where the sticky message will be set")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Custom sticky message, leave blank for default")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member;
    if (!member || !interaction.guild) return;

    await interaction.deferReply({ flags: "Ephemeral" });

    try {
      const channel = interaction.options.getChannel("channel") as TextChannel;
      const message = interaction.options.getString("message");

      if (!channel) {
        await interaction.editReply({ content: "Channel not found" });
        return;
      }

      let updatedStickyDocument: StickyChannelDocument | null = null;
      if (message) {
        updatedStickyDocument = await STICKYCHANNEL_setStickyMessageId(
          channel.id,
          message
        );
      } else {
        updatedStickyDocument = await STICKYCHANNEL_setStickyMessageId(
          channel.id
        );
      }

      if (!updatedStickyDocument) {
        await interaction.editReply({
          content: "Something went wrong with updating the sticky message",
        });
        return;
      }

      await interaction.editReply({
        content: `Sticky Message for <#${channel.id}> has been set`,
      });
      return;
    } catch (error) {
      await interaction.editReply({
        content: `There was an error deleting sticky channel`,
      });
      console.log(`There was an error deleting sticky channel: ${error}`);
      return;
    }
  },
};
