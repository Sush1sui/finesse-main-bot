import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import {
  getAllStickyChannels,
  STICKYCHANNEL_create,
} from "../../utils/StickyChannel.helper";

export default {
  data: new SlashCommandBuilder()
    .setName("sticky_add")
    .setDescription("Adds sticky message to a channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Target channel")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("message").setDescription("Set custom sticky message")
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

      // check if sticky message is already set in a channel
      const stickyMesages = await getAllStickyChannels();
      if (stickyMesages.length > 0) {
        for (const stickyMessage of stickyMesages) {
          if (stickyMessage.channelId === channel.id) {
            await interaction.editReply({
              content: "Sticky message is already set to that channel",
            });
            console.log(
              `Sticky message is already set to channel: ${channel.name}, ${channel.id}`
            );
            return;
          }
        }
      }

      let success = false;
      if (message) {
        success = await STICKYCHANNEL_create(channel.id, message);
      } else {
        success = await STICKYCHANNEL_create(channel.id);
      }

      if (!success) {
        await interaction.editReply({
          content: "There is a problem with adding the sticky channel",
        });
        return;
      }
      await interaction.editReply({
        content: `Sticky Channel: ${channel.name} has been set`,
      });
      return;
    } catch (error) {
      await interaction.editReply({
        content: `There was an error setting the sticky message`,
      });
      console.error(`There was an error setting the sticky message: ${error}`);
      return;
    }
  },
};
