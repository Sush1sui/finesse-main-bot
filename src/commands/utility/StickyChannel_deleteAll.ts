import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { STICKYCHANNEL_deleteAll } from "../../utils/StickyChannel.helper";

export default {
  data: new SlashCommandBuilder()
    .setName("sticky_delete_all")
    .setDescription("Delete all sticky channels")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member;
    if (!member || !interaction.guild) return;

    await interaction.deferReply({ flags: "Ephemeral" });

    try {
      const success = await STICKYCHANNEL_deleteAll();

      if (success === "sticky not found") {
        await interaction.editReply({
          content: `Sticky Channels not found, there is nothing to delete`,
        });
        return;
      }

      await interaction.editReply({
        content: `Sticky Channels has been unset`,
      });
      return;
    } catch (error) {
      await interaction.editReply({
        content: `There was an error deleting sticky channels`,
      });
      console.error(`There was an error deleting sticky channels: ${error}`);
      return;
    }
  },
};
