import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { removeUserVanity } from "../../utils/Vanity.helper";

export default {
  data: new SlashCommandBuilder()
    .setName("vanity_remove")
    .setDescription("Removes users from the exemption")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to remove exemption")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member = interaction.member;
    if (!member || !interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a guild.",
        flags: "Ephemeral",
      });
      return;
    }

    await interaction.deferReply({ flags: "Ephemeral" });

    try {
      const user = interaction.options.getUser("user");

      if (!user) {
        await interaction.editReply({
          content: "User not found",
        });
        return;
      }

      const member = await interaction.guild.members.fetch(user.id);

      if (!member) {
        await interaction.editReply({
          content: "Member not found",
        });
        return;
      }

      const exemptedUser = await removeUserVanity(user.id);

      if (!exemptedUser) {
        await interaction.editReply({
          content: "There is a problem removing user to the exempted database",
        });
        return;
      }

      member.roles.remove("1312957178356699146");
      member.roles.remove("1303924607555997776");

      await interaction.editReply({
        content: "User removed from exemption successfully",
      });
      return;
    } catch (error) {
      const errorMessage = (error as Error).message;
      await interaction.editReply({
        content: `There was an error removing the user to exemptions: ${errorMessage}`,
      });
      return;
    }
  },
};
