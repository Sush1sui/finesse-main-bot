import { Colors, EmbedBuilder, Message, TextChannel } from "discord.js";
import { STAFF_ROLE_IDS } from "../utils/helpers";
import {
  approveEmoji,
  denyEmoji,
  NicknameRequest_create,
  setupNicknameRequestCollector,
} from "../utils/NicknameRequest.helper";

export default {
  name: "messageCreate",
  once: false,
  async execute(message: Message) {
    try {
      if (
        message.author.bot ||
        !(
          message.channel.id === "1310583941287379116" &&
          message.content.toLowerCase().startsWith("!rn")
        )
      )
        return;

      const nicknameRequest = message.content.slice("!rn".length).trim();

      const embed = new EmbedBuilder()
        .setTitle("Nickname Request")
        .setDescription(
          `**<@${message.author.id}>** has requested the nickname: **${nicknameRequest}**.\n\n<@&${STAFF_ROLE_IDS[0]}>, please approve or decline.`
        )
        .setColor(Colors.White);

      const approvalChannel = message.guild?.channels.cache.get(
        "1310273100583276544"
      ) as TextChannel;

      if (!approvalChannel) {
        console.error("Approval channel not found or is not a text channel.");
        await message.reply("An error occurred while processing your request.");
        return;
      }

      const sentMessage = await approvalChannel.send({
        content: "<@&1310186525606154340>",
        embeds: [embed],
        allowedMentions: { parse: ["roles"] },
      });

      await sentMessage.react(approveEmoji);
      await sentMessage.react(denyEmoji);

      await NicknameRequest_create(
        nicknameRequest,
        message.author.id,
        message.id,
        message.channelId,
        sentMessage.channelId,
        sentMessage.id
      );

      await setupNicknameRequestCollector(sentMessage, nicknameRequest);
      console.log(
        `Successfully created a nickname request from user: ${message.author.username}`
      );
    } catch (error) {
      console.log(error);
    }
  },
};
